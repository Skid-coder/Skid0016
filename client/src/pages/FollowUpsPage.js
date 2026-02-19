import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Replied: 'bg-purple-100 text-purple-700',
  Registered: 'bg-green-100 text-green-700',
  Activated: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function FollowUpsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followupModal, setFollowupModal] = useState(null);
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    // Fetch all non-terminal leads and filter those with overdue/today followups
    const data = await apiFetch('/api/leads?limit=200&sort_by=next_followup_date&sort_order=ASC');
    const filtered = data.leads.filter(
      l => l.next_followup_date && l.next_followup_date <= today && !['Activated', 'Rejected'].includes(l.status)
    );
    setLeads(filtered);
    setLoading(false);
  }, [today]);

  useEffect(() => { fetchFollowups(); }, [fetchFollowups]);

  async function handleFollowupDone() {
    if (!followupModal) return;
    setSaving(true);
    await apiFetch(`/api/leads/${followupModal.id}/followup`, {
      method: 'POST',
      body: JSON.stringify({ next_followup_date: nextDate || null, notes }),
    });
    setSaving(false);
    setFollowupModal(null);
    setNextDate('');
    setNotes('');
    fetchFollowups();
  }

  function openFollowup(lead) {
    setFollowupModal(lead);
    // Default next followup to 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setNextDate(d.toISOString().split('T')[0]);
    setNotes('');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Follow-ups Due</h2>
        <span className="text-sm text-gray-500">Today: {today}</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">No follow-ups due today</p>
          <p className="text-gray-400 text-sm mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => {
            const isOverdue = lead.next_followup_date < today;
            return (
              <div key={lead.id} className={`bg-white rounded-xl shadow-sm border ${isOverdue ? 'border-red-300' : 'border-gray-200'} p-4 flex flex-wrap items-center gap-4`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{lead.company_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                    {isOverdue && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Overdue</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {lead.contact_person || 'No contact'} &middot; {lead.email || 'No email'} &middot; {lead.source}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Follow-up scheduled: {lead.next_followup_date}
                    {lead.last_contact_date && ` &middot; Last contact: ${lead.last_contact_date}`}
                  </p>
                  {lead.notes && <p className="text-xs text-gray-400 mt-1 truncate">Notes: {lead.notes}</p>}
                </div>
                <button onClick={() => openFollowup(lead)}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex-shrink-0">
                  Mark Done
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Follow-up Modal */}
      {followupModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setFollowupModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Complete Follow-up</h3>
              <p className="text-sm text-gray-500">{followupModal.company_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Next Follow-up</label>
                <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                <p className="text-xs text-gray-400 mt-1">Leave empty if no further follow-up needed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="What happened during this follow-up..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setFollowupModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleFollowupDone} disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Mark Done & Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
