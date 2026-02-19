import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import LeadModal from '../components/LeadModal';

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Replied: 'bg-purple-100 text-purple-700',
  Registered: 'bg-green-100 text-green-700',
  Activated: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 25, sort_by: sortBy, sort_order: sortOrder });
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    if (filterSource) params.set('source', filterSource);

    const data = await apiFetch(`/api/leads?${params}`);
    setLeads(data.leads);
    setTotal(data.total);
    setTotalPages(data.total_pages);
    setLoading(false);
  }, [page, search, filterStatus, filterSource, sortBy, sortOrder]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleSave(form) {
    if (editingLead) {
      await apiFetch(`/api/leads/${editingLead.id}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiFetch('/api/leads', { method: 'POST', body: JSON.stringify(form) });
    }
    fetchLeads();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this lead?')) return;
    await apiFetch(`/api/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
  }

  function handleSort(col) {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(col);
      setSortOrder('ASC');
    }
  }

  const SortIcon = ({ col }) => (
    sortBy === col ? (
      <span className="ml-1 text-primary-500">{sortOrder === 'ASC' ? '\u2191' : '\u2193'}</span>
    ) : null
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Leads ({total})</h2>
        <button onClick={() => { setEditingLead(null); setModalOpen(true); }}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search leads..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-64" />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Statuses</option>
          {['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Sources</option>
          {['Google Maps', 'LinkedIn', 'Event', 'Referral', 'Email Outreach', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('company_name')}>
                Company<SortIcon col="company_name" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                Status<SortIcon col="status" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('date_added')}>
                Added<SortIcon col="date_added" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleSort('next_followup_date')}>
                Follow-up<SortIcon col="next_followup_date" />
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No leads found</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{lead.company_name}</div>
                  {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700">{lead.contact_person || '—'}</div>
                  {lead.linkedin && (
                    <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">LinkedIn</a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {[lead.city, lead.country].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{lead.source}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{lead.date_added || '—'}</td>
                <td className="px-4 py-3">
                  {lead.next_followup_date ? (
                    <span className={`text-xs font-medium ${new Date(lead.next_followup_date) <= new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                      {lead.next_followup_date}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingLead(lead); setModalOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(lead.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {modalOpen && <LeadModal lead={editingLead} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
