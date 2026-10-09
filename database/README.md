# SentinelFlow Database Setup

## Prerequisites
- PostgreSQL 14+ installed and running locally.
- A database named `sentinelflow`.

## Quick Setup

### Option 1: Automated Node.js Setup (Recommended)
From the repository root or `database` directory, make sure backend dependencies are installed (`npm install` in `backend`), then run:
```bash
node database/seed.js
```
*This command executes `schema.sql`, resets tables, hashes passwords with bcrypt, and inserts complete demonstration data.*

### Option 2: Native PostgreSQL CLI (psql)
```bash
# 1. Create database (if not exists)
createdb sentinelflow

# 2. Run schema
psql -U postgres -d sentinelflow -f database/schema.sql

# 3. Load seed data
psql -U postgres -d sentinelflow -f database/seed.sql
```

## Demo Credentials

| Role | Username | Password | Access Scope |
|------|----------|----------|--------------|
| **Admin** | `admin` | `Admin@123` | Full administrative control, user & policy management, audit logs, reports |
| **Security Analyst** | `analyst` | `Analyst@123` | SOC operations, alerts triage, investigation cases & findings, threat monitoring |
| **Employee** | `employee1` | `Employee@123` | Activity logging, device viewing, personal security telemetry |
| **Employee** | `employee2` | `Employee@123` | Activity logging, simulated insider threat anomalies |

## Database Schema Highlights
- **`users` & `roles`**: RBAC permissions model (`admin`, `analyst`, `employee`)
- **`devices` & `network_sessions`**: Endpoint telemetry, IP tracking, and duration
- **`activity_logs`**: High-volume auditable user actions (`LOGIN`, `FILE_ACCESS`, `DATA_EXPORT`, `SUSPICIOUS_ACTIVITY`)
- **`behavior_analysis` & `risk_assessments`**: 0-100 deterministic risk scoring with JSONB contributing factors
- **`threat_alerts`**: SOC incident triage stream (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **`investigation_cases` & `investigation_findings`**: Forensic case management with audit notes and evidence attachment
- **`security_reports` & `audit_logs`**: Immutable governance ledger and reporting engine
- **`policies` & `detection_rules`**: Configurable behavioral boundaries
