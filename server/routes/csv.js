const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Export leads as CSV
router.get('/export', (req, res) => {
  const { status, source } = req.query;

  const conditions = ['1=1'];
  const params = [];
  if (status) { conditions.push('status = ?'); params.push(status); }
  if (source) { conditions.push('source = ?'); params.push(source); }

  const leads = db.prepare(
    `SELECT company_name, country, city, contact_person, email, linkedin, source, status, notes, date_added, last_contact_date, next_followup_date FROM leads WHERE ${conditions.join(' AND ')} ORDER BY date_added DESC`
  ).all(...params);

  const csv = stringify(leads, {
    header: true,
    columns: [
      { key: 'company_name', header: 'Company Name' },
      { key: 'country', header: 'Country' },
      { key: 'city', header: 'City' },
      { key: 'contact_person', header: 'Contact Person' },
      { key: 'email', header: 'Email' },
      { key: 'linkedin', header: 'LinkedIn' },
      { key: 'source', header: 'Source' },
      { key: 'status', header: 'Status' },
      { key: 'notes', header: 'Notes' },
      { key: 'date_added', header: 'Date Added' },
      { key: 'last_contact_date', header: 'Last Contact Date' },
      { key: 'next_followup_date', header: 'Next Follow-up Date' },
    ],
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

// Import leads from CSV
router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  let records;
  try {
    records = parse(req.file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid CSV format' });
  }

  const validSources = ['Google Maps', 'LinkedIn', 'Event', 'Referral', 'Email Outreach', 'Other'];
  const validStatuses = ['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'];

  const insert = db.prepare(`
    INSERT INTO leads (company_name, country, city, contact_person, email, linkedin, source, status, notes, date_added, last_contact_date, next_followup_date, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const headerMap = {
    'company name': 'company_name', 'company_name': 'company_name', 'companyname': 'company_name',
    'country': 'country',
    'city': 'city',
    'contact person': 'contact_person', 'contact_person': 'contact_person', 'contactperson': 'contact_person',
    'email': 'email',
    'linkedin': 'linkedin',
    'source': 'source',
    'status': 'status',
    'notes': 'notes',
    'date added': 'date_added', 'date_added': 'date_added', 'dateadded': 'date_added',
    'last contact date': 'last_contact_date', 'last_contact_date': 'last_contact_date',
    'next follow-up date': 'next_followup_date', 'next_followup_date': 'next_followup_date', 'next followup date': 'next_followup_date',
  };

  let imported = 0;
  let skipped = 0;
  const errors = [];

  const transaction = db.transaction(() => {
    for (let i = 0; i < records.length; i++) {
      const raw = records[i];
      const row = {};
      for (const [key, value] of Object.entries(raw)) {
        const mapped = headerMap[key.toLowerCase().trim()];
        if (mapped) row[mapped] = value;
      }

      if (!row.company_name) {
        skipped++;
        errors.push(`Row ${i + 2}: Missing company name`);
        continue;
      }

      const source = validSources.includes(row.source) ? row.source : 'Other';
      const status = validStatuses.includes(row.status) ? row.status : 'New';

      insert.run(
        row.company_name,
        row.country || '',
        row.city || '',
        row.contact_person || '',
        row.email || '',
        row.linkedin || '',
        source,
        status,
        row.notes || '',
        row.date_added || new Date().toISOString().split('T')[0],
        row.last_contact_date || null,
        row.next_followup_date || null,
        req.user.id
      );
      imported++;
    }
  });

  transaction();
  res.json({ imported, skipped, errors: errors.slice(0, 20) });
});

module.exports = router;
