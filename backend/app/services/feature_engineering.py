"""
Feature Engineering Service for CivicFlow.
Constructs snapshot feature vectors from asset state, operational complaints,
maintenance history, and environmental exposure.
Conforms strictly to the feature vector contract required by Member 2's Random Forest model.
"""

from typing import Dict, Any


def extract_prediction_features(asset: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts and defensively formats the 10-feature dictionary required by
    Member 2's ML inference model (predict_maintenance_risk).
    """
    return {
        "asset_id": str(asset.get("asset_id", "UNKNOWN")),
        "age_years": float(asset.get("age_years", 5.0)),
        "surface_type": str(asset.get("surface_type", "asphalt")).lower(),
        "traffic_level": int(asset.get("traffic_level", 3)),
        "condition_score": float(asset.get("condition_score", 70.0)),
        "pothole_count": int(asset.get("pothole_count", 0)),
        "previous_repairs": int(asset.get("previous_repairs", 1)),
        "days_since_last_repair": int(asset.get("days_since_last_repair", 365)),
        "rainfall_30d_mm": float(asset.get("rainfall_30d_mm", 138.2)),
        "complaints_30d": int(asset.get("complaints_30d", 0)),
        "overdue_inspection": int(asset.get("overdue_inspection", 0))
    }
