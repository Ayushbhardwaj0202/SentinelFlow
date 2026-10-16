import os
import sys
import pandas as pd
import psycopg2
from dotenv import load_dotenv


# ============================================================
# SENTINELFLOW - REAL DATABASE DATA EXTRACTION
# ============================================================

# Current file:
# ml/src/extract_data.py
#
# Project root:
# SENTINELFLOW/
#
# Backend environment file:
# backend/.env


CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ML_DIR = os.path.dirname(CURRENT_DIR)

PROJECT_ROOT = os.path.dirname(ML_DIR)

BACKEND_ENV = os.path.join(
    PROJECT_ROOT,
    "backend",
    ".env"
)

DATA_DIR = os.path.join(
    ML_DIR,
    "data"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "real_activities.csv"
)


# ------------------------------------------------------------
# Load backend environment variables
# ------------------------------------------------------------

if os.path.exists(BACKEND_ENV):

    print("\nLoading backend database configuration...")

    load_dotenv(BACKEND_ENV)

else:

    print("\nWARNING: backend/.env was not found.")

    load_dotenv()


# ------------------------------------------------------------
# Database configuration
# ------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

DB_HOST = (
    os.getenv("DB_HOST")
    or os.getenv("PGHOST")
    or "localhost"
)

DB_PORT = (
    os.getenv("DB_PORT")
    or os.getenv("PGPORT")
    or "5432"
)

DB_NAME = (
    os.getenv("DB_NAME")
    or os.getenv("DB_DATABASE")
    or os.getenv("PGDATABASE")
    or "sentinelflow"
)

DB_USER = (
    os.getenv("DB_USER")
    or os.getenv("DB_USERNAME")
    or os.getenv("PGUSER")
    or "postgres"
)

DB_PASSWORD = (
    os.getenv("DB_PASSWORD")
    or os.getenv("DB_PASS")
    or os.getenv("PGPASSWORD")
)


def connect_database():

    print("\n========================================")
    print(" SENTINELFLOW DATABASE CONNECTION")
    print("========================================")

    try:

        if DATABASE_URL:

            print("Using DATABASE_URL...")

            connection = psycopg2.connect(
                DATABASE_URL
            )

        else:

            print(f"Host     : {DB_HOST}")
            print(f"Port     : {DB_PORT}")
            print(f"Database : {DB_NAME}")
            print(f"User     : {DB_USER}")

            connection = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )

        print("\nDatabase connection successful.")

        return connection

    except Exception as error:

        print("\nDATABASE CONNECTION FAILED")
        print("----------------------------------------")
        print(error)
        print("----------------------------------------")

        print("\nCheck that:")
        print("1. PostgreSQL is running")
        print("2. Backend .env contains database credentials")
        print("3. Database name is sentinelflow")

        sys.exit(1)


def extract_activities(connection):

    print("\n========================================")
    print(" EXTRACTING SENTINELFLOW ACTIVITIES")
    print("========================================")

    query = """
        SELECT
            id,
            username,
            activity_type,
            resource,
            device,
            ip_address,
            risk_score,
            status,
            created_at,
            risk_level
        FROM sentinelflow_activities
        ORDER BY created_at ASC;
    """

    try:

        df = pd.read_sql_query(
            query,
            connection
        )

        print("\nExtraction successful.")

        print(f"Total activity records: {len(df)}")

        return df

    except Exception as error:

        print("\nDATA EXTRACTION FAILED")
        print("----------------------------------------")
        print(error)
        print("----------------------------------------")

        sys.exit(1)


def display_statistics(df):

    print("\n========================================")
    print(" ACTIVITY DATA SUMMARY")
    print("========================================")

    print("\nColumns:")
    for column in df.columns:
        print(f"  - {column}")

    print("\nActivity types:")

    print(
        df["activity_type"]
        .value_counts()
        .to_string()
    )

    print("\nRisk levels:")

    print(
        df["risk_level"]
        .value_counts()
        .to_string()
    )

    print("\nUsers:")

    print(
        df["username"]
        .value_counts()
        .to_string()
    )

    print("\nRisk score statistics:")

    print(
        df["risk_score"]
        .describe()
        .to_string()
    )

    print("\nFirst records:")

    print(
        df.head(10).to_string(
            index=False
        )
    )


def save_dataset(df):

    os.makedirs(
        DATA_DIR,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\n========================================")
    print(" DATASET SAVED")
    print("========================================")

    print(
        f"\nFile:\n{OUTPUT_FILE}"
    )


def main():

    connection = connect_database()

    try:

        df = extract_activities(
            connection
        )

        display_statistics(df)

        save_dataset(df)

    finally:

        connection.close()

        print("\nDatabase connection closed.")

    print("\n========================================")
    print(" SENTINELFLOW DATA EXTRACTION COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()