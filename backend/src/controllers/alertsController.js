const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const { severity, status } = req.query;
    let query = `
      SELECT t.*, u.username 
      FROM threat_alerts t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (severity) { params.push(severity); query += ` AND t.severity = $${params.length}`; }
    if (status) { params.push(status); query += ` AND t.status = $${params.length}`; }
    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.username, a.activity_type, r.risk_score as assessment_score
      FROM threat_alerts t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN activity_logs a ON t.source_activity_id = a.id
      LEFT JOIN risk_assessments r ON t.risk_assessment_id = r.id
      WHERE t.id = $1
    `, [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, user_id, severity, risk_score } = req.body;
    const result = await pool.query(`
      INSERT INTO threat_alerts (title, description, user_id, severity, risk_score)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [title, description, user_id, severity, risk_score]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { status, severity } = req.body;
    const result = await pool.query(`
      UPDATE threat_alerts SET status = COALESCE($1, status), severity = COALESCE($2, severity), updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [status, severity, req.params.id]);
    
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'UPDATE_ALERT', entityType: 'ALERT', entityId: req.params.id, description: `Updated alert status to ${status}`, ipAddress: req.ip });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
