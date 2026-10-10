const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_security_reports (
      id SERIAL PRIMARY KEY,
      report_number VARCHAR(50) UNIQUE,
      report_type VARCHAR(100),
      generated_by VARCHAR(100),
      activities_analyzed INTEGER DEFAULT 0,
      threats_detected INTEGER DEFAULT 0,
      open_threats INTEGER DEFAULT 0,
      critical_threats INTEGER DEFAULT 0,
      active_investigations INTEGER DEFAULT 0,
      average_risk_score NUMERIC(10,2) DEFAULT 0,
      risk_summary TEXT,
      threat_summary TEXT,
      investigation_summary TEXT,
      recommendations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/* ================================
   GET CURRENT LIVE SECURITY DATA
================================ */

router.get("/", async (req, res) => {
  try {
    await ensureTable();

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

    const risk = await pool.query(`
      SELECT COALESCE(
        ROUND(AVG(risk_score)::numeric, 2),
        0
      ) AS average
      FROM sentinelflow_activities
    `);

    const riskDistribution = await pool.query(`
      SELECT
        CASE
          WHEN risk_score < 30 THEN 'LOW'
          WHEN risk_score < 60 THEN 'MEDIUM'
          WHEN risk_score < 80 THEN 'HIGH'
          ELSE 'CRITICAL'
        END AS risk_level,
        COUNT(*)::int AS count
      FROM sentinelflow_activities
      GROUP BY risk_level
      ORDER BY count DESC
    `);

    res.json({
      success: true,

      summary: {
        activitiesAnalyzed:
          activities.rows[0].count,

        threatsDetected:
          threats.rows[0].count,

        openThreats:
          openThreats.rows[0].count,

        criticalThreats:
          criticalThreats.rows[0].count,

        activeInvestigations:
          investigations.rows[0].count,

        averageRiskScore:
          Number(risk.rows[0].average),
      },

      riskDistribution:
        riskDistribution.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to load security analytics",
      details: error.message,
    });
  }
});

/* ================================
   GENERATE SECURITY REPORT
================================ */

router.post("/generate", async (req, res) => {
  try {
    await ensureTable();

    const generatedBy =
      req.body.generated_by ||
      "Security Analyst";

    /* LIVE DATABASE VALUES */

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

    const risk = await pool.query(`
      SELECT COALESCE(
        ROUND(AVG(risk_score)::numeric, 2),
        0
      ) AS average
      FROM sentinelflow_activities
    `);

    const avgRisk =
      Number(risk.rows[0].average);

    /* RISK SUMMARY */

    let riskSummary;

    if (avgRisk >= 80) {
      riskSummary =
        "The environment is currently at CRITICAL risk. Immediate security investigation and containment are recommended.";
    } else if (avgRisk >= 60) {
      riskSummary =
        "The environment is currently at HIGH risk. Security analysts should review high-risk activities and active threats.";
    } else if (avgRisk >= 30) {
      riskSummary =
        "The environment is currently at MEDIUM risk. Suspicious activities should be monitored and reviewed.";
    } else {
      riskSummary =
        "The environment is currently at LOW risk with no significant abnormal activity detected.";
    }

    /* THREAT SUMMARY */

    const threatSummary =
      `${threats.rows[0].count} threats have been detected. ` +
      `${openThreats.rows[0].count} threats remain active and ` +
      `${criticalThreats.rows[0].count} are classified as critical.`;

    /* INVESTIGATION SUMMARY */

    const investigationSummary =
      `${investigations.rows[0].count} investigation cases are currently active. ` +
      `Security analysts should prioritize unresolved high and critical incidents.`;

    /* RECOMMENDATIONS */

    const recommendations = [];

    if (criticalThreats.rows[0].count > 0) {
      recommendations.push(
        "Immediately investigate all critical threats."
      );
    }

    if (openThreats.rows[0].count > 0) {
      recommendations.push(
        "Review and resolve all open security alerts."
      );
    }

    if (avgRisk >= 60) {
      recommendations.push(
        "Review high-risk employee activities and access patterns."
      );
    }

    recommendations.push(
      "Continue monitoring employee activity and device behavior."
    );

    recommendations.push(
      "Maintain complete audit records for security and compliance."
    );

    const reportNumber =
      `RPT-${Date.now()
        .toString()
        .slice(-8)}`;

    const result = await pool.query(
      `
      INSERT INTO sentinelflow_security_reports
      (
        report_number,
        report_type,
        generated_by,
        activities_analyzed,
        threats_detected,
        open_threats,
        critical_threats,
        active_investigations,
        average_risk_score,
        risk_summary,
        threat_summary,
        investigation_summary,
        recommendations
      )
      VALUES
      (
        $1,
        'Security Risk Assessment',
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
      )
      RETURNING *
      `,
      [
        reportNumber,
        generatedBy,
        activities.rows[0].count,
        threats.rows[0].count,
        openThreats.rows[0].count,
        criticalThreats.rows[0].count,
        investigations.rows[0].count,
        avgRisk,
        riskSummary,
        threatSummary,
        investigationSummary,
        recommendations.join(" "),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Security report generated successfully",
      report: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Report generation error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to generate security report",
      details: error.message,
    });
  }
});

/* ================================
   GET GENERATED REPORTS
================================ */

router.get("/generated", async (req, res) => {
  try {
    await ensureTable();

    const result = await pool.query(`
      SELECT *
      FROM sentinelflow_security_reports
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      reports: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;