"""
predict.py
Loads the saved model pipeline and exposes a predict() function for the
Flask API to call.
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
            f"Model not found at {MODEL_PATH}. "
            "Please run train.py first."
        )

    if _pipeline is None:
        _pipeline = joblib.load(MODEL_PATH)

    if _metrics is None and os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            _metrics = json.load(f)

    return _pipeline, _metrics


# ─────────────────────────────────────────────
#  Prediction Function
# ─────────────────────────────────────────────
def predict(input_data: dict) -> dict:
    """
    Takes a dict of raw feature values (as sent from the Express backend),
    runs it through the saved pipeline, and returns prediction + probabilities.

    Parameters
    ----------
    input_data : dict
        Raw feature values keyed by feature name.

    Returns
    -------
    dict with keys:
        prediction     : 0 (Not Fraud) or 1 (Fraud)
        label          : "Fraud" or "Not Fraud"
        fraud_probability   : float 0–1
        not_fraud_probability: float 0–1
        confidence     : float 0–1 (max probability)
        model_used     : str
    """
    pipeline, metrics = _load_model()

    # Convert to DataFrame with correct schema
    df = prepare_single_input(input_data)

    # Predict — pipeline handles preprocessing internally
    # Note: ImbPipeline at inference time skips SMOTE step (transform-only)
    pred  = int(pipeline.predict(df)[0])
    proba = pipeline.predict_proba(df)[0]  # [P(0), P(1)]

    fraud_prob     = float(round(proba[1], 6))
    not_fraud_prob = float(round(proba[0], 6))
    confidence     = float(round(max(proba), 6))

    best_model = metrics.get("best_model", "Unknown") if metrics else "Unknown"

    return {
        "prediction":          pred,
        "label":               "Fraud" if pred == 1 else "Not Fraud",
        "fraud_probability":   fraud_prob,
        "not_fraud_probability": not_fraud_prob,
        "confidence":          confidence,
        "model_used":          best_model,
    }


# ─────────────────────────────────────────────
#  Model Info Function
# ─────────────────────────────────────────────
def get_model_info() -> dict:
    """Returns model metrics and metadata for the /model-info endpoint."""
    _, metrics = _load_model()
    if metrics is None:
        return {"error": "No metrics available"}
    return metrics
