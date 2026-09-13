"""
app.py
Unified Python Backend (Flask REST API) for the Insurance Fraud Detection System.
Handles ML inference, embedded SQLite persistence, predictions history, and dashboard statistics.
"""

import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from predict import get_model_info
import database
import prediction_service

load_dotenv()

app = Flask(__name__)

# Allow cross-origin requests from Next.js frontend
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

PORT = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5000)))
DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"


# ─────────────────────────────────────────────
#  Health Checks
# ─────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "ok",
        "service": "Insurance Fraud Detection Python Backend",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
    }), 200


@app.route("/api/predictions/ml-health", methods=["GET"])
def ml_health():
    return jsonify({
        "success": True,
        "data": {
            "status": "ok",
            "service": "Insurance Fraud ML Engine",
            "version": "1.0.0",
        },
    }), 200


# ─────────────────────────────────────────────
#  Model Performance & Info
# ─────────────────────────────────────────────
@app.route("/api/predictions/model-performance", methods=["GET"])
@app.route("/model-info", methods=["GET"])
def model_performance():
    try:
        info = get_model_info()
        return jsonify({"success": True, "data": info}), 200
    except FileNotFoundError as e:
        return jsonify({"success": False, "error": str(e), "hint": "Run train.py first."}), 503
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  Predictions: Submit Claim for Prediction
# ─────────────────────────────────────────────
@app.route("/api/predictions/predict", methods=["POST"])
@app.route("/predict", methods=["POST"])
def predict_fraud():
    """
    Expects JSON body with insurance claim feature values.
    Returns fraud prediction and persists record in MongoDB.
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Content-Type must be application/json"
        }), 400

    input_data = request.get_json()

    if not input_data:
        return jsonify({
            "success": False,
            "error": "Empty request body"
        }), 400

    ip_address = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")

    try:
        saved_prediction = prediction_service.create_prediction(input_data, ip_address)
        return jsonify({
            "success": True,
            "message": "Prediction completed successfully",
            "data": saved_prediction,
        }), 201

    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "hint": "Run train.py to generate the model first."
        }), 503

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": f"Invalid input data: {str(e)}"
        }), 422

    except Exception as e:
        app.logger.error(f"Prediction error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal prediction error",
            "detail": str(e),
        }), 500


# ─────────────────────────────────────────────
#  Predictions: History & Pagination
# ─────────────────────────────────────────────
@app.route("/api/predictions/history", methods=["GET"])
def prediction_history():
    """
    Returns paginated prediction history with optional filter (fraud / not_fraud).
    """
    try:
        page = int(request.args.get("page", 1))
    except (ValueError, TypeError):
        page = 1

    try:
        limit = int(request.args.get("limit", 10))
    except (ValueError, TypeError):
        limit = 10

    filter_type = request.args.get("filter", None)

    try:
        result = prediction_service.get_prediction_history(page=page, limit=limit, filter_type=filter_type)
        return jsonify({
            "success": True,
            "data": result["items"],
            "pagination": result["pagination"],
        }), 200
    except Exception as e:
        app.logger.error(f"History fetch error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  Predictions: Dashboard Statistics
# ─────────────────────────────────────────────
@app.route("/api/predictions/stats/summary", methods=["GET"])
def dashboard_stats():
    """
    Returns aggregated dashboard statistics.
    """
    try:
        stats = prediction_service.get_dashboard_stats()
        return jsonify({
            "success": True,
            "data": stats,
        }), 200
    except Exception as e:
        app.logger.error(f"Stats summary error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  Predictions: Get By ID & Delete
# ─────────────────────────────────────────────
@app.route("/api/predictions/<prediction_id>", methods=["GET"])
def get_prediction_by_id(prediction_id):
    """
    Returns a single prediction record by ID.
    """
    try:
        doc = prediction_service.get_prediction_by_id(prediction_id)
        if not doc:
            return jsonify({"success": False, "error": "Prediction not found"}), 404
        return jsonify({"success": True, "data": doc}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/predictions/<prediction_id>", methods=["DELETE"])
def delete_prediction_by_id(prediction_id):
    """
    Deletes a single prediction record by ID.
    """
    try:
        deleted = prediction_service.delete_prediction(prediction_id)
        if not deleted:
            return jsonify({"success": False, "error": "Prediction not found"}), 404
        return jsonify({"success": True, "message": "Prediction deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  Error Handlers
# ─────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"success": False, "error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"success": False, "error": "Internal server error"}), 500


# ─────────────────────────────────────────────
#  Main Entrypoint
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("===============================================")
    print(f"  Insurance Fraud Detection - Python Backend")
    print(f"  Server running on http://localhost:{PORT}")
    print("===============================================")
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
