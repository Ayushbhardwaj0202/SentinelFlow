# SentinelFlow Setup & Deployment Guide

This guide provides end-to-end instructions for configuring and running **SentinelFlow** locally in development or evaluation environments.

---

## 1. Prerequisites

Ensure the following tools are installed:
- **Node.js**: v18.0.0 or later (tested on v20+ and v24)
- **npm**: v9.0.0 or later
- **PostgreSQL**: v14 or later (service running on `localhost:5432`)
- **Git**

---

## 2. Database Configuration

### Step 2.1: Start PostgreSQL and Create Database
Using PowerShell / Command Prompt / Terminal:
```bash
# Using createdb command
createdb -U postgres sentinelflow

# Or using psql:
psql -U postgres -c "CREATE DATABASE sentinelflow;"
```

### Step 2.2: Apply Schema and Seed Data
You can seed using either Node.js or native PostgreSQL CLI:

#### Method A: Node.js Automated Seed (Recommended)
```bash
# Navigate to backend and install packages if not done
cd backend
npm install
cd ..

# Run database seeder (creates tables, bcrypt hashes passwords, and loads demo records)
node database/seed.js
```

#### Method B: Direct psql Import
```bash
psql -U postgres -d sentinelflow -f database/schema.sql
psql -U postgres -d sentinelflow -f database/seed.sql
```

---

## 3. Backend Setup

### Step 3.1: Environment Variables
Create or verify the `backend/.env` configuration file:
```ini
DATABASE_URL=postgresql://postgres:password@localhost:5432/sentinelflow
PORT=5000
JWT_SECRET=sentinelflow_production_secure_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
NODE_ENV=development
```
*(Adjust the username and password in `DATABASE_URL` to match your local PostgreSQL credentials).*

### Step 3.2: Install Dependencies & Launch
```bash
cd backend
npm install
npm run dev
```
*The API will start and listen on `http://localhost:5000`.*  
Health check verification: Open `http://localhost:5000/` in your browser. You should receive:
```json
{ "message": "SentinelFlow API is running", "version": "1.0.0" }
```

---

## 4. Frontend Setup

### Step 4.1: Install Dependencies
In a new terminal window:
```bash
cd frontend
npm install
```

### Step 4.2: Start Vite Development Server
```bash
npm run dev
```
*The React SOC console will be accessible at `http://localhost:5173`.*

---

## 5. Demonstration & Evaluation Walkthrough

### Step 5.1: Login with Demo Accounts

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| **Admin** | `admin` | `Admin@123` | Full access: User management, policy tuning, audit trails |
| **Security Analyst** | `analyst` | `Analyst@123` | SOC operations: Triage alerts, investigations, forensic findings |
| **Employee** | `employee1` | `Employee@123` | Normal baseline employee telemetry |
| **Employee** | `employee2` | `Employee@123` | High-risk employee profile with data export anomalies |

### Step 5.2: Verify Key Workflows

1. **Dashboard & Threat Visibility**:
   - Log in as `analyst` or `admin`.
   - Inspect the SOC dashboard overview: active alerts, threat levels, and risk metrics.
2. **Alert Triage & Case Escalation**:
   - Navigate to **Alerts** (`/alerts`).
   - Click on an alert (e.g., *High-Volume Data Export Anomaly*).
   - Triage the alert or escalate to an **Investigation Case**.
3. **Forensic Investigation**:
   - Navigate to **Investigations** (`/investigations`).
   - Open *CASE-20261010-0001*.
   - Add new findings, notes, and evidence. Update the case status to `RESOLVED`.
4. **Live Activity Telemetry & Ingestion**:
   - Navigate to **Activities** (`/activities`).
   - Filter by suspicious activities or test adding new events to observe real-time scoring.
5. **Security Reporting**:
   - Navigate to **Reports** (`/reports`).
   - Click **Generate Report** to assemble live aggregated security findings.
6. **Governance & Audit Trail**:
   - Navigate to **Audit Logs** (`/audit-logs`) to review immutable records of all administrative and security actions.
