const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* =========================================
   CREATE AUDIT TABLE
========================================= */

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_audit_logs (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      action VARCHAR(150),
      module VARCHAR(100),
      reference_id VARCHAR(100),
      status VARCHAR(50) DEFAULT 'SUCCESS',
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/* =========================================
   GET LIVE AUDIT LOGS
========================================= */

router.get("/", async (req, res) => {
  try {
    await ensureTable();

    /*
      Combine actual system activity,
      threat and investigation events.
    */

    const result = await pool.query(`
      SELECT *
      FROM (
        SELECT
          id,
          username,
          activity_type AS action,
          'Activity Monitoring' AS module,
          CONCAT('ACT-', id) AS reference_id,
          'SUCCESS' AS status,
          CONCAT(
            'Activity detected: ',
            activity_type,
            ' on ',
            COALESCE(resource, 'system resource'),
            '. Risk score: ',
            risk_score
          ) AS details,
          created_at
        FROM sentinelflow_activities

        UNION ALL

        SELECT
          id,
          username,
          'THREAT_DETECTED' AS action,
          'Threat Detection' AS module,
          CONCAT('THR-', id) AS reference_id,
          CASE
            WHEN status = 'RESOLVED'
              THEN 'RESOLVED'
            ELSE 'SUCCESS'
          END AS status,
          CONCAT(
            threat_type,
            ' detected with severity ',
            severity,
            '. Risk score: ',
            risk_score,
            '. Current status: ',
            status
          ) AS details,
          created_at
        FROM sentinelflow_threat_alerts

        UNION ALL

        SELECT
          id,
          investigator AS username,
          CASE
            WHEN status = 'RESOLVED'
              THEN 'INVESTIGATION_RESOLVED'
            ELSE 'INVESTIGATION_STARTED'
          END AS action,
          'Investigation' AS module,
          CONCAT('INV-', id) AS reference_id,
          'SUCCESS' AS status,
          CONCAT(
            title,
            '. Case status: ',
            status
          ) AS details,
          created_at
        FROM sentinelflow_investigations
      ) audit_events
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      count: result.rows.length,
      logs: result.rows,
    });
  } catch (error) {
    console.error(
      "Audit log error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to load audit logs",
      details: error.message,
    });
  }
});

module.exports = router;