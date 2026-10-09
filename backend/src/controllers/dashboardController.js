const pool = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeDevices = await pool.query("SELECT COUNT(*) FROM devices WHERE status = 'active'");
    const activitiesToday = await pool.query("SELECT COUNT(*) FROM activity_logs WHERE created_at > NOW() - INTERVAL '24 HOURS'");
    const openAlerts = await pool.query("SELECT COUNT(*) FROM threat_alerts WHERE status = 'OPEN'");
    const highRiskUsers = await pool.query("SELECT COUNT(*) FROM users WHERE risk_level IN ('HIGH', 'CRITICAL')");
    const criticalThreats = await pool.query("SELECT COUNT(*) FROM threat_alerts WHERE severity = 'CRITICAL' AND status = 'OPEN'");
    
    const alertsSeverityRaw = await pool.query('SELECT severity, COUNT(*) FROM threat_alerts GROUP BY severity');
    const alertsBySeverity = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    alertsSeverityRaw.rows.forEach(r => alertsBySeverity[r.severity] = parseInt(r.count));
    
    const recentAlerts = await pool.query('SELECT * FROM threat_alerts ORDER BY created_at DESC LIMIT 5');
    const recentActivities = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5');
    
    const riskDistributionRaw = await pool.query('SELECT risk_level, COUNT(*) FROM users GROUP BY risk_level');
    const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    riskDistributionRaw.rows.forEach(r => riskDistribution[r.risk_level] = parseInt(r.count));
    
    const invStatsRaw = await pool.query('SELECT status, COUNT(*) FROM investigation_cases GROUP BY status');
    const investigationStats = { open: 0, inProgress: 0, resolved: 0 };
    invStatsRaw.rows.forEach(r => {
      if (r.status === 'OPEN') investigationStats.open = parseInt(r.count);
      else if (r.status === 'IN_PROGRESS') investigationStats.inProgress = parseInt(r.count);
      else if (r.status === 'RESOLVED' || r.status === 'CLOSED') investigationStats.resolved += parseInt(r.count);
    });

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeDevices: parseInt(activeDevices.rows[0].count),
      activitiesToday: parseInt(activitiesToday.rows[0].count),
      openAlerts: parseInt(openAlerts.rows[0].count),
      highRiskUsers: parseInt(highRiskUsers.rows[0].count),
      criticalThreats: parseInt(criticalThreats.rows[0].count),
      alertsBySeverity,
      recentAlerts: recentAlerts.rows,
      recentActivities: recentActivities.rows,
      riskDistribution,
      investigationStats
    });
  } catch (err) { next(err); }
};
