const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../utils/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.full_name, u.department, u.status, u.risk_level, u.last_login, u.created_at, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.full_name, u.department, u.status, u.risk_level, u.last_login, u.created_at, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { username, email, password, full_name, role_id, department } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role_id, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, full_name, department
    `, [username, email, hash, full_name, role_id, department]);
    
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'CREATE_USER', entityType: 'USER', entityId: result.rows[0].id, description: 'Created new user', ipAddress: req.ip });
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { full_name, department, status, risk_level, role_id } = req.body;
    const result = await pool.query(`
      UPDATE users SET full_name = COALESCE($1, full_name), department = COALESCE($2, department), status = COALESCE($3, status), risk_level = COALESCE($4, risk_level), role_id = COALESCE($5, role_id), updated_at = NOW()
      WHERE id = $6 RETURNING id, username
    `, [full_name, department, status, risk_level, role_id, req.params.id]);
    
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'UPDATE_USER', entityType: 'USER', entityId: req.params.id, description: 'Updated user', ipAddress: req.ip });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'DELETE_USER', entityType: 'USER', entityId: req.params.id, description: 'Deleted user', ipAddress: req.ip });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};
