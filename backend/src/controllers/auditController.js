const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { action, entity_type, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    if (action) { params.push(`%${action}%`); query += ` AND action ILIKE $${params.length}`; }
    if (entity_type) { params.push(`%${entity_type}%`); query += ` AND entity_type ILIKE $${params.length}`; }
    params.push(parseInt(limit));
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    params.push(parseInt(offset));
    query += ` OFFSET $${params.length}`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};
