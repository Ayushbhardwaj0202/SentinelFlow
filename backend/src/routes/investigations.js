const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_investigations (
      id SERIAL PRIMARY KEY,
      threat_id INTEGER,
      case_number VARCHAR(50),
      investigator VARCHAR(100),
      title VARCHAR(255),
      severity VARCHAR(30),
      status VARCHAR(50) DEFAULT 'OPEN',
      findings TEXT,
      evidence TEXT,
      resolution TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = [
    ["threat_id", "INTEGER"],
    ["case_number", "VARCHAR(50)"],
    ["investigator", "VARCHAR(100)"],
    ["title", "VARCHAR(255)"],
    ["severity", "VARCHAR(30)"],
    ["status", "VARCHAR(50) DEFAULT 'OPEN'"],
    ["findings", "TEXT"],
    ["evidence", "TEXT"],
    ["resolution", "TEXT"],
    ["created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
    ["updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
  ];

  for (const [name, type] of columns) {
    await pool.query(`
      ALTER TABLE sentinelflow_investigations
      ADD COLUMN IF NOT EXISTS ${name} ${type}
    `);
  }
}

/* GET ALL */
router.get("/", async (req, res) => {
  try {
    await ensureTable();

    const result = await pool.query(`
      SELECT *
      FROM sentinelflow_investigations
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      investigations: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to retrieve investigations",
      details: error.message,
    });
  }
});

/* GET ONE */
router.get("/:id", async (req, res) => {
  try {
    await ensureTable();

    const result = await pool.query(
      `
      SELECT *
      FROM sentinelflow_investigations
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Investigation not found",
      });
    }

    res.json({
      success: true,
      investigation: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* CREATE */
router.post("/", async (req, res) => {
  try {
    await ensureTable();

    const {
      threat_id,
      investigator = "Security Analyst",
      findings,
      evidence,
    } = req.body;

    if (!threat_id) {
      return res.status(400).json({
        success: false,
        error: "threat_id is required",
      });
    }

    const threatResult = await pool.query(
      `
      SELECT *
      FROM sentinelflow_threat_alerts
      WHERE id = $1
      `,
      [threat_id]
    );

    if (!threatResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Threat not found",
      });
    }

    const threat = threatResult.rows[0];

    const existing = await pool.query(
      `
      SELECT *
      FROM sentinelflow_investigations
      WHERE threat_id = $1
      AND status != 'RESOLVED'
      LIMIT 1
      `,
      [threat_id]
    );

    if (existing.rows.length) {
      return res.json({
        success: true,
        message: "Investigation already exists",
        investigation: existing.rows[0],
      });
    }

    const caseNumber =
      `INV-${String(Date.now()).slice(-6)}`;

    const result = await pool.query(
      `
      INSERT INTO sentinelflow_investigations
      (
        threat_id,
        case_number,
        investigator,
        title,
        severity,
        status,
        findings,
        evidence
      )
      VALUES
      ($1,$2,$3,$4,$5,'UNDER_INVESTIGATION',$6,$7)
      RETURNING *
      `,
      [
        threat_id,
        caseNumber,
        investigator,
        threat.threat_type || "Security Investigation",
        threat.severity || "HIGH",
        findings ||
          "Threat requires analyst investigation.",
        evidence ||
          "Activity logs and threat detection records.",
      ]
    );

    await pool.query(
      `
      UPDATE sentinelflow_threat_alerts
      SET status = 'UNDER_INVESTIGATION'
      WHERE id = $1
      `,
      [threat_id]
    );

    res.status(201).json({
      success: true,
      message: "Investigation created",
      investigation: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to create investigation",
      details: error.message,
    });
  }
});

/* UPDATE / RESOLVE */
router.put("/:id", async (req, res) => {
  try {
    await ensureTable();

    const {
      status,
      findings,
      evidence,
      resolution,
      investigator,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE sentinelflow_investigations
      SET
        status = COALESCE($1,status),
        findings = COALESCE($2,findings),
        evidence = COALESCE($3,evidence),
        resolution = COALESCE($4,resolution),
        investigator = COALESCE($5,investigator),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
      `,
      [
        status,
        findings,
        evidence,
        resolution,
        investigator,
        req.params.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "Investigation not found",
      });
    }

    const investigation = result.rows[0];

    if (status === "RESOLVED") {
      await pool.query(
        `
        UPDATE sentinelflow_threat_alerts
        SET status = 'RESOLVED'
        WHERE id = $1
        `,
        [investigation.threat_id]
      );
    }

    res.json({
      success: true,
      message: "Investigation updated",
      investigation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to update investigation",
      details: error.message,
    });
  }
});

module.exports = router;