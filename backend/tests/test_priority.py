import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.api.deps import get_data_repository

client = TestClient(app)


def test_priorities_queue_ranked():
    """Test priority queue returns items strictly sorted by priority_score descending."""
    response = client.get("/api/priorities")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data

    items = data["items"]
    assert len(items) > 0

    # Verify strictly descending order of priority_score
    priority_scores = [item["priority_score"] for item in items]
    assert priority_scores == sorted(priority_scores, reverse=True)

    # Verify rank numbering
    for i, item in enumerate(items, start=1):
        assert item["rank"] == i
        assert "asset_id" in item
        assert "risk_score" in item
        assert "urgency_score" in item
        assert "impact_score" in item
        assert "priority_score" in item
        assert "recommended_action" in item


def test_priorities_pagination():
    """Test pagination parameters for priority queue."""
    response = client.get("/api/priorities?limit=2&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["items"][0]["rank"] == 1
    assert data["items"][1]["rank"] == 2

    # Second page
    response_p2 = client.get("/api/priorities?limit=2&offset=2")
    assert response_p2.status_code == 200
    data_p2 = response_p2.json()
    assert len(data_p2["items"]) == 2
    assert data_p2["items"][0]["rank"] == 3


def test_priorities_empty_queue():
    """Test empty priority queue response when repository returns no items."""
    class EmptyRepo:
        def get_priorities_queue(self, limit=50, offset=0):
            return [], 0

    app.dependency_overrides[get_data_repository] = lambda: EmptyRepo()
    try:
        response = client.get("/api/priorities")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
    finally:
        app.dependency_overrides.clear()


def test_priorities_invalid_params():
    """Test invalid limit/offset query parameters."""
    response = client.get("/api/priorities?limit=-1")
    assert response.status_code == 422
    assert response.json()["error_code"] == "VALIDATION_ERROR"


"""
Unit & Integration Tests for CivicFlow Priority Engine, Urgency Engine, Impact Engine,
and Database Repositories.
"""

import os
import tempfile
import pytest

from app.services.urgency_engine import calculate_urgency_score
from app.services.impact_engine import calculate_impact_score
from app.services.priority_engine import (
    calculate_priority_score,
    evaluate_decision_for_asset,
    calculate_and_save_decision,
)
from app.services.explanations import determine_recommended_action, generate_grounded_reasons
from app.database.database import set_db_path, init_db
from app.database.repositories import AssetRepository, PriorityRepository
from app.services.asset_service import get_all_assets, get_asset_history, get_dashboard_summary
from app.services.priority_service import get_priority_queue


def test_urgency_score_formula():
    """
    Formula: 0.35*(100 - condition) + 0.35*(complaints * 5) + 0.30*(overdue * 100)
    For condition=32.5, complaints=9, overdue=1:
      deterioration = 0.35 * 67.5 = 23.625
      complaints    = 0.35 * 45.0 = 15.75
      overdue       = 0.30 * 100  = 30.0
      total         = 69.375 -> rounded to 69.4
    """
    asset = {
        "condition_score": 32.5,
        "complaints_30d": 9,
        "overdue_inspection": 1
    }
    score = calculate_urgency_score(asset)
    assert score == 69.4

    # Perfect asset: condition=100, complaints=0, overdue=0 -> 0.0
    perfect_asset = {
        "condition_score": 100.0,
        "complaints_30d": 0,
        "overdue_inspection": 0
    }
    assert calculate_urgency_score(perfect_asset) == 0.0


def test_impact_score_formula():
    """
    Formula: (traffic_level * 15) + (25 if criticality == 'HIGH' else 10)
    traffic=5, HIGH -> 75 + 25 = 100.0
    traffic=2, LOW  -> 30 + 10 = 40.0
    """
    high_asset = {"traffic_level": 5, "criticality": "HIGH"}
    assert calculate_impact_score(high_asset) == 100.0

    low_asset = {"traffic_level": 2, "criticality": "LOW"}
    assert calculate_impact_score(low_asset) == 40.0


def test_priority_score_formula():
    """
    Formula: 0.50 * Risk + 0.25 * Urgency + 0.25 * Impact
    Risk=90, Urgency=70, Impact=80:
      0.50*90 + 0.25*70 + 0.25*80 = 45 + 17.5 + 20 = 82.5
    """
    priority = calculate_priority_score(90.0, 70.0, 80.0)
    assert priority == 82.5

    # Bounds check
    assert calculate_priority_score(150.0, 150.0, 150.0) == 100.0
    assert calculate_priority_score(-50.0, -10.0, -5.0) == 0.0


def test_recommended_actions():
    assert determine_recommended_action(85.0, "ROAD") == "Immediate inspection / dispatch"
    assert determine_recommended_action(85.0, "STREETLIGHT") == "Emergency electrical repair dispatch"
    assert determine_recommended_action(60.0, "ROAD") == "Priority inspection"
    assert determine_recommended_action(35.0, "ROAD") == "Inspect / plan maintenance"
    assert determine_recommended_action(15.0, "ROAD") == "Routine monitoring"


def test_grounded_reasons():
    """Verifies reasons are derived from actual signals without hallucination."""
    severe_asset = {
        "condition_score": 30.0,
        "complaints_30d": 7,
        "previous_repairs": 4,
        "pothole_count": 5,
        "age_years": 12,
        "overdue_inspection": 1,
        "traffic_level": 5,
        "criticality": "HIGH"
    }
    reasons = generate_grounded_reasons(severe_asset)
    assert len(reasons) >= 3
    assert "Poor current physical condition" in reasons
    assert "High recent citizen grievance frequency" in reasons
    assert "Multiple previous patch repairs on record" in reasons


def test_sqlite_database_lifecycle_and_seeding():
    """Tests end-to-end SQLite initialization, seed ingestion, and query services."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        test_db_path = os.path.join(tmp_dir, "test_civicflow.db")
        set_db_path(test_db_path)

        # 1. Initialize and seed DB
        success = init_db(test_db_path, auto_seed=True)
        assert success is True
        assert os.path.exists(test_db_path)

        # 2. Check assets loaded
        total_assets = AssetRepository.count()
        assert total_assets >= 60

        # 3. Check specific asset RD-0042 exists
        asset_42 = AssetRepository.get_by_id("RD-0042")
        assert asset_42 is not None
        assert asset_42["asset_id"] == "RD-0042"

        # 4. Check priority calculation and ranking queue
        queue = get_priority_queue(limit=5)
        assert len(queue) > 0
        # Queue must be sorted descending by priority_score
        scores = [q["priority_score"] for q in queue]
        assert scores == sorted(scores, reverse=True)

        # 5. Check dashboard summary metrics
        summary = get_dashboard_summary()
        assert summary["total_assets"] >= 60
        assert summary["top_priority_asset"] is not None
        assert "critical_risk_count" in summary
        assert "high_risk_count" in summary

        # 6. Check history query
        history = get_asset_history("RD-0042")
        assert history["asset_id"] == "RD-0042"
        assert len(history["maintenance_records"]) > 0
        assert len(history["complaints"]) > 0
        assert len(history["inspections"]) > 0

