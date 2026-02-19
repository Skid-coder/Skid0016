require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const kpiRoutes = require('./routes/kpi');
const targetRoutes = require('./routes/targets');
const csvRoutes = require('./routes/csv');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/csv', csvRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CRM server running on port ${PORT}`);
});
