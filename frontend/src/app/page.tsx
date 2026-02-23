"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ProgressBar from "@/components/ProgressBar";
import LeadTable from "@/components/LeadTable";
import {
  Lead,
  SearchProgress,
  SearchResult,
  getDownloadUrl,
  searchLeadsStream,
} from "@/lib/api";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<SearchProgress | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelFn, setCancelFn] = useState<(() => void) | null>(null);

  const handleSearch = (city: string, country: string, keywords: string[]) => {
    // Reset state
    setIsLoading(true);
    setProgress(null);
    setLeads([]);
    setResult(null);
    setError(null);

    // Cancel any in-flight request
    if (cancelFn) cancelFn();

    const cancel = searchLeadsStream(
      { city, country, keywords },
      (p) => setProgress(p),
      (r) => {
        setResult(r);
        setLeads(r.leads);
        setIsLoading(false);
        setProgress(null);
      },
      (e) => {
        setError(e.message);
        setIsLoading(false);
        setProgress(null);
      }
    );

    setCancelFn(() => cancel);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          TransferLead Engine
        </h1>
        <p className="text-gray-600 mt-1">
          Find airport transfer, chauffeur, and taxi companies worldwide.
          Extract contacts for B2B outreach.
        </p>
      </div>

      {/* Search form */}
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {/* Progress */}
      {isLoading && <ProgressBar progress={progress} />}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Results summary + export buttons */}
      {result && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg shadow-md p-4 gap-3">
          <div>
            <span className="text-lg font-semibold text-gray-900">
              {result.total} leads found
            </span>
            <span className="text-gray-500 ml-2">for &quot;{result.query}&quot;</span>
          </div>
          <div className="flex gap-2">
            {result.export_csv && (
              <a
                href={getDownloadUrl(result.export_csv)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                download
              >
                Download CSV
              </a>
            )}
            {result.export_json && (
              <a
                href={getDownloadUrl(result.export_json)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                download
              >
                Download JSON
              </a>
            )}
          </div>
        </div>
      )}

      {/* Lead table */}
      <LeadTable leads={leads} />

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-gray-400">
        TransferLead Engine &mdash; B2B lead generation for ground transportation
      </footer>
    </main>
  );
}
