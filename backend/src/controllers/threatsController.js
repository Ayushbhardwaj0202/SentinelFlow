const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM threat_alerts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
};
exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM threat_alerts WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  try {
    const { title, description, user_id, severity, risk_score } = req.body;
    const result = await pool.query(`INSERT INTO threat_alerts (title, description, user_id, severity, risk_score) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [title, description, user_id, severity, risk_score]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const { status, severity } = req.body;
    const result = await pool.query(`UPDATE threat_alerts SET status = COALESCE($1, status), severity = COALESCE($2, severity), updated_at = NOW() WHERE id = $3 RETURNING *`, [status, severity, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
