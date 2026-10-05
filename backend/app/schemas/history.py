from typing import List, Optional
from pydantic import BaseModel, Field


class MaintenanceRecord(BaseModel):
    maintenance_id: Optional[str] = Field(None, description="Unique maintenance intervention identifier")
    asset_id: str = Field(..., description="Asset identifier")
    date: str = Field(..., description="Date of maintenance (YYYY-MM-DD)")
    type: str = Field(..., description="Intervention type (e.g., resurfacing, pothole repair, structural repair)")
    severity: str = Field(default="MEDIUM", description="Intervention severity (LOW, MEDIUM, HIGH, CRITICAL)")
    cost: Optional[float] = Field(None, ge=0.0, description="Estimated or actual intervention cost")
    downtime_hours: Optional[float] = Field(None, ge=0.0, description="Downtime or disruption duration in hours")
    description: Optional[str] = Field(None, description="Operational notes regarding maintenance")


class ComplaintRecord(BaseModel):
    complaint_id: Optional[str] = Field(None, description="Unique citizen complaint identifier")
    asset_id: str = Field(..., description="Asset identifier")
    date: str = Field(..., description="Complaint registration date (YYYY-MM-DD)")
    category: str = Field(..., description="Complaint category (e.g., pothole, waterlogging, cracking, outage)")
    severity: str = Field(default="MEDIUM", description="Reported issue severity")
    status: str = Field(default="RESOLVED", description="Complaint resolution status")
    description: Optional[str] = Field(None, description="Grievance description")


class InspectionRecord(BaseModel):
    inspection_id: Optional[str] = Field(None, description="Inspection report identifier")
    asset_id: str = Field(..., description="Asset identifier")
    date: str = Field(..., description="Inspection date (YYYY-MM-DD)")
    score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Assessed condition score at inspection")
    defect_type: Optional[str] = Field(None, description="Primary defect identified (e.g., alligator cracking, pothole, raveling)")
    inspector: Optional[str] = Field(None, description="Inspector ID or designation")
    notes: Optional[str] = Field(None, description="Inspector remarks")


class HistoryResponse(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    maintenance_records: List[MaintenanceRecord] = Field(default_factory=list, description="Historical maintenance interventions")
    complaints: List[ComplaintRecord] = Field(default_factory=list, description="Recent and historical citizen complaints")
    inspections: List[InspectionRecord] = Field(default_factory=list, description="Historical technical inspection logs")
