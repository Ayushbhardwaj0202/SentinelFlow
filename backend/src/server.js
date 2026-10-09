const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/behavior-analysis', require('./routes/behavior'));
app.use('/api/risk-assessments', require('./routes/risk'));
app.use('/api/threats', require('./routes/threats'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/investigations', require('./routes/investigations'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/audit-logs', require('./routes/audit'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/policies', require('./routes/policies'));

// Health check
app.get('/', (req, res) => res.json({ message: 'SentinelFlow API is running', version: '1.0.0' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('SentinelFlow API running on port ' + PORT);
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
});