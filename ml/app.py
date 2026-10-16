import os
import joblib
import pandas as pd
import numpy as np

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


# ============================================================
# SENTINELFLOW - ML PREDICTION SERVICE
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "models",
    "isolation_forest.pkl"
)


FEATURES = [
    "hour",
    "day_of_week",
    "is_weekend",
    "after_hours",
    "is_file_access",
    "is_failed_login",
    "is_data_export",
    "sensitive_resource",
    "unknown_device",
    "private_ip",
    "activity_frequency",
    "failed_login_count",
    "data_export_frequency",
    "sensitive_access_frequency",
    "risk_score",
    "risk_score_normalized"
]


# ------------------------------------------------------------
# FastAPI
# ------------------------------------------------------------

app = FastAPI(
    title="SentinelFlow ML Service",
    description="Machine Learning anomaly detection service for SentinelFlow",
    version="1.0.0"
)


# ------------------------------------------------------------
# Load model once when service starts
# ------------------------------------------------------------

model = None


@app.on_event("startup")
def load_model():

    global model

    if not os.path.exists(MODEL_FILE):

        raise RuntimeError(
            f"ML model not found: {MODEL_FILE}"
        )

    model = joblib.load(
        MODEL_FILE
    )

    print("========================================")
    print(" SENTINELFLOW ML SERVICE")
    print("========================================")
    print("Isolation Forest model loaded.")
    print("Service ready.")


# ------------------------------------------------------------
# Request model
# ------------------------------------------------------------

class ActivityInput(BaseModel):

    hour: int
    day_of_week: int
    is_weekend: int
    after_hours: int

    is_file_access: int
    is_failed_login: int
    is_data_export: int

    sensitive_resource: int
    unknown_device: int
    private_ip: int

    activity_frequency: int
    failed_login_count: int
    data_export_frequency: int
    sensitive_access_frequency: int

    risk_score: float


# ------------------------------------------------------------
# Health check
# ------------------------------------------------------------

@app.get("/")
def root():

    return {
        "service": "SentinelFlow ML Service",
        "status": "running",
        "model": "Isolation Forest",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_type": "Isolation Forest"
    }


# ------------------------------------------------------------
# Prediction
# ------------------------------------------------------------

@app.post("/predict")
def predict(activity: ActivityInput):

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded"
        )

    try:

        risk_score_normalized = (
            activity.risk_score / 100.0
        )

        data = {
            "hour": [activity.hour],
            "day_of_week": [
                activity.day_of_week
            ],
            "is_weekend": [
                activity.is_weekend
            ],
            "after_hours": [
                activity.after_hours
            ],
            "is_file_access": [
                activity.is_file_access
            ],
            "is_failed_login": [
                activity.is_failed_login
            ],
            "is_data_export": [
                activity.is_data_export
            ],
            "sensitive_resource": [
                activity.sensitive_resource
            ],
            "unknown_device": [
                activity.unknown_device
            ],
            "private_ip": [
                activity.private_ip
            ],
            "activity_frequency": [
                activity.activity_frequency
            ],
            "failed_login_count": [
                activity.failed_login_count
            ],
            "data_export_frequency": [
                activity.data_export_frequency
            ],
            "sensitive_access_frequency": [
                activity.sensitive_access_frequency
            ],
            "risk_score": [
                activity.risk_score
            ],
            "risk_score_normalized": [
                risk_score_normalized
            ]
        }

        df = pd.DataFrame(
            data,
            columns=FEATURES
        )

        prediction = model.predict(df)[0]

        decision_score = (
            model.decision_function(df)[0]
        )

        # Convert Isolation Forest decision
        # score to a 0-1 anomaly score.
        #
        # Lower decision_function values indicate
        # stronger anomalies.

        anomaly_score = 1 / (
            1 + np.exp(
                5 * decision_score
            )
        )

        anomaly_score = float(
            np.clip(
                anomaly_score,
                0,
                1
            )
        )

        anomaly = (
            prediction == -1
        )

        if anomaly_score >= 0.80:

            risk_level = "CRITICAL"

        elif anomaly_score >= 0.60:

            risk_level = "HIGH"

        elif anomaly_score >= 0.30:

            risk_level = "MEDIUM"

        else:

            risk_level = "LOW"

        return {
            "success": True,
            "anomaly": bool(anomaly),
            "anomaly_score": round(
                anomaly_score,
                4
            ),
            "risk_level": risk_level,
            "model": "Isolation Forest",
            "decision_score": round(
                float(decision_score),
                4
            )
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )