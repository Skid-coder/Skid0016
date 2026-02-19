# CRM Dashboard — Setup & Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm

### 1. Install dependencies
```bash
npm run install-all
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
```

### 3. Run development servers
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:5000
- React dev server on http://localhost:3000 (proxied to backend)

### Default Login
- Email: `admin@crm.local`
- Password: `admin123`

> Change the default password after first login by registering a new account.

---

## Project Structure

```
├── server/
│   ├── index.js              # Express entry point
│   ├── database.js           # SQLite setup & schema
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   └── routes/
│       ├── auth.js           # Login/register
│       ├── leads.js          # Lead CRUD + follow-up + bulk ops
│       ├── kpi.js            # Dashboard analytics
│       ├── targets.js        # Monthly target management
│       └── csv.js            # CSV import/export
├── client/
│   ├── public/index.html     # Tailwind CSS via CDN
│   └── src/
│       ├── App.js            # Router setup
│       ├── api.js            # API helper (fetch + auth)
│       ├── context/
│       │   └── AuthContext.js # Auth state management
│       ├── components/
│       │   ├── Layout.js     # Sidebar navigation
│       │   └── LeadModal.js  # Add/edit lead form
│       └── pages/
│           ├── LoginPage.js
│           ├── DashboardPage.js
│           ├── LeadsPage.js
│           ├── PipelinePage.js
│           ├── FollowUpsPage.js
│           ├── TargetsPage.js
│           └── ImportExportPage.js
├── Dockerfile
├── .env.example
└── package.json
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Lead Database** | Full table view with search, filter by status/source, sortable columns, pagination |
| **Pipeline (Kanban)** | Drag-and-drop cards between status columns |
| **KPI Dashboard** | Stats cards, conversion funnel, monthly progress vs targets |
| **Follow-up System** | Shows overdue/today follow-ups, mark done & schedule next |
| **Monthly Targets** | Set targets per month, track progress on dashboard |
| **CSV Import/Export** | Download leads as CSV, upload CSV to bulk-import |
| **Authentication** | Email + password login with JWT tokens |

---

## Deployment Options

### Option 1: Docker
```bash
docker build -t crm-dashboard .
docker run -p 5000:5000 -e JWT_SECRET=your-secret -v crm-data:/app crm-dashboard
```

### Option 2: Production Build
```bash
npm run build          # Build React frontend
npm start              # Serve everything from Express
```

### Option 3: Railway / Render / Fly.io
1. Push to a Git repo
2. Connect to your deployment platform
3. Set environment variables:
   - `JWT_SECRET` — a random string
   - `NODE_ENV` — `production`
   - `PORT` — usually auto-assigned
4. Build command: `npm run install-all && npm run build`
5. Start command: `npm start`

---

## API Reference

All API routes require `Authorization: Bearer <token>` header (except auth endpoints).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/leads` | List leads (with filters, sorting, pagination) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get lead details + activity log |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/followup` | Mark follow-up done |
| PATCH | `/api/leads/bulk-status` | Bulk status update |
| GET | `/api/kpi/overview` | Dashboard overview stats |
| GET | `/api/kpi/daily` | Daily stats (charts) |
| GET | `/api/kpi/funnel` | Conversion funnel |
| GET | `/api/kpi/monthly-progress` | Progress vs targets |
| GET | `/api/targets/:month` | Get monthly target |
| PUT | `/api/targets/:month` | Set monthly target |
| GET | `/api/csv/export` | Export leads as CSV |
| POST | `/api/csv/import` | Import leads from CSV |
