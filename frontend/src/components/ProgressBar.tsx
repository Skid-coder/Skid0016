"use client";

import { SearchProgress } from "@/lib/api";

interface ProgressBarProps {
  progress: SearchProgress | null;
}

const STAGE_LABELS: Record<string, string> = {
  searching: "Searching the web",
  dedup: "Removing duplicates",
  crawling: "Crawling company websites",
  scoring: "Scoring leads",
  exporting: "Exporting results",
};

export default function ProgressBar({ progress }: ProgressBarProps) {
  if (!progress) return null;

  const label = STAGE_LABELS[progress.stage] || progress.stage;
  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {progress.leads_found > 0 && `${progress.leads_found} leads found`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{progress.message}</p>
    </div>
  );
}
