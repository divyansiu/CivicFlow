"""
Unit Tests for CivicFlow Risk Engine.
Tests risk scoring normalization, risk banding, fallback handling, and feature extraction.
"""

import pytest
from app.services.risk_engine import classify_risk_level, evaluate_asset_risk
from app.services.feature_engineering import extract_prediction_features


def test_risk_level_classification():
    """Verifies PRD Section 5.5 Risk Score Bands."""
    assert classify_risk_level(0.0) == "LOW"
    assert classify_risk_level(24.9) == "LOW"
    assert classify_risk_level(25.0) == "MEDIUM"
    assert classify_risk_level(49.9) == "MEDIUM"
    assert classify_risk_level(50.0) == "HIGH"
    assert classify_risk_level(74.9) == "HIGH"
    assert classify_risk_level(75.0) == "CRITICAL"
    assert classify_risk_level(100.0) == "CRITICAL"


def test_feature_extraction_defaults():
    """Verifies robust feature extraction with missing keys."""
    raw_asset = {"asset_id": "RD-TEST"}
    features = extract_prediction_features(raw_asset)

    assert features["asset_id"] == "RD-TEST"
    assert features["age_years"] == 5.0
    assert features["surface_type"] == "asphalt"
    assert features["traffic_level"] == 3
    assert features["condition_score"] == 70.0
    assert features["pothole_count"] == 0
    assert features["previous_repairs"] == 1
    assert features["complaints_30d"] == 0
    assert features["overdue_inspection"] == 0


def test_evaluate_asset_risk_critical():
    """Verifies that an asset with severe deterioration is classified as CRITICAL."""
    critical_asset = {
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
    result = evaluate_asset_risk(critical_asset)

    assert result["asset_id"] == "RD-0042"
    assert result["risk_score"] >= 75.0
    assert result["risk_level"] == "CRITICAL"
    assert result["maintenance_required_30d"] is True
    assert len(result["reasons"]) >= 3


def test_evaluate_asset_risk_low():
    """Verifies that a pristine new road is classified as LOW."""
    pristine_asset = {
        "asset_id": "RD-0099",
        "age_years": 1,
        "surface_type": "concrete",
        "traffic_level": 2,
        "condition_score": 95.0,
        "pothole_count": 0,
        "previous_repairs": 0,
        "days_since_last_repair": 30,
        "rainfall_30d_mm": 50.0,
        "complaints_30d": 0,
        "overdue_inspection": 0
    }
    result = evaluate_asset_risk(pristine_asset)

    assert result["asset_id"] == "RD-0099"
    assert result["risk_score"] < 25.0
    assert result["risk_level"] == "LOW"
    assert result["maintenance_required_30d"] is False
