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
