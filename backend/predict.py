"""
predict.py
Loads the saved trained model pipeline and runs prediction on input claims.
Preserves existing model inference logic and probabilities.
"""

import os
import json
import joblib
import numpy as np
from preprocessing import prepare_single_input

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, "model")

MODEL_PATH   = os.path.join(MODEL_DIR, "fraud_model.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

# ─────────────────────────────────────────────
#  Load Model (lazy singleton)
# ─────────────────────────────────────────────
_pipeline = None
_metrics  = None

def _load_model():
    global _pipeline, _metrics

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained model not found at {MODEL_PATH}. "
            "Please ensure model/fraud_model.pkl exists."
        )

    if _pipeline is None:
        _pipeline = joblib.load(MODEL_PATH)

    if _metrics is None and os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            _metrics = json.load(f)

    return _pipeline, _metrics


def predict(input_data: dict) -> dict:
    """
    Takes a dictionary of raw feature values, transforms into DataFrame,
    runs inference through the trained pipeline, and calculates probabilities.
    """
    pipeline, metrics = _load_model()

    # Convert to DataFrame matching model schema
    df = prepare_single_input(input_data)

    pred = int(pipeline.predict(df)[0])
    proba = pipeline.predict_proba(df)[0]  # [P(0), P(1)]

    fraud_prob     = float(round(proba[1], 6))
    not_fraud_prob = float(round(proba[0], 6))
    confidence     = float(round(max(proba), 6))

    best_model = metrics.get("best_model", "XGBoost") if metrics else "XGBoost"

    return {
        "prediction":            "Yes" if pred == 1 else "No",
        "prediction_raw":        pred,
        "label":                 "Fraud" if pred == 1 else "Not Fraud",
        "fraud_probability":     fraud_prob,
        "not_fraud_probability": not_fraud_prob,
        "confidence":            confidence,
        "model_used":            best_model,
    }


def get_model_info() -> dict:
    """Returns model metrics and evaluation data from model_metrics.json."""
    _, metrics = _load_model()
    if metrics is None:
        return {"error": "No model metrics available"}
    return metrics
