from fastapi import APIRouter, Depends, status
from backend.app.api.orchestrator import ApplicationOrchestrator, get_orchestrator
from backend.app.schemas.common import ErrorResponse
from backend.app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="", tags=["Dashboard"])


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Dashboard KPI Metrics and Risk Distribution",
    description="Returns aggregate counts of total, critical, high, medium, and low-risk infrastructure assets along with network-wide averages and the top-priority asset.",
    responses={
        200: {"model": DashboardResponse, "description": "Dashboard KPI summary"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def get_dashboard_summary(
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> DashboardResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_dashboard()
