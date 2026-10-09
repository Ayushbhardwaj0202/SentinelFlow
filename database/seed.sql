-- SentinelFlow Database Seed Data
-- Can be executed directly via psql:
-- psql -U postgres -d sentinelflow -f database/seed.sql

-- Clear existing data (idempotent reset)
TRUNCATE TABLE 
  audit_logs, security_reports, investigation_findings, investigation_cases, 
  threat_alerts, risk_assessments, behavior_analysis, activity_logs, 
  network_sessions, devices, policies, detection_rules, users, roles 
RESTART IDENTITY CASCADE;

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'employee', 'Standard employee access'),
(2, 'analyst', 'Security analyst with investigation access'),
(3, 'admin', 'Full administrative access');

-- Users
-- Passwords:
-- employee1 -> Employee@123
-- employee2 -> Employee@123
-- analyst   -> Analyst@123
-- admin     -> Admin@123
INSERT INTO users (id, username, email, password_hash, full_name, role_id, department, risk_level) VALUES
(1, 'employee1', 'emp1@sentinelflow.local', '$2b$10$Eh5ht8NZufWptxGXEMoLSewbnLTK8/zVY0ajQJbqsVQGVOWu51jKG', 'John Employee', 1, 'Engineering', 'LOW'),
(2, 'employee2', 'emp2@sentinelflow.local', '$2b$10$Eh5ht8NZufWptxGXEMoLSewbnLTK8/zVY0ajQJbqsVQGVOWu51jKG', 'Jane Employee', 1, 'Finance', 'MEDIUM'),
(3, 'analyst', 'analyst@sentinelflow.local', '$2b$10$2b3gvvkqsHEwCO67rnkhy.Gq0qouF4VFjUsHtBquX5XDdpvQq/tIK', 'Security Analyst', 2, 'Security', 'LOW'),
(4, 'admin', 'admin@sentinelflow.local', '$2b$10$xAdYqT1SCLjwGhAEQ40OZedaMKFgprZtuJtt/rOnY9lhO6szHbsVe', 'Admin User', 3, 'IT Administration', 'LOW');

-- Adjust users serial sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- Devices
INSERT INTO devices (id, user_id, device_name, device_type, os_type, ip_address, status, is_registered) VALUES
(1, 1, 'John-Laptop', 'laptop', 'Windows 11', '192.168.1.100', 'active', true),
(2, 2, 'Jane-Workstation', 'workstation', 'macOS 14', '192.168.1.101', 'active', true),
(3, 3, 'Analyst-Test-Dev', 'laptop', 'Ubuntu 22.04', '192.168.1.200', 'active', true);
SELECT setval('devices_id_seq', (SELECT MAX(id) FROM devices));

-- Network Sessions
INSERT INTO network_sessions (id, user_id, device_id, session_token, ip_address, duration_minutes, status) VALUES
(1, 1, 1, 'token-emp1-live', '192.168.1.100', 120, 'active'),
(2, 2, 2, 'token-emp2-live', '192.168.1.101', 45, 'active');
SELECT setval('network_sessions_id_seq', (SELECT MAX(id) FROM network_sessions));

-- Activity Logs
INSERT INTO activity_logs (id, user_id, device_id, activity_type, resource, source_ip, status, risk_score, is_suspicious) VALUES
(1, 1, 1, 'LOGIN', 'System Portal', '192.168.1.100', 'success', 0, false),
(2, 1, 1, 'FILE_ACCESS', 'Engineering_Spec_v2.pdf', '192.168.1.100', 'success', 5, false),
(3, 2, 2, 'FAILED_LOGIN', 'System Portal', '192.168.1.101', 'failed', 20, false),
(4, 2, 2, 'FAILED_LOGIN', 'System Portal', '192.168.1.101', 'failed', 20, false),
(5, 2, 2, 'DATA_EXPORT', 'Customer_Financial_Records.csv', '192.168.1.101', 'success', 65, true),
(6, 2, 2, 'SUSPICIOUS_ACTIVITY', 'Off-hours database dump via SSH tunnel', '192.168.1.101', 'flagged', 85, true);
SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs));

-- Behavior Analysis
INSERT INTO behavior_analysis (id, user_id, total_activities, failed_logins, data_exports, sensitive_resource_accesses) VALUES
(1, 1, 2, 0, 0, 0),
(2, 2, 4, 2, 1, 1);
SELECT setval('behavior_analysis_id_seq', (SELECT MAX(id) FROM behavior_analysis));

-- Risk Assessments
INSERT INTO risk_assessments (id, user_id, behavior_analysis_id, risk_score, risk_level, contributing_factors) VALUES
(1, 1, 1, 15, 'LOW', '["Normal baseline activity", "Verified corporate device"]'::jsonb),
(2, 2, 2, 45, 'MEDIUM', '["Multiple failed logins within 15 minutes"]'::jsonb),
(3, 2, 2, 72, 'HIGH', '["High volume customer data export detected"]'::jsonb),
(4, 2, 2, 88, 'CRITICAL', '["Off-hours database dump", "High sensitivity table download", "Unusual transfer protocol"]'::jsonb);
SELECT setval('risk_assessments_id_seq', (SELECT MAX(id) FROM risk_assessments));

-- Threat Alerts
INSERT INTO threat_alerts (id, title, description, user_id, risk_assessment_id, severity, risk_score, status, rule_triggered) VALUES
(1, 'Suspicious New IP Authentication', 'Employee authenticated from non-standard internal subnet', 1, 1, 'LOW', 15, 'RESOLVED', 'GEO_IP_CHECK'),
(2, 'Consecutive Failed Authentication Attempts', 'User exceeded failure threshold within monitoring window', 2, 2, 'MEDIUM', 45, 'OPEN', 'Detect Multiple Failed Logins'),
(3, 'High-Volume Data Export Anomaly', 'Exported 45,000 sensitive customer financial rows', 2, 3, 'HIGH', 72, 'UNDER_INVESTIGATION', 'Detect Large Data Export'),
(4, 'Critical Off-Hours Insider Exfiltration Risk', 'Simultaneous off-hours database dump and sensitive resource access', 2, 4, 'CRITICAL', 88, 'OPEN', 'Detect Suspicious Activity');
SELECT setval('threat_alerts_id_seq', (SELECT MAX(id) FROM threat_alerts));

-- Investigation Cases
INSERT INTO investigation_cases (id, case_number, alert_id, assigned_analyst_id, title, description, priority, status, resolution, created_by) VALUES
(1, 'CASE-20261010-0001', 3, 3, 'Investigation: Large Customer Database Exfiltration', 'Assess whether Jane Employee had business authorization to export financial table', 'HIGH', 'IN_PROGRESS', NULL, 3),
(2, 'CASE-20261010-0002', 1, 3, 'Routine Audit: Low Risk Subnet Variance', 'Verified user John Employee was temporarily on test lab VPN subnet', 'LOW', 'RESOLVED', 'False positive. Verified authorized test lab activity.', 3);
SELECT setval('investigation_cases_id_seq', (SELECT MAX(id) FROM investigation_cases));

-- Investigation Findings
INSERT INTO investigation_findings (id, case_id, analyst_id, finding_type, content) VALUES
(1, 1, 3, 'NOTE', 'Initiated forensic review of endpoint Jane-Workstation logs and network gateway sessions.'),
(2, 1, 3, 'EVIDENCE', 'Confirmed customer_financial_records.csv was exported via web portal at 02:14 AM UTC.'),
(3, 2, 3, 'NOTE', 'Cross-referenced ticket IT-9042 requesting access to secondary VLAN.'),
(4, 2, 3, 'CONCLUSION', 'Valid lab session verified with IT lead. No policy breach detected.');
SELECT setval('investigation_findings_id_seq', (SELECT MAX(id) FROM investigation_findings));

-- Security Reports
INSERT INTO security_reports (id, title, report_type, generated_by, content, summary) VALUES
(1, 'Executive Weekly Insider Risk Summary', 'SECURITY_SUMMARY', 4, '{"total_alerts": 4, "critical_threats": 1, "high_threats": 1, "cases_opened": 2, "compliance_rate": "98.4%"}'::jsonb, 'Weekly threat analysis highlights 1 ongoing high priority exfiltration investigation with containment steps active.'),
(2, 'Incident Forensic Report: Financial DB Export', 'INCIDENT_REPORT', 4, '{"case_number": "CASE-20261010-0001", "involved_user": "Jane Employee", "alert_level": "HIGH", "data_volume_mb": 128}'::jsonb, 'Detailed forensic breakdown of unauthorized off-hours data extraction on Finance segment.');
SELECT setval('security_reports_id_seq', (SELECT MAX(id) FROM security_reports));

-- Audit Logs
INSERT INTO audit_logs (id, actor_id, actor_username, action, entity_type, entity_id, description) VALUES
(1, 4, 'admin', 'SYSTEM_INITIALIZATION', 'SYSTEM', 1, 'Initialized SentinelFlow security platform and base policy rulesets'),
(2, 4, 'admin', 'USER_ONBOARDING', 'USER', 1, 'Created user profile employee1 in Engineering department'),
(3, 4, 'admin', 'USER_ONBOARDING', 'USER', 2, 'Created user profile employee2 in Finance department'),
(4, 3, 'analyst', 'CASE_OPENED', 'INVESTIGATION', 1, 'Created investigation case CASE-20261010-0001 for high-volume data export alert');
SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));

-- Policies
INSERT INTO policies (id, name, policy_type, description, status, rules) VALUES
(1, 'Corporate Working Hours Access Rule', 'ACCESS', 'Enforces strict heightened alert status for resource access outside 08:00 - 19:00', 'active', '{"hours": "08:00-19:00", "action": "FLAG"}'::jsonb),
(2, 'Mass Data Export Threshold', 'DATA', 'Flags any single data export operation exceeding 10MB or 5,000 records', 'active', '{"max_export_mb": 10, "max_records": 5000, "action": "ALERT"}'::jsonb),
(3, 'Mandatory VPN for Privileged Personnel', 'NETWORK', 'Requires multi-factor authenticated VPN connection for all administrative operations', 'active', '{"require_vpn": true, "require_mfa": true}'::jsonb);
SELECT setval('policies_id_seq', (SELECT MAX(id) FROM policies));

-- Detection Rules
INSERT INTO detection_rules (id, name, rule_type, condition_field, condition_operator, condition_value, severity, is_active) VALUES
(1, 'Detect Multiple Failed Logins', 'LOGIN', 'failed_logins', '>=', '3', 'MEDIUM', true),
(2, 'Detect Large Data Export', 'DATA', 'activity_type', '=', 'DATA_EXPORT', 'HIGH', true),
(3, 'Detect Suspicious Activity', 'BEHAVIOR', 'is_suspicious', '=', 'true', 'CRITICAL', true);
SELECT setval('detection_rules_id_seq', (SELECT MAX(id) FROM detection_rules));
