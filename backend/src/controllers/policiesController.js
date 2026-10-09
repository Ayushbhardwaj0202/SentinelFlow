const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username as created_by_username
      FROM policies p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM policies WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Policy not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, policy_type, status, rules } = req.body;
    if (!name) return res.status(400).json({ error: 'Policy name is required' });
    const result = await pool.query(`
      INSERT INTO policies (name, description, policy_type, status, rules, created_by)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [name, description, policy_type || 'GENERAL', status || 'active', rules ? JSON.stringify(rules) : null, req.user.id]);
    await logAudit(pool, {
      actorId: req.user.id, actorUsername: req.user.username,
      action: 'CREATE_POLICY', entityType: 'POLICY', entityId: result.rows[0].id,
      description: `Created policy: ${name}`, ipAddress: req.ip
    });
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, policy_type, status, rules } = req.body;
    const result = await pool.query(`
      UPDATE policies SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        policy_type = COALESCE($3, policy_type),
        status = COALESCE($4, status),
        rules = COALESCE($5, rules),
        updated_at = NOW()
      WHERE id = $6 RETURNING *
    `, [name, description, policy_type, status, rules ? JSON.stringify(rules) : null, req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Policy not found' });
    await logAudit(pool, {
      actorId: req.user.id, actorUsername: req.user.username,
      action: 'UPDATE_POLICY', entityType: 'POLICY', entityId: req.params.id,
      description: `Updated policy #${req.params.id}`, ipAddress: req.ip
    });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deletePolicy = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM policies WHERE id = $1', [req.params.id]);
    await logAudit(pool, {
      actorId: req.user.id, actorUsername: req.user.username,
      action: 'DELETE_POLICY', entityType: 'POLICY', entityId: req.params.id,
      description: `Deleted policy #${req.params.id}`, ipAddress: req.ip
    });
    res.json({ message: 'Policy deleted' });
  } catch (err) { next(err); }
};
