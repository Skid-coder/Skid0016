import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import LeadModal from '../components/LeadModal';

const STATUSES = ['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'];

const STATUS_COLORS = {
  New: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  Contacted: { bg: 'bg-yellow-50', border: 'border-yellow-200', header: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  Replied: { bg: 'bg-purple-50', border: 'border-purple-200', header: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  Registered: { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  Activated: { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  Rejected: { bg: 'bg-red-50', border: 'border-red-200', header: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
};

export default function PipelinePage() {
  const [leadsByStatus, setLeadsByStatus] = useState({});
  const [draggedLead, setDraggedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    const grouped = {};
    for (const status of STATUSES) {
      const data = await apiFetch(`/api/leads?status=${encodeURIComponent(status)}&limit=100&sort_by=date_added&sort_order=DESC`);
      grouped[status] = data.leads;
    }
    setLeadsByStatus(grouped);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  function handleDragStart(e, lead) {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  async function handleDrop(e, newStatus) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedLead || draggedLead.status === newStatus) return;

    await apiFetch(`/api/leads/${draggedLead.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
    setDraggedLead(null);
    fetchLeads();
  }

  async function handleSave(form) {
    if (editingLead) {
      await apiFetch(`/api/leads/${editingLead.id}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiFetch('/api/leads', { method: 'POST', body: JSON.stringify(form) });
    }
    fetchLeads();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Pipeline</h2>
        <button onClick={() => { setEditingLead(null); setModalOpen(true); }}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
          + Add Lead
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {STATUSES.map(status => {
          const leads = leadsByStatus[status] || [];
          const colors = STATUS_COLORS[status];
          return (
            <div key={status}
              className={`kanban-column flex-shrink-0 w-72 rounded-xl border-2 ${colors.border} ${colors.bg} flex flex-col`}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, status)}>
              <div className={`${colors.header} text-white px-4 py-2.5 rounded-t-lg flex items-center justify-between`}>
                <span className="font-semibold text-sm">{status}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{leads.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {leads.map(lead => (
                  <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    onClick={() => { setEditingLead(lead); setModalOpen(true); }}>
                    <p className="font-medium text-gray-900 text-sm">{lead.company_name}</p>
                    {lead.contact_person && <p className="text-xs text-gray-500 mt-0.5">{lead.contact_person}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {lead.country && <span className="text-xs text-gray-400">{lead.country}</span>}
                      <span className="text-xs text-gray-400">{lead.source}</span>
                    </div>
                    {lead.next_followup_date && (
                      <p className={`text-xs mt-1.5 ${new Date(lead.next_followup_date) <= new Date() ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                        Follow-up: {lead.next_followup_date}
                      </p>
                    )}
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-center text-xs text-gray-400 py-8">Drop leads here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && <LeadModal lead={editingLead} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
