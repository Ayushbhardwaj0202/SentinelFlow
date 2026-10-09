const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT d.*, u.username as user_username 
      FROM devices d 
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT d.*, u.username as user_username 
      FROM devices d 
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Device not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, device_name, device_type, os_type, mac_address, ip_address } = req.body;
    const result = await pool.query(`
      INSERT INTO devices (user_id, device_name, device_type, os_type, mac_address, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [user_id || req.user.id, device_name, device_type, os_type, mac_address, ip_address]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { status, is_registered } = req.body;
    const result = await pool.query(`
      UPDATE devices SET status = COALESCE($1, status), is_registered = COALESCE($2, is_registered), updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [status, is_registered, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteDevice = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM devices WHERE id = $1', [req.params.id]);
    res.json({ message: 'Device deleted' });
  } catch (err) { next(err); }
};
