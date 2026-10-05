"""
Risk Engine Service for CivicFlow.
Converts ML model inferences into standardized 0-100 risk scores and PRD Section 5.5
risk levels (LOW, MEDIUM, HIGH, CRITICAL).
Integrates seamlessly with Member 2's predict_maintenance_risk function, with an
isolated fallback baseline to maintain 100% local stability if the ML artifact is loading.
"""

from typing import Dict, Any
from app.services.feature_engineering import extract_prediction_features


def classify_risk_level(risk_score: float) -> str:
    """
    Classifies a 0-100 product risk score into PRD Section 5.5 Risk Bands:
      0-24   -> LOW
      25-49  -> MEDIUM
      50-74  -> HIGH
      75-100 -> CRITICAL
    """
    if risk_score < 25.0:
        return "LOW"
    elif risk_score < 50.0:
        return "MEDIUM"
    elif risk_score < 75.0:
        return "HIGH"
    return "CRITICAL"


def evaluate_asset_risk(asset: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates maintenance risk for a given asset.
    First attempts to invoke Member 2's trained Random Forest model (predict_maintenance_risk).
    If the ML model is not available or encounters an error, applies the PRD-approved
    transparent deterministic baseline.
    """
    features = extract_prediction_features(asset)
    asset_id = features["asset_id"]

    # 1. Try invoking Member 2's official ML inference
    try:
        from app.ml.predict import predict_maintenance_risk
        ml_result = predict_maintenance_risk(features)
        if isinstance(ml_result, dict) and "risk_score" in ml_result:
            return ml_result
    except Exception:
        pass

    # 2. Transparent Fallback Baseline (PRD Section 7.1)
    # Grounded heuristic derived from condition, complaints, and overdue inspection
    condition = features["condition_score"]
    complaints = features["complaints_30d"]
    overdue = features["overdue_inspection"]
    repairs = features["previous_repairs"]
    potholes = features["pothole_count"]

    # Raw score calculation
    raw_risk = (
        (100.0 - condition) * 0.50
        + (complaints * 4.0)
        + (overdue * 20.0)
        + (repairs * 3.0)
        + (potholes * 3.0)
    )
    risk_score = round(max(0.0, min(100.0, raw_risk)), 1)
    prob = round(risk_score / 100.0, 4)
    risk_level = classify_risk_level(risk_score)

    from app.services.explanations import generate_grounded_reasons
    reasons = generate_grounded_reasons(asset)

    return {
        "asset_id": asset_id,
        "maintenance_probability": prob,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "maintenance_required_30d": bool(risk_score >= 50.0),
        "prediction_horizon_days": 30,
        "model_version": "baseline_rule_v1.0",
        "reasons": reasons
    }
