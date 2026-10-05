from fastapi import APIRouter
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.assets import router as assets_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.priorities import router as priorities_router

api_router = APIRouter()

api_router.include_router(dashboard_router)
api_router.include_router(assets_router)
api_router.include_router(predictions_router)
api_router.include_router(priorities_router)

__all__ = ["api_router"]
