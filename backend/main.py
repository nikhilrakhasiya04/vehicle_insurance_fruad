"""
main.py
FastAPI REST Backend for Vehicle Insurance Fraud Detection System.
Provides ML inference, history tracking, dashboard statistics, and health checks.
"""

import os
from typing import Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Request, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

import database
import prediction_service
from predict import get_model_info

load_dotenv()

app = FastAPI(
    title="Vehicle Insurance Fraud Detection API",
    description="FastAPI backend serving XGBoost/Scikit-Learn ML fraud inference and analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────
#  CORS Configuration
# ─────────────────────────────────────────────
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://vehicle-insurance-fruad.vercel.app",
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    for o in env_origins.split(","):
        o_clean = o.strip()
        if o_clean and o_clean not in default_origins:
            default_origins.append(o_clean)

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
#  Pydantic Schemas
# ─────────────────────────────────────────────
class ClaimInputSchema(BaseModel):
    # Driver Info
    age_of_driver: Optional[float] = Field(default=35, description="Driver age in years")
    gender: Optional[str] = Field(default="M", description="Gender (M/F)")
    marital_status: Optional[int] = Field(default=1, description="1=Married, 0=Single")
    high_education: Optional[int] = Field(default=1, description="1=Higher Education, 0=None")
    annual_income: Optional[float] = Field(default=60000.0, description="Annual income ($)")
    safety_rating: Optional[float] = Field(default=75.0, description="Driver safety rating (0-100)")
    address_change: Optional[int] = Field(default=0, description="Recent address change (1/0)")
    property_status: Optional[str] = Field(default="Own", description="Own / Rent")

    # Claim & Accident Info
    claim_month: Optional[int] = Field(default=6, description="Month of claim (1-12)")
    claim_year: Optional[int] = Field(default=2024, description="Year of claim")
    claim_day_num: Optional[int] = Field(default=15, description="Day of month (1-31)")
    claim_day_of_week: Optional[str] = Field(default="Monday", description="Day of week")
    accident_site: Optional[str] = Field(default="Highway", description="Accident location site")
    past_num_of_claims: Optional[int] = Field(default=0, description="Number of past claims")
    witness_present: Optional[int] = Field(default=0, description="Witness present (1/0)")
    liab_prct: Optional[float] = Field(default=50.0, description="Liability percentage (0-100)")
    channel: Optional[str] = Field(default="Phone", description="Submission channel (Online/Phone/Agent)")
    police_report: Optional[int] = Field(default=1, description="Police report filed (1/0)")

    # Vehicle Info
    age_of_vehicle: Optional[float] = Field(default=4.0, description="Age of vehicle in years")
    vehicle_category: Optional[str] = Field(default="Medium", description="Vehicle category (Compact/Medium/Large)")
    vehicle_price: Optional[float] = Field(default=25000.0, description="Vehicle price ($)")
    vehicle_color: Optional[str] = Field(default="silver", description="Vehicle color")

    # Financial & Policy Info
    total_claim: Optional[float] = Field(default=20000.0, description="Total claim amount ($)")
    injury_claim: Optional[float] = Field(default=5000.0, description="Injury claim amount ($)")
    policy_deductible: Optional[float] = Field(default=1000.0, description="Policy deductible ($)")
    annual_premium: Optional[float] = Field(default=1200.0, description="Annual premium ($)")
    days_open: Optional[float] = Field(default=9.0, description="Days claim has been open")
    form_defects: Optional[float] = Field(default=2.0, description="Number of form defects")

    class Config:
        extra = "allow"


# ─────────────────────────────────────────────
#  Health Endpoints
# ─────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint confirming FastAPI backend operational status."""
    return {
        "status": "success",
        "message": "FastAPI backend is running",
        "service": "Insurance Fraud Detection FastAPI Backend",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
    }


@app.get("/api/predictions/ml-health", tags=["Health"])
async def ml_health_check():
    """ML Engine health verification."""
    return {
        "success": True,
        "data": {
            "status": "ok",
            "service": "Insurance Fraud ML Engine",
            "version": "1.0.0",
        },
    }


# ─────────────────────────────────────────────
#  Prediction Endpoints
# ─────────────────────────────────────────────
@app.post("/api/predict", status_code=status.HTTP_200_OK, tags=["Prediction"])
@app.post("/api/predictions/predict", status_code=status.HTTP_200_OK, tags=["Prediction"])
async def predict_claim(claim: ClaimInputSchema, request: Request):
    """
    Submits an insurance claim for ML fraud detection.
    Runs input through the trained preprocessing and XGBoost pipeline,
    saves record to SQLite, and returns fraud prediction & probabilities.
    """
    input_dict = claim.model_dump()
    ip_address = request.client.host if request.client else "unknown"

    try:
        prediction_result = prediction_service.create_prediction(input_dict, ip_address)
        return {
            "success": True,
            "status": "success",
            "prediction": prediction_result["prediction"],
            "fraud_probability": prediction_result["fraud_probability"],
            "confidence": prediction_result["confidence"],
            "result": prediction_result["result"],
            "data": prediction_result["data"],
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model error: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid feature input: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


# ─────────────────────────────────────────────
#  History Endpoints
# ─────────────────────────────────────────────
@app.get("/api/predictions/history", tags=["History"])
async def get_history(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, le=100, description="Page size limit"),
    filter: Optional[str] = Query(default=None, description="Filter type: fraud / not_fraud"),
):
    """Retrieves paginated history of claims with optional verdict filtering."""
    try:
        res = prediction_service.get_prediction_history(page=page, limit=limit, filter_type=filter)
        return {
            "success": True,
            "data": res["items"],
            "pagination": res["pagination"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )


@app.get("/api/predictions/{prediction_id}", tags=["History"])
async def get_single_prediction(prediction_id: str):
    """Fetches a specific prediction record by ID."""
    doc = prediction_service.get_prediction_by_id(prediction_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record '{prediction_id}' not found"
        )
    return {"success": True, "data": doc}


@app.delete("/api/predictions/{prediction_id}", tags=["History"])
async def delete_single_prediction(prediction_id: str):
    """Deletes a specific prediction record by ID."""
    deleted = prediction_service.delete_prediction(prediction_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record '{prediction_id}' not found"
        )
    return {"success": True, "message": "Prediction deleted successfully"}


# ─────────────────────────────────────────────
#  Dashboard Statistics Endpoint
# ─────────────────────────────────────────────
@app.get("/api/predictions/stats/summary", tags=["Dashboard"])
async def get_summary_stats():
    """Aggregates metrics and trends for the dashboard."""
    try:
        stats_data = prediction_service.get_dashboard_stats()
        return {"success": True, "data": stats_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate stats: {str(e)}"
        )


# ─────────────────────────────────────────────
#  Model Performance Endpoint
# ─────────────────────────────────────────────
@app.get("/api/predictions/model-performance", tags=["Model"])
@app.get("/model-info", tags=["Model"])
async def get_performance_info():
    """Returns evaluation metrics, confusion matrix, and performance comparisons."""
    try:
        info = get_model_info()
        return {"success": True, "data": info}
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ─────────────────────────────────────────────
#  Application Runner
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting FastAPI backend on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
