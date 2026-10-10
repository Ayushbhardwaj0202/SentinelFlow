const path = require('path');
module.paths.push(path.join(__dirname, '..', 'backend', 'node_modules'));

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Basketball@8478@localhost:5432/sentinelflow'
});

async function seed() {
  try {
    console.log('Starting seed...');

// Ensure database sentinelflow exists
    const rootUrl = (process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sentinelflow')
      .replace(/\/sentinelflow(\?.*)?$/, '/postgres$1');
    const adminPool = new Pool({ connectionString: rootUrl });
    try {
      const checkDb = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = 'sentinelflow'");
      if (checkDb.rowCount === 0) {
        console.log("Database 'sentinelflow' does not exist. Creating...");
        await adminPool.query('CREATE DATABASE sentinelflow');
        console.log("Database 'sentinelflow' created successfully.");
      }
    } catch (dbErr) {
      console.warn("Notice: could not auto-create database (may already exist):", dbErr.message);
    } finally {
      await adminPool.end().catch(() => {});
    }

    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
    await pool.query(schemaSql);
    console.log('Schema executed successfully.');

    // Clear existing data (optional, for idempotency)
    await pool.query(`
      TRUNCATE TABLE 
        audit_logs, security_reports, investigation_findings, investigation_cases, 
        threat_alerts, risk_assessments, behavior_analysis, activity_logs, 
        network_sessions, devices, policies, detection_rules, users, roles 
      RESTART IDENTITY CASCADE;
    `);

    // Insert Roles
    const rolesResult = await pool.query(`
      INSERT INTO roles (name, description) VALUES
      ('employee', 'Standard employee access'),
      ('analyst', 'Security analyst with read/investigate access'),
      ('admin', 'Full administrative access')
      RETURNING id, name;
    `);
    const roles = rolesResult.rows.reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {});

    // Insert Users
    const saltRounds = 10;
    const emp1Hash = await bcrypt.hash('Employee@123', saltRounds);
    const emp2Hash = await bcrypt.hash('Employee@123', saltRounds);
    const analystHash = await bcrypt.hash('Analyst@123', saltRounds);
    const adminHash = await bcrypt.hash('Admin@123', saltRounds);

    const usersResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role_id, department, risk_level) VALUES
      ('employee1', 'emp1@sentinelflow.local', $1, 'John Employee', $2, 'Engineering', 'LOW'),
      ('employee2', 'emp2@sentinelflow.local', $3, 'Jane Employee', $2, 'Finance', 'MEDIUM'),
      ('analyst', 'analyst@sentinelflow.local', $4, 'Security Analyst', $5, 'Security', 'LOW'),
      ('admin', 'admin@sentinelflow.local', $6, 'Admin User', $7, 'IT Administration', 'LOW')
      RETURNING id, username;
    `, [emp1Hash, roles.employee, emp2Hash, analystHash, roles.analyst, adminHash, roles.admin]);
    const users = usersResult.rows.reduce((acc, u) => ({ ...acc, [u.username]: u.id }), {});

    // Insert Devices
    const devicesResult = await pool.query(`
      INSERT INTO devices (user_id, device_name, device_type, os_type, ip_address) VALUES
      ($1, 'John-Laptop', 'laptop', 'Windows 11', '192.168.1.100'),
      ($2, 'Jane-Workstation', 'workstation', 'macOS 14', '192.168.1.101'),
      ($3, 'Analyst-Test-Dev', 'laptop', 'Ubuntu 22.04', '192.168.1.200')
      RETURNING id, user_id;
    `, [users.employee1, users.employee2, users.analyst]);
    const devEmp1 = devicesResult.rows.find(d => d.user_id === users.employee1).id;
    const devEmp2 = devicesResult.rows.find(d => d.user_id === users.employee2).id;

    // Insert Network Sessions
    await pool.query(`
      INSERT INTO network_sessions (user_id, device_id, session_token, ip_address, duration_minutes) VALUES
      ($1, $2, 'token123', '192.168.1.100', 120),
      ($3, $4, 'token456', '192.168.1.101', 45)
    `, [users.employee1, devEmp1, users.employee2, devEmp2]);

    // Insert Activities
    await pool.query(`
      INSERT INTO activity_logs (user_id, device_id, activity_type, resource, source_ip, status, risk_score, is_suspicious) VALUES
      ($1, $2, 'LOGIN', 'System', '192.168.1.100', 'success', 0, false),
      ($1, $2, 'FILE_ACCESS', 'Q3_Report.pdf', '192.168.1.100', 'success', 0, false),
      ($3, $4, 'FAILED_LOGIN', 'System', '192.168.1.101', 'failed', 20, false),
      ($3, $4, 'FAILED_LOGIN', 'System', '192.168.1.101', 'failed', 20, false),
      ($3, $4, 'DATA_EXPORT', 'Customer_DB_Export.csv', '192.168.1.101', 'success', 65, true),
      ($3, $4, 'SUSPICIOUS_ACTIVITY', 'Off-hours access', '192.168.1.101', 'flagged', 85, true)
    `, [users.employee1, devEmp1, users.employee2, devEmp2]);

    // Insert Behavior Analysis
    const baResult = await pool.query(`
      INSERT INTO behavior_analysis (user_id, total_activities, failed_logins, data_exports) VALUES
      ($1, 2, 0, 0),
      ($2, 4, 2, 1)
      RETURNING id, user_id;
    `, [users.employee1, users.employee2]);
    const baEmp2 = baResult.rows.find(b => b.user_id === users.employee2).id;

    // Insert Risk Assessments
    const raResult = await pool.query(`
      INSERT INTO risk_assessments (user_id, behavior_analysis_id, risk_score, risk_level, contributing_factors) VALUES
      ($1, NULL, 15, 'LOW', '["Normal activity"]'),
      ($2, $3, 45, 'MEDIUM', '["Failed logins"]'),
      ($2, $3, 72, 'HIGH', '["Data export detected"]'),
      ($2, $3, 88, 'CRITICAL', '["Off-hours access", "Suspicious activity flagged"]')
      RETURNING id, risk_level;
    `, [users.employee1, users.employee2, baEmp2]);
    const raCrit = raResult.rows.find(r => r.risk_level === 'CRITICAL').id;

    // Insert Threat Alerts
    const alertResult = await pool.query(`
      INSERT INTO threat_alerts (title, description, user_id, risk_assessment_id, severity, risk_score, status) VALUES
      ('Low risk login', 'New IP address detected', $1, NULL, 'LOW', 15, 'RESOLVED'),
      ('Multiple failed logins', 'User failed to login twice', $2, NULL, 'MEDIUM', 45, 'OPEN'),
      ('Large Data Export', 'Exported Customer DB', $2, NULL, 'HIGH', 72, 'UNDER_INVESTIGATION'),
      ('Critical Suspicious Activity', 'Off-hours access and data export', $2, $3, 'CRITICAL', 88, 'OPEN')
      RETURNING id, severity;
    `, [users.employee1, users.employee2, raCrit]);
    const alertHigh = alertResult.rows.find(a => a.severity === 'HIGH').id;

    // Insert Investigation Cases
    const caseResult = await pool.query(`
      INSERT INTO investigation_cases (case_number, alert_id, assigned_analyst_id, title, description, priority, status) VALUES
      ('CASE-20231010-0001', $1, $2, 'Investigate Data Export', 'Review why user exported DB', 'HIGH', 'IN_PROGRESS'),
      ('CASE-20231010-0002', NULL, $2, 'Resolved Low Risk', 'False positive', 'LOW', 'RESOLVED')
      RETURNING id, status;
    `, [alertHigh, users.analyst]);
    const caseResolved = caseResult.rows.find(c => c.status === 'RESOLVED').id;

    // Insert Findings
    await pool.query(`
      INSERT INTO investigation_findings (case_id, analyst_id, finding_type, content) VALUES
      ($1, $2, 'NOTE', 'Reviewed logs, seems normal'),
      ($1, $2, 'EVIDENCE', 'User was on VPN'),
      ($1, $2, 'CONCLUSION', 'False positive, closing case')
    `, [caseResolved, users.analyst]);

    // Insert Reports
    await pool.query(`
      INSERT INTO security_reports (title, report_type, generated_by, content, summary) VALUES
      ('Weekly Security Summary', 'SECURITY_SUMMARY', $1, '{"alerts": 4}', 'Summary of week'),
      ('Incident Report: Data Export', 'INCIDENT_REPORT', $1, '{"case": "CASE-20231010-0001"}', 'Details of data export')
    `, [users.admin]);

    // Insert Audit Logs
    await pool.query(`
      INSERT INTO audit_logs (actor_id, actor_username, action, entity_type, description) VALUES
      ($1, 'admin', 'CREATE_USER', 'USER', 'Created user employee1'),
      ($1, 'admin', 'CREATE_USER', 'USER', 'Created user employee2')
    `, [users.admin]);

    // Insert Policies
    await pool.query(`
      INSERT INTO policies (name, policy_type, description, rules) VALUES
      ('Block Off-hours Access', 'ACCESS', 'Block access outside 9-5', '{"hours": "09:00-17:00"}'),
      ('Prevent Large Exports', 'DATA', 'Alert on exports > 10MB', '{"max_export_mb": 10}'),
      ('Require VPN for Admin', 'NETWORK', 'Admins must use VPN', '{"require_vpn": true}')
    `);

    // Insert Detection Rules
    await pool.query(`
      INSERT INTO detection_rules (name, rule_type, condition_field, condition_operator, condition_value, severity) VALUES
      ('Detect Multiple Failed Logins', 'LOGIN', 'failed_logins', '>=', '3', 'MEDIUM'),
      ('Detect Large Data Export', 'DATA', 'activity_type', '=', 'DATA_EXPORT', 'HIGH'),
      ('Detect Suspicious Activity', 'BEHAVIOR', 'is_suspicious', '=', 'true', 'CRITICAL')
    `);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
