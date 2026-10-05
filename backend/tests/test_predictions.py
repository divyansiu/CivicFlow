import pytest
from fastapi import HTTPException, status
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.api.deps import get_ml_adapter, MLInferenceAdapter

client = TestClient(app)


def test_predict_valid_request():
    """Test valid prediction request returns full decision intelligence response."""
    payload = {
        "asset_id": "RD-021",
        "asset_type": "road",
        "age_years": 12,
        "condition_score": 42,
        "complaints_30d": 8,
        "previous_repairs": 3,
        "rainfall_30d": 220,
        "usage_level": "high",
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "RD-021"
    assert "risk_score" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert "urgency_score" in data
    assert "impact_score" in data
    assert "priority_score" in data
    assert "recommended_action" in data
    assert "reasons" in data
    assert isinstance(data["reasons"], list)
    assert len(data["reasons"]) >= 1


def test_predict_missing_required_field():
    """Test missing required field triggers 422 validation error."""
    payload = {
        "asset_id": "RD-021",
        # missing condition_score and age_years
        "complaints_30d": 5,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VALIDATION_ERROR"
    assert "detail" in data


def test_predict_invalid_range_field():
    """Test out-of-range condition score (e.g., > 100 or < 0) triggers 422."""
    payload = {
        "asset_id": "RD-021",
        "asset_type": "road",
        "age_years": 5,
        "condition_score": 150,  # Invalid: max is 100
        "complaints_30d": 2,
        "previous_repairs": 1,
        "rainfall_30d": 50,
        "usage_level": "medium",
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error_code"] == "VALIDATION_ERROR"


def test_predict_ml_failure():
    """Test downstream ML model inference failure returns 502 Bad Gateway."""
    class BrokenMLAdapter:
        def predict(self, features):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="ML model checkpoint corrupted or unavailable",
            )

    app.dependency_overrides[get_ml_adapter] = lambda: BrokenMLAdapter()
    try:
        payload = {
            "asset_id": "RD-021",
            "asset_type": "road",
            "age_years": 12,
            "condition_score": 42,
            "complaints_30d": 8,
            "previous_repairs": 3,
            "rainfall_30d": 220,
            "usage_level": "high",
        }
        response = client.post("/api/predict", json=payload)
        assert response.status_code == 502
        data = response.json()
        assert data["error_code"] == "HTTP_502"
        assert "ML model checkpoint" in data["detail"]
    finally:
        app.dependency_overrides.clear()


def test_simulate_valid_request():
    """Test what-if simulation calculates pre/post intervention deltas."""
    payload = {
        "asset_id": "RD-021",
        "intervention_type": "Pothole Patching & Resurfacing",
        "condition_gain": 35.0,
        "complaints_reduction_percent": 80.0,
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "RD-021"
    assert data["intervention_type"] == "Pothole Patching & Resurfacing"
    assert "before" in data
    assert "after" in data
    assert "risk_delta" in data
    assert "priority_delta" in data
    assert "summary" in data
    assert data["risk_delta"] > 0
    assert data["priority_delta"] > 0


def test_simulate_nonexistent_asset():
    """Test what-if simulation for nonexistent asset returns 404."""
    payload = {
        "asset_id": "NON-EXISTENT-ASSET",
        "intervention_type": "Resurfacing",
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert data["error_code"] == "HTTP_404"


def test_simulate_with_custom_features():
    """Test what-if simulation using explicit custom features override."""
    payload = {
        "asset_id": "RD-999-VIRTUAL",
        "intervention_type": "Drainage Clearing",
        "condition_gain": 25.0,
        "custom_features": {
            "asset_id": "RD-999-VIRTUAL",
            "asset_type": "road",
            "age_years": 7.0,
            "condition_score": 50.0,
            "complaints_30d": 6,
            "previous_repairs": 2,
            "rainfall_30d": 140.0,
            "usage_level": "medium",
        },
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["asset_id"] == "RD-999-VIRTUAL"
    assert data["after"]["risk_score"] < data["before"]["risk_score"]
    assert data["risk_delta"] > 0


def test_health_endpoints():
    """Test root and health check endpoints."""
    resp_health = client.get("/health")
    assert resp_health.status_code == 200
    assert resp_health.json()["status"] == "healthy"

    resp_api_health = client.get("/api/health")
    assert resp_api_health.status_code == 200
    assert resp_api_health.json()["status"] == "healthy"

    resp_root = client.get("/")
    assert resp_root.status_code == 200
    assert "app" in resp_root.json()

