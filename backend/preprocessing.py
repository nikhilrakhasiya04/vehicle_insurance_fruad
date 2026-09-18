"""
preprocessing.py
Handles data schema, feature engineering, and preparation of inputs for model inference.
Exact match to the training data transformations.
"""

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# ─────────────────────────────────────────────
#  Column name constants
# ─────────────────────────────────────────────
RENAME_MAP = {
    "policy deductible": "policy_deductible",
    "annual premium":    "annual_premium",
    "days open":         "days_open",
    "form defects":      "form_defects",
    "fraud reported":    "fraud_reported",
}

TARGET_COL = "fraud_reported"
DROP_COLS  = ["claim_number", "claim_date", "zip_code"]

# Features required by the trained model pipeline
NUMERICAL_FEATURES = [
    "age_of_driver",
    "safety_rating",
    "annual_income",
    "liab_prct",
    "age_of_vehicle",
    "vehicle_price",
    "total_claim",
    "injury_claim",
    "policy_deductible",
    "annual_premium",
    "days_open",
    "past_num_of_claims",
    "form_defects",
    "claim_month",
    "claim_year",
    "claim_day_num",
]

CATEGORICAL_FEATURES = [
    "gender",
    "property_status",
    "accident_site",
    "channel",
    "vehicle_category",
    "vehicle_color",
    "claim_day_of_week",
]

BINARY_FEATURES = [
    "marital_status",
    "high_education",
    "address_change",
    "police_report",
    "witness_present",
]

ALL_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES


def prepare_single_input(data: dict) -> pd.DataFrame:
    """
    Convert a raw API request dict into a single-row DataFrame that matches
    the exact training feature schema. Missing fields are set to NaN for imputation.
    """
    row = {col: data.get(col, np.nan) for col in ALL_FEATURES}
    df = pd.DataFrame([row])

    # Coerce numeric columns
    for col in NUMERICAL_FEATURES + BINARY_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df
