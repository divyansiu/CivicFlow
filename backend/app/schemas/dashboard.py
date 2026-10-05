from typing import Dict, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.asset import AssetListItem


class RiskDistribution(BaseModel):
    LOW: int = Field(default=0, ge=0)
    MEDIUM: int = Field(default=0, ge=0)
    HIGH: int = Field(default=0, ge=0)
    CRITICAL: int = Field(default=0, ge=0)


class DashboardResponse(BaseModel):
    total_assets: int = Field(..., ge=0, description="Total infrastructure assets in registry")
    critical_risk_count: int = Field(..., ge=0, description="Count of assets in CRITICAL risk band")
    high_risk_count: int = Field(..., ge=0, description="Count of assets in HIGH risk band")
    medium_risk_count: int = Field(..., ge=0, description="Count of assets in MEDIUM risk band")
    low_risk_count: int = Field(..., ge=0, description="Count of assets in LOW risk band")
    under_maintenance_count: int = Field(default=0, ge=0, description="Count of assets currently under maintenance")
    average_condition_score: float = Field(..., ge=0.0, le=100.0, description="Network-wide average condition score")
    average_priority_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Network-wide average priority score")
    risk_distribution: RiskDistribution = Field(..., description="Distribution breakdown across risk bands")
    asset_type_breakdown: Dict[str, int] = Field(default_factory=dict, description="Asset count by infrastructure type")
    top_priority_asset: Optional[AssetListItem] = Field(None, description="The current #1 priority asset for direct action")
