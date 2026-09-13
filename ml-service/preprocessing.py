"""
preprocessing.py
Handles all data loading, cleaning, feature engineering and pipeline creation.
"""

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
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

# Features to keep (after dropping identifiers / date raw)
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
    # engineered
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


# ─────────────────────────────────────────────
#  Data Loading & Cleaning
# ─────────────────────────────────────────────
def load_and_clean(csv_path: str) -> pd.DataFrame:
    """
    Load the raw CSV, clean it, and return a DataFrame ready for feature
    engineering.
    """
    df = pd.read_csv(csv_path, na_values=["*", ""])

    # 1. Rename columns with spaces
    df.rename(columns=RENAME_MAP, inplace=True)
    df.columns = df.columns.str.strip()

    # 2. Encode target: Y → 1, N → 0
    df[TARGET_COL] = df[TARGET_COL].map({"Y": 1, "N": 0})
    df.dropna(subset=[TARGET_COL], inplace=True)
    df[TARGET_COL] = df[TARGET_COL].astype(int)

    # 3. Parse claim_date for feature extraction
    df["claim_date"] = pd.to_datetime(df["claim_date"], errors="coerce")
    df["claim_month"]   = df["claim_date"].dt.month.fillna(0).astype(int)
    df["claim_year"]    = df["claim_date"].dt.year.fillna(0).astype(int)
    df["claim_day_num"] = df["claim_date"].dt.day.fillna(0).astype(int)

    # 4. Fix invalid negative annual_income → NaN (will be imputed)
    df.loc[df["annual_income"] < 0, "annual_income"] = np.nan

    # 5. Drop identifier / raw-date columns
    df.drop(columns=[c for c in DROP_COLS if c in df.columns], inplace=True)

    # 6. Binary features: ensure numeric
    for col in BINARY_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # 7. Numerical features: ensure numeric
    for col in NUMERICAL_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


# ─────────────────────────────────────────────
#  Outlier Handling (Winsorization via IQR)
# ─────────────────────────────────────────────
WINSOR_COLS = [
    "annual_income", "vehicle_price", "total_claim",
    "injury_claim", "annual_premium",
]

def winsorize_iqr(df: pd.DataFrame, cols: list, factor: float = 3.0) -> pd.DataFrame:
    """Cap extreme values at (Q1 - factor*IQR) and (Q3 + factor*IQR)."""
    df = df.copy()
    for col in cols:
        if col not in df.columns:
            continue
        q1  = df[col].quantile(0.25)
        q3  = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - factor * iqr
        upper = q3 + factor * iqr
        df[col] = df[col].clip(lower=lower, upper=upper)
    return df


# ─────────────────────────────────────────────
#  Preprocessing Pipeline
# ─────────────────────────────────────────────
def build_preprocessor() -> ColumnTransformer:
    """
    Returns a ColumnTransformer that:
    - Imputes + scales numerical features
    - Imputes + one-hot encodes categorical features
    - Imputes binary features with mode
    """
    numerical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler",  StandardScaler()),
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot",  OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    binary_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
    ])

    # Only keep columns that actually exist in data
    preprocessor = ColumnTransformer(
        transformers=[
            ("num",  numerical_pipeline,   NUMERICAL_FEATURES),
            ("cat",  categorical_pipeline, CATEGORICAL_FEATURES),
            ("bin",  binary_pipeline,      BINARY_FEATURES),
        ],
        remainder="drop",
    )

    return preprocessor


# ─────────────────────────────────────────────
#  Feature / Target split helper
# ─────────────────────────────────────────────
def get_feature_target(df: pd.DataFrame):
    """Return X (features) and y (target) DataFrames."""
    all_features = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES
    available    = [c for c in all_features if c in df.columns]
    X = df[available].copy()
    y = df[TARGET_COL].copy()
    return X, y


# ─────────────────────────────────────────────
#  Single-row inference helper
# ─────────────────────────────────────────────
def prepare_single_input(data: dict) -> pd.DataFrame:
    """
    Convert a raw API request dict into a single-row DataFrame that matches
    the training feature schema. Missing fields are set to NaN.
    """
    all_features = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES
    row = {col: data.get(col, np.nan) for col in all_features}
    df  = pd.DataFrame([row])

    # Coerce numeric columns
    for col in NUMERICAL_FEATURES + BINARY_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df
