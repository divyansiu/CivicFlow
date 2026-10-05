from fastapi import APIRouter, Depends, status
from backend.app.api.orchestrator import ApplicationOrchestrator, get_orchestrator
from backend.app.schemas.common import ErrorResponse
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse
from backend.app.schemas.simulation import SimulationRequest, SimulationResponse

router = APIRouter(prefix="", tags=["Predictions & Decision Intelligence"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate 30-Day Risk Prediction and Priority Decision",
    description="Invokes ML inference for maintenance risk estimation and evaluates operational Urgency, Impact, composite Priority, grounded reasons, and recommended action.",
    responses={
        200: {"model": PredictionResponse, "description": "Complete decision intelligence response"},
        422: {"model": ErrorResponse, "description": "Request validation error"},
        502: {"model": ErrorResponse, "description": "Downstream ML inference service unavailable"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def predict_asset_maintenance(
    request: PredictionRequest,
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> PredictionResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_prediction(request=request)


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate What-If Maintenance Scenario",
    description="Simulates a hypothetical maintenance intervention (e.g. resurfacing or pothole repair) to evaluate projected risk and priority reduction without training a secondary model.",
    responses={
        200: {"model": SimulationResponse, "description": "Simulation comparison response"},
        404: {"model": ErrorResponse, "description": "Asset not found"},
        422: {"model": ErrorResponse, "description": "Request validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def simulate_maintenance_intervention(
    request: SimulationRequest,
    orchestrator: ApplicationOrchestrator = Depends(get_orchestrator),
) -> SimulationResponse:
    """Thin route handler delegating to Application Orchestrator."""
    return orchestrator.orchestrate_simulation(request=request)
