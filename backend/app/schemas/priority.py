from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.common import AssetType, AssetStatus, RiskLevel


class PriorityQueueItem(BaseModel):
    rank: int = Field(..., ge=1, description="Priority rank position (1 being highest priority)")
    asset_id: str = Field(..., description="Unique asset identifier")
    name: str = Field(..., description="Asset name or road segment")
    asset_type: AssetType = Field(default=AssetType.ROAD, description="Asset infrastructure type")
    priority_score: float = Field(..., ge=0.0, le=100.0, description="Composite priority score")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk score")
    risk_level: RiskLevel = Field(..., description="Categorical risk level")
    urgency_score: float = Field(..., ge=0.0, le=100.0, description="Urgency score")
    impact_score: float = Field(..., ge=0.0, le=100.0, description="Public impact score")
    condition_score: float = Field(..., ge=0.0, le=100.0, description="Current asset condition score")
    recommended_action: str = Field(..., description="Operational action recommendation")
    status: AssetStatus = Field(default=AssetStatus.ACTIVE, description="Current asset operational status")
    reasons: List[str] = Field(default_factory=list, description="Top decision justification reasons")


class PriorityQueueResponse(BaseModel):
    items: List[PriorityQueueItem] = Field(..., description="Ranked priority maintenance queue items")
    total: int = Field(..., ge=0, description="Total ranked assets in queue")
    limit: int = Field(..., ge=1, description="Page limit")
    offset: int = Field(..., ge=0, description="Page offset")
