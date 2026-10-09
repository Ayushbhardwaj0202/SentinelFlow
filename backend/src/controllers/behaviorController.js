const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.username 
      FROM behavior_analysis b 
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getByUser = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const result = await pool.query('SELECT * FROM behavior_analysis WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.analyze = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });
    const baResult = await pool.query(`
      INSERT INTO behavior_analysis (user_id, total_activities)
      VALUES ($1, 0) RETURNING *
    `, [user_id]);
    res.status(201).json(baResult.rows[0]);
  } catch (err) { next(err); }
};
