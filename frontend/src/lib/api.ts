const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Lead {
  company_name: string;
  website: string;
  emails: string[];
  phone: string;
  city: string;
  country: string;
  services: string[];
  linkedin: string;
  score: number;
  notes: string;
  source: string;
}

export interface SearchResult {
  query: string;
  total: number;
  leads: Lead[];
  export_csv: string;
  export_json: string;
}

export interface SearchProgress {
  stage: string;
  message: string;
  current: number;
  total: number;
  leads_found: number;
}

export interface SearchRequest {
  city: string;
  country: string;
  keywords: string[];
}

export async function searchLeads(req: SearchRequest): Promise<SearchResult> {
  const res = await fetch(`${API_URL}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Search failed: ${err}`);
  }
  return res.json();
}

export function searchLeadsStream(
  req: SearchRequest,
  onProgress: (p: SearchProgress) => void,
  onResult: (r: SearchResult) => void,
  onError: (e: Error) => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_URL}/api/search/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (eventType === "progress") {
                onProgress(parsed as SearchProgress);
              } else if (eventType === "result") {
                onResult(parsed as SearchResult);
              }
            } catch {
              // ignore malformed JSON
            }
          }
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return () => controller.abort();
}

export function getDownloadUrl(filename: string): string {
  // Extract just the filename from a full path
  const name = filename.split("/").pop() || filename;
  return `${API_URL}/api/download/${name}`;
}
