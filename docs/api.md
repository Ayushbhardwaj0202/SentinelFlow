# SentinelFlow REST API Specification

## Base URL & Authentication

All API endpoints (except `/api/auth/login` and `/api/auth/register`) require an HTTP `Authorization` header containing a valid Bearer token:

```http
Authorization: Bearer <jwt_token>
```

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticates user credentials and issues a JWT token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Admin@123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 4,
      "username": "admin",
      "email": "admin@sentinelflow.local",
      "full_name": "Admin User",
      "role": "admin",
      "department": "IT Administration",
      "risk_level": "LOW"
    }
  }
  ```

### `POST /api/auth/register`
Creates a new user account (defaults to `employee` role).
- **Access**: Public

### `GET /api/auth/me`
Fetches the currently authenticated profile.
- **Access**: Authenticated

---

## 2. Dashboard Analytics (`/api/dashboard`)

### `GET /api/dashboard/stats`
Fetches SOC high-level metrics, risk distribution, recent alerts, and activity volumes.
- **Access**: `employee`, `analyst`, `admin`
- **Response `200 OK`**:
  ```json
  {
    "totalActivities": 124,
    "activeAlerts": 3,
    "criticalThreats": 1,
    "openInvestigations": 2,
    "riskDistribution": {
      "low": 12,
      "medium": 4,
      "high": 2,
      "critical": 1
    },
    "recentAlerts": [...]
  }
  ```

---

## 3. Activities Telemetry (`/api/activities`)

### `GET /api/activities`
Query recorded activity logs with optional filters.
- **Query Parameters**:
  - `user_id` (integer)
  - `type` (`LOGIN`, `FILE_ACCESS`, `DATA_EXPORT`, `SUSPICIOUS_ACTIVITY`)
  - `suspicious` (`true` | `false`)
- **Response `200 OK`**: Array of activity log objects.

### `POST /api/activities`
Records a new endpoint activity, triggers automatic risk calculation, and generates threat alerts if score $\ge 30$.
- **Request Body**:
  ```json
  {
    "user_id": 2,
    "device_id": 2,
    "activity_type": "DATA_EXPORT",
    "resource": "Customer_Financial_Records.csv",
    "source_ip": "192.168.1.101",
    "status": "success",
    "metadata": { "bytes": 10485760 }
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "activity": { "id": 7, "risk_score": 65, "is_suspicious": true, ... },
    "riskResult": {
      "score": 65,
      "level": "HIGH",
      "factors": ["Data exports (1) : +10", "Unusual time login : +20"]
    },
    "alert": { "id": 5, "severity": "HIGH", "status": "OPEN", ... }
  }
  ```

---

## 4. Threat Alerts (`/api/alerts`)

### `GET /api/alerts`
Retrieves threat alerts.
- **Query Parameters**: `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`OPEN`, `RESOLVED`, `UNDER_INVESTIGATION`).

### `GET /api/alerts/:id`
Retrieves detailed information for an alert including associated user telemetry and linked investigation cases.

### `PATCH /api/alerts/:id/status`
Updates an alert's status.
- **Access**: `analyst`, `admin`
- **Request Body**: `{ "status": "RESOLVED" }`

---

## 5. Investigation Cases (`/api/investigations`)

### `GET /api/investigations`
Lists forensic investigation cases.
- **Query Parameters**: `status`, `priority`.

### `GET /api/investigations/:id`
Retrieves a case along with all attached findings, evidentiary notes, and originating alert.

### `POST /api/investigations`
Opens a new forensic investigation case.
- **Access**: `analyst`, `admin`
- **Request Body**:
  ```json
  {
    "alert_id": 3,
    "title": "Investigate Unauthorized Financial Export",
    "description": "Suspected exfiltration from Finance department workstation.",
    "priority": "HIGH"
  }
  ```

### `PATCH /api/investigations/:id/status`
Updates the investigation status (`IN_PROGRESS`, `PENDING_REVIEW`, `RESOLVED`, `CLOSED`).
- **Request Body**: `{ "status": "RESOLVED", "resolution": "Confirmed valid finance audit ticket." }`

### `POST /api/investigations/:id/findings`
Appends a forensic finding or evidence note to the case.
- **Request Body**:
  ```json
  {
    "finding_type": "EVIDENCE",
    "content": "Workstation forensic image reveals export initiated via curl to external host."
  }
  ```

---

## 6. Devices & Sessions

### `GET /api/devices`
Lists registered devices with hardware and operating system telemetry.

### `POST /api/devices`
Registers a new endpoint device.

### `GET /api/sessions`
Lists network sessions, source IP addresses, and session duration.

---

## 7. Risk Assessments & Behavior Analysis

### `GET /api/risk-assessments`
Retrieves risk scores, categorical levels, and contributing factor breakdowns.

### `GET /api/behavior-analysis`
Retrieves statistical behavioral profiles (total activities, failed logins, export counts).

---

## 8. Security Reports (`/api/reports`)

### `GET /api/reports`
Lists generated compliance, incident, and security summary reports.

### `POST /api/reports`
Generates a new aggregated security report.
- **Access**: `analyst`, `admin`
- **Request Body**:
  ```json
  {
    "title": "Q4 Insider Risk Assessment",
    "report_type": "SECURITY_SUMMARY",
    "summary": "Monthly overview of threat landscape."
  }
  ```

---

## 9. Policies & Rules (`/api/policies`)

### `GET /api/policies`
Lists security policies (`ACCESS`, `DATA`, `NETWORK`, `DEVICE`).

### `POST /api/policies`
Creates a security policy rule.
- **Access**: `admin`

### `PATCH /api/policies/:id`
Toggles policy status (`active` / `inactive`) or modifies rule parameters.
- **Access**: `admin`

---

## 10. User Administration (`/api/users`)

### `GET /api/users`
Lists all user accounts, assigned roles, departments, and active risk ratings.
- **Access**: `admin`

### `POST /api/users`
Creates a user account with specific role assignment.
- **Access**: `admin`

### `PATCH /api/users/:id`
Updates user details, role, department, or status (`active`, `suspended`).
- **Access**: `admin`

### `DELETE /api/users/:id`
Deactivates or removes a user account.
- **Access**: `admin`

---

## 11. Audit Logs (`/api/audit-logs`)

### `GET /api/audit-logs`
Queries immutable administrative and security audit trail.
- **Access**: `analyst`, `admin`
- **Query Parameters**: `action`, `entity_type`, `limit`, `offset`.
