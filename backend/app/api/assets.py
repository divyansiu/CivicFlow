from typing import Optional
from fastapi import APIRouter, Depends, Path, Query, status
from backend.app.api.orchestrator import ApplicationOrchestrator, get_orchestrator
from backend.app.schemas.asset import AssetDetailResponse, AssetListResponse
from backend.app.schemas.common import ErrorResponse
from backend.app.schemas.history import HistoryResponse

router = APIRouter(prefix="", tags=["Assets"])


@router.get(
    "/assets",
    response_model=AssetListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Infrastructure Assets",
    description="Returns a paginated list of infrastructure assets with optional filtering by asset type, risk level, and operational status.",
    responses={
        200: {"model": AssetListResponse, "description": "Paginated assets list"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def list_assets(
    asset_type: Optional[str] = Query(None, description="Filter by asset type: road, streetlight, bridge"),
    risk_level: Optional[str] = Query(None, description="Filter by categorical risk level: LOW, MEDIUM, HIGH, CRITICAL"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by operational status: ACTIVE, UNDER_MAINTENANCE, etc."),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> AssetListResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_assets_list(
        asset_type=asset_type,
        risk_level=risk_level,
        status_filter=status_filter,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/assets/{id}",
    response_model=AssetDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Asset Details by ID",
    description="Returns detailed condition, location, operational scores (Risk, Urgency, Impact, Priority), grounded explanation reasons, and recommended action for a specific asset.",
    responses={
        200: {"model": AssetDetailResponse, "description": "Asset details with decision scores"},
        404: {"model": ErrorResponse, "description": "Asset not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def get_asset_detail(
    asset_id: str = Path(..., alias="id", description="Unique asset identifier (e.g. RD-021)"),
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> AssetDetailResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_asset_detail(asset_id=asset_id)


@router.get(
    "/assets/{id}/history",
    response_model=HistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Maintenance and Inspection History for Asset",
    description="Returns historical maintenance records, recorded citizen complaints, and engineering inspection logs for an asset.",
    responses={
        200: {"model": HistoryResponse, "description": "Asset historical log"},
        404: {"model": ErrorResponse, "description": "Asset not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def get_asset_history(
    asset_id: str = Path(..., alias="id", description="Unique asset identifier (e.g. RD-021)"),
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> HistoryResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_asset_history(asset_id=asset_id)
