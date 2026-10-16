import numpy as np
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
from sklearn.model_selection import train_test_split


np.random.seed(42)


def create_dataset():
    normal_count = 800
    anomaly_count = 200

    normal = pd.DataFrame({
        "hour": np.random.randint(8, 19, normal_count),
        "day_of_week": np.random.randint(0, 5, normal_count),
        "is_weekend": np.zeros(normal_count),
        "after_hours": np.random.binomial(1, 0.05, normal_count),
        "is_file_access": np.random.binomial(1, 0.45, normal_count),
        "is_failed_login": np.random.binomial(1, 0.03, normal_count),
        "is_data_export": np.random.binomial(1, 0.02, normal_count),
        "sensitive_resource": np.random.binomial(1, 0.08, normal_count),
        "unknown_device": np.random.binomial(1, 0.03, normal_count),
        "private_ip": np.ones(normal_count),
        "activity_frequency": np.random.normal(8, 2, normal_count).clip(1, 20),
        "failed_login_count": np.random.poisson(0.2, normal_count),
        "data_export_frequency": np.random.poisson(0.1, normal_count),
        "sensitive_access_frequency": np.random.poisson(0.4, normal_count)
    })

    anomaly = pd.DataFrame({
        "hour": np.random.choice(
            [0, 1, 2, 3, 4, 5, 22, 23],
            anomaly_count
        ),
        "day_of_week": np.random.randint(0, 7, anomaly_count),
        "is_weekend": np.random.binomial(1, 0.5, anomaly_count),
        "after_hours": np.ones(anomaly_count),
        "is_file_access": np.random.binomial(1, 0.8, anomaly_count),
        "is_failed_login": np.random.binomial(1, 0.35, anomaly_count),
        "is_data_export": np.random.binomial(1, 0.55, anomaly_count),
        "sensitive_resource": np.random.binomial(1, 0.65, anomaly_count),
        "unknown_device": np.random.binomial(1, 0.45, anomaly_count),
        "private_ip": np.random.binomial(1, 0.45, anomaly_count),
        "activity_frequency": np.random.normal(25, 7, anomaly_count).clip(10, 60),
        "failed_login_count": np.random.poisson(4, anomaly_count),
        "data_export_frequency": np.random.poisson(3, anomaly_count),
        "sensitive_access_frequency": np.random.poisson(5, anomaly_count)
    })

    normal["label"] = 0
    anomaly["label"] = 1

    data = pd.concat(
        [normal, anomaly],
        ignore_index=True
    )

    data = data.sample(
        frac=1,
        random_state=42
    ).reset_index(drop=True)

    return data


def calculate_rule_score(row):
    score = 10

    if row["is_failed_login"] == 1:
        score += 45

    if row["is_file_access"] == 1:
        score += 25

    if row["is_data_export"] == 1:
        score += 70

    if row["sensitive_resource"] == 1:
        score += 20

    if row["unknown_device"] == 1:
        score += 25

    if row["after_hours"] == 1:
        score += 15

    if row["failed_login_count"] >= 3:
        score += 20

    if row["data_export_frequency"] >= 2:
        score += 25

    if row["sensitive_access_frequency"] >= 3:
        score += 15

    return min(score, 100)


def risk_to_prediction(score):
    return 1 if score >= 60 else 0


def evaluate_model(y_true, y_pred):
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(
            y_true,
            y_pred,
            zero_division=0
        ),
        "recall": recall_score(
            y_true,
            y_pred,
            zero_division=0
        ),
        "f1": f1_score(
            y_true,
            y_pred,
            zero_division=0
        ),
        "confusion_matrix": confusion_matrix(
            y_true,
            y_pred
        )
    }


print("=" * 60)
print("SENTINELFLOW ML MODEL EVALUATION")
print("=" * 60)


data = create_dataset()

features = [
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
    "sensitive_access_frequency"
]

X = data[features]
y = data["label"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42,
    stratify=y
)


print("\nDataset:")
print(f"Total samples : {len(data)}")
print(f"Training      : {len(X_train)}")
print(f"Testing       : {len(X_test)}")
print(f"Normal        : {(y == 0).sum()}")
print(f"Anomalous     : {(y == 1).sum()}")


# --------------------------------------------------
# ISOLATION FOREST
# --------------------------------------------------

normal_training = X_train[
    y_train == 0
]

model = IsolationForest(
    n_estimators=200,
    contamination=0.20,
    random_state=42
)

model.fit(normal_training)


raw_prediction = model.predict(X_test)

ml_prediction = np.where(
    raw_prediction == -1,
    1,
    0
)


# --------------------------------------------------
# RULE ENGINE
# --------------------------------------------------

rule_scores = X_test.apply(
    calculate_rule_score,
    axis=1
)

rule_prediction = rule_scores.apply(
    risk_to_prediction
).values


# --------------------------------------------------
# HYBRID MODEL
# --------------------------------------------------

ml_decision_score = model.decision_function(
    X_test
)

min_score = ml_decision_score.min()
max_score = ml_decision_score.max()

if max_score != min_score:
    ml_normalized = (
        (max_score - ml_decision_score) /
        (max_score - min_score)
    )
else:
    ml_normalized = np.zeros(
        len(ml_decision_score)
    )


rule_scores_array = rule_scores.values

hybrid_score = (
    rule_scores_array * 0.65
    +
    (ml_normalized * 100) * 0.35
)

hybrid_prediction = (
    hybrid_score >= 60
).astype(int)


# --------------------------------------------------
# METRICS
# --------------------------------------------------

ml_metrics = evaluate_model(
    y_test,
    ml_prediction
)

rule_metrics = evaluate_model(
    y_test,
    rule_prediction
)

hybrid_metrics = evaluate_model(
    y_test,
    hybrid_prediction
)


# --------------------------------------------------
# PRINT RESULTS
# --------------------------------------------------

print("\n" + "=" * 60)
print("RULE ENGINE PERFORMANCE")
print("=" * 60)

print(
    f"Accuracy  : {rule_metrics['accuracy']:.4f}"
)
print(
    f"Precision : {rule_metrics['precision']:.4f}"
)
print(
    f"Recall    : {rule_metrics['recall']:.4f}"
)
print(
    f"F1 Score  : {rule_metrics['f1']:.4f}"
)

print("\nConfusion Matrix:")
print(rule_metrics["confusion_matrix"])


print("\n" + "=" * 60)
print("ISOLATION FOREST PERFORMANCE")
print("=" * 60)

print(
    f"Accuracy  : {ml_metrics['accuracy']:.4f}"
)
print(
    f"Precision : {ml_metrics['precision']:.4f}"
)
print(
    f"Recall    : {ml_metrics['recall']:.4f}"
)
print(
    f"F1 Score  : {ml_metrics['f1']:.4f}"
)

print("\nConfusion Matrix:")
print(ml_metrics["confusion_matrix"])


print("\n" + "=" * 60)
print("HYBRID MODEL PERFORMANCE")
print("=" * 60)

print(
    f"Accuracy  : {hybrid_metrics['accuracy']:.4f}"
)
print(
    f"Precision : {hybrid_metrics['precision']:.4f}"
)
print(
    f"Recall    : {hybrid_metrics['recall']:.4f}"
)
print(
    f"F1 Score  : {hybrid_metrics['f1']:.4f}"
)

print("\nConfusion Matrix:")
print(hybrid_metrics["confusion_matrix"])


# --------------------------------------------------
# SAVE RESULTS
# --------------------------------------------------

results = pd.DataFrame({
    "Model": [
        "Rule Engine",
        "Isolation Forest",
        "Hybrid Rule + ML"
    ],
    "Accuracy": [
        rule_metrics["accuracy"],
        ml_metrics["accuracy"],
        hybrid_metrics["accuracy"]
    ],
    "Precision": [
        rule_metrics["precision"],
        ml_metrics["precision"],
        hybrid_metrics["precision"]
    ],
    "Recall": [
        rule_metrics["recall"],
        ml_metrics["recall"],
        hybrid_metrics["recall"]
    ],
    "F1 Score": [
        rule_metrics["f1"],
        ml_metrics["f1"],
        hybrid_metrics["f1"]
    ]
})

results.to_csv(
    "evaluation_results.csv",
    index=False
)


with open(
    "model_evaluation.txt",
    "w"
) as file:

    file.write(
        "SENTINELFLOW ML MODEL EVALUATION\n"
    )

    file.write(
        "=" * 60 + "\n\n"
    )

    file.write(
        "Dataset: Synthetic labeled behavioral "
        "security benchmark\n"
    )

    file.write(
        "Training samples: "
        f"{len(X_train)}\n"
    )

    file.write(
        "Testing samples: "
        f"{len(X_test)}\n\n"
    )

    file.write(
        results.to_string(index=False)
    )

    file.write("\n\n")

    file.write(
        "Rule Engine Confusion Matrix:\n"
    )

    file.write(
        str(rule_metrics["confusion_matrix"])
    )

    file.write("\n\n")

    file.write(
        "Isolation Forest Confusion Matrix:\n"
    )

    file.write(
        str(ml_metrics["confusion_matrix"])
    )

    file.write("\n\n")

    file.write(
        "Hybrid Model Confusion Matrix:\n"
    )

    file.write(
        str(hybrid_metrics["confusion_matrix"])
    )

    file.write("\n")


print("\n" + "=" * 60)
print("EVALUATION COMPLETE")
print("=" * 60)

print("\nFiles generated:")
print("1. evaluation_results.csv")
print("2. model_evaluation.txt")

print("\nThese results are based on a synthetic")
print("labeled evaluation benchmark and should")
print("not be presented as real-world accuracy.")