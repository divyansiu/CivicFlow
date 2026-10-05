from fastapi import APIRouter, Depends, Query, status
from backend.app.api.orchestrator import ApplicationOrchestrator, get_orchestrator
from backend.app.schemas.common import ErrorResponse
from backend.app.schemas.priority import PriorityQueueResponse

router = APIRouter(prefix="", tags=["Priorities"])


@router.get(
    "/priorities",
    response_model=PriorityQueueResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Ranked Maintenance Priority Queue",
    description="Returns public infrastructure assets strictly ranked by priority score in descending order, showing individual Risk, Urgency, Impact, and recommended actions.",
    responses={
        200: {"model": PriorityQueueResponse, "description": "Ranked priority queue"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def get_priority_queue(
    limit: int = Query(50, ge=1, le=500, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> PriorityQueueResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_priorities(limit=limit, offset=offset)
