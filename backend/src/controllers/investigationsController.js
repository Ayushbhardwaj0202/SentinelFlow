const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.username as assigned_analyst 
      FROM investigation_cases c
      LEFT JOIN users u ON c.assigned_analyst_id = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.username as assigned_analyst 
      FROM investigation_cases c
      LEFT JOIN users u ON c.assigned_analyst_id = u.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Case not found' });
    
    const findingsResult = await pool.query('SELECT * FROM investigation_findings WHERE case_id = $1 ORDER BY created_at ASC', [req.params.id]);
    res.json({ ...result.rows[0], findings: findingsResult.rows });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { alert_id, assigned_analyst_id, title, description, priority } = req.body;
    const d = new Date();
    const case_number = `CASE-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const result = await pool.query(`
      INSERT INTO investigation_cases (case_number, alert_id, assigned_analyst_id, title, description, priority, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [case_number, alert_id, assigned_analyst_id, title, description, priority || 'MEDIUM', req.user.id]);
    
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'CREATE_CASE', entityType: 'INVESTIGATION', entityId: result.rows[0].id, description: `Created case ${case_number}`, ipAddress: req.ip });
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { status, priority, description, resolution, assigned_analyst_id } = req.body;
    const result = await pool.query(`
      UPDATE investigation_cases 
      SET status = COALESCE($1, status), priority = COALESCE($2, priority), description = COALESCE($3, description), resolution = COALESCE($4, resolution), assigned_analyst_id = COALESCE($5, assigned_analyst_id), updated_at = NOW()
      WHERE id = $6 RETURNING *
    `, [status, priority, description, resolution, assigned_analyst_id, req.params.id]);
    
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'UPDATE_CASE', entityType: 'INVESTIGATION', entityId: req.params.id, description: 'Updated case', ipAddress: req.ip });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.addFinding = async (req, res, next) => {
  try {
    const { finding_type, content } = req.body;
    const result = await pool.query(`
      INSERT INTO investigation_findings (case_id, analyst_id, finding_type, content)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [req.params.id, req.user.id, finding_type, content]);
    
    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'ADD_FINDING', entityType: 'INVESTIGATION', entityId: req.params.id, description: 'Added finding', ipAddress: req.ip });
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getFindings = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM investigation_findings WHERE case_id = $1 ORDER BY created_at', [req.params.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};
