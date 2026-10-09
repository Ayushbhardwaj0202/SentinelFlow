async function detectThreats(pool, userId, activityId, riskResult) {
  if (riskResult.score < 30) return null;

  try {
    const query = `
      INSERT INTO threat_alerts (title, description, user_id, source_activity_id, severity, risk_score, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const title = `High Risk Activity Detected: ${riskResult.level} Severity`;
    const description = `System detected an anomaly. Contributing factors: ${riskResult.factors.join(', ')}`;
    
    const result = await pool.query(query, [
      title,
      description,
      userId,
      activityId,
      riskResult.level,
      riskResult.score,
      'OPEN'
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error detecting threats:', error);
    return null;
  }
}

module.exports = { detectThreats };
