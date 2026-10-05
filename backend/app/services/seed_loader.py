"""
Seed Loader Service for CivicFlow.
Loads synthetic and public geospatial road data from backend/data/seed/*.json
into SQLite. Automatically runs on first database initialization to ensure
the application is fully operational and local-first with zero external dependencies.
"""

import os
import json
from typing import Optional

from app.database.repositories import (
    AssetRepository,
    MaintenanceRepository,
    ComplaintRepository,
    InspectionRepository,
)

SEED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "seed"))


def seed_database(db_path: Optional[str] = None) -> dict:
    """
    Loads assets, maintenance, complaints, and inspections from seed JSON files
    and computes initial priority scores for each asset.
    Uses 'utf-8-sig' encoding to support both UTF-8 with and without BOM across platforms.
    """
    assets_file = os.path.join(SEED_DIR, "assets.json")
    maint_file = os.path.join(SEED_DIR, "maintenance.json")
    comp_file = os.path.join(SEED_DIR, "complaints.json")
    insp_file = os.path.join(SEED_DIR, "inspections.json")

    counts = {"assets": 0, "maintenance": 0, "complaints": 0, "inspections": 0}

    # 1. Load Assets
    if os.path.exists(assets_file):
        with open(assets_file, "r", encoding="utf-8-sig") as f:
            assets = json.load(f)
            for asset in assets:
                AssetRepository.upsert(asset)
            counts["assets"] = len(assets)

    # 2. Load Maintenance
    if os.path.exists(maint_file):
        with open(maint_file, "r", encoding="utf-8-sig") as f:
            records = json.load(f)
            for rec in records:
                MaintenanceRepository.insert(rec)
            counts["maintenance"] = len(records)

    # 3. Load Complaints
    if os.path.exists(comp_file):
        with open(comp_file, "r", encoding="utf-8-sig") as f:
            records = json.load(f)
            for rec in records:
                ComplaintRepository.insert(rec)
            counts["complaints"] = len(records)

    # 4. Load Inspections
    if os.path.exists(insp_file):
        with open(insp_file, "r", encoding="utf-8-sig") as f:
            records = json.load(f)
            for rec in records:
                InspectionRepository.insert(rec)
            counts["inspections"] = len(records)

    # 5. Automatically compute initial decisions and priorities
    from app.services.priority_engine import recalculate_all_priorities
    recalculate_all_priorities()

    return counts
