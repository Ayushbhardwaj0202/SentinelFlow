const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.username 
      FROM risk_assessments r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM risk_assessments WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, risk_score, risk_level, contributing_factors } = req.body;
    const result = await pool.query(`
      INSERT INTO risk_assessments (user_id, risk_score, risk_level, contributing_factors)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [user_id, risk_score, risk_level, JSON.stringify(contributing_factors)]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};
