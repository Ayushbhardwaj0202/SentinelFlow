const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.username, d.device_name 
      FROM network_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN devices d ON s.device_id = d.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM network_sessions WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, device_id, session_token, ip_address } = req.body;
    const result = await pool.query(`
      INSERT INTO network_sessions (user_id, device_id, session_token, ip_address)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [user_id, device_id, session_token, ip_address]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.endSession = async (req, res, next) => {
  try {
    const result = await pool.query(`
      UPDATE network_sessions SET status = 'ended', logout_time = NOW()
      WHERE id = $1 RETURNING *
    `, [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
