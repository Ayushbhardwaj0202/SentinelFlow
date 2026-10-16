import os
import numpy as np
import pandas as pd


# ============================================================
# SENTINELFLOW - BEHAVIORAL FEATURE ENGINEERING
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ML_DIR = os.path.dirname(CURRENT_DIR)

DATA_DIR = os.path.join(
    ML_DIR,
    "data"
)

INPUT_FILE = os.path.join(
    DATA_DIR,
    "real_activities.csv"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "ml_features.csv"
)

TRAINING_FILE = os.path.join(
    DATA_DIR,
    "ml_training_dataset.csv"
)


def load_real_data():

    print("\n========================================")
    print(" LOADING REAL SENTINELFLOW DATA")
    print("========================================")

    if not os.path.exists(INPUT_FILE):

        print("\nERROR: real_activities.csv not found.")
        print(f"Expected location: {INPUT_FILE}")
        return None

    df = pd.read_csv(INPUT_FILE)

    print(f"\nReal records loaded: {len(df)}")

    return df


def engineer_features(df):

    print("\n========================================")
    print(" FEATURE ENGINEERING")
    print("========================================")

    df = df.copy()

    df["created_at"] = pd.to_datetime(
        df["created_at"]
    )

    # --------------------------------------------------------
    # Time-based features
    # --------------------------------------------------------

    df["hour"] = df["created_at"].dt.hour

    df["day_of_week"] = (
        df["created_at"].dt.dayofweek
    )

    df["is_weekend"] = (
        df["day_of_week"] >= 5
    ).astype(int)

    df["after_hours"] = (
        (df["hour"] < 8) |
        (df["hour"] >= 19)
    ).astype(int)

    # --------------------------------------------------------
    # Activity type features
    # --------------------------------------------------------

    df["is_file_access"] = (
        df["activity_type"]
        .str.upper()
        .eq("FILE_ACCESS")
    ).astype(int)

    df["is_failed_login"] = (
        df["activity_type"]
        .str.upper()
        .eq("FAILED_LOGIN")
    ).astype(int)

    df["is_data_export"] = (
        df["activity_type"]
        .str.upper()
        .eq("DATA_EXPORT")
    ).astype(int)

    # --------------------------------------------------------
    # Sensitive resource detection
    # --------------------------------------------------------

    sensitive_keywords = (
        "financial",
        "finance",
        "payroll",
        "customer",
        "database",
        "employee",
        "salary",
        "confidential",
        "bank",
        "payment"
    )

    resource_text = (
        df["resource"]
        .fillna("")
        .astype(str)
        .str.lower()
    )

    df["sensitive_resource"] = (
        resource_text.apply(
            lambda value: int(
                any(
                    keyword in value
                    for keyword in sensitive_keywords
                )
            )
        )
    )

    # --------------------------------------------------------
    # Unknown device detection
    # --------------------------------------------------------

    device_text = (
        df["device"]
        .fillna("")
        .astype(str)
        .str.lower()
    )

    df["unknown_device"] = (
        device_text
        .str.contains(
            "unknown|unrecognized|unknown device",
            regex=True
        )
        .astype(int)
    )

    # --------------------------------------------------------
    # IP-based feature
    # --------------------------------------------------------

    df["private_ip"] = (
        df["ip_address"]
        .fillna("")
        .astype(str)
        .str.startswith(
            ("10.", "192.168.", "172.")
        )
        .astype(int)
    )

    # --------------------------------------------------------
    # User activity frequency
    # --------------------------------------------------------

    user_frequency = (
        df.groupby("username")["id"]
        .transform("count")
    )

    df["activity_frequency"] = (
        user_frequency
    )

    # --------------------------------------------------------
    # Failed login frequency
    # --------------------------------------------------------

    failed_login_count = (
        df.groupby("username")["is_failed_login"]
        .transform("sum")
    )

    df["failed_login_count"] = (
        failed_login_count
    )

    # --------------------------------------------------------
    # Data export frequency
    # --------------------------------------------------------

    export_count = (
        df.groupby("username")["is_data_export"]
        .transform("sum")
    )

    df["data_export_frequency"] = (
        export_count
    )

    # --------------------------------------------------------
    # Sensitive access frequency
    # --------------------------------------------------------

    sensitive_count = (
        df.groupby("username")["sensitive_resource"]
        .transform("sum")
    )

    df["sensitive_access_frequency"] = (
        sensitive_count
    )

    # --------------------------------------------------------
    # Risk normalization
    # --------------------------------------------------------

    df["risk_score_normalized"] = (
        df["risk_score"] / 100.0
    )

    # --------------------------------------------------------
    # Final ML features
    # --------------------------------------------------------

    feature_columns = [
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

    feature_df = df[
        feature_columns
    ].copy()

    print("\nGenerated ML features:")

    for feature in feature_columns:
        print(f"  - {feature}")

    return df, feature_df


def create_training_dataset(feature_df):

    print("\n========================================")
    print(" BUILDING ML TRAINING DATASET")
    print("========================================")

    np.random.seed(42)

    real_count = len(feature_df)

    print(
        f"\nUsing {real_count} real SentinelFlow records."
    )

    # --------------------------------------------------------
    # Synthetic behavioral expansion
    #
    # Used only because the current demo database has
    # very few real activity records.
    # --------------------------------------------------------

    target_count = max(
        500,
        real_count * 50
    )

    synthetic_count = (
        target_count - real_count
    )

    normal_count = int(
        synthetic_count * 0.85
    )

    anomaly_count = (
        synthetic_count - normal_count
    )

    # --------------------------------------------------------
    # Normal behaviour
    # --------------------------------------------------------

    normal = pd.DataFrame({
        "hour": np.random.randint(
            8, 19, normal_count
        ),

        "day_of_week": np.random.randint(
            0, 5, normal_count
        ),

        "is_weekend": np.zeros(
            normal_count,
            dtype=int
        ),

        "after_hours": np.zeros(
            normal_count,
            dtype=int
        ),

        "is_file_access": np.random.choice(
            [0, 1],
            normal_count,
            p=[0.25, 0.75]
        ),

        "is_failed_login": np.random.choice(
            [0, 1],
            normal_count,
            p=[0.97, 0.03]
        ),

        "is_data_export": np.random.choice(
            [0, 1],
            normal_count,
            p=[0.98, 0.02]
        ),

        "sensitive_resource": np.random.choice(
            [0, 1],
            normal_count,
            p=[0.85, 0.15]
        ),

        "unknown_device": np.random.choice(
            [0, 1],
            normal_count,
            p=[0.96, 0.04]
        ),

        "private_ip": np.random.choice(
            [0, 1],
            normal_count,
            p=[0.05, 0.95]
        ),

        "activity_frequency": np.random.randint(
            1, 15, normal_count
        ),

        "failed_login_count": np.random.randint(
            0, 3, normal_count
        ),

        "data_export_frequency": np.random.randint(
            0, 2, normal_count
        ),

        "sensitive_access_frequency": np.random.randint(
            0, 4, normal_count
        ),

        "risk_score": np.random.randint(
            5, 50, normal_count
        ),

        "risk_score_normalized": np.zeros(
            normal_count
        )
    })

    normal["risk_score_normalized"] = (
        normal["risk_score"] / 100.0
    )

    # --------------------------------------------------------
    # Anomalous behaviour
    # --------------------------------------------------------

    anomalies = pd.DataFrame({
        "hour": np.random.randint(
            0, 6, anomaly_count
        ),

        "day_of_week": np.random.randint(
            0, 7, anomaly_count
        ),

        "is_weekend": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.45, 0.55]
        ),

        "after_hours": np.ones(
            anomaly_count,
            dtype=int
        ),

        "is_file_access": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.2, 0.8]
        ),

        "is_failed_login": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.3, 0.7]
        ),

        "is_data_export": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.25, 0.75]
        ),

        "sensitive_resource": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.15, 0.85]
        ),

        "unknown_device": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.15, 0.85]
        ),

        "private_ip": np.random.choice(
            [0, 1],
            anomaly_count,
            p=[0.5, 0.5]
        ),

        "activity_frequency": np.random.randint(
            25, 100, anomaly_count
        ),

        "failed_login_count": np.random.randint(
            4, 15, anomaly_count
        ),

        "data_export_frequency": np.random.randint(
            2, 10, anomaly_count
        ),

        "sensitive_access_frequency": np.random.randint(
            5, 20, anomaly_count
        ),

        "risk_score": np.random.randint(
            70, 101, anomaly_count
        ),

        "risk_score_normalized": np.zeros(
            anomaly_count
        )
    })

    anomalies["risk_score_normalized"] = (
        anomalies["risk_score"] / 100.0
    )

    synthetic = pd.concat(
        [normal, anomalies],
        ignore_index=True
    )

    # --------------------------------------------------------
    # Add real data
    # --------------------------------------------------------

    training_df = pd.concat(
        [
            feature_df,
            synthetic
        ],
        ignore_index=True
    )

    training_df = training_df.sample(
        frac=1,
        random_state=42
    ).reset_index(
        drop=True
    )

    print(
        f"\nFinal training records: {len(training_df)}"
    )

    print(
        f"Synthetic records: {len(synthetic)}"
    )

    print(
        f"Real records: {real_count}"
    )

    return training_df


def main():

    df = load_real_data()

    if df is None:
        return

    _, feature_df = engineer_features(
        df
    )

    training_df = create_training_dataset(
        feature_df
    )

    feature_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    training_df.to_csv(
        TRAINING_FILE,
        index=False
    )

    print("\n========================================")
    print(" FEATURE ENGINEERING COMPLETE")
    print("========================================")

    print(
        f"\nReal feature file:\n{OUTPUT_FILE}"
    )

    print(
        f"\nTraining dataset:\n{TRAINING_FILE}"
    )

    print("\nFeature dataset shape:")
    print(feature_df.shape)

    print("\nTraining dataset shape:")
    print(training_df.shape)


if __name__ == "__main__":
    main()