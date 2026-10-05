import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from backend.app.api.deps import (
    DataRepositoryAdapter,
    DomainServicesAdapter,
    MLInferenceAdapter,
    get_data_repository,
    get_domain_services,
    get_ml_adapter,
)
from backend.app.schemas import (
    AssetDetailResponse,
    AssetListResponse,
    DashboardResponse,
    HistoryResponse,
    PredictionRequest,
    PredictionResponse,
    PriorityQueueResponse,
    SimulationRequest,
    SimulationResponse,
)

logger = logging.getLogger("civicflow.api.orchestrator")


class ApplicationOrchestrator:
    """
    Application Orchestrator for CivicFlow.
    Orchestrates the decision flow:
    Request -> ML Inference -> Domain Services (Risk/Urgency/Impact/Priority) -> DB/Repository -> Response.
    Owned by Member 3 (Backend Core / API).
    """

    def __init__(
        self,
        ml_adapter: MLInferenceAdapter,
        domain_services: DomainServicesAdapter,
        data_repo: DataRepositoryAdapter,
    ):
        self.ml = ml_adapter
        self.domain = domain_services
        self.repo = data_repo

    def orchestrate_prediction(self, request: PredictionRequest) -> PredictionResponse:
        """
        Executes end-to-end prediction orchestration:
        1. Validated PredictionRequest converted to feature map
        2. ML inference interface invoked for risk assessment
        3. Domain engines invoked for Urgency, Impact, Priority
        4. Explanation service invoked for reasons and recommended action
        5. Returns validated PredictionResponse
        """
        features = request.model_dump()

        # Step 1: Call ML Inference Provider (Member 2 boundary)
        ml_result = self.ml.predict(features)
        risk_score = float(ml_result["risk_score"])
        risk_level = ml_result["risk_level"]
        prob = ml_result.get("maintenance_probability")
        maint_req = ml_result.get("maintenance_required_30d")
        version = ml_result.get("model_version")

        # Step 2: Call Domain Decision Services (Member 4 boundary)
        urgency_score = self.domain.calculate_urgency(features)
        impact_score = self.domain.calculate_impact(features)
        priority_score = self.domain.calculate_priority(risk_score, urgency_score, impact_score)
        reasons = self.domain.generate_reasons(features, risk_score)
        recommended_action = self.domain.get_recommended_action(risk_level, priority_score)

        return PredictionResponse(
            asset_id=request.asset_id,
            risk_score=risk_score,
            risk_level=risk_level,
            urgency_score=urgency_score,
            impact_score=impact_score,
            priority_score=priority_score,
            recommended_action=recommended_action,
            reasons=reasons,
            maintenance_required_30d=maint_req,
            maintenance_probability=prob,
            model_version=version,
        )

    def orchestrate_simulation(self, request: SimulationRequest) -> SimulationResponse:
        """
        Executes what-if maintenance scenario analysis (PRD Section 4.2 / Section 11.4).
        Simulates post-intervention conditions and computes impact on risk and priority.
        """
        # Obtain base asset features
        if request.custom_features:
            base_request = request.custom_features
        else:
            raw_asset = self.repo.get_asset_by_id(request.asset_id)
            if not raw_asset:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Asset '{request.asset_id}' not found for simulation.",
                )
            base_request = PredictionRequest(
                asset_id=raw_asset["asset_id"],
                asset_type=raw_asset.get("asset_type", "road"),
                age_years=raw_asset.get("age_years", 5.0),
                condition_score=raw_asset.get("condition_score", 50.0),
                complaints_30d=raw_asset.get("complaints_30d", 0),
                previous_repairs=raw_asset.get("previous_repairs", 0),
                rainfall_30d=raw_asset.get("rainfall_30d", 100.0),
                usage_level=raw_asset.get("usage_level", "medium"),
            )

        before_response = self.orchestrate_prediction(base_request)

        # Apply intervention adjustments
        improved_condition = min(100.0, base_request.condition_score + (request.condition_gain or 35.0))
        reduction_factor = max(0.0, 1.0 - ((request.complaints_reduction_percent or 75.0) / 100.0))
        reduced_complaints = int(round(base_request.complaints_30d * reduction_factor))

        simulated_request = PredictionRequest(
            asset_id=base_request.asset_id,
            asset_type=base_request.asset_type,
            age_years=base_request.age_years,
            condition_score=improved_condition,
            complaints_30d=reduced_complaints,
            previous_repairs=base_request.previous_repairs + 1,
            rainfall_30d=base_request.rainfall_30d,
            usage_level=base_request.usage_level,
        )

        after_response = self.orchestrate_prediction(simulated_request)

        risk_delta = round(before_response.risk_score - after_response.risk_score, 1)
        priority_delta = round(before_response.priority_score - after_response.priority_score, 1)

        summary = (
            f"Simulated {request.intervention_type} improved condition from {base_request.condition_score} "
            f"to {improved_condition}, reducing risk score by {risk_delta} pts ({before_response.risk_level} -> {after_response.risk_level}) "
            f"and priority score by {priority_delta} pts."
        )

        return SimulationResponse(
            asset_id=request.asset_id,
            intervention_type=request.intervention_type,
            before=before_response,
            after=after_response,
            risk_delta=risk_delta,
            priority_delta=priority_delta,
            summary=summary,
        )

    def orchestrate_dashboard(self) -> DashboardResponse:
        """Retrieves and packages dashboard KPI data."""
        try:
            metrics = self.repo.get_dashboard_metrics()
            return DashboardResponse(**metrics)
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Repository failure while getting dashboard metrics: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal data service error occurred.",
            )

    def orchestrate_assets_list(
        self,
        asset_type: Optional[str] = None,
        risk_level: Optional[str] = None,
        status_filter: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> AssetListResponse:
        """Lists and filters infrastructure assets."""
        try:
            items, total = self.repo.list_assets(
                asset_type=asset_type,
                risk_level=risk_level,
                status=status_filter,
                limit=limit,
                offset=offset,
            )
            return AssetListResponse(
                items=items,
                total=total,
                limit=limit,
                offset=offset,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Repository failure while listing assets: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal data service error occurred.",
            )

    def orchestrate_asset_detail(self, asset_id: str) -> AssetDetailResponse:
        """Retrieves individual asset details with decision intelligence."""
        try:
            asset = self.repo.get_asset_by_id(asset_id)
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Repository failure while getting asset {asset_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal data service error occurred.",
            )

        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ID '{asset_id}' not found.",
            )
        return AssetDetailResponse(**asset)

    def orchestrate_asset_history(self, asset_id: str) -> HistoryResponse:
        """Retrieves maintenance, complaint, and inspection history for an asset."""
        try:
            history = self.repo.get_asset_history(asset_id)
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Repository failure while getting history for {asset_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal data service error occurred.",
            )

        if not history:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ID '{asset_id}' not found.",
            )
        return HistoryResponse(**history)

    def orchestrate_priorities(self, limit: int = 50, offset: int = 0) -> PriorityQueueResponse:
        """Retrieves ranked maintenance queue."""
        try:
            items, total = self.repo.get_priorities_queue(limit=limit, offset=offset)
            return PriorityQueueResponse(
                items=items,
                total=total,
                limit=limit,
                offset=offset,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Repository failure while getting priority queue: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal data service error occurred.",
            )


def get_orchestrator(
    ml_adapter: MLInferenceAdapter = Depends(get_ml_adapter),
    domain_services: DomainServicesAdapter = Depends(get_domain_services),
    data_repo: DataRepositoryAdapter = Depends(get_data_repository),
) -> ApplicationOrchestrator:
    """FastAPI Dependency providing the configured ApplicationOrchestrator."""
    return ApplicationOrchestrator(ml_adapter, domain_services, data_repo)

