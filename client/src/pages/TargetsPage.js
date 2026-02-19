import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function TargetsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [target, setTarget] = useState({
    target_leads: 0, target_contacted: 0, target_replied: 0,
    target_registered: 0, target_activated: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch(`/api/targets/${month}`).then(data => {
      setTarget({
        target_leads: data.target_leads || 0,
        target_contacted: data.target_contacted || 0,
        target_replied: data.target_replied || 0,
        target_registered: data.target_registered || 0,
        target_activated: data.target_activated || 0,
      });
      setSaved(false);
    });
  }, [month]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await apiFetch(`/api/targets/${month}`, {
      method: 'PUT',
      body: JSON.stringify(target),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = [
    { key: 'target_leads', label: 'New Leads Target' },
    { key: 'target_contacted', label: 'Contacted Target' },
    { key: 'target_replied', label: 'Replies Target' },
    { key: 'target_registered', label: 'Registrations Target' },
    { key: 'target_activated', label: 'Activations Target' },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold text-gray-900">Monthly Targets</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input type="number" min={0} value={target[f.key]}
              onChange={e => setTarget(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Targets'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
