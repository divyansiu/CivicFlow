"""
Domain Services Package for CivicFlow Predictive Maintenance Platform.
"""

from app.services.risk_engine import evaluate_asset_risk, classify_risk_level
from app.services.urgency_engine import calculate_urgency_score
from app.services.impact_engine import calculate_impact_score
from app.services.priority_engine import (
    calculate_priority_score,
    evaluate_decision_for_asset,
    calculate_and_save_decision,
    recalculate_all_priorities,
)
from app.services.explanations import generate_grounded_reasons, determine_recommended_action
from app.services.feature_engineering import extract_prediction_features
from app.services.seed_loader import seed_database
from app.services.asset_service import (
    get_all_assets,
    get_asset_by_id,
    get_asset_history,
    get_dashboard_summary,
)
from app.services.priority_service import (
    get_priority_queue,
    get_priority_by_asset_id,
    get_latest_prediction,
    process_asset_decision,
    batch_recalculate,
)

__all__ = [
    "evaluate_asset_risk",
    "classify_risk_level",
    "calculate_urgency_score",
    "calculate_impact_score",
    "calculate_priority_score",
    "evaluate_decision_for_asset",
    "calculate_and_save_decision",
    "recalculate_all_priorities",
    "generate_grounded_reasons",
    "determine_recommended_action",
    "extract_prediction_features",
    "seed_database",
    "get_all_assets",
    "get_asset_by_id",
    "get_asset_history",
    "get_dashboard_summary",
    "get_priority_queue",
    "get_priority_by_asset_id",
    "get_latest_prediction",
    "process_asset_decision",
    "batch_recalculate",
]
