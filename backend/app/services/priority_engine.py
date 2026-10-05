"""
Priority Engine Service for CivicFlow.
Combines Risk, Urgency, and Impact scores into the final ranked Priority Score.
Implements the core decision equation:
  Priority = 0.50 * Risk + 0.25 * Urgency + 0.25 * Impact
Saves decision records into SQLite and provides queue ranking logic.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

from app.services.risk_engine import evaluate_asset_risk
from app.services.urgency_engine import calculate_urgency_score
from app.services.impact_engine import calculate_impact_score
from app.services.explanations import determine_recommended_action, generate_grounded_reasons
from app.database.repositories import (
    AssetRepository,
    PriorityRepository,
    PredictionRepository,
)


def calculate_priority_score(risk_score: float, urgency_score: float, impact_score: float) -> float:
    """
    Computes priority score using PRD Section 5.4 weighted combination:
      Priority Score = 0.50 * Risk + 0.25 * Urgency + 0.25 * Impact
    Bounded strictly between 0.0 and 100.0.
    """
    raw_priority = (0.50 * risk_score) + (0.25 * urgency_score) + (0.25 * impact_score)
    return round(max(0.0, min(100.0, raw_priority)), 1)


def evaluate_decision_for_asset(asset: Dict[str, Any], ml_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Runs the full end-to-end decision pipeline for a single asset record:
      Asset -> Risk Engine -> Urgency Engine -> Impact Engine -> Priority -> Action & Reasons.
    """
    # 1. Risk Score & Level (from ML or evaluate_asset_risk)
    risk_data = ml_result or evaluate_asset_risk(asset)
    risk_score = float(risk_data["risk_score"])
    risk_level = risk_data["risk_level"]

    # 2. Urgency Score (0-100)
    urgency_score = calculate_urgency_score(asset)

    # 3. Impact Score (0-100)
    impact_score = calculate_impact_score(asset)

    # 4. Priority Score (0-100)
    priority_score = calculate_priority_score(risk_score, urgency_score, impact_score)

    # 5. Explanations & Action
    asset_type = asset.get("asset_type", "ROAD")
    action = determine_recommended_action(priority_score, asset_type)
    reasons = risk_data.get("reasons") or generate_grounded_reasons(asset)

    return {
        "asset_id": asset["asset_id"],
        "risk_score": risk_score,
        "risk_level": risk_level,
        "urgency_score": urgency_score,
        "impact_score": impact_score,
        "priority_score": priority_score,
        "recommended_action": action,
        "reasons": reasons,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


def calculate_and_save_decision(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Evaluates decision pipeline for a specific asset ID and persists
    both prediction and priority records into SQLite.
    """
    asset = AssetRepository.get_by_id(asset_id)
    if not asset:
        return None

    # Evaluate ML risk
    risk_data = evaluate_asset_risk(asset)
    PredictionRepository.save(risk_data)

    # Evaluate Priority
    decision = evaluate_decision_for_asset(asset, ml_result=risk_data)
    PriorityRepository.save(decision)

    return decision


def recalculate_all_priorities(asset_type: Optional[str] = None) -> int:
    """
    Iterates through all registered assets and recalculates decisions.
    Populates priorities table for all seed assets.
    """
    assets = AssetRepository.get_all(asset_type=asset_type)
    count = 0
    for asset in assets:
        risk_data = evaluate_asset_risk(asset)
        PredictionRepository.save(risk_data)
        decision = evaluate_decision_for_asset(asset, ml_result=risk_data)
        PriorityRepository.save(decision)
        count += 1
    return count
