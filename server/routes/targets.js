const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get target for a month
router.get('/:month', (req, res) => {
  const target = db.prepare(
    'SELECT * FROM targets WHERE user_id = ? AND month = ?'
  ).get(req.user.id, req.params.month);

  res.json(target || {
    month: req.params.month,
    target_leads: 0,
    target_contacted: 0,
    target_replied: 0,
    target_registered: 0,
    target_activated: 0,
  });
});

// Set/update target for a month
router.put('/:month', (req, res) => {
  const { target_leads, target_contacted, target_replied, target_registered, target_activated } = req.body;

  db.prepare(`
    INSERT INTO targets (user_id, month, target_leads, target_contacted, target_replied, target_registered, target_activated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, month) DO UPDATE SET
      target_leads = excluded.target_leads,
      target_contacted = excluded.target_contacted,
      target_replied = excluded.target_replied,
      target_registered = excluded.target_registered,
      target_activated = excluded.target_activated
  `).run(
    req.user.id,
    req.params.month,
    target_leads || 0,
    target_contacted || 0,
    target_replied || 0,
    target_registered || 0,
    target_activated || 0
  );

  const target = db.prepare(
    'SELECT * FROM targets WHERE user_id = ? AND month = ?'
  ).get(req.user.id, req.params.month);

  res.json(target);
});

module.exports = router;
