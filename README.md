# SentinelFlow
## Intelligent Insider Threat Detection and Risk Analysis Platform

SentinelFlow is an intelligent cybersecurity platform designed to detect suspicious user behaviour and potential insider threats within an organization.

The system combines an **explainable rule-based risk engine** with **machine-learning-based anomaly detection using Isolation Forest**. These two detection signals are combined into a hybrid risk score to identify suspicious activities, generate threats, support security investigations, and provide security reports and audit logs.

---

## 1. Problem Statement

Insider threats occur when legitimate users misuse their authorized access to organizational resources.

Traditional security systems primarily depend on predefined rules. Although rule-based detection is effective for known security violations, it may not identify unusual behavioural patterns that do not exactly match predefined rules.

SentinelFlow addresses this problem by combining:

- Rule-based security detection
- Behavioural anomaly detection
- Hybrid risk assessment
- Automated threat generation
- Security investigation workflows
- Reporting and auditing

---

## 2. Objectives

The main objectives of SentinelFlow are:

- Monitor user activities and device information.
- Identify suspicious user behaviour.
- Calculate security risk scores.
- Detect behavioural anomalies using machine learning.
- Combine rule-based and ML-based detection.
- Automatically generate security threats.
- Support investigation and threat resolution.
- Generate security reports.
- Maintain audit records of security activities.

---

## 3. Key Features

### Authentication & Role Management
- Secure user authentication.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access for:
  - Employee
  - Security Analyst
  - Administrator

### Activity Monitoring
The system records activities such as:

- File access
- Failed login attempts
- Data exports
- Sensitive resource access
- Unknown device activity

### Rule-Based Risk Engine

The rule engine calculates an initial risk score based on security-related activity.

Example scoring:

| Activity / Condition | Risk Contribution |
|---|---:|
| Base Risk | 10 |
| Failed Login | +45 |
| File Access | +25 |
| Data Export | +70 |
| Sensitive Resource | +20 |
| Unknown Device | +25 |

The final rule score is capped at 100.

Risk levels:

| Score | Risk Level |
|---:|---|
| 80–100 | CRITICAL |
| 60–79 | HIGH |
| 30–59 | MEDIUM |
| 0–29 | LOW |

### Machine Learning Anomaly Detection

SentinelFlow uses an **Isolation Forest** model to identify unusual activity patterns.

The ML model considers behavioural features such as:

- Hour of activity
- Day of week
- Weekend activity
- After-hours activity
- File access
- Failed login
- Data export
- Sensitive resource access
- Unknown device
- Private IP information
- Activity frequency
- Failed-login frequency
- Data-export frequency
- Sensitive-access frequency
- Rule-based risk score

### Hybrid Detection

The system combines rule-based and ML signals.

The hybrid score is calculated as:

`Hybrid Risk Score = Rule Risk Score × 0.65 + ML Risk Score × 0.35`

This approach combines:

- **Rule Engine:** deterministic and explainable security rules
- **Machine Learning:** behavioural anomaly detection

If the ML service is unavailable, the system automatically falls back to rule-based detection.

### Threat Detection

Detected activities can automatically generate threats.

Examples include:

- Large Data Export
- Suspicious Login Attempt
- Unknown Device Activity
- Sensitive File Access
- Suspicious Activity

### Investigation Management

Security analysts can:

- Review detected threats
- Create investigations
- Track investigation status
- Record investigation details
- Update investigation outcomes

### Security Reports

The platform provides security reporting including:

- Activities analyzed
- Threats detected
- Critical threats
- High-risk threats
- ML anomalies
- Hybrid detections
- Average ML score
- Average hybrid risk
- ML-assisted threats
- Threat intelligence
- Detection breakdown

### Audit Logs

Security-related activities, threats, and investigation events are available through the audit log interface.

### ML Performance Dashboard

The platform includes a dedicated ML performance dashboard for comparing:

- Rule Engine
- Isolation Forest
- Hybrid Rule + ML

using:

- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix

---

## 4. System Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js +         │
                    │   Express Backend   │
                    └───────┬───────┬─────┘
                            │       │
                ┌───────────┘       └──────────────┐
                ▼                                  ▼
      ┌──────────────────┐              ┌──────────────────┐
      │   PostgreSQL     │              │ Python ML Service│
      │    Database      │              │ FastAPI/Uvicorn  │
      └──────────────────┘              └────────┬─────────┘
                                                 │
                                                 ▼
                                      ┌────────────────────┐
                                      │   Isolation Forest │
                                      │   Anomaly Model    │
                                      └────────────────────┘
```

### Detection Workflow

```text
User Authentication
        ↓
Activity Monitoring
        ↓
Activity Logging
        ↓
Rule-Based Risk Analysis
        +
Isolation Forest Anomaly Detection
        ↓
Hybrid Risk Assessment
        ↓
Threat Detection
        ↓
Automatic Threat Generation
        ↓
Investigation
        ↓
Reporting & Audit
```



## 5. Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- REST APIs

### Database

- PostgreSQL

### Machine Learning

- Python
- pandas
- NumPy
- scikit-learn
- joblib

### ML API

- FastAPI
- Uvicorn

### Development Tools

- Visual Studio Code
- Git
- GitHub
- PowerShell

---

## 6. Project Structure

```text
SentinelFlow/
│
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── ml/
│   ├── model/
│   ├── evaluate_model.py
│   ├── train_model.py
│   └── ...
│
├── README.md
└── .gitignore
```

> The exact contents of individual folders may vary depending on the current implementation.

---

## 7. Backend API Modules

The backend provides REST APIs for:

```text
/api/auth
/api/users
/api/devices
/api/activities
/api/sessions
/api/behavior-analysis
/api/risk-assessments
/api/threats
/api/alerts
/api/investigations
/api/reports
/api/audit-logs
/api/dashboard
/api/policies
```

The ML service provides endpoints including:

```text
/health
/predict
```

---

## 8. Installation

### Prerequisites

Install the following:

- Node.js
- npm
- PostgreSQL
- Python 3.x
- Git

---

## 9. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the required environment variables.

Example structure:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
ML_SERVICE_URL=http://127.0.0.1:8000
```

**Do not commit `.env` or real secrets to GitHub.**

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

---

## 10. ML Service Setup

Navigate to the ML directory:

```bash
cd ml
```

Create and activate a Python virtual environment if required:

```bash
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install the required packages:

```bash
pip install pandas numpy scikit-learn joblib fastapi uvicorn
```

Start the ML service:

```bash
uvicorn app:app --host 127.0.0.1 --port 8000
```

The ML service runs on:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

## 11. Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend is normally available at:

```text
http://localhost:5173
```

---

## 12. Running the Complete System

Run the three components separately:

### Terminal 1 — PostgreSQL

Ensure PostgreSQL is running.

### Terminal 2 — ML Service

```bash
cd ml
uvicorn app:app --host 127.0.0.1 --port 8000
```

### Terminal 3 — Backend

```bash
cd backend
npm run dev
```

### Terminal 4 — Frontend

```bash
cd frontend
npm run dev
```

Then open the frontend URL provided by Vite.

---

## 13. Demo Credentials

The project includes demo accounts for demonstration purposes.

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `Admin@123` |
| Security Analyst | `analyst` | `Analyst@123` |
| Employee | `employee1` | `Employee@123` |
| Employee | `employee2` | `Employee@123` |

> These credentials are intended only for local/project demonstration.

---

## 14. Example Detection Scenario

A high-risk activity can be generated using a data export from an unknown device.

Example:

```text
Username: employee5
Activity: DATA_EXPORT
Resource: Customer_Database
Device: Unknown Device
IP: 172.16.10.45
```

The system evaluates the activity using both detection mechanisms.

Example result:

```text
Rule Risk Score:       100
ML Anomaly Score:      0.5499
ML Anomaly:            TRUE
Hybrid Risk Score:     84
Risk Level:            CRITICAL
Detection Method:      HYBRID_RULE_ML
Threat:                Large Data Export
Status:                OPEN
```

This demonstrates the complete pipeline:

```text
Activity
   ↓
Rule Engine
   +
Isolation Forest
   ↓
Hybrid Risk Score
   ↓
CRITICAL Risk
   ↓
Automatic Threat
   ↓
Investigation
```

---

## 15. ML Evaluation

The ML evaluation uses a **synthetic labeled benchmark** consisting of:

- 1,000 total samples
- 700 training samples
- 300 test samples
- 800 normal samples
- 200 anomalous samples

### Results

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| Rule Engine | 92.67% | 73.17% | 100% | 84.51% |
| Isolation Forest | 80.00% | 50.00% | 100% | 66.67% |
| Hybrid Rule + ML | **94.33%** | **77.92%** | **100%** | **87.59%** |

The hybrid approach performed better than either individual detection method on this benchmark.

**Important:** These results are based on a synthetic evaluation dataset and should not be interpreted as production performance.

---

## 16. Security Considerations

SentinelFlow includes several security-oriented mechanisms:

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access
- Risk scoring
- Threat detection
- Audit logging
- ML anomaly detection
- ML-service failure fallback
- Separation of frontend, backend, database and ML service

Sensitive configuration values should be stored in environment variables and should not be committed to the repository.

---

## 17. Future Scope

Possible future improvements include:

- Real-time enterprise activity monitoring
- Integration with SIEM platforms
- Real organizational security datasets
- Advanced behavioural profiling
- Explainable AI for anomaly decisions
- Automated incident response
- Email and Slack security notifications
- Continuous model retraining
- Advanced user and entity behaviour analytics
- Cloud deployment
- Containerization using Docker

---

## 18. Project Contribution

SentinelFlow integrates multiple areas of software engineering and cybersecurity into a single platform:

```text
Full-Stack Development
        +
Cybersecurity Rule Engine
        +
Machine Learning
        +
Threat Investigation
        +
Security Reporting
        +
Audit Management
```

The primary contribution is an end-to-end insider-threat detection workflow that combines explainable security rules with machine-learning-based behavioural anomaly detection.

---

## 19. Team

**Project:** SentinelFlow – Intelligent Insider Threat Detection and Risk Analysis Platform

**Institution:** VIT Chennai

**Course:** Software Engineering

**Team Members:**

- Ayush Bhardwaj
- [Team Member 2]
- [Team Member 3]
- [Team Member 4]

> Replace the team-member placeholders with the final team details before submission.

---

## 20. Repository

The source code is maintained using Git and GitHub.

**Personal Repository:**  
`https://github.com/Ayushbhardwaj0202/SentinelFlow`

**VIT Classroom Repository:**  
`[Add VIT Classroom repository link]`

---

## 21. Project Status

**Status: Completed / Demonstration Ready**

The implemented platform provides:

- Authentication
- Activity monitoring
- Risk assessment
- Rule-based detection
- ML anomaly detection
- Hybrid threat detection
- Threat management
- Investigation management
- Security reports
- Audit logs
- ML performance evaluation
- Integrated React, Node.js, PostgreSQL and Python ML architecture