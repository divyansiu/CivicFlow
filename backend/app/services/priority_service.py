"""
Priority Service for CivicFlow.
Provides ranked priority queue retrieval, asset decision calculation, and batch re-ranking
for Member 3 (FastAPI Route Controllers).
"""

from typing import List, Dict, Any, Optional

from app.database.repositories import PriorityRepository, PredictionRepository
from app.services.priority_engine import (
    calculate_and_save_decision,
    recalculate_all_priorities,
    evaluate_decision_for_asset,
)


def get_priority_queue(
    asset_type: Optional[str] = None,
    limit: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Retrieves the ranked priority queue ordered by priority_score descending."""
    return PriorityRepository.get_queue(asset_type=asset_type, limit=limit)


def get_priority_by_asset_id(asset_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves decision priority record for a single asset."""
    return PriorityRepository.get_by_asset_id(asset_id)


def get_latest_prediction(asset_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves latest ML prediction snapshot for a single asset."""
    return PredictionRepository.get_latest(asset_id)


def process_asset_decision(asset_id: str) -> Optional[Dict[str, Any]]:
    """
    Computes and persists risk, urgency, impact, priority, reasons, and action
    for a given asset. Returns full decision object.
    """
    return calculate_and_save_decision(asset_id)


def batch_recalculate(asset_type: Optional[str] = None) -> int:
    """Recalculates all registered asset priorities."""
    return recalculate_all_priorities(asset_type=asset_type)
