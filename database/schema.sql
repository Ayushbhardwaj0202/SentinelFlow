-- roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,  -- 'employee', 'analyst', 'admin'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id) NOT NULL,
  department VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- devices table
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(50) CHECK (device_type IN ('laptop','workstation','mobile','tablet','server','unknown')),
  os_type VARCHAR(100),
  mac_address VARCHAR(17),
  ip_address VARCHAR(45),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','blocked')),
  is_registered BOOLEAN DEFAULT true,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- network_sessions table
CREATE TABLE IF NOT EXISTS network_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_id INTEGER REFERENCES devices(id),
  session_token VARCHAR(255),
  ip_address VARCHAR(45),
  login_time TIMESTAMP DEFAULT NOW(),
  logout_time TIMESTAMP,
  duration_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','ended','expired','forced_logout')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_id INTEGER REFERENCES devices(id),
  session_id INTEGER REFERENCES network_sessions(id),
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('LOGIN','LOGOUT','FILE_ACCESS','FILE_DOWNLOAD','DATA_EXPORT','NETWORK_ACCESS','PRIVILEGED_ACTION','POLICY_CHANGE','FAILED_LOGIN','DEVICE_LOGIN','SUSPICIOUS_ACTIVITY','OTHER')),
  resource VARCHAR(500),
  source_ip VARCHAR(45),
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success','failed','blocked','flagged')),
  risk_score INTEGER DEFAULT 0,
  is_suspicious BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- audit_logs table (immutable security trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id),
  actor_username VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  description TEXT,
  ip_address VARCHAR(45),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- behavior_analysis table
CREATE TABLE IF NOT EXISTS behavior_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  analysis_period VARCHAR(50) DEFAULT 'daily',
  total_activities INTEGER DEFAULT 0,
  failed_logins INTEGER DEFAULT 0,
  unusual_time_logins INTEGER DEFAULT 0,
  sensitive_resource_accesses INTEGER DEFAULT 0,
  policy_violations INTEGER DEFAULT 0,
  unknown_device_logins INTEGER DEFAULT 0,
  data_exports INTEGER DEFAULT 0,
  flags JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- risk_assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  behavior_analysis_id INTEGER REFERENCES behavior_analysis(id),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  contributing_factors JSONB NOT NULL,
  assessed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- threat_alerts table
CREATE TABLE IF NOT EXISTS threat_alerts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  user_id INTEGER REFERENCES users(id),
  risk_assessment_id INTEGER REFERENCES risk_assessments(id),
  source_activity_id INTEGER REFERENCES activity_logs(id),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  risk_score INTEGER,
  status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','UNDER_INVESTIGATION','RESOLVED','FALSE_POSITIVE')),
  rule_triggered VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- investigation_cases table
CREATE TABLE IF NOT EXISTS investigation_cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  alert_id INTEGER REFERENCES threat_alerts(id),
  assigned_analyst_id INTEGER REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','PENDING_REVIEW','RESOLVED','CLOSED')),
  resolution TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- investigation_findings table
CREATE TABLE IF NOT EXISTS investigation_findings (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES investigation_cases(id) NOT NULL,
  analyst_id INTEGER REFERENCES users(id),
  finding_type VARCHAR(50) DEFAULT 'NOTE' CHECK (finding_type IN ('NOTE','EVIDENCE','CONCLUSION','ACTION_TAKEN')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- security_reports table
CREATE TABLE IF NOT EXISTS security_reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('SECURITY_SUMMARY','INCIDENT_REPORT','RISK_ASSESSMENT','COMPLIANCE','INVESTIGATION_REPORT','CUSTOM')),
  generated_by INTEGER REFERENCES users(id),
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  content JSONB NOT NULL,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- policies table
CREATE TABLE IF NOT EXISTS policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  policy_type VARCHAR(50) CHECK (policy_type IN ('ACCESS','DATA','NETWORK','DEVICE','PASSWORD','GENERAL')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','draft')),
  rules JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- detection_rules table
CREATE TABLE IF NOT EXISTS detection_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50),
  condition_field VARCHAR(100),
  condition_operator VARCHAR(20),
  condition_value VARCHAR(255),
  severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_user_id ON threat_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_alerts_status ON threat_alerts(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
