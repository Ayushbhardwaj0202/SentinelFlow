const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get("/summary", async (req, res) => {
  try {
    const activities = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM sentinelflow_activities
    `);

    const threats = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM sentinelflow_threat_alerts
    `);

    const openThreats = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM sentinelflow_threat_alerts
      WHERE status IN (
        'OPEN',
        'ACKNOWLEDGED',
        'UNDER_INVESTIGATION'
      )
    `);

    const criticalThreats = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM sentinelflow_threat_alerts
      WHERE severity = 'CRITICAL'
    `);

    const investigations = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM sentinelflow_investigations
      WHERE status = 'UNDER_INVESTIGATION'
    `);

    const resolvedInvestigations = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM sentinelflow_investigations
      WHERE status = 'RESOLVED'
    `);

    const risk = await pool.query(`
      SELECT COALESCE(
        ROUND(AVG(risk_score)::numeric, 2),
        0
      ) AS average
      FROM sentinelflow_activities
    `);

    const recentActivities = await pool.query(`
      SELECT
        id,
        username,
        activity_type,
        resource,
        risk_score,
        risk_level,
        status,
        created_at
      FROM sentinelflow_activities
      ORDER BY created_at DESC
      LIMIT 8
    `);

    const recentThreats = await pool.query(`
      SELECT
        id,
        threat_type,
        severity,
        risk_score,
        status,
        username,
        created_at
      FROM sentinelflow_threat_alerts
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,

      summary: {
        totalActivities:
          activities.rows[0].count,

        totalThreats:
          threats.rows[0].count,

        openThreats:
          openThreats.rows[0].count,

        criticalThreats:
          criticalThreats.rows[0].count,

        activeInvestigations:
          investigations.rows[0].count,

        resolvedInvestigations:
          resolvedInvestigations.rows[0].count,

        averageRiskScore:
          Number(risk.rows[0].average),
      },

      recentActivities:
        recentActivities.rows,

      recentThreats:
        recentThreats.rows,
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to load dashboard",
      details: error.message,
    });
  }
});

module.exports = router;