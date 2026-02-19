import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-800',
  Contacted: 'bg-yellow-100 text-yellow-800',
  Replied: 'bg-purple-100 text-purple-800',
  Registered: 'bg-green-100 text-green-800',
  Activated: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [progress, setProgress] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    apiFetch('/api/kpi/overview').then(setOverview);
    apiFetch(`/api/kpi/funnel?month=${month}`).then(setFunnel);
    apiFetch(`/api/kpi/monthly-progress?month=${month}`).then(setProgress);
  }, [month]);

  if (!overview) return <div className="text-gray-500">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Leads', value: overview.total, color: 'bg-blue-500' },
    { label: 'New Today', value: overview.new_today, color: 'bg-green-500' },
    { label: 'Overdue Follow-ups', value: overview.overdue_followups, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Leads by Status</h3>
        <div className="flex flex-wrap gap-3">
          {['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'].map(status => (
            <div key={status} className={`px-4 py-2 rounded-lg ${STATUS_COLORS[status]}`}>
              <span className="font-semibold text-lg">{overview.by_status[status] || 0}</span>
              <span className="text-sm ml-1.5">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      {funnel && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversion Funnel ({month})</h3>
          <div className="space-y-3">
            {['New', 'Contacted', 'Replied', 'Registered', 'Activated'].map(stage => {
              const count = funnel.funnel[stage] || 0;
              const pct = funnel.total > 0 ? (count / funnel.total * 100) : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{count} ({pct.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          {funnel.rates && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
              {Object.entries(funnel.rates).map(([key, val]) => (
                <div key={key} className="text-center">
                  <p className="text-xl font-bold text-primary-600">{val}%</p>
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly Progress vs Target */}
      {progress && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Progress vs Target ({progress.month})</h3>
          <div className="space-y-3">
            {[
              { label: 'Leads Added', actual: progress.actual.leads, target: progress.target.target_leads },
              { label: 'Contacted', actual: progress.actual.contacted, target: progress.target.target_contacted },
              { label: 'Replied', actual: progress.actual.replied, target: progress.target.target_replied },
              { label: 'Registered', actual: progress.actual.registered, target: progress.target.target_registered },
              { label: 'Activated', actual: progress.actual.activated, target: progress.target.target_activated },
            ].map(item => {
              const pct = item.target > 0 ? Math.min((item.actual / item.target * 100), 100) : 0;
              const isOnTrack = item.target === 0 || item.actual >= item.target;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isOnTrack ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {item.actual} / {item.target || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3">Set targets in the Targets page</p>
        </div>
      )}
    </div>
  );
}
