import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.api.deps import get_data_repository, DataRepositoryAdapter

client = TestClient(app)


def test_dashboard_success():
    """Test dashboard returns 200 with all required KPI fields."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_assets" in data
    assert "critical_risk_count" in data
    assert "high_risk_count" in data
    assert "medium_risk_count" in data
    assert "low_risk_count" in data
    assert "average_condition_score" in data
    assert "risk_distribution" in data
    assert "asset_type_breakdown" in data
    assert data["total_assets"] >= 0
    assert "top_priority_asset" in data


def test_dashboard_service_failure():
    """Test dashboard handles internal repository failure safely with 500 without leaking details."""
    class FailingRepo:
        def get_dashboard_metrics(self):
            raise RuntimeError("Database connection timed out")

    app.dependency_overrides[get_data_repository] = lambda: FailingRepo()
    try:
        response = client.get("/api/dashboard")
        assert response.status_code == 500
        data = response.json()
        assert data["error_code"] == "INTERNAL_SERVER_ERROR"
        assert "Database connection timed out" not in data["detail"]
    finally:
        app.dependency_overrides.clear()


def test_list_assets_success():
    """Test asset listing returns paginated list of assets."""
    response = client.get("/api/assets")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0

    first = data["items"][0]
    assert "asset_id" in first
    assert "name" in first
    assert "asset_type" in first
    assert "condition_score" in first
    assert "risk_score" in first
    assert "priority_score" in first


def test_list_assets_filtering():
    """Test asset list filtering by asset_type, risk_level, and status."""
    # Filter by asset_type road
    resp_road = client.get("/api/assets?asset_type=road")
    assert resp_road.status_code == 200
    for item in resp_road.json()["items"]:
        assert item["asset_type"] == "road"

    # Filter by streetlight
    resp_sl = client.get("/api/assets?asset_type=streetlight")
    assert resp_sl.status_code == 200
    for item in resp_sl.json()["items"]:
        assert item["asset_type"] == "streetlight"

    # Filter by risk_level
    resp_crit = client.get("/api/assets?risk_level=CRITICAL")
    assert resp_crit.status_code == 200
    for item in resp_crit.json()["items"]:
        assert item["risk_level"] == "CRITICAL"


def test_list_assets_empty_result():
    """Test filtering for non-existent criteria returns empty list."""
    response = client.get("/api/assets?asset_type=nonexistent_type")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_list_assets_invalid_query():
    """Test validation errors for invalid pagination parameters."""
    response = client.get("/api/assets?limit=0")
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VALIDATION_ERROR"

    response_neg = client.get("/api/assets?offset=-5")
    assert response_neg.status_code == 422


def test_get_asset_detail_valid():
    """Test fetching a valid asset by ID returns detailed scores and explanations."""
    response = client.get("/api/assets/RD-021")
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "RD-021"
    assert "risk_score" in data
    assert "urgency_score" in data
    assert "impact_score" in data
    assert "priority_score" in data
    assert "reasons" in data
    assert isinstance(data["reasons"], list)
    assert len(data["reasons"]) > 0
    assert "recommended_action" in data


def test_get_asset_detail_not_found():
    """Test fetching a non-existent asset ID returns 404."""
    response = client.get("/api/assets/NON-EXISTENT-999")
    assert response.status_code == 404
    data = response.json()
    assert data["error_code"] == "HTTP_404"
    assert "not found" in data["detail"].lower()


def test_get_asset_history_valid():
    """Test fetching maintenance history for an existing asset."""
    response = client.get("/api/assets/RD-021/history")
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "RD-021"
    assert "maintenance_records" in data
    assert "complaints" in data
    assert "inspections" in data
    assert isinstance(data["maintenance_records"], list)
    assert isinstance(data["complaints"], list)
    assert isinstance(data["inspections"], list)


def test_get_asset_history_not_found():
    """Test fetching history for an unknown asset returns 404."""
    response = client.get("/api/assets/UNKNOWN-ASSET/history")
    assert response.status_code == 404
    data = response.json()
    assert data["error_code"] == "HTTP_404"
