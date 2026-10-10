const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* =====================================================
   CREATE / UPDATE TABLES
===================================================== */

async function ensureTables() {
  // Create activities table if it does not exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_activities (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      activity_type VARCHAR(100) NOT NULL,
      resource VARCHAR(255),
      device VARCHAR(255),
      ip_address VARCHAR(100),
      risk_score INTEGER DEFAULT 0,
      risk_level VARCHAR(30) DEFAULT 'LOW',
      status VARCHAR(50) DEFAULT 'NORMAL',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // IMPORTANT:
  // If the old table already existed without risk_level,
  // add the column now.
  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(30) DEFAULT 'LOW';
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NORMAL';
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `);

  // Create threat table
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

  // Make sure older threat table also has all columns
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
   RISK SCORE
===================================================== */

function calculateRisk(
  activityType,
  resource,
  device
) {
  let score = 10;

  const type =
    String(activityType || "").toUpperCase();

  const res =
    String(resource || "").toLowerCase();

  const dev =
    String(device || "").toLowerCase();


  // Failed login
  if (type === "FAILED_LOGIN") {
    score += 45;
  }

  // File access
  if (type === "FILE_ACCESS") {
    score += 25;
  }

  // Data export
  if (type === "DATA_EXPORT") {
    score += 70;
  }

  // Sensitive resource
  if (
    res.includes("customer") ||
    res.includes("payroll") ||
    res.includes("financial") ||
    res.includes("database")
  ) {
    score += 20;
  }

  // Unknown device
  if (dev.includes("unknown")) {
    score += 25;
  }

  return Math.min(score, 100);
}


/* =====================================================
   RISK LEVEL
===================================================== */

function getRiskLevel(score) {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 30) {
    return "MEDIUM";
  }

  return "LOW";
}


/* =====================================================
   ACTIVITY STATUS
===================================================== */

function getActivityStatus(score) {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH RISK";
  }

  if (score >= 30) {
    return "SUSPICIOUS";
  }

  return "NORMAL";
}


/* =====================================================
   THREAT TYPE
===================================================== */

function getThreatType(
  activityType,
  resource,
  device
) {
  const type =
    String(activityType || "").toUpperCase();

  const res =
    String(resource || "").toLowerCase();

  const dev =
    String(device || "").toLowerCase();


  if (type === "DATA_EXPORT") {
    return "Large Data Export";
  }

  if (type === "FAILED_LOGIN") {
    return "Suspicious Login Attempt";
  }

  if (dev.includes("unknown")) {
    return "Unknown Device Activity";
  }

  if (
    res.includes("payroll") ||
    res.includes("financial") ||
    res.includes("customer")
  ) {
    return "Sensitive File Access";
  }

  return "Suspicious Activity";
}


/* =====================================================
   GET ALL ACTIVITIES
===================================================== */

router.get("/", async (req, res) => {
  try {
    await ensureTables();

    const result = await pool.query(`
      SELECT
        id,
        username,
        activity_type,
        resource,
        device,
        ip_address,
        risk_score,
        risk_level,
        status,
        created_at
      FROM sentinelflow_activities
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      activities: result.rows,
    });

  } catch (error) {

    console.error(
      "[ACTIVITIES GET ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to retrieve activities",
      details: error.message,
    });
  }
});


/* =====================================================
   GET ACTIVITY BY ID
===================================================== */

router.get("/:id", async (req, res) => {
  try {

    await ensureTables();

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        activity_type,
        resource,
        device,
        ip_address,
        risk_score,
        risk_level,
        status,
        created_at
      FROM sentinelflow_activities
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        error: "Activity not found",
      });
    }

    res.json({
      success: true,
      activity: result.rows[0],
    });

  } catch (error) {

    console.error(
      "[ACTIVITY GET ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to retrieve activity",
      details: error.message,
    });
  }
});


/* =====================================================
   CREATE ACTIVITY
===================================================== */

router.post("/", async (req, res) => {

  try {

    await ensureTables();

    const {
      username,
      activity_type,
      resource,
      device,
      ip_address,
    } = req.body;


    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!username || !activity_type) {

      return res.status(400).json({
        success: false,
        error:
          "Username and activity type are required",
      });
    }


    /* -----------------------------
       CALCULATE RISK
    ----------------------------- */

    const riskScore =
      calculateRisk(
        activity_type,
        resource,
        device
      );

    const riskLevel =
      getRiskLevel(riskScore);

    const status =
      getActivityStatus(riskScore);


    /* -----------------------------
       INSERT ACTIVITY
    ----------------------------- */

    const activityResult =
      await pool.query(
        `
        INSERT INTO sentinelflow_activities
        (
          username,
          activity_type,
          resource,
          device,
          ip_address,
          risk_score,
          risk_level,
          status
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
          username,
          activity_type,
          resource || "N/A",
          device || "Unknown Device",
          ip_address || "N/A",
          riskScore,
          riskLevel,
          status,
        ]
      );


    const activity =
      activityResult.rows[0];


    /* -----------------------------
       AUTOMATIC THREAT DETECTION
    ----------------------------- */

    let threat = null;


    if (riskScore >= 60) {

      const threatType =
        getThreatType(
          activity_type,
          resource,
          device
        );


      let description =
        `${threatType} detected for ${username}. ` +
        `Activity: ${activity_type}. ` +
        `Risk score: ${riskScore}/100.`;


      if (
        String(device || "")
          .toLowerCase()
          .includes("unknown")
      ) {

        description +=
          " Activity originated from an unknown device.";
      }


      if (
        String(activity_type)
          .toUpperCase() ===
        "DATA_EXPORT"
      ) {

        description +=
          " Sensitive data export detected.";
      }


      const threatResult =
        await pool.query(
          `
          INSERT INTO sentinelflow_threat_alerts
          (
            activity_id,
            username,
            threat_type,
            severity,
            risk_score,
            description,
            status
          )
          VALUES
          ($1,$2,$3,$4,$5,$6,'OPEN')
          RETURNING *
          `,
          [
            activity.id,
            username,
            threatType,
            riskLevel,
            riskScore,
            description,
          ]
        );


      threat =
        threatResult.rows[0];
    }


    /* -----------------------------
       RESPONSE
    ----------------------------- */

    res.status(201).json({

      success: true,

      message:
        threat
          ? "Activity recorded and threat detected"
          : "Activity recorded successfully",

      activity,

      threat,

    });

  } catch (error) {

    console.error(
      "[ACTIVITY CREATE ERROR]",
      error
    );

    res.status(500).json({

      success: false,

      error: "Failed to create activity",

      details: error.message,

    });
  }
});


module.exports = router;