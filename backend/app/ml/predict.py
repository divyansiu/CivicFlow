import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# Cached model instance
_model = None

SURFACE_MAP = {"asphalt": 0, "concrete": 1, "composite": 2}
FEATURE_NAMES = [
    "age_years",
    "surface_type",
    "traffic_level",
    "condition_score",
    "pothole_count",
    "previous_repairs",
    "days_since_last_repair",
    "rainfall_30d_mm",
    "complaints_30d",
    "overdue_inspection"
]

def load_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run train.py first.")
        _model = joblib.load(MODEL_PATH)
    return _model

def classify_risk_level(risk_score: float) -> str:
    """PRD Section 5.5: Risk Score Bands"""
    if risk_score < 25.0:
        return "LOW"
    elif risk_score < 50.0:
        return "MEDIUM"
    elif risk_score < 75.0:
        return "HIGH"
    return "CRITICAL"

def generate_grounded_reasons(features: dict) -> list[str]:
    """PRD Section 8.1 & 8.2: 3-5 Grounded Human-Readable Evidence Reasons"""
    reasons = []

    if features.get("condition_score", 100) < 50:
        reasons.append("Poor current physical condition")
    if features.get("complaints_30d", 0) >= 3:
        reasons.append("High recent citizen grievance frequency")
    if features.get("previous_repairs", 0) >= 3:
        reasons.append("Multiple previous patch repairs on record")
    if features.get("pothole_count", 0) >= 3:
        reasons.append("Observable surface distress and potholes")
    if features.get("age_years", 0) >= 10:
        reasons.append("Advanced infrastructure age")
    if features.get("overdue_inspection", 0) == 1:
        reasons.append("Overdue routine maintenance inspection")
    if features.get("rainfall_30d_mm", 0) >= 160:
        reasons.append("Elevated environmental exposure and rainfall")
    if features.get("traffic_level", 1) >= 4:
        reasons.append("Heavy traffic loading on arterial corridor")

    if not reasons:
        reasons.append("Asset within normal operating tolerances")

    return reasons[:4]

def predict_maintenance_risk(asset: dict) -> dict:
    """
    Core ML Inference Interface (Contract for Member 3 Backend Core).
    Input: dictionary of asset condition/operational features.
    Output: PRD-compliant risk assessment dictionary.
    """
    model = load_model()

    # Normalize categorical surface type
    surface_raw = str(asset.get("surface_type", "asphalt")).lower()
    surface_val = SURFACE_MAP.get(surface_raw, 0)

    # Build input vector in exact training order with defensive defaults
    input_features = {
        "age_years": int(asset.get("age_years", 5)),
        "surface_type": surface_val,
        "traffic_level": int(asset.get("traffic_level", 3)),
        "condition_score": float(asset.get("condition_score", 70.0)),
        "pothole_count": int(asset.get("pothole_count", 0)),
        "previous_repairs": int(asset.get("previous_repairs", 1)),
        "days_since_last_repair": int(asset.get("days_since_last_repair", 365)),
        "rainfall_30d_mm": float(asset.get("rainfall_30d_mm", 138.2)),
        "complaints_30d": int(asset.get("complaints_30d", 0)),
        "overdue_inspection": int(asset.get("overdue_inspection", 0))
    }

    df_input = pd.DataFrame([input_features], columns=FEATURE_NAMES)

    # Inference: Probability that target_30d == 1
    prob = float(model.predict_proba(df_input)[0][1])
    risk_score = round(prob * 100.0, 1)
    risk_level = classify_risk_level(risk_score)
    reasons = generate_grounded_reasons(asset)

    return {
        "asset_id": asset.get("asset_id", "UNKNOWN"),
        "maintenance_probability": round(prob, 4),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "maintenance_required_30d": bool(risk_score >= 50.0),
        "prediction_horizon_days": 30,
        "model_version": "rf_v1.0",
        "reasons": reasons
    }

if __name__ == "__main__":
    print("Testing PRD-compliant inference pipeline on sample roads...")

    # Case 1: High-risk broken arterial road
    critical_road = {
        "asset_id": "RD-0042",
        "age_years": 16,
        "surface_type": "asphalt",
        "traffic_level": 5,
        "condition_score": 32.5,
        "pothole_count": 8,
        "previous_repairs": 5,
        "days_since_last_repair": 1200,
        "rainfall_30d_mm": 210.0,
        "complaints_30d": 9,
        "overdue_inspection": 1
    }

    # Case 2: Healthy, newly paved road
    healthy_road = {
        "asset_id": "RD-0008",
        "age_years": 2,
        "surface_type": "concrete",
        "traffic_level": 2,
        "condition_score": 92.0,
        "pothole_count": 0,
        "previous_repairs": 0,
        "days_since_last_repair": 90,
        "rainfall_30d_mm": 138.2,
        "complaints_30d": 0,
        "overdue_inspection": 0
    }

    print("\n[TEST 1] Severe Asset RD-0042:")
    res_critical = predict_maintenance_risk(critical_road)
    for k, v in res_critical.items():
        print(f"  {k}: {v}")

    print("\n[TEST 2] Healthy Asset RD-0008:")
    res_healthy = predict_maintenance_risk(healthy_road)
    for k, v in res_healthy.items():
        print(f"  {k}: {v}")
