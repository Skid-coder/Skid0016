const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// List leads with filtering, sorting, and pagination
router.get('/', (req, res) => {
  const {
    status, source, search,
    sort_by = 'date_added', sort_order = 'DESC',
    page = 1, limit = 50,
  } = req.query;

  const conditions = ['1=1'];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (source) {
    conditions.push('source = ?');
    params.push(source);
  }
  if (search) {
    conditions.push('(company_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR city LIKE ? OR country LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }

  const allowedSorts = ['date_added', 'company_name', 'status', 'last_contact_date', 'next_followup_date', 'created_at'];
  const sortCol = allowedSorts.includes(sort_by) ? sort_by : 'date_added';
  const order = sort_order === 'ASC' ? 'ASC' : 'DESC';

  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  const where = conditions.join(' AND ');
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM leads WHERE ${where}`).get(...params);
  const leads = db.prepare(
    `SELECT * FROM leads WHERE ${where} ORDER BY ${sortCol} ${order} LIMIT ? OFFSET ?`
  ).all(...params, parseInt(limit), offset);

  res.json({
    leads,
    total: countRow.total,
    page: parseInt(page),
    total_pages: Math.ceil(countRow.total / parseInt(limit)),
  });
});

// Get single lead
router.get('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const activities = db.prepare(
    'SELECT * FROM activity_log WHERE lead_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.params.id);

  res.json({ ...lead, activities });
});

// Create lead
router.post('/', (req, res) => {
  const {
    company_name, country, city, contact_person, email, linkedin,
    source, status, notes, next_followup_date,
  } = req.body;

  if (!company_name) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  const result = db.prepare(`
    INSERT INTO leads (company_name, country, city, contact_person, email, linkedin, source, status, notes, next_followup_date, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    company_name,
    country || '',
    city || '',
    contact_person || '',
    email || '',
    linkedin || '',
    source || 'Other',
    status || 'New',
    notes || '',
    next_followup_date || null,
    req.user.id
  );

  db.prepare('INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)').run(
    result.lastInsertRowid, req.user.id, 'created', `Lead "${company_name}" created`
  );

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(lead);
});

// Update lead
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found' });

  const {
    company_name, country, city, contact_person, email, linkedin,
    source, status, notes, last_contact_date, next_followup_date,
  } = req.body;

  db.prepare(`
    UPDATE leads SET
      company_name = ?, country = ?, city = ?, contact_person = ?, email = ?, linkedin = ?,
      source = ?, status = ?, notes = ?, last_contact_date = ?, next_followup_date = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    company_name ?? existing.company_name,
    country ?? existing.country,
    city ?? existing.city,
    contact_person ?? existing.contact_person,
    email ?? existing.email,
    linkedin ?? existing.linkedin,
    source ?? existing.source,
    status ?? existing.status,
    notes ?? existing.notes,
    last_contact_date ?? existing.last_contact_date,
    next_followup_date ?? existing.next_followup_date,
    req.params.id
  );

  // Log status change
  if (status && status !== existing.status) {
    db.prepare('INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)').run(
      req.params.id, req.user.id, 'status_change', `Status changed from "${existing.status}" to "${status}"`
    );
  }

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete lead
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found' });

  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted' });
});

// Mark follow-up done and schedule next
router.post('/:id/followup', (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found' });

  const { next_followup_date, notes } = req.body;

  db.prepare(`
    UPDATE leads SET
      last_contact_date = date('now'),
      next_followup_date = ?,
      notes = CASE WHEN ? != '' THEN ? ELSE notes END,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    next_followup_date || null,
    notes || '',
    notes || '',
    req.params.id
  );

  db.prepare('INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)').run(
    req.params.id, req.user.id, 'followup_done',
    `Follow-up completed. Next: ${next_followup_date || 'none scheduled'}`
  );

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Bulk status update (for Kanban drag-and-drop)
router.patch('/bulk-status', (req, res) => {
  const { lead_ids, status } = req.body;
  const validStatuses = ['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
    return res.status(400).json({ error: 'lead_ids must be a non-empty array' });
  }

  const update = db.prepare("UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?");
  const logEntry = db.prepare('INSERT INTO activity_log (lead_id, user_id, action, details) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    for (const id of lead_ids) {
      update.run(status, id);
      logEntry.run(id, req.user.id, 'status_change', `Status changed to "${status}"`);
    }
  });

  transaction();
  res.json({ message: `Updated ${lead_ids.length} leads to "${status}"` });
});

module.exports = router;
