const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const ML_SERVICE_URL = "http://127.0.0.1:8000";

// ============================================================
// SENTINELFLOW - ACTIVITY MONITORING + HYBRID ML DETECTION
// ============================================================

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_activities (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      activity_type VARCHAR(100) NOT NULL,
      resource VARCHAR(255),
      device VARCHAR(255),
      ip_address VARCHAR(100),
      risk_score INTEGER DEFAULT 0,
      status VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      risk_level VARCHAR(50)
    );
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS rule_risk_score INTEGER DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS ml_anomaly_score NUMERIC(6,4) DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS ml_anomaly BOOLEAN DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS hybrid_risk_score INTEGER DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_activities
    ADD COLUMN IF NOT EXISTS detection_method VARCHAR(100) DEFAULT 'RULE_ENGINE';
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sentinelflow_threat_alerts (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      threat_type VARCHAR(255),
      severity VARCHAR(50),
      risk_score INTEGER,
      status VARCHAR(100) DEFAULT 'OPEN',
      activity_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS activity_id INTEGER;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS ml_anomaly_score NUMERIC(6,4) DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE sentinelflow_threat_alerts
    ADD COLUMN IF NOT EXISTS detection_method VARCHAR(100) DEFAULT 'RULE_ENGINE';
  `);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateRuleRisk({
  activityType,
  resource,
  device,
}) {
  let score = 10;

  const type = String(activityType || "").toUpperCase();
  const resourceText = String(resource || "").toLowerCase();
  const deviceText = String(device || "").toLowerCase();

  if (type === "FAILED_LOGIN") {
    score += 45;
  }

  if (type === "FILE_ACCESS") {
    score += 25;
  }

  if (type === "DATA_EXPORT") {
    score += 70;
  }

  const sensitiveKeywords = [
    "customer",
    "payroll",
    "financial",
    "finance",
    "database",
    "salary",
    "confidential",
    "bank",
    "payment",
  ];

  if (
    sensitiveKeywords.some((keyword) =>
      resourceText.includes(keyword)
    )
  ) {
    score += 20;
  }

  if (
    !deviceText ||
    deviceText.includes("unknown") ||
    deviceText.includes("unrecognized")
  ) {
    score += 25;
  }

  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

function getStatus(score) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH RISK";
  if (score >= 30) return "SUSPICIOUS";
  return "NORMAL";
}

function getThreatType({
  activityType,
  resource,
  device,
}) {
  const type = String(activityType || "").toUpperCase();
  const resourceText = String(resource || "").toLowerCase();
  const deviceText = String(device || "").toLowerCase();

  if (type === "DATA_EXPORT") {
    return "Large Data Export";
  }

  if (type === "FAILED_LOGIN") {
    return "Suspicious Login Attempt";
  }

  if (
    !deviceText ||
    deviceText.includes("unknown") ||
    deviceText.includes("unrecognized")
  ) {
    return "Unknown Device Activity";
  }

  if (
    resourceText.includes("customer") ||
    resourceText.includes("payroll") ||
    resourceText.includes("financial") ||
    resourceText.includes("database")
  ) {
    return "Sensitive File Access";
  }

  return "Suspicious Activity";
}

// ============================================================
// ML PREDICTION
// ============================================================

async function getMLPrediction({
  activityType,
  resource,
  device,
  ipAddress,
  username,
  riskScore,
}) {
  try {
    const now = new Date();

    const hour = now.getHours();

    const dayOfWeek = now.getDay();

    const isWeekend =
      dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

    const afterHours =
      hour < 8 || hour >= 19 ? 1 : 0;

    const type = String(
      activityType || ""
    ).toUpperCase();

    const resourceText = String(
      resource || ""
    ).toLowerCase();

    const deviceText = String(
      device || ""
    ).toLowerCase();

    const ipText = String(
      ipAddress || ""
    );

    const isFileAccess =
      type === "FILE_ACCESS" ? 1 : 0;

    const isFailedLogin =
      type === "FAILED_LOGIN" ? 1 : 0;

    const isDataExport =
      type === "DATA_EXPORT" ? 1 : 0;

    const sensitiveKeywords = [
      "customer",
      "payroll",
      "financial",
      "finance",
      "database",
      "salary",
      "confidential",
      "bank",
      "payment",
    ];

    const sensitiveResource =
      sensitiveKeywords.some((keyword) =>
        resourceText.includes(keyword)
      )
        ? 1
        : 0;

    const unknownDevice =
      !deviceText ||
      deviceText.includes("unknown") ||
      deviceText.includes("unrecognized")
        ? 1
        : 0;

    const privateIp =
      ipText.startsWith("10.") ||
      ipText.startsWith("192.168.") ||
      ipText.startsWith("172.")
        ? 1
        : 0;

    // Current user's historical activity count
    const frequencyResult = await pool.query(
      `
        SELECT
          COUNT(*)::INTEGER AS activity_frequency,
          COUNT(*) FILTER (
            WHERE UPPER(activity_type) = 'FAILED_LOGIN'
          )::INTEGER AS failed_login_count,
          COUNT(*) FILTER (
            WHERE UPPER(activity_type) = 'DATA_EXPORT'
          )::INTEGER AS data_export_frequency
        FROM sentinelflow_activities
        WHERE username = $1
      `,
      [username]
    );

    const frequencyRow =
      frequencyResult.rows[0] || {};

    const activityFrequency =
      Number(
        frequencyRow.activity_frequency || 0
      ) + 1;

    const failedLoginCount =
      Number(
        frequencyRow.failed_login_count || 0
      ) + isFailedLogin;

    const dataExportFrequency =
      Number(
        frequencyRow.data_export_frequency || 0
      ) + isDataExport;

    const sensitiveFrequencyResult =
      await pool.query(
        `
          SELECT COUNT(*)::INTEGER AS count
          FROM sentinelflow_activities
          WHERE username = $1
          AND (
            LOWER(resource) LIKE '%customer%'
            OR LOWER(resource) LIKE '%payroll%'
            OR LOWER(resource) LIKE '%financial%'
            OR LOWER(resource) LIKE '%database%'
            OR LOWER(resource) LIKE '%salary%'
          )
        `,
        [username]
      );

    const sensitiveAccessFrequency =
      Number(
        sensitiveFrequencyResult.rows[0]?.count ||
          0
      ) + sensitiveResource;

    const payload = {
      hour,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      after_hours: afterHours,

      is_file_access: isFileAccess,
      is_failed_login: isFailedLogin,
      is_data_export: isDataExport,

      sensitive_resource: sensitiveResource,
      unknown_device: unknownDevice,
      private_ip: privateIp,

      activity_frequency: activityFrequency,
      failed_login_count: failedLoginCount,
      data_export_frequency: dataExportFrequency,
      sensitive_access_frequency:
        sensitiveAccessFrequency,

      risk_score: Number(riskScore),
    };

    const response = await fetch(
      `${ML_SERVICE_URL}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(
        `ML service returned HTTP ${response.status}`
      );
    }

    const result = await response.json();

    return {
      available: true,
      anomaly: Boolean(result.anomaly),
      anomalyScore: Number(
        result.anomaly_score || 0
      ),
      riskLevel:
        result.risk_level || "LOW",
      decisionScore: Number(
        result.decision_score || 0
      ),
    };
  } catch (error) {
    console.error(
      "[ML SERVICE] Prediction unavailable:",
      error.message
    );

    return {
      available: false,
      anomaly: false,
      anomalyScore: 0,
      riskLevel: "LOW",
      decisionScore: 0,
    };
  }
}

// ============================================================
// CREATE ACTIVITY
// ============================================================

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

    if (!username || !activity_type) {
      return res.status(400).json({
        success: false,
        error:
          "username and activity_type are required",
      });
    }

    // --------------------------------------------------------
    // 1. Existing explainable rule engine
    // --------------------------------------------------------

    const ruleRiskScore =
      calculateRuleRisk({
        activityType: activity_type,
        resource,
        device,
      });

    // --------------------------------------------------------
    // 2. ML prediction
    // --------------------------------------------------------

    const mlPrediction =
      await getMLPrediction({
        activityType: activity_type,
        resource,
        device,
        ipAddress: ip_address,
        username,
        riskScore: ruleRiskScore,
      });

    // --------------------------------------------------------
    // 3. Hybrid risk calculation
    // --------------------------------------------------------

    const mlRiskScore = Math.round(
      mlPrediction.anomalyScore * 100
    );

    let hybridRiskScore;

    if (mlPrediction.available) {
      hybridRiskScore = Math.round(
        ruleRiskScore * 0.65 +
          mlRiskScore * 0.35
      );
    } else {
      hybridRiskScore = ruleRiskScore;
    }

    hybridRiskScore = Math.min(
      Math.max(hybridRiskScore, 0),
      100
    );

    const riskLevel =
      getRiskLevel(hybridRiskScore);

    const status =
      getStatus(hybridRiskScore);

    const detectionMethod =
      mlPrediction.available
        ? "HYBRID_RULE_ML"
        : "RULE_ENGINE";

    // --------------------------------------------------------
    // 4. Store activity
    // --------------------------------------------------------

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
            status,
            risk_level,
            rule_risk_score,
            ml_anomaly_score,
            ml_anomaly,
            hybrid_risk_score,
            detection_method
          )
          VALUES
          (
            $1,
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
            $12,
            $13
          )
          RETURNING *
        `,
        [
          username,
          activity_type,
          resource || null,
          device || null,
          ip_address || null,
          hybridRiskScore,
          status,
          riskLevel,
          ruleRiskScore,
          mlPrediction.anomalyScore,
          mlPrediction.anomaly,
          hybridRiskScore,
          detectionMethod,
        ]
      );

    const activity =
      activityResult.rows[0];

    // --------------------------------------------------------
    // 5. Threat detection
    // --------------------------------------------------------

    if (hybridRiskScore >= 60) {
      const threatType =
        getThreatType({
          activityType: activity_type,
          resource,
          device,
        });

      const threatResult =
        await pool.query(
          `
            INSERT INTO sentinelflow_threat_alerts
            (
              username,
              threat_type,
              severity,
              risk_score,
              status,
              activity_id,
              ml_anomaly_score,
              detection_method
            )
            VALUES
            (
              $1,
              $2,
              $3,
              $4,
              'OPEN',
              $5,
              $6,
              $7
            )
            RETURNING *
          `,
          [
            username,
            threatType,
            riskLevel,
            hybridRiskScore,
            activity.id,
            mlPrediction.anomalyScore,
            detectionMethod,
          ]
        );

      return res.status(201).json({
        success: true,
        message:
          "Activity created and threat detected",
        activity,
        threat: threatResult.rows[0],
        detection: {
          method: detectionMethod,
          ruleRiskScore,
          mlAnomaly:
            mlPrediction.anomaly,
          mlAnomalyScore:
            mlPrediction.anomalyScore,
          hybridRiskScore,
          riskLevel,
        },
      });
    }

    // --------------------------------------------------------
    // 6. Normal / non-threat activity
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Activity created successfully",
      activity,
      detection: {
        method: detectionMethod,
        ruleRiskScore,
        mlAnomaly:
          mlPrediction.anomaly,
        mlAnomalyScore:
          mlPrediction.anomalyScore,
        hybridRiskScore,
        riskLevel,
      },
    });
  } catch (error) {
    console.error(
      "[ACTIVITY CREATE ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to create activity",
    });
  }
});

// ============================================================
// GET ALL ACTIVITIES
// ============================================================

router.get("/", async (req, res) => {
  try {
    await ensureTables();

    const result = await pool.query(`
      SELECT *
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
      error:
        error.message ||
        "Failed to fetch activities",
    });
  }
});

// ============================================================
// GET ACTIVITY BY ID
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    await ensureTables();

    const result = await pool.query(
      `
        SELECT *
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
      error:
        error.message ||
        "Failed to fetch activity",
    });
  }
});

module.exports = router;