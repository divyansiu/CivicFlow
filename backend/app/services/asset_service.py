"""
Asset Service for CivicFlow.
Provides high-level, business-ready asset data querying and history retrieval
for Member 3 (FastAPI Route Controllers).
"""

from typing import List, Dict, Any, Optional

from app.database.repositories import (
    AssetRepository,
    MaintenanceRepository,
    ComplaintRepository,
    InspectionRepository,
    PriorityRepository,
)


def get_all_assets(
    asset_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    criticality: Optional[str] = None,
    search: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Retrieves list of assets filtered by type, risk level, or name, with priority data attached."""
    return AssetRepository.get_all(
        asset_type=asset_type,
        risk_level=risk_level,
        criticality=criticality,
        search=search,
        limit=limit,
        offset=offset
    )


def get_asset_by_id(asset_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full asset details including current priority calculation."""
    return AssetRepository.get_by_id(asset_id)


def get_asset_history(asset_id: str) -> Dict[str, Any]:
    """
    Retrieves complete operational lifecycle history for an asset:
    - past maintenance repairs
    - citizen grievance complaints
    - official physical inspections
    """
    maintenance = MaintenanceRepository.get_by_asset_id(asset_id)
    complaints = ComplaintRepository.get_by_asset_id(asset_id)
    inspections = InspectionRepository.get_by_asset_id(asset_id)

    return {
        "asset_id": asset_id,
        "maintenance_records": maintenance,
        "complaints": complaints,
        "inspections": inspections,
        "total_repairs": len(maintenance),
        "total_complaints": len(complaints),
        "total_inspections": len(inspections)
    }


def get_dashboard_summary() -> Dict[str, Any]:
    """Retrieves top-level KPIs and risk distributions for the executive dashboard."""
    return PriorityRepository.get_dashboard_summary()
