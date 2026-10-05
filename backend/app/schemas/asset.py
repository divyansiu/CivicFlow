from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.common import AssetType, AssetStatus, CriticalityLevel, RiskLevel


class AssetBase(BaseModel):
    asset_id: str = Field(..., description="Unique asset identifier (e.g., RD-021)")
    asset_type: AssetType = Field(default=AssetType.ROAD, description="Type of infrastructure asset")
    name: str = Field(..., description="Human-readable asset name or street segment")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Geographic latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Geographic longitude coordinate")
    age_years: float = Field(..., ge=0.0, description="Asset age in years")
    condition_score: float = Field(..., ge=0.0, le=100.0, description="Condition score (0-100, where 100 is pristine)")
    criticality: CriticalityLevel = Field(default=CriticalityLevel.MEDIUM, description="Public criticality level")
    status: AssetStatus = Field(default=AssetStatus.ACTIVE, description="Current operational status")


class AssetListItem(AssetBase):
    risk_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Calculated risk score")
    risk_level: Optional[RiskLevel] = Field(None, description="Categorical risk classification")
    priority_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Ranked priority score")
    urgency_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Operational urgency score")
    impact_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Public impact score")


class AssetDetailResponse(AssetListItem):
    recommended_action: Optional[str] = Field(None, description="Transparent next-step action recommendation")
    reasons: List[str] = Field(default_factory=list, description="Grounding reasons explaining the decision")
    last_inspected: Optional[str] = Field(None, description="Date of last recorded inspection (ISO format or YYYY-MM-DD)")
    zone: Optional[str] = Field(None, description="Municipal administrative zone or sector")


class AssetListResponse(BaseModel):
    items: List[AssetListItem] = Field(..., description="List of infrastructure assets")
    total: int = Field(..., ge=0, description="Total matching asset count")
    limit: int = Field(..., ge=1, description="Page limit")
    offset: int = Field(..., ge=0, description="Page offset")
