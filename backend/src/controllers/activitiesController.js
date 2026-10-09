const pool = require('../config/db');
const { calculateRiskScore } = require('../utils/riskScorer');
const { detectThreats } = require('../utils/threatDetector');
const { logAudit } = require('../utils/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const { user_id, type, suspicious } = req.query;
    let query = `
      SELECT a.*, u.username, d.device_name 
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN devices d ON a.device_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (user_id) { params.push(user_id); query += ` AND a.user_id = $${params.length}`; }
    if (type) { params.push(type); query += ` AND a.activity_type = $${params.length}`; }
    if (suspicious) { params.push(suspicious === 'true'); query += ` AND a.is_suspicious = $${params.length}`; }
    query += ' ORDER BY a.created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM activity_logs WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, device_id, session_id, activity_type, resource, source_ip, status, metadata } = req.body;
    if (!user_id || !activity_type) return res.status(400).json({ error: 'Missing required fields' });

    const insertResult = await pool.query(`
      INSERT INTO activity_logs (user_id, device_id, session_id, activity_type, resource, source_ip, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [user_id, device_id, session_id, activity_type, resource, source_ip, status || 'success', metadata ? JSON.stringify(metadata) : null]);
    
    const activity = insertResult.rows[0];

    // Compute Risk
    const recentActivitiesResult = await pool.query("SELECT COUNT(*) as count FROM activity_logs WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 HOURS'", [user_id]);
    const failedLoginsResult = await pool.query("SELECT COUNT(*) as count FROM activity_logs WHERE user_id = $1 AND activity_type = 'FAILED_LOGIN' AND created_at > NOW() - INTERVAL '24 HOURS'", [user_id]);
    const dataExportsResult = await pool.query("SELECT COUNT(*) as count FROM activity_logs WHERE user_id = $1 AND activity_type = 'DATA_EXPORT' AND created_at > NOW() - INTERVAL '24 HOURS'", [user_id]);
    
    const hour = new Date().getHours();
    const unusualTimeLogin = hour < 8 || hour >= 18;
    const sensitiveResourceAccess = resource && (resource.toLowerCase().includes('admin') || resource.toLowerCase().includes('export'));
    
    const factors = {
      failedLogins: parseInt(failedLoginsResult.rows[0].count),
      unusualTimeLogin,
      unusualActivityVolume: parseInt(recentActivitiesResult.rows[0].count) > 100,
      sensitiveResourceAccess,
      unknownDevice: !device_id,
      policyViolations: 0,
      dataExports: parseInt(dataExportsResult.rows[0].count),
      previousAlerts: 0
    };

    const riskResult = calculateRiskScore(factors);

    const baResult = await pool.query(`
      INSERT INTO behavior_analysis (user_id, total_activities, failed_logins, data_exports)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [user_id, parseInt(recentActivitiesResult.rows[0].count), factors.failedLogins, factors.dataExports]);

    const raResult = await pool.query(`
      INSERT INTO risk_assessments (user_id, behavior_analysis_id, risk_score, risk_level, contributing_factors)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [user_id, baResult.rows[0].id, riskResult.score, riskResult.level, JSON.stringify(riskResult.factors)]);

    await pool.query('UPDATE activity_logs SET risk_score = $1, is_suspicious = $2 WHERE id = $3', [riskResult.score, riskResult.score >= 30, activity.id]);
    await pool.query('UPDATE users SET risk_level = $1 WHERE id = $2', [riskResult.level, user_id]);

    const alert = await detectThreats(pool, user_id, activity.id, riskResult);

    await logAudit(pool, { actorId: req.user.id, actorUsername: req.user.username, action: 'RECORD_ACTIVITY', entityType: 'ACTIVITY', entityId: activity.id, description: `Recorded ${activity_type}`, ipAddress: req.ip });

    res.status(201).json({ activity, riskResult, alert });
  } catch (err) { next(err); }
};
