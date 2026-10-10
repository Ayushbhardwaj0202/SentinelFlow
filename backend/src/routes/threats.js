const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* =====================================================
   ENSURE THREAT TABLE
===================================================== */

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_threat_alerts (
      id SERIAL PRIMARY KEY,
      activity_id INTEGER,
      username VARCHAR(100),
      threat_type VARCHAR(150),
      severity VARCHAR(30),
      risk_score INTEGER,
      description TEXT,
      status VARCHAR(50) DEFAULT 'OPEN',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS activity_id INTEGER;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS username VARCHAR(100);
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS threat_type VARCHAR(150);
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS severity VARCHAR(30);
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS risk_score INTEGER;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS description TEXT;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'OPEN';
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `);
}


/* =====================================================
   GET ALL THREATS
===================================================== */

router.get("/", async (req, res) => {
  try {
    await ensureTable();

    const result = await pool.query(`
      SELECT
        id,
        activity_id,
        username,
        threat_type,
        severity,
        risk_score,
        description,
        status,
        created_at
      FROM sentinelflow_threat_alerts
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      threats: result.rows,
    });

  } catch (error) {
    console.error("[THREATS GET ERROR]", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve threats",
      details: error.message,
    });
  }
});


/* =====================================================
   GET SINGLE THREAT
===================================================== */

router.get("/:id", async (req, res) => {
  try {
    await ensureTable();

    const result = await pool.query(
      `
      SELECT *
      FROM sentinelflow_threat_alerts
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Threat not found",
      });
    }

    res.json({
      success: true,
      threat: result.rows[0],
    });

  } catch (error) {
    console.error("[THREAT GET ERROR]", error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve threat",
      details: error.message,
    });
  }
});


/* =====================================================
   UPDATE THREAT STATUS
===================================================== */

router.put("/:id", async (req, res) => {
  try {
    await ensureTable();

    const {
      status,
    } = req.body;

    const allowedStatuses = [
      "OPEN",
      "ACKNOWLEDGED",
      "UNDER_INVESTIGATION",
      "RESOLVED",
      "FALSE_POSITIVE",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid threat status",
      });
    }

    const result = await pool.query(
      `
      UPDATE sentinelflow_threat_alerts
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        status,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Threat not found",
      });
    }

    res.json({
      success: true,
      message: "Threat status updated",
      threat: result.rows[0],
    });

  } catch (error) {
    console.error("[THREAT UPDATE ERROR]", error);

    res.status(500).json({
      success: false,
      error: "Failed to update threat",
      details: error.message,
    });
  }
});


module.exports = router;