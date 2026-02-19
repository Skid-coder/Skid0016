import React, { useState, useRef } from 'react';
import { apiFetch, apiUpload } from '../api';

const API = process.env.REACT_APP_API_URL || '';

export default function ImportExportPage() {
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [exportFilter, setExportFilter] = useState('');
  const fileRef = useRef();

  async function handleImport(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    try {
      const result = await apiUpload('/api/csv/import', file);
      setImportResult(result);
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleExport() {
    setExportStatus('Downloading...');
    const token = localStorage.getItem('crm_token');
    const params = exportFilter ? `?status=${encodeURIComponent(exportFilter)}` : '';
    try {
      const res = await fetch(`${API}/api/csv/export${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportStatus('Download complete');
    } catch (err) {
      setExportStatus(`Error: ${err.message}`);
    }
    setTimeout(() => setExportStatus(''), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Import & Export</h2>

      {/* Export */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Leads to CSV</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status (optional)</label>
            <select value={exportFilter} onChange={e => setExportFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">All Leads</option>
              {['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={handleExport}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
            Download CSV
          </button>
        </div>
        {exportStatus && <p className="text-sm text-gray-600 mt-2">{exportStatus}</p>}
      </div>

      {/* Import */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Leads from CSV</h3>
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
            <input type="file" accept=".csv" ref={fileRef}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          </div>
          <button type="submit" disabled={importing}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
            {importing ? 'Importing...' : 'Import'}
          </button>
        </form>

        {importResult && (
          <div className={`mt-4 p-4 rounded-lg ${importResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {importResult.error ? (
              <p>{importResult.error}</p>
            ) : (
              <>
                <p className="font-medium">Import complete</p>
                <p className="text-sm mt-1">Imported: {importResult.imported} | Skipped: {importResult.skipped}</p>
                {importResult.errors?.length > 0 && (
                  <ul className="text-sm mt-2 space-y-0.5">
                    {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">Expected CSV Format</h4>
          <p className="text-xs text-gray-500 mt-1">
            Headers: Company Name, Country, City, Contact Person, Email, LinkedIn, Source, Status, Notes, Date Added, Last Contact Date, Next Follow-up Date
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sources: Google Maps, LinkedIn, Event, Referral, Email Outreach, Other
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Statuses: New, Contacted, Replied, Registered, Activated, Rejected
          </p>
        </div>
      </div>
    </div>
  );
}
