import sys
from pathlib import Path

# Ensure 'backend' directory is in sys.path so 'app.*' imports resolve from any execution directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api import api_router
from backend.app.config import get_settings

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("civicflow.main")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    logger.info(f"Starting {settings.APP_NAME} API in {settings.APP_ENV} mode...")
    yield
    logger.info(f"Shutting down {settings.APP_NAME} API...")


# Initialize FastAPI Application
app = FastAPI(
    title=f"{settings.APP_NAME} - Predictive Maintenance Platform",
    description=(
        "Public Infrastructure Predictive Maintenance Decision Support API. "
        "Transforms asset signals into explainable, risk-aware maintenance priorities."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized handler for HTTPExceptions."""
    logger.warning(f"HTTPException [{exc.status_code}] on {request.method} {request.url.path}: {exc.detail}")
    error_code = "INTERNAL_SERVER_ERROR" if exc.status_code == 500 else f"HTTP_{exc.status_code}"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": error_code,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Standardized handler for request validation failures (422)."""
    error_messages = []
    for error in exc.errors():
        loc = " -> ".join(str(loc_elem) for loc_elem in error.get("loc", []))
        msg = error.get("msg", "Invalid value")
        error_messages.append(f"{loc}: {msg}")

    detail_str = "; ".join(error_messages) if error_messages else "Request validation failed"
    logger.warning(f"Validation error on {request.method} {request.url.path}: {detail_str}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": detail_str,
            "error_code": "VALIDATION_ERROR",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch-all handler for unhandled server errors (500).
    Ensures internal paths, stack traces, and database implementation details are never leaked.
    """
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "error_code": "INTERNAL_SERVER_ERROR",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# Health Check Endpoints
@app.get("/health", tags=["System"], summary="System Health Status")
@app.get(f"{settings.API_PREFIX}/health", tags=["System"], summary="API Health Status")
async def health_check():
    """Returns application liveness and metadata."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/", tags=["System"], summary="API Root")
async def root():
    """Root entrypoint linking to documentation."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api_prefix": settings.API_PREFIX,
        "description": "Public Infrastructure Predictive Maintenance Decision Support API",
    }


# Include API Router
app.include_router(api_router, prefix=settings.API_PREFIX)
