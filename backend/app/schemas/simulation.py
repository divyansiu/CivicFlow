from typing import Optional
from pydantic import BaseModel, Field
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse


class SimulationRequest(BaseModel):
    asset_id: str = Field(..., description="Unique asset identifier to simulate intervention for")
    intervention_type: str = Field(default="resurfacing", description="Type of planned maintenance intervention (e.g., resurfacing, patching, structural_overhaul)")
    condition_gain: Optional[float] = Field(default=35.0, ge=0.0, le=100.0, description="Hypothetical boost in condition score (0-100)")
    complaints_reduction_percent: Optional[float] = Field(default=75.0, ge=0.0, le=100.0, description="Estimated percentage drop in complaints post-intervention")
    custom_features: Optional[PredictionRequest] = Field(None, description="Optional explicit feature overrides for scenario analysis")


class SimulationResponse(BaseModel):
    asset_id: str = Field(..., description="Unique asset identifier")
    intervention_type: str = Field(..., description="Simulated intervention type")
    before: PredictionResponse = Field(..., description="Pre-intervention scores and decision metrics")
    after: PredictionResponse = Field(..., description="Post-intervention projected scores and decision metrics")
    risk_delta: float = Field(..., description="Change in risk score (before - after, positive indicates improvement)")
    priority_delta: float = Field(..., description="Change in priority score (before - after, positive indicates improvement)")
    summary: str = Field(..., description="Human-readable assessment of intervention effectiveness")
