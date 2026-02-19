const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Overview KPIs
router.get('/overview', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  const byStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
  ).all();

  const statusMap = {};
  byStatus.forEach(row => { statusMap[row.status] = row.count; });

  const today = new Date().toISOString().split('T')[0];
  const newToday = db.prepare(
    'SELECT COUNT(*) as count FROM leads WHERE date_added = ?'
  ).get(today).count;

  const overdueFollowups = db.prepare(
    "SELECT COUNT(*) as count FROM leads WHERE next_followup_date <= ? AND status NOT IN ('Activated', 'Rejected')"
  ).get(today).count;

  res.json({
    total,
    by_status: statusMap,
    new_today: newToday,
    overdue_followups: overdueFollowups,
  });
});

// Daily stats for charts (last 30 days)
router.get('/daily', (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const newLeads = db.prepare(`
    SELECT date_added as date, COUNT(*) as count
    FROM leads
    WHERE date_added >= date('now', '-' || ? || ' days')
    GROUP BY date_added
    ORDER BY date_added
  `).all(days);

  const contacted = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM activity_log
    WHERE action = 'status_change' AND details LIKE '%"Contacted"%'
      AND created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY date(created_at)
    ORDER BY date(created_at)
  `).all(days);

  const replies = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM activity_log
    WHERE action = 'status_change' AND details LIKE '%"Replied"%'
      AND created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY date(created_at)
    ORDER BY date(created_at)
  `).all(days);

  const registrations = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM activity_log
    WHERE action = 'status_change' AND details LIKE '%"Registered"%'
      AND created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY date(created_at)
    ORDER BY date(created_at)
  `).all(days);

  res.json({ new_leads: newLeads, contacted, replies, registrations });
});

// Conversion funnel
router.get('/funnel', (req, res) => {
  const month = req.query.month; // format: YYYY-MM

  let dateFilter = '';
  const params = [];
  if (month) {
    dateFilter = "WHERE date_added LIKE ? || '%'";
    params.push(month);
  }

  const stages = ['New', 'Contacted', 'Replied', 'Registered', 'Activated', 'Rejected'];
  const funnel = {};

  for (const stage of stages) {
    const query = month
      ? `SELECT COUNT(*) as count FROM leads WHERE date_added LIKE ? || '%' AND status = ?`
      : 'SELECT COUNT(*) as count FROM leads WHERE status = ?';
    const p = month ? [month, stage] : [stage];
    funnel[stage] = db.prepare(query).get(...p).count;
  }

  // Conversion rates
  const total = Object.values(funnel).reduce((a, b) => a + b, 0);
  const rates = {};
  if (total > 0) {
    const pipeline = total - (funnel['Rejected'] || 0);
    rates['contacted_rate'] = total > 0 ? (((funnel['Contacted'] || 0) + (funnel['Replied'] || 0) + (funnel['Registered'] || 0) + (funnel['Activated'] || 0)) / total * 100).toFixed(1) : 0;
    rates['reply_rate'] = total > 0 ? (((funnel['Replied'] || 0) + (funnel['Registered'] || 0) + (funnel['Activated'] || 0)) / total * 100).toFixed(1) : 0;
    rates['registration_rate'] = total > 0 ? (((funnel['Registered'] || 0) + (funnel['Activated'] || 0)) / total * 100).toFixed(1) : 0;
    rates['activation_rate'] = total > 0 ? ((funnel['Activated'] || 0) / total * 100).toFixed(1) : 0;
  }

  res.json({ funnel, rates, total });
});

// Monthly progress vs target
router.get('/monthly-progress', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const target = db.prepare(
    'SELECT * FROM targets WHERE user_id = ? AND month = ?'
  ).get(req.user.id, month);

  const actual = {
    leads: db.prepare("SELECT COUNT(*) as count FROM leads WHERE date_added LIKE ? || '%'").get(month).count,
    contacted: db.prepare("SELECT COUNT(*) as count FROM leads WHERE date_added LIKE ? || '%' AND status IN ('Contacted','Replied','Registered','Activated')").get(month).count,
    replied: db.prepare("SELECT COUNT(*) as count FROM leads WHERE date_added LIKE ? || '%' AND status IN ('Replied','Registered','Activated')").get(month).count,
    registered: db.prepare("SELECT COUNT(*) as count FROM leads WHERE date_added LIKE ? || '%' AND status IN ('Registered','Activated')").get(month).count,
    activated: db.prepare("SELECT COUNT(*) as count FROM leads WHERE date_added LIKE ? || '%' AND status = 'Activated'").get(month).count,
  };

  res.json({
    month,
    target: target || { target_leads: 0, target_contacted: 0, target_replied: 0, target_registered: 0, target_activated: 0 },
    actual,
  });
});

module.exports = router;
