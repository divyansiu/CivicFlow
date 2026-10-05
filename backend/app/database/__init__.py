"""
Database package for CivicFlow Predictive Maintenance Platform.
"""

from app.database.database import (
    get_db_connection,
    init_db,
    query_all,
    query_one,
    execute_write,
    get_db_path,
    set_db_path,
)
from app.database.models import (
    Asset,
    MaintenanceRecord,
    Complaint,
    Inspection,
    Prediction,
    PriorityRecord,
)
from app.database.repositories import (
    AssetRepository,
    MaintenanceRepository,
    ComplaintRepository,
    InspectionRepository,
    PredictionRepository,
    PriorityRepository,
)

__all__ = [
    "get_db_connection",
    "init_db",
    "query_all",
    "query_one",
    "execute_write",
    "get_db_path",
    "set_db_path",
    "Asset",
    "MaintenanceRecord",
    "Complaint",
    "Inspection",
    "Prediction",
    "PriorityRecord",
    "AssetRepository",
    "MaintenanceRepository",
    "ComplaintRepository",
    "InspectionRepository",
    "PredictionRepository",
    "PriorityRepository",
]
