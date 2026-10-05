"""
Database Models for CivicFlow Predictive Maintenance Platform.
Defines entity dataclasses, table schema constants, and row converters for SQLite.
Conforms to PRD Section 11 & Member 2 ML dataset hand-off specifications.
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone


# ==============================================================================
# SQL DDL SCHEMAS
# ==============================================================================

CREATE_ASSETS_TABLE = """
CREATE TABLE IF NOT EXISTS assets (
    asset_id TEXT PRIMARY KEY,
    asset_type TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    age_years REAL NOT NULL,
    condition_score REAL NOT NULL,
    surface_type TEXT DEFAULT 'asphalt',
    traffic_level INTEGER DEFAULT 3,
    criticality TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'ACTIVE',
    pothole_count INTEGER DEFAULT 0,
    previous_repairs INTEGER DEFAULT 0,
    days_since_last_repair INTEGER DEFAULT 365,
    rainfall_30d_mm REAL DEFAULT 138.2,
    complaints_30d INTEGER DEFAULT 0,
    overdue_inspection INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""

CREATE_MAINTENANCE_TABLE = """
CREATE TABLE IF NOT EXISTS maintenance_records (
    maintenance_id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    maintenance_date TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    cost REAL NOT NULL,
    downtime_days REAL DEFAULT 0.0,
    notes TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

CREATE_COMPLAINTS_TABLE = """
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

CREATE_INSPECTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS inspections (
    inspection_id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    date TEXT NOT NULL,
    score REAL NOT NULL,
    defect_type TEXT,
    notes TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

CREATE_ENVIRONMENT_TABLE = """
CREATE TABLE IF NOT EXISTS environment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT,
    zone TEXT,
    date TEXT NOT NULL,
    rainfall REAL NOT NULL,
    temperature REAL,
    exposure_index REAL,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

CREATE_MODEL_FEATURES_TABLE = """
CREATE TABLE IF NOT EXISTS model_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL,
    snapshot_date TEXT NOT NULL,
    engineered_features TEXT NOT NULL,
    target_30d INTEGER,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

CREATE_PREDICTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL,
    risk_score REAL NOT NULL,
    risk_level TEXT NOT NULL,
    maintenance_probability REAL NOT NULL,
    maintenance_required_30d INTEGER NOT NULL,
    predicted_at TEXT NOT NULL,
    model_version TEXT NOT NULL,
    reasons TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

CREATE_PRIORITIES_TABLE = """
CREATE TABLE IF NOT EXISTS priorities (
    asset_id TEXT PRIMARY KEY,
    risk_score REAL NOT NULL,
    urgency_score REAL NOT NULL,
    impact_score REAL NOT NULL,
    priority_score REAL NOT NULL,
    recommended_action TEXT NOT NULL,
    reasons TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);
"""

# Useful indexes for high-speed queries on hackathon hardware
INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);",
    "CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);",
    "CREATE INDEX IF NOT EXISTS idx_assets_criticality ON assets(criticality);",
    "CREATE INDEX IF NOT EXISTS idx_maint_asset_id ON maintenance_records(asset_id);",
    "CREATE INDEX IF NOT EXISTS idx_complaints_asset_id ON complaints(asset_id);",
    "CREATE INDEX IF NOT EXISTS idx_inspections_asset_id ON inspections(asset_id);",
    "CREATE INDEX IF NOT EXISTS idx_predictions_asset_id ON predictions(asset_id);",
    "CREATE INDEX IF NOT EXISTS idx_priorities_score ON priorities(priority_score DESC);",
]

ALL_TABLE_SCHEMAS = [
    CREATE_ASSETS_TABLE,
    CREATE_MAINTENANCE_TABLE,
    CREATE_COMPLAINTS_TABLE,
    CREATE_INSPECTIONS_TABLE,
    CREATE_ENVIRONMENT_TABLE,
    CREATE_MODEL_FEATURES_TABLE,
    CREATE_PREDICTIONS_TABLE,
    CREATE_PRIORITIES_TABLE,
]


# ==============================================================================
# DOMAIN DATACLASSES
# ==============================================================================

@dataclass
class Asset:
    asset_id: str
    asset_type: str
    name: str
    latitude: float
    longitude: float
    age_years: float
    condition_score: float
    surface_type: str = "asphalt"
    traffic_level: int = 3
    criticality: str = "MEDIUM"
    status: str = "ACTIVE"
    pothole_count: int = 0
    previous_repairs: int = 0
    days_since_last_repair: int = 365
    rainfall_30d_mm: float = 138.2
    complaints_30d: int = 0
    overdue_inspection: int = 0
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class MaintenanceRecord:
    maintenance_id: str
    asset_id: str
    maintenance_date: str
    type: str
    severity: str
    cost: float
    downtime_days: float = 0.0
    notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Complaint:
    complaint_id: str
    asset_id: str
    date: str
    category: str
    severity: str
    status: str
    description: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Inspection:
    inspection_id: str
    asset_id: str
    date: str
    score: float
    defect_type: Optional[str] = None
    notes: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Prediction:
    asset_id: str
    risk_score: float
    risk_level: str
    maintenance_probability: float
    maintenance_required_30d: bool
    predicted_at: str
    model_version: str
    reasons: Optional[List[str]] = None
    id: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PriorityRecord:
    asset_id: str
    risk_score: float
    urgency_score: float
    impact_score: float
    priority_score: float
    recommended_action: str
    reasons: List[str]
    updated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
