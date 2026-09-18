"""
prediction_service.py
Service layer for ML fraud prediction persistence, history retrieval,
pagination, and dashboard statistics using embedded SQLite.
"""

import json
import math
from datetime import datetime
from database import get_connection
from predict import predict as run_ml_prediction


def _format_row(row) -> dict:
    """Converts a SQLite row into the dict format expected by the frontend."""
    if not row:
        return None

    try:
        input_data = json.loads(row["input_data"])
    except Exception:
        input_data = {}

    try:
        result = json.loads(row["result"])
    except Exception:
        result = {}

    created_at = row["created_at"]
    if created_at and not created_at.endswith("Z"):
        created_at = created_at.replace(" ", "T") + "Z"

    updated_at = row["updated_at"]
    if updated_at and not updated_at.endswith("Z"):
        updated_at = updated_at.replace(" ", "T") + "Z"

    return {
        "_id": str(row["id"]),
        "id": row["id"],
        "inputData": input_data,
        "result": result,
        "prediction": result.get("prediction", "No"),
        "fraud_probability": row["fraud_probability"],
        "confidence": row["confidence"],
        "status": row["status"] or "completed",
        "ipAddress": row["ip_address"] or "unknown",
        "createdAt": created_at,
        "updatedAt": updated_at,
    }


def create_prediction(input_data: dict, ip_address: str = "unknown") -> dict:
    """
    1. Runs ML model prediction
    2. Persists to local SQLite database
    3. Returns formatted document
    """
    result = run_ml_prediction(input_data)

    pred_raw = int(result.get("prediction_raw", 1 if result.get("prediction") == "Yes" else 0))
    conf_val = float(result.get("confidence", 0.0))
    fraud_prob_val = float(result.get("fraud_probability", 0.0))
    accident_site = input_data.get("accident_site", "Unknown")

    input_json = json.dumps(input_data)
    # Ensure result dictionary has both formats for complete compatibility
    result_dict = {
        "prediction": pred_raw,
        "prediction_label": result.get("prediction"),
        "label": result.get("label"),
        "fraud_probability": fraud_prob_val,
        "not_fraud_probability": result.get("not_fraud_probability", 1.0 - fraud_prob_val),
        "confidence": conf_val,
        "model_used": result.get("model_used", "XGBoost"),
    }
    result_json = json.dumps(result_dict)
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO predictions (
            input_data, result, prediction, confidence,
            fraud_probability, accident_site, status, ip_address,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        input_json, result_json, pred_raw, conf_val,
        fraud_prob_val, accident_site, "completed", ip_address or "unknown",
        now_str, now_str
    ))

    inserted_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM predictions WHERE id = ?", (inserted_id,))
    row = cursor.fetchone()
    conn.close()

    formatted = _format_row(row)
    # Include top-level fields matching the requested API format
    return {
        "prediction": result.get("prediction"),
        "fraud_probability": fraud_prob_val,
        "confidence": conf_val,
        "result": result_dict,
        "data": formatted,
    }


def get_prediction_history(page: int = 1, limit: int = 10, filter_type: str = None) -> dict:
    """
    Fetches paginated prediction history with optional fraud filtering.
    """
    conn = get_connection()
    cursor = conn.cursor()

    where_clauses = []
    params = []

    if filter_type == "fraud":
        where_clauses.append("prediction = 1")
    elif filter_type == "not_fraud":
        where_clauses.append("prediction = 0")

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    # Count total
    count_query = f"SELECT COUNT(*) as total FROM predictions {where_sql}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()["total"]

    # Select items
    skip = (page - 1) * limit
    select_query = f"""
        SELECT * FROM predictions
        {where_sql}
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
    """
    cursor.execute(select_query, params + [limit, skip])
    rows = cursor.fetchall()
    conn.close()

    items = [_format_row(r) for r in rows]

    return {
        "items": items,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": math.ceil(total / limit) if limit > 0 else 0,
        },
    }


def get_prediction_by_id(prediction_id: str) -> dict:
    """
    Fetches a single prediction by ID.
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        pid = int(prediction_id)
        cursor.execute("SELECT * FROM predictions WHERE id = ?", (pid,))
        row = cursor.fetchone()
    except ValueError:
        row = None

    conn.close()
    return _format_row(row)


def delete_prediction(prediction_id: str) -> bool:
    """
    Deletes a single prediction by ID.
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        pid = int(prediction_id)
        cursor.execute("DELETE FROM predictions WHERE id = ?", (pid,))
        deleted = cursor.rowcount > 0
        conn.commit()
    except ValueError:
        deleted = False

    conn.close()
    return deleted


def get_dashboard_stats() -> dict:
    """
    Aggregates summary statistics for the dashboard.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Totals
    cursor.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN prediction = 1 THEN 1 ELSE 0 END) as totalFraud,
            AVG(confidence) as avgConfidence,
            AVG(fraud_probability) as avgFraudProb
        FROM predictions
    """)
    totals = cursor.fetchone()

    total = totals["total"] or 0
    total_fraud = totals["totalFraud"] or 0
    avg_conf = totals["avgConfidence"] or 0.0
    avg_fraud_prob = totals["avgFraudProb"] or 0.0

    # 2. Last 30 days trend
    cursor.execute("""
        SELECT
            strftime('%Y-%m-%d', created_at) as date_str,
            COUNT(*) as total,
            SUM(CASE WHEN prediction = 1 THEN 1 ELSE 0 END) as fraud
        FROM predictions
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date_str ASC
    """)
    trend_rows = cursor.fetchall()

    # 3. Top 5 Fraud Sites
    cursor.execute("""
        SELECT
            COALESCE(accident_site, 'Unknown') as site,
            COUNT(*) as count
        FROM predictions
        WHERE prediction = 1
        GROUP BY accident_site
        ORDER BY count DESC
        LIMIT 5
    """)
    site_rows = cursor.fetchall()
    conn.close()

    return {
        "total": total,
        "totalFraud": total_fraud,
        "totalNotFraud": total - total_fraud,
        "fraudRate": round((total_fraud / total * 100), 1) if total > 0 else 0,
        "avgConfidence": round(avg_conf * 100, 1),
        "avgFraudProb": round(avg_fraud_prob * 100, 1),
        "recentTrend": [
            {
                "date": r["date_str"],
                "total": r["total"],
                "fraud": r["fraud"] or 0,
            }
            for r in trend_rows
        ],
        "fraudByAccidentSite": [
            {
                "site": r["site"] if r["site"] else "Unknown",
                "count": r["count"],
            }
            for r in site_rows
        ],
    }
