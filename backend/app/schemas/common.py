from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AssetType(str, Enum):
    ROAD = "road"
    STREETLIGHT = "streetlight"
    BRIDGE = "bridge"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AssetStatus(str, Enum):
    ACTIVE = "ACTIVE"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    INSPECTION_PENDING = "INSPECTION_PENDING"
    DECOMMISSIONED = "DECOMMISSIONED"


class CriticalityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class UsageLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Human-readable error description")
    error_code: Optional[str] = Field(None, description="System error code classification")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Error event timestamp in UTC")


class PaginationMetadata(BaseModel):
    total: int = Field(..., ge=0, description="Total count of matching records")
    limit: int = Field(..., ge=1, description="Requested page limit")
    offset: int = Field(..., ge=0, description="Requested offset")
