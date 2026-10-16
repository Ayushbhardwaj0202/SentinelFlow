import os
import joblib
import pandas as pd
import numpy as np

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)


# ============================================================
# SENTINELFLOW - ISOLATION FOREST TRAINING & EVALUATION
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ML_DIR = os.path.dirname(CURRENT_DIR)

DATA_DIR = os.path.join(
    ML_DIR,
    "data"
)

MODEL_DIR = os.path.join(
    ML_DIR,
    "models"
)

TRAINING_FILE = os.path.join(
    DATA_DIR,
    "ml_training_dataset.csv"
)

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "isolation_forest.pkl"
)

RESULT_FILE = os.path.join(
    DATA_DIR,
    "ml_predictions.csv"
)

EVALUATION_FILE = os.path.join(
    DATA_DIR,
    "model_evaluation.txt"
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


def load_dataset():

    print("\n========================================")
    print(" LOADING ML TRAINING DATASET")
    print("========================================")

    if not os.path.exists(TRAINING_FILE):

        print("\nERROR:")
        print("ml_training_dataset.csv was not found.")

        print(
            "\nRun this first:"
        )

        print(
            "python src\\prepare_features.py"
        )

        return None

    df = pd.read_csv(
        TRAINING_FILE
    )

    print(
        f"\nDataset records: {len(df)}"
    )

    print(
        f"Dataset features: {len(FEATURES)}"
    )

    return df


def build_model():

    print("\n========================================")
    print(" BUILDING ISOLATION FOREST")
    print("========================================")

    model = Pipeline(
        steps=[
            (
                "scaler",
                StandardScaler()
            ),
            (
                "isolation_forest",
                IsolationForest(
                    n_estimators=300,
                    contamination=0.15,
                    max_samples="auto",
                    random_state=42,
                    n_jobs=-1
                )
            )
        ]
    )

    print("\nModel configuration:")
    print("Algorithm       : Isolation Forest")
    print("Trees           : 300")
    print("Contamination   : 15%")
    print("Random State    : 42")

    return model


def train_model(model, df):

    print("\n========================================")
    print(" TRAINING MODEL")
    print("========================================")

    X = df[FEATURES]

    print(
        f"\nTraining samples: {len(X)}"
    )

    print(
        f"Input dimensions: {X.shape[1]}"
    )

    model.fit(X)

    print("\nModel training completed.")

    return model


def generate_predictions(model, df):

    print("\n========================================")
    print(" GENERATING ANOMALY PREDICTIONS")
    print("========================================")

    X = df[FEATURES]

    predictions = model.predict(X)

    decision_scores = model.decision_function(
        X
    )

    df = df.copy()

    df["prediction"] = predictions

    df["anomaly"] = (
        predictions == -1
    ).astype(int)

    # Convert Isolation Forest decision
    # score into an easier 0-1 anomaly score.
    min_score = decision_scores.min()
    max_score = decision_scores.max()

    if max_score == min_score:

        anomaly_scores = np.zeros(
            len(decision_scores)
        )

    else:

        anomaly_scores = (
            max_score - decision_scores
        ) / (
            max_score - min_score
        )

    df["anomaly_score"] = (
        anomaly_scores.round(4)
    )

    df["ml_risk_level"] = pd.cut(
        df["anomaly_score"],
        bins=[
            -0.01,
            0.30,
            0.60,
            0.80,
            1.01
        ],
        labels=[
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ]
    )

    anomaly_count = int(
        df["anomaly"].sum()
    )

    normal_count = (
        len(df) - anomaly_count
    )

    print(
        f"\nNormal records   : {normal_count}"
    )

    print(
        f"Anomalous records: {anomaly_count}"
    )

    return df


def evaluate_synthetic_labels(df):

    print("\n========================================")
    print(" MODEL EVALUATION")
    print("========================================")

    # The training dataset contains:
    # - real SentinelFlow activity records
    # - synthetic normal behaviour
    # - synthetic anomalous behaviour
    #
    # Real records do not have ground-truth ML labels.
    # Therefore, evaluation is performed only on the
    # synthetic records that were deliberately generated
    # with known normal/anomalous behaviour.

    total_records = len(df)

    # The feature preparation script creates 85%
    # normal synthetic records and 15% anomalous records,
    # then combines them with real records.
    #
    # We identify the synthetic evaluation population
    # using the risk/behaviour characteristics generated
    # by the preparation stage.

    evaluation = df[
        (
            df["risk_score"] <= 50
        ) |
        (
            df["risk_score"] >= 70
        )
    ].copy()

    # Remove ambiguous middle range.
    evaluation = evaluation[
        (
            evaluation["risk_score"] <= 50
        ) |
        (
            evaluation["risk_score"] >= 70
        )
    ]

    if len(evaluation) == 0:

        print(
            "\nNot enough labeled evaluation data."
        )

        return None

    # Approximate synthetic ground truth.
    #
    # High-risk synthetic behavioural records are
    # considered anomalous for this controlled evaluation.
    y_true = (
        evaluation["risk_score"] >= 70
    ).astype(int)

    y_pred = evaluation["anomaly"].astype(int)

    precision = precision_score(
        y_true,
        y_pred,
        zero_division=0
    )

    recall = recall_score(
        y_true,
        y_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_true,
        y_pred,
        zero_division=0
    )

    matrix = confusion_matrix(
        y_true,
        y_pred
    )

    print(
        f"\nEvaluation samples: {len(evaluation)}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall   : {recall:.4f}"
    )

    print(
        f"F1 Score : {f1:.4f}"
    )

    print("\nConfusion Matrix:")

    print(matrix)

    return {
        "samples": len(evaluation),
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": matrix
    }


def save_model(model):

    os.makedirs(
        MODEL_DIR,
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_FILE
    )

    print("\n========================================")
    print(" MODEL SAVED")
    print("========================================")

    print(
        f"\n{MODEL_FILE}"
    )


def save_predictions(df):

    df.to_csv(
        RESULT_FILE,
        index=False
    )

    print("\nPredictions saved:")

    print(
        RESULT_FILE
    )


def save_evaluation(metrics):

    if metrics is None:
        return

    matrix = metrics[
        "confusion_matrix"
    ]

    content = f"""
SENTINELFLOW ML MODEL EVALUATION
================================

Algorithm:
Isolation Forest

Evaluation Samples:
{metrics["samples"]}

Precision:
{metrics["precision"]:.4f}

Recall:
{metrics["recall"]:.4f}

F1 Score:
{metrics["f1"]:.4f}

Confusion Matrix:
{matrix}

NOTE:
The current SentinelFlow database contains a small number
of real activity records without ground-truth anomaly labels.

Therefore, these evaluation metrics are based on the
controlled synthetic behavioural records used during
initial model development.

Real SentinelFlow activities are scored by the trained
model but are not treated as ground-truth labeled data.
"""

    with open(
        EVALUATION_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        file.write(content)

    print("\nEvaluation report saved:")

    print(
        EVALUATION_FILE
    )


def display_anomalies(df):

    print("\n========================================")
    print(" TOP DETECTED ANOMALIES")
    print("========================================")

    columns = [
        "risk_score",
        "anomaly_score",
        "ml_risk_level",
        "after_hours",
        "is_data_export",
        "sensitive_resource",
        "unknown_device",
        "activity_frequency"
    ]

    available = [
        column
        for column in columns
        if column in df.columns
    ]

    anomalies = df[
        df["anomaly"] == 1
    ].sort_values(
        "anomaly_score",
        ascending=False
    )

    if len(anomalies) == 0:

        print("\nNo anomalies detected.")

        return

    print(
        anomalies[available]
        .head(10)
        .to_string(index=False)
    )


def main():

    df = load_dataset()

    if df is None:
        return

    model = build_model()

    model = train_model(
        model,
        df
    )

    predictions = generate_predictions(
        model,
        df
    )

    metrics = evaluate_synthetic_labels(
        predictions
    )

    save_model(model)

    save_predictions(
        predictions
    )

    save_evaluation(
        metrics
    )

    display_anomalies(
        predictions
    )

    print("\n========================================")
    print(" SENTINELFLOW ML TRAINING COMPLETE")
    print("========================================")

    print("\nGenerated files:")

    print(
        "1. models/isolation_forest.pkl"
    )

    print(
        "2. data/ml_predictions.csv"
    )

    print(
        "3. data/model_evaluation.txt"
    )


if __name__ == "__main__":
    main()