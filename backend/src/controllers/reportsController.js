const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT sr.*, u.username as generated_by_username
      FROM security_reports sr
      LEFT JOIN users u ON sr.generated_by = u.id
      ORDER BY sr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT sr.*, u.username as generated_by_username
      FROM security_reports sr
      LEFT JOIN users u ON sr.generated_by = u.id
      WHERE sr.id = $1
    `, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.generate = async (req, res, next) => {
  try {
    const { title, report_type, period_start, period_end } = req.body;
    if (!title) return res.status(400).json({ error: 'Report title is required' });

    // Aggregate real data from DB
    const [
      uResult, dResult, aResult, alertOpen,
      alertsBySeverity, riskDist, openInv,
      topRiskyUsers, recentAlerts
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM devices WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) FROM activity_logs'),
      pool.query("SELECT COUNT(*) FROM threat_alerts WHERE status = 'OPEN'"),
      pool.query(`
        SELECT severity, COUNT(*) as count 
        FROM threat_alerts GROUP BY severity
      `),
      pool.query(`
        SELECT risk_level, COUNT(*) as count 
        FROM users GROUP BY risk_level
      `),
      pool.query("SELECT COUNT(*) FROM investigation_cases WHERE status IN ('OPEN','IN_PROGRESS')"),
      pool.query(`
        SELECT username, risk_level, department FROM users 
        WHERE risk_level IN ('HIGH','CRITICAL') ORDER BY 
        CASE risk_level WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 ELSE 3 END LIMIT 5
      `),
      pool.query(`
        SELECT ta.title, ta.severity, ta.status, u.username, ta.created_at
        FROM threat_alerts ta
        LEFT JOIN users u ON ta.user_id = u.id
        ORDER BY ta.created_at DESC LIMIT 5
      `),
    ]);

    const alertsBySevObj = {};
    alertsBySeverity.rows.forEach(r => { alertsBySevObj[r.severity] = parseInt(r.count); });

    const riskDistObj = {};
    riskDist.rows.forEach(r => { riskDistObj[r.risk_level] = parseInt(r.count); });

    const content = {
      totalUsers: parseInt(uResult.rows[0].count),
      activeDevices: parseInt(dResult.rows[0].count),
      totalActivities: parseInt(aResult.rows[0].count),
      openAlerts: parseInt(alertOpen.rows[0].count),
      highRiskUsers: (riskDistObj['HIGH'] || 0) + (riskDistObj['CRITICAL'] || 0),
      openInvestigations: parseInt(openInv.rows[0].count),
      alertsBySeverity: alertsBySevObj,
      riskDistribution: riskDistObj,
      topRiskyUsers: topRiskyUsers.rows,
      recentAlerts: recentAlerts.rows,
      generatedAt: new Date().toISOString(),
    };

    const summary = `Security report covering ${parseInt(aResult.rows[0].count)} activities, ${parseInt(alertOpen.rows[0].count)} open alerts, and ${parseInt(openInv.rows[0].count)} active investigations.`;

    const result = await pool.query(`
      INSERT INTO security_reports (title, report_type, generated_by, period_start, period_end, content, summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [title, report_type || 'SECURITY_SUMMARY', req.user.id, period_start || null, period_end || null, JSON.stringify(content), summary]);

    await logAudit(pool, {
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: 'GENERATE_REPORT',
      entityType: 'REPORT',
      entityId: result.rows[0].id,
      description: `Generated report: ${title}`,
      ipAddress: req.ip
    });

    res.status(201).json({ ...result.rows[0], generated_by_username: req.user.username });
  } catch (err) { next(err); }
};
