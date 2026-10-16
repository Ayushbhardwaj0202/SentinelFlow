# SentinelFlow
## Intelligent Insider Threat Detection and Risk Analysis Platform

SentinelFlow is a full-stack cybersecurity platform designed to monitor user activities, identify suspicious behavior, calculate security risk, detect potential insider threats, and support security investigations.

The platform combines an explainable rule-based security engine with an unsupervised Machine Learning model using Isolation Forest. These two detection signals are combined through a hybrid risk engine to improve threat detection performance.

---

## Key Features

- JWT-based authentication
- Role-based access control
- Employee activity monitoring
- Device and session monitoring
- Rule-based risk scoring
- Isolation Forest anomaly detection
- Hybrid Rule + ML risk assessment
- Automated threat generation
- Threat severity classification
- Security investigations
- Investigation resolution workflow
- Security report generation
- Audit logging
- Live security dashboard
- ML performance evaluation
- PostgreSQL persistence
- REST API architecture
- Python ML microservice

---

# System Architecture

```text
                    ┌──────────────────────┐
                    │     React Frontend   │
                    │   Security Dashboard │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express   │
                    │     Backend API       │
                    └───────┬─────────┬────┘
                            │         │
                            │         │ HTTP
                            │         ▼
                            │  ┌──────────────────┐
                            │  │ Python ML Service│
                            │  │    FastAPI       │
                            │  │ Isolation Forest │
                            │  └──────────────────┘
                            │
                            ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │      Database        │
                    └──────────────────────┘