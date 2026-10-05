from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.common import AssetType, RiskLevel, UsageLevel


class PredictionRequest(BaseModel):
    """
    Contract for POST /api/predict as specified in PRD Section 10.2.
    """
    asset_id: str = Field(..., description="Unique asset identifier (e.g., RD-021)")
    asset_type: str = Field(default="road", description="Asset type: road, streetlight, bridge")
    age_years: float = Field(..., ge=0.0, description="Age of the asset in years")
    condition_score: float = Field(..., ge=0.0, le=100.0, description="Current structural/operational condition (0-100)")
    complaints_30d: int = Field(default=0, ge=0, description="Citizen complaints registered in the last 30 days")
    previous_repairs: int = Field(default=0, ge=0, description="Cumulative previous repair interventions count")
    rainfall_30d: float = Field(default=0.0, ge=0.0, description="Rainfall or environmental exposure in mm over last 30 days")
    usage_level: str = Field(default="medium", description="Usage or traffic volume intensity: low, medium, high, critical")


class PredictionResponse(BaseModel):
    """
    Contract for POST /api/predict response as specified in PRD Section 10.3.
    """
    asset_id: str = Field(..., description="Unique asset identifier")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Model-estimated 0-100 maintenance risk score")
    risk_level: RiskLevel = Field(..., description="Categorical risk band (LOW, MEDIUM, HIGH, CRITICAL)")
    urgency_score: float = Field(..., ge=0.0, le=100.0, description="Operational urgency score (0-100)")
    impact_score: float = Field(..., ge=0.0, le=100.0, description="Public consequence impact score (0-100)")
    priority_score: float = Field(..., ge=0.0, le=100.0, description="Calculated priority score (0-100)")
    recommended_action: str = Field(..., description="Transparent recommended inspection/maintenance intervention")
    reasons: List[str] = Field(..., description="Grounded, human-readable explanations explaining the priority")
    maintenance_required_30d: Optional[bool] = Field(None, description="Binary near-term maintenance prediction flag")
    maintenance_probability: Optional[float] = Field(None, ge=0.0, le=1.0, description="Raw model probability for 30-day maintenance need")
    model_version: Optional[str] = Field(None, description="Machine learning model version identifier")
