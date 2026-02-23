# TransferLead Engine

Web scraping and lead generation tool for the ground transportation industry. Search for airport transfer, chauffeur, and taxi companies worldwide, extract their contact details, and export structured leads for B2B outreach.

## Architecture

```
TransferLead Engine
├── backend/          Python FastAPI backend
│   ├── app/
│   │   ├── main.py           FastAPI app entry point
│   │   ├── config.py         Environment configuration
│   │   ├── models/
│   │   │   └── lead.py       Pydantic data models
│   │   ├── routers/
│   │   │   └── search.py     API endpoints
│   │   ├── services/
│   │   │   ├── search_engine.py    Google search + Maps scraper
│   │   │   ├── website_crawler.py  Website crawler & email extractor
│   │   │   ├── scoring.py         Lead scoring (0-100)
│   │   │   ├── dedup.py           Deduplication engine
│   │   │   ├── exporter.py        CSV & JSON export
│   │   │   └── orchestrator.py    Pipeline coordinator
│   │   └── utils/
│   │       ├── http_client.py     Async HTTP with anti-blocking
│   │       ├── url_helpers.py     URL normalization
│   │       └── text_helpers.py    Email/phone extraction regex
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/         Next.js + React + Tailwind UI
│   ├── src/
│   │   ├── app/              Next.js App Router pages
│   │   ├── components/       React components
│   │   └── lib/api.ts        Backend API client
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── docker-compose.yml
```

## Features

- **Multi-source search** — Google Search + Google Maps scraping
- **Website crawling** — Visits homepage, contact, and about pages to extract emails
- **Email extraction** — Regex-based with blacklist filtering (no-reply, spam domains)
- **Phone extraction** — International format support
- **Service detection** — Identifies airport transfer, chauffeur, taxi, limo, shuttle, etc.
- **LinkedIn detection** — Finds company LinkedIn pages from website links
- **Fleet & API detection** — Notes fleet size mentions and API/integration capability
- **Lead scoring** — 0–100 score based on data quality signals
- **Deduplication** — Domain-based with data merging
- **CSV & JSON export** — Download results in either format
- **Real-time progress** — Server-Sent Events for live search status
- **Anti-blocking** — Random user agents, rate limiting, request throttling, retries

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env as needed

# Run the server
python run.py
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

The UI will be available at `http://localhost:3000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/search` | Run a full search (returns JSON) |
| `POST` | `/api/search/stream` | Run a search with SSE progress updates |
| `GET` | `/api/download/{filename}` | Download an exported CSV/JSON file |
| `GET` | `/api/health` | Health check |

### Search Request Body

```json
{
  "city": "London",
  "country": "UK",
  "keywords": ["airport transfer", "chauffeur service"]
}
```

### Search Response

```json
{
  "query": "London, UK",
  "total": 15,
  "leads": [
    {
      "company_name": "Example Transfers Ltd",
      "website": "https://exampletransfers.co.uk",
      "emails": ["info@exampletransfers.co.uk"],
      "phone": "+44 20 1234 5678",
      "city": "London",
      "country": "UK",
      "services": ["airport transfer", "chauffeur", "executive transfer"],
      "linkedin": "https://linkedin.com/company/example-transfers",
      "score": 85,
      "notes": "Fleet mentioned on website; API/integration capability detected"
    }
  ],
  "export_csv": "exports/leads_abc12345.csv",
  "export_json": "exports/leads_abc12345.json"
}
```

## Lead Scoring

Leads are scored 0–100 based on these signals:

| Signal | Points |
|--------|--------|
| Has email address | 25 |
| Mentions airport transfers | 15 |
| Has website | 10 |
| Has phone number | 10 |
| Multiple services detected | 10 |
| Fleet mentioned | 10 |
| Has company name | 5 |
| Has LinkedIn page | 5 |
| API/integration capability | 5 |
| Located near airport | 5 |

## Configuration

All configuration is via environment variables (see `.env.example` files).

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `REQUEST_DELAY_MIN` | `1.5` | Min seconds between requests |
| `REQUEST_DELAY_MAX` | `3.5` | Max seconds between requests |
| `MAX_CONCURRENT_REQUESTS` | `3` | Max parallel outbound requests |
| `MAX_RESULTS_PER_QUERY` | `20` | Max leads from search phase |
| `MAX_PAGES_TO_CRAWL` | `5` | Max sub-pages to crawl per site |
| `EXPORT_DIR` | `./exports` | Directory for exported files |
| `HTTP_PROXY` | — | Optional HTTP proxy |
| `HTTPS_PROXY` | — | Optional HTTPS proxy |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

## Deployment

### Docker Compose

```bash
docker-compose up --build
```

### Backend on Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set the root directory to `backend/`
4. Railway will auto-detect Python and use `railway.json`
5. Add environment variables in the Railway dashboard

### Backend on Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set root directory to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables

### Frontend on Vercel

1. Import the repo on [Vercel](https://vercel.com)
2. Set root directory to `frontend/`
3. Framework preset: Next.js
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
5. Deploy

## Usage Notes

- This tool is designed for **legitimate B2B outreach** to transport providers
- Google may rate-limit or block requests if run too aggressively — adjust `REQUEST_DELAY_*` and `MAX_CONCURRENT_REQUESTS` accordingly
- For production use, consider adding a proxy service (e.g., residential proxies)
- The tool respects `robots.txt` implicitly by targeting only public-facing contact pages
- Exported files are stored in the `exports/` directory and served via the download endpoint

## License

Private — for internal business development use.
