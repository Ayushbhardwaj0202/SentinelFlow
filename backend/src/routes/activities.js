const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// GET ALL ACTIVITIES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        u.username
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      activities: result.rows,
    });
  } catch (error) {
    console.error("Activity fetch error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch activities",
    });
  }
});

// GET ACTIVITY BY ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        a.*,
        u.username
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
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
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch activity",
    });
  }
});

module.exports = router;