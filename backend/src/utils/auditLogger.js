async function logAudit(pool, { actorId, actorUsername, action, entityType, entityId, description, ipAddress, metadata }) {
  try {
    const query = `
      INSERT INTO audit_logs (actor_id, actor_username, action, entity_type, entity_id, description, ip_address, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      actorId, actorUsername, action, entityType, entityId, description, ipAddress, 
      metadata ? JSON.stringify(metadata) : null
    ];
    await pool.query(query, values);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

module.exports = { logAudit };
