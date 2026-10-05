"""
Repository Layer for CivicFlow Predictive Maintenance Platform.
Implements typed, structured data access patterns separating domain services
and API controllers from raw database queries.
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.database.database import get_db_connection, query_all, query_one, execute_write


class AssetRepository:
    """Data access methods for public infrastructure assets."""

    @staticmethod
    def get_all(
        asset_type: Optional[str] = None,
        risk_level: Optional[str] = None,
        criticality: Optional[str] = None,
        search: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves assets with their latest priority and risk scores joined from the priorities table.
        Supports filtering by asset_type, risk_level, criticality, and search text.
        """
        sql = """
            SELECT 
                a.*,
                p.risk_score,
                p.urgency_score,
                p.impact_score,
                p.priority_score,
                p.recommended_action,
                p.reasons AS priority_reasons
            FROM assets a
            LEFT JOIN priorities p ON a.asset_id = p.asset_id
            WHERE 1=1
        """
        params: List[Any] = []

        if asset_type:
            sql += " AND LOWER(a.asset_type) = LOWER(?)"
            params.append(asset_type)

        if criticality:
            sql += " AND UPPER(a.criticality) = UPPER(?)"
            params.append(criticality)

        if search:
            sql += " AND (a.name LIKE ? OR a.asset_id LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term])

        # Filter by risk level if requested (using risk score bands from PRD 5.5)
        if risk_level:
            level_upper = risk_level.upper()
            if level_upper == "CRITICAL":
                sql += " AND p.risk_score >= 75.0"
            elif level_upper == "HIGH":
                sql += " AND p.risk_score >= 50.0 AND p.risk_score < 75.0"
            elif level_upper == "MEDIUM":
                sql += " AND p.risk_score >= 25.0 AND p.risk_score < 50.0"
            elif level_upper == "LOW":
                sql += " AND p.risk_score < 25.0"

        sql += " ORDER BY COALESCE(p.priority_score, 0) DESC, a.condition_score ASC"

        if limit is not None:
            sql += " LIMIT ?"
            params.append(limit)
            if offset is not None:
                sql += " OFFSET ?"
                params.append(offset)

        rows = query_all(sql, tuple(params))
        for row in rows:
            if row.get("priority_reasons"):
                try:
                    row["priority_reasons"] = json.loads(row["priority_reasons"])
                except Exception:
                    pass
        return rows

    @staticmethod
    def get_by_id(asset_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single asset with full latest priority scores."""
        sql = """
            SELECT 
                a.*,
                p.risk_score,
                p.urgency_score,
                p.impact_score,
                p.priority_score,
                p.recommended_action,
                p.reasons AS priority_reasons
            FROM assets a
            LEFT JOIN priorities p ON a.asset_id = p.asset_id
            WHERE a.asset_id = ?
        """
        row = query_one(sql, (asset_id,))
        if row and row.get("priority_reasons"):
            try:
                row["priority_reasons"] = json.loads(row["priority_reasons"])
            except Exception:
                pass
        return row

    @staticmethod
    def upsert(asset: Dict[str, Any]) -> None:
        """Inserts or updates an asset in SQLite."""
        now = datetime.now(timezone.utc).isoformat()
        sql = """
            INSERT INTO assets (
                asset_id, asset_type, name, latitude, longitude, age_years,
                condition_score, surface_type, traffic_level, criticality, status,
                pothole_count, previous_repairs, days_since_last_repair,
                rainfall_30d_mm, complaints_30d, overdue_inspection,
                created_at, updated_at
            ) VALUES (
                :asset_id, :asset_type, :name, :latitude, :longitude, :age_years,
                :condition_score, :surface_type, :traffic_level, :criticality, :status,
                :pothole_count, :previous_repairs, :days_since_last_repair,
                :rainfall_30d_mm, :complaints_30d, :overdue_inspection,
                :created_at, :updated_at
            )
            ON CONFLICT(asset_id) DO UPDATE SET
                name = excluded.name,
                condition_score = excluded.condition_score,
                age_years = excluded.age_years,
                traffic_level = excluded.traffic_level,
                criticality = excluded.criticality,
                status = excluded.status,
                pothole_count = excluded.pothole_count,
                previous_repairs = excluded.previous_repairs,
                days_since_last_repair = excluded.days_since_last_repair,
                rainfall_30d_mm = excluded.rainfall_30d_mm,
                complaints_30d = excluded.complaints_30d,
                overdue_inspection = excluded.overdue_inspection,
                updated_at = excluded.updated_at;
        """
        params = {
            "asset_id": asset["asset_id"],
            "asset_type": asset.get("asset_type", "ROAD").upper(),
            "name": asset.get("name", asset["asset_id"]),
            "latitude": float(asset.get("latitude", 12.9716)),
            "longitude": float(asset.get("longitude", 77.5946)),
            "age_years": float(asset.get("age_years", 5)),
            "condition_score": float(asset.get("condition_score", 70.0)),
            "surface_type": asset.get("surface_type", "asphalt"),
            "traffic_level": int(asset.get("traffic_level", 3)),
            "criticality": asset.get("criticality", "MEDIUM").upper(),
            "status": asset.get("status", "ACTIVE").upper(),
            "pothole_count": int(asset.get("pothole_count", 0)),
            "previous_repairs": int(asset.get("previous_repairs", 0)),
            "days_since_last_repair": int(asset.get("days_since_last_repair", 365)),
            "rainfall_30d_mm": float(asset.get("rainfall_30d_mm", 138.2)),
            "complaints_30d": int(asset.get("complaints_30d", 0)),
            "overdue_inspection": int(asset.get("overdue_inspection", 0)),
            "created_at": asset.get("created_at", now),
            "updated_at": now
        }
        with get_db_connection() as conn:
            conn.execute(sql, params)

    @staticmethod
    def count() -> int:
        """Returns total number of assets."""
        row = query_one("SELECT COUNT(*) AS total FROM assets;")
        return row["total"] if row else 0


class MaintenanceRepository:
    """Data access methods for asset maintenance history records."""

    @staticmethod
    def get_by_asset_id(asset_id: str) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM maintenance_records WHERE asset_id = ? ORDER BY maintenance_date DESC;"
        return query_all(sql, (asset_id,))

    @staticmethod
    def insert(record: Dict[str, Any]) -> None:
        sql = """
            INSERT OR REPLACE INTO maintenance_records (
                maintenance_id, asset_id, maintenance_date, type, severity, cost, downtime_days, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """
        execute_write(sql, (
            record["maintenance_id"],
            record["asset_id"],
            record.get("maintenance_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            record.get("type", "General Repair"),
            record.get("severity", "MEDIUM"),
            float(record.get("cost", 0.0)),
            float(record.get("downtime_days", 0.0)),
            record.get("notes", "")
        ))


class ComplaintRepository:
    """Data access methods for citizen complaints."""

    @staticmethod
    def get_by_asset_id(asset_id: str) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM complaints WHERE asset_id = ? ORDER BY date DESC;"
        return query_all(sql, (asset_id,))

    @staticmethod
    def insert(record: Dict[str, Any]) -> None:
        sql = """
            INSERT OR REPLACE INTO complaints (
                complaint_id, asset_id, date, category, severity, status, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """
        execute_write(sql, (
            record["complaint_id"],
            record["asset_id"],
            record.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            record.get("category", "General"),
            record.get("severity", "MEDIUM"),
            record.get("status", "PENDING"),
            record.get("description", "")
        ))


class InspectionRepository:
    """Data access methods for asset inspections."""

    @staticmethod
    def get_by_asset_id(asset_id: str) -> List[Dict[str, Any]]:
        sql = "SELECT * FROM inspections WHERE asset_id = ? ORDER BY date DESC;"
        return query_all(sql, (asset_id,))

    @staticmethod
    def insert(record: Dict[str, Any]) -> None:
        sql = """
            INSERT OR REPLACE INTO inspections (
                inspection_id, asset_id, date, score, defect_type, notes
            ) VALUES (?, ?, ?, ?, ?, ?);
        """
        execute_write(sql, (
            record["inspection_id"],
            record["asset_id"],
            record.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            float(record.get("score", 70.0)),
            record.get("defect_type", ""),
            record.get("notes", "")
        ))


class PredictionRepository:
    """Data access methods for ML predictions."""

    @staticmethod
    def save(pred: Dict[str, Any]) -> int:
        sql = """
            INSERT INTO predictions (
                asset_id, risk_score, risk_level, maintenance_probability,
                maintenance_required_30d, predicted_at, model_version, reasons
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """
        reasons_json = json.dumps(pred.get("reasons", []))
        return execute_write(sql, (
            pred["asset_id"],
            float(pred["risk_score"]),
            pred["risk_level"],
            float(pred.get("maintenance_probability", pred["risk_score"] / 100.0)),
            1 if pred.get("maintenance_required_30d", False) else 0,
            pred.get("predicted_at", datetime.now(timezone.utc).isoformat()),
            pred.get("model_version", "rf_v1.0"),
            reasons_json
        ))

    @staticmethod
    def get_latest(asset_id: str) -> Optional[Dict[str, Any]]:
        sql = "SELECT * FROM predictions WHERE asset_id = ? ORDER BY id DESC LIMIT 1;"
        row = query_one(sql, (asset_id,))
        if row and row.get("reasons"):
            try:
                row["reasons"] = json.loads(row["reasons"])
            except Exception:
                pass
        return row


class PriorityRepository:
    """Data access methods for calculated maintenance priorities."""

    @staticmethod
    def save(prio: Dict[str, Any]) -> None:
        sql = """
            INSERT INTO priorities (
                asset_id, risk_score, urgency_score, impact_score, priority_score,
                recommended_action, reasons, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(asset_id) DO UPDATE SET
                risk_score = excluded.risk_score,
                urgency_score = excluded.urgency_score,
                impact_score = excluded.impact_score,
                priority_score = excluded.priority_score,
                recommended_action = excluded.recommended_action,
                reasons = excluded.reasons,
                updated_at = excluded.updated_at;
        """
        reasons_json = json.dumps(prio.get("reasons", []))
        execute_write(sql, (
            prio["asset_id"],
            float(prio["risk_score"]),
            float(prio["urgency_score"]),
            float(prio["impact_score"]),
            float(prio["priority_score"]),
            prio["recommended_action"],
            reasons_json,
            prio.get("updated_at", datetime.now(timezone.utc).isoformat())
        ))

    @staticmethod
    def get_by_asset_id(asset_id: str) -> Optional[Dict[str, Any]]:
        sql = "SELECT * FROM priorities WHERE asset_id = ?;"
        row = query_one(sql, (asset_id,))
        if row and row.get("reasons"):
            try:
                row["reasons"] = json.loads(row["reasons"])
            except Exception:
                pass
        return row

    @staticmethod
    def get_queue(asset_type: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Returns the ranked maintenance priority queue."""
        sql = """
            SELECT 
                p.*,
                a.name AS asset_name,
                a.asset_type,
                a.condition_score,
                a.latitude,
                a.longitude,
                a.criticality,
                a.status
            FROM priorities p
            JOIN assets a ON p.asset_id = a.asset_id
            WHERE 1=1
        """
        params: List[Any] = []
        if asset_type:
            sql += " AND LOWER(a.asset_type) = LOWER(?)"
            params.append(asset_type)

        sql += " ORDER BY p.priority_score DESC"

        if limit is not None:
            sql += " LIMIT ?"
            params.append(limit)

        rows = query_all(sql, tuple(params))
        for row in rows:
            if row.get("reasons"):
                try:
                    row["reasons"] = json.loads(row["reasons"])
                except Exception:
                    pass
        return rows

    @staticmethod
    def get_dashboard_summary() -> Dict[str, Any]:
        """Calculates executive KPI metrics and risk distributions for PRD Section 9.1."""
        sql = """
            SELECT 
                COUNT(*) AS total_assets,
                SUM(CASE WHEN p.risk_score >= 75.0 THEN 1 ELSE 0 END) AS critical_risk_count,
                SUM(CASE WHEN p.risk_score >= 50.0 AND p.risk_score < 75.0 THEN 1 ELSE 0 END) AS high_risk_count,
                SUM(CASE WHEN p.risk_score >= 25.0 AND p.risk_score < 50.0 THEN 1 ELSE 0 END) AS medium_risk_count,
                SUM(CASE WHEN p.risk_score < 25.0 THEN 1 ELSE 0 END) AS low_risk_count,
                AVG(a.condition_score) AS avg_condition_score,
                AVG(p.priority_score) AS avg_priority_score
            FROM assets a
            LEFT JOIN priorities p ON a.asset_id = p.asset_id;
        """
        row = query_one(sql) or {}
        
        # Identify top #1 priority asset for direct dashboard highlighting
        top_asset_sql = """
            SELECT 
                p.*,
                a.name AS asset_name,
                a.asset_type,
                a.condition_score,
                a.criticality
            FROM priorities p
            JOIN assets a ON p.asset_id = a.asset_id
            ORDER BY p.priority_score DESC
            LIMIT 1;
        """
        top_asset = query_one(top_asset_sql)
        if top_asset and top_asset.get("reasons"):
            try:
                top_asset["reasons"] = json.loads(top_asset["reasons"])
            except Exception:
                pass

        return {
            "total_assets": row.get("total_assets", 0),
            "critical_risk_count": row.get("critical_risk_count", 0) or 0,
            "high_risk_count": row.get("high_risk_count", 0) or 0,
            "medium_risk_count": row.get("medium_risk_count", 0) or 0,
            "low_risk_count": row.get("low_risk_count", 0) or 0,
            "avg_condition_score": round(row.get("avg_condition_score", 0.0) or 0.0, 1),
            "avg_priority_score": round(row.get("avg_priority_score", 0.0) or 0.0, 1),
            "top_priority_asset": top_asset
        }
