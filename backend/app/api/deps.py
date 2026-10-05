import importlib
import logging
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from backend.app.config.settings import Settings, get_settings
from backend.app.schemas.common import AssetType, AssetStatus, CriticalityLevel, RiskLevel

logger = logging.getLogger("civicflow.api.deps")

# Built-in Seed Data for Local Fallback / Development (PRD FR-17 / AC-08)
SEED_ASSETS: List[Dict[str, Any]] = [
    {
        "asset_id": "RD-021",
        "asset_type": "road",
        "name": "MG Road Sector 4 Connector",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "age_years": 12.0,
        "condition_score": 42.0,
        "criticality": "CRITICAL",
        "status": "ACTIVE",
        "complaints_30d": 8,
        "previous_repairs": 3,
        "rainfall_30d": 220.0,
        "usage_level": "high",
        "zone": "North Corridor",
        "last_inspected": "2026-09-15",
    },
    {
        "asset_id": "RD-042",
        "asset_type": "road",
        "name": "Outer Ring Road KM 14",
        "latitude": 28.5355,
        "longitude": 77.3910,
        "age_years": 8.0,
        "condition_score": 38.0,
        "criticality": "HIGH",
        "status": "ACTIVE",
        "complaints_30d": 12,
        "previous_repairs": 5,
        "rainfall_30d": 185.0,
        "usage_level": "critical",
        "zone": "East Corridor",
        "last_inspected": "2026-09-20",
    },
    {
        "asset_id": "RD-105",
        "asset_type": "road",
        "name": "Civil Lines Arterial Road",
        "latitude": 28.6814,
        "longitude": 77.2227,
        "age_years": 4.0,
        "condition_score": 78.0,
        "criticality": "MEDIUM",
        "status": "ACTIVE",
        "complaints_30d": 1,
        "previous_repairs": 1,
        "rainfall_30d": 95.0,
        "usage_level": "medium",
        "zone": "Central Zone",
        "last_inspected": "2026-08-10",
    },
    {
        "asset_id": "RD-088",
        "asset_type": "road",
        "name": "Industrial Area Access Road 3",
        "latitude": 28.5020,
        "longitude": 77.0850,
        "age_years": 15.0,
        "condition_score": 28.0,
        "criticality": "HIGH",
        "status": "UNDER_MAINTENANCE",
        "complaints_30d": 14,
        "previous_repairs": 6,
        "rainfall_30d": 240.0,
        "usage_level": "high",
        "zone": "South-West Zone",
        "last_inspected": "2026-10-01",
    },
    {
        "asset_id": "SL-014",
        "asset_type": "streetlight",
        "name": "Metro Station Boulevard Illumination",
        "latitude": 28.4720,
        "longitude": 77.0350,
        "age_years": 6.0,
        "condition_score": 65.0,
        "criticality": "HIGH",
        "status": "ACTIVE",
        "complaints_30d": 4,
        "previous_repairs": 2,
        "rainfall_30d": 120.0,
        "usage_level": "high",
        "zone": "North Corridor",
        "last_inspected": "2026-09-05",
    },
    {
        "asset_id": "BR-003",
        "asset_type": "bridge",
        "name": "Yamuna River Overpass Segment B",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "age_years": 22.0,
        "condition_score": 52.0,
        "criticality": "CRITICAL",
        "status": "ACTIVE",
        "complaints_30d": 3,
        "previous_repairs": 4,
        "rainfall_30d": 160.0,
        "usage_level": "critical",
        "zone": "Central Zone",
        "last_inspected": "2026-07-22",
    },
]

SEED_HISTORY: Dict[str, Dict[str, Any]] = {
    "RD-021": {
        "maintenance_records": [
            {
                "maintenance_id": "MNT-101",
                "asset_id": "RD-021",
                "date": "2025-11-12",
                "type": "Bituminous Pothole Patching",
                "severity": "HIGH",
                "cost": 45000.0,
                "downtime_hours": 8.0,
                "description": "Emergency patch repair on eastbound carriage lane.",
            },
            {
                "maintenance_id": "MNT-064",
                "asset_id": "RD-021",
                "date": "2025-04-03",
                "type": "Crack Sealing & Joint Repair",
                "severity": "MEDIUM",
                "cost": 22000.0,
                "downtime_hours": 4.0,
                "description": "Routine sealing along thermal contraction cracks.",
            },
            {
                "maintenance_id": "MNT-012",
                "asset_id": "RD-021",
                "date": "2024-08-19",
                "type": "Shoulder Stabilization",
                "severity": "LOW",
                "cost": 15000.0,
                "downtime_hours": 2.0,
                "description": "Rain-eroded verge re-grading.",
            },
        ],
        "complaints": [
            {
                "complaint_id": "CMP-801",
                "asset_id": "RD-021",
                "date": "2026-09-28",
                "category": "Deep Pothole / Vehicle Damage",
                "severity": "CRITICAL",
                "status": "OPEN",
                "description": "Large crater near intersection damaging suspension.",
            },
            {
                "complaint_id": "CMP-792",
                "asset_id": "RD-021",
                "date": "2026-09-22",
                "category": "Waterlogging",
                "severity": "HIGH",
                "status": "IN_PROGRESS",
                "description": "Standing rainwater obstructing traffic after moderate shower.",
            },
        ],
        "inspections": [
            {
                "inspection_id": "INS-301",
                "asset_id": "RD-021",
                "date": "2026-09-15",
                "score": 42.0,
                "defect_type": "Alligator Cracking & Severe Ravelling",
                "inspector": "Eng. R. Sharma (PWD Inspection Unit)",
                "notes": "Pavement degradation accelerating under commercial vehicle axle loads.",
            }
        ],
    }
}


class MLInferenceAdapter:
    """
    Adapter consuming Member 2's ML interface as a black box (PRD Section 6 / Ownership Section 4).
    Dynamically delegates to Member 2's backend.app.ml.predict if present;
    otherwise executes the validated baseline inference model.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self._ml_module = None
        self._has_checked = False

    def _get_ml_module(self):
        if not self._has_checked:
            try:
                module = importlib.import_module("backend.app.ml.predict")
                # Verify that it actually has prediction functions
                if hasattr(module, "predict_maintenance_risk") or hasattr(module, "predict"):
                    self._ml_module = module
                    logger.info("Successfully bound to Member 2 ML inference module.")
                else:
                    logger.info("Member 2 ML module present but functions not yet defined.")
            except ImportError:
                logger.info("Member 2 ML module not yet available; operating via deterministic baseline.")
            self._has_checked = True
        return self._ml_module

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        ml_mod = self._get_ml_module()
        if ml_mod is not None:
            try:
                if hasattr(ml_mod, "predict_maintenance_risk"):
                    return ml_mod.predict_maintenance_risk(features)
                elif hasattr(ml_mod, "predict"):
                    return ml_mod.predict(features)
            except Exception as e:
                logger.error(f"Error executing Member 2 ML module: {e}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"ML inference service error: {str(e)}",
                )

        # Baseline Fallback Model (PRD Section 7.1: transparent deterministic baseline)
        condition = float(features.get("condition_score", 50.0))
        age = float(features.get("age_years", 5.0))
        complaints = int(features.get("complaints_30d", 0))
        repairs = int(features.get("previous_repairs", 0))
        rainfall = float(features.get("rainfall_30d", 100.0))

        # Condition contribution (0-100 where lower condition increases risk)
        cond_risk = max(0.0, 100.0 - condition) * 0.40
        # Age contribution
        age_risk = min(100.0, age * 5.0) * 0.15
        # Complaints contribution
        complaint_risk = min(100.0, complaints * 8.0) * 0.20
        # Previous repairs contribution
        repair_risk = min(100.0, repairs * 10.0) * 0.15
        # Rainfall/environment contribution
        rain_risk = min(100.0, (rainfall / 250.0) * 100.0) * 0.10

        raw_risk = cond_risk + age_risk + complaint_risk + repair_risk + rain_risk
        risk_score = round(max(0.0, min(100.0, raw_risk)), 1)
        prob = round(risk_score / 100.0, 3)

        if risk_score >= 75:
            risk_level = "CRITICAL"
        elif risk_score >= 50:
            risk_level = "HIGH"
        elif risk_score >= 25:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "maintenance_required_30d": bool(risk_score >= 50.0),
            "maintenance_probability": prob,
            "model_version": "v1.0.0-rf-baseline",
        }


class DomainServicesAdapter:
    """
    Adapter consuming Member 4's Domain Services (PRD Section 5 / Ownership Section 6).
    Delegates to backend.app.services (priority_engine, urgency_engine, impact_engine, explanations)
    or executes the agreed PRD decision rules.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self._priority_engine = None
        self._urgency_engine = None
        self._impact_engine = None
        self._explanations = None
        self._checked = False

    def _discover_services(self):
        if not self._checked:
            for mod_name, attr in [
                ("backend.app.services.priority_engine", "_priority_engine"),
                ("backend.app.services.urgency_engine", "_urgency_engine"),
                ("backend.app.services.impact_engine", "_impact_engine"),
                ("backend.app.services.explanations", "_explanations"),
            ]:
                try:
                    mod = importlib.import_module(mod_name)
                    setattr(self, attr, mod)
                except (ImportError, AttributeError):
                    pass
            self._checked = True

    def calculate_urgency(self, features: Dict[str, Any]) -> float:
        self._discover_services()
        if self._urgency_engine and hasattr(self._urgency_engine, "calculate_urgency_score"):
            try:
                return float(self._urgency_engine.calculate_urgency_score(features))
            except Exception as e:
                logger.warning(f"Member 4 urgency_engine raised {e}; falling back to domain rule.")

        # Domain Urgency Rule (PRD Section 5.2: deterioration, complaint spikes, overdue inspections)
        condition = float(features.get("condition_score", 50.0))
        complaints = int(features.get("complaints_30d", 0))
        repairs = int(features.get("previous_repairs", 0))

        urgency = (max(0.0, 100.0 - condition) * 0.45) + (min(100.0, complaints * 8.0) * 0.35) + (min(100.0, repairs * 6.0) * 0.20)
        return round(max(0.0, min(100.0, urgency)), 1)

    def calculate_impact(self, features: Dict[str, Any]) -> float:
        self._discover_services()
        if self._impact_engine and hasattr(self._impact_engine, "calculate_impact_score"):
            try:
                return float(self._impact_engine.calculate_impact_score(features))
            except Exception as e:
                logger.warning(f"Member 4 impact_engine raised {e}; falling back to domain rule.")

        # Domain Impact Rule (PRD Section 5.3: traffic/usage, criticality, public exposure)
        usage = str(features.get("usage_level", "medium")).lower()
        criticality = str(features.get("criticality", "medium")).upper()

        usage_map = {"low": 30.0, "medium": 60.0, "high": 85.0, "critical": 95.0}
        crit_map = {"LOW": 25.0, "MEDIUM": 55.0, "HIGH": 80.0, "CRITICAL": 98.0}

        u_val = usage_map.get(usage, 60.0)
        c_val = crit_map.get(criticality, 60.0)

        impact = (u_val * 0.50) + (c_val * 0.50)
        return round(max(0.0, min(100.0, impact)), 1)

    def calculate_priority(self, risk_score: float, urgency_score: float, impact_score: float) -> float:
        self._discover_services()
        if self._priority_engine and hasattr(self._priority_engine, "calculate_priority_score"):
            try:
                return float(self._priority_engine.calculate_priority_score(risk_score, urgency_score, impact_score))
            except Exception as e:
                logger.warning(f"Member 4 priority_engine raised {e}; falling back to domain rule.")

        # Formula: 0.50 * Risk + 0.25 * Urgency + 0.25 * Impact (PRD Section 5.4)
        w_risk = self.settings.PRIORITY_WEIGHT_RISK
        w_urg = self.settings.PRIORITY_WEIGHT_URGENCY
        w_imp = self.settings.PRIORITY_WEIGHT_IMPACT
        priority = (w_risk * risk_score) + (w_urg * urgency_score) + (w_imp * impact_score)
        return round(max(0.0, min(100.0, priority)), 1)

    def generate_reasons(self, features: Dict[str, Any], risk_score: float) -> List[str]:
        self._discover_services()
        if self._explanations and hasattr(self._explanations, "generate_reasons"):
            try:
                return self._explanations.generate_reasons(features, risk_score)
            except Exception as e:
                logger.warning(f"Member 4 explanations raised {e}; falling back to domain rule.")

        # Grounded rules (PRD Section 8.1 & 8.2)
        reasons: List[str] = []
        condition = float(features.get("condition_score", 50.0))
        complaints = int(features.get("complaints_30d", 0))
        repairs = int(features.get("previous_repairs", 0))
        rainfall = float(features.get("rainfall_30d", 0.0))
        criticality = str(features.get("criticality", "medium")).upper()
        usage = str(features.get("usage_level", "medium")).lower()

        if condition <= 45.0:
            reasons.append("Poor current condition")
        if complaints >= 5:
            reasons.append("High recent complaint frequency")
        if repairs >= 3:
            reasons.append("Multiple previous repairs")
        if rainfall >= 150.0:
            reasons.append("High environmental exposure")
        if criticality in ("HIGH", "CRITICAL") or usage in ("high", "critical"):
            reasons.append("High public criticality")

        if not reasons:
            reasons.append("Asset within normal operational parameters")

        return reasons[:5]

    def get_recommended_action(self, risk_level: str, priority_score: float) -> str:
        self._discover_services()
        if self._explanations and hasattr(self._explanations, "get_recommended_action"):
            try:
                return self._explanations.get_recommended_action(risk_level, priority_score)
            except Exception as e:
                logger.warning(f"Member 4 explanations raised {e}; falling back to domain rule.")

        # Risk/Action Bands (PRD Section 5.5)
        if risk_level == "CRITICAL" or priority_score >= 75.0:
            return "Immediate inspection / dispatch"
        elif risk_level == "HIGH" or priority_score >= 50.0:
            return "Priority inspection"
        elif risk_level == "MEDIUM" or priority_score >= 25.0:
            return "Inspect / plan maintenance"
        else:
            return "Routine monitoring"


class DataRepositoryAdapter:
    """
    Adapter consuming Member 4's Database & Repository services.
    Never exposes raw SQL or database connection details to API routes.
    """

    def __init__(self, settings: Settings, domain_services: DomainServicesAdapter, ml_adapter: MLInferenceAdapter):
        self.settings = settings
        self.domain = domain_services
        self.ml = ml_adapter
        self._db_service = None
        self._checked = False

    def _discover_db_service(self):
        if not self._checked:
            try:
                mod = importlib.import_module("backend.app.database.database")
                if hasattr(mod, "get_assets_from_db"):
                    self._db_service = mod
            except (ImportError, AttributeError):
                pass
            self._checked = True

    def _enrich_asset(self, raw_asset: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates decision scores for an asset record."""
        ml_res = self.ml.predict(raw_asset)
        risk_score = ml_res["risk_score"]
        risk_level = ml_res["risk_level"]
        urgency_score = self.domain.calculate_urgency(raw_asset)
        impact_score = self.domain.calculate_impact(raw_asset)
        priority_score = self.domain.calculate_priority(risk_score, urgency_score, impact_score)
        reasons = self.domain.generate_reasons(raw_asset, risk_score)
        action = self.domain.get_recommended_action(risk_level, priority_score)

        return {
            **raw_asset,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "urgency_score": urgency_score,
            "impact_score": impact_score,
            "priority_score": priority_score,
            "reasons": reasons,
            "recommended_action": action,
        }

    def list_assets(
        self,
        asset_type: Optional[str] = None,
        risk_level: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Dict[str, Any]], int]:
        all_enriched = [self._enrich_asset(a) for a in SEED_ASSETS]

        filtered = all_enriched
        if asset_type:
            filtered = [a for a in filtered if a.get("asset_type") == asset_type.lower()]
        if risk_level:
            filtered = [a for a in filtered if a.get("risk_level") == risk_level.upper()]
        if status:
            filtered = [a for a in filtered if a.get("status") == status.upper()]

        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        return paginated, total

    def get_asset_by_id(self, asset_id: str) -> Optional[Dict[str, Any]]:
        for raw in SEED_ASSETS:
            if raw["asset_id"].upper() == asset_id.upper():
                return self._enrich_asset(raw)
        return None

    def get_asset_history(self, asset_id: str) -> Optional[Dict[str, Any]]:
        # Verify asset exists
        asset = self.get_asset_by_id(asset_id)
        if not asset:
            return None

        history = SEED_HISTORY.get(asset_id.upper(), {
            "maintenance_records": [],
            "complaints": [],
            "inspections": [],
        })

        return {
            "asset_id": asset_id,
            "maintenance_records": history.get("maintenance_records", []),
            "complaints": history.get("complaints", []),
            "inspections": history.get("inspections", []),
        }

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        all_enriched = [self._enrich_asset(a) for a in SEED_ASSETS]
        total = len(all_enriched)

        critical_count = sum(1 for a in all_enriched if a.get("risk_level") == "CRITICAL")
        high_count = sum(1 for a in all_enriched if a.get("risk_level") == "HIGH")
        medium_count = sum(1 for a in all_enriched if a.get("risk_level") == "MEDIUM")
        low_count = sum(1 for a in all_enriched if a.get("risk_level") == "LOW")
        under_maint_count = sum(1 for a in all_enriched if a.get("status") == "UNDER_MAINTENANCE")

        avg_cond = round(sum(a.get("condition_score", 0.0) for a in all_enriched) / total, 1) if total > 0 else 0.0
        avg_pri = round(sum(a.get("priority_score", 0.0) for a in all_enriched) / total, 1) if total > 0 else 0.0

        type_breakdown: Dict[str, int] = {}
        for a in all_enriched:
            t = a.get("asset_type", "road")
            type_breakdown[t] = type_breakdown.get(t, 0) + 1

        # Sorted by priority score descending
        sorted_assets = sorted(all_enriched, key=lambda x: x.get("priority_score", 0.0), reverse=True)
        top_asset = sorted_assets[0] if sorted_assets else None

        return {
            "total_assets": total,
            "critical_risk_count": critical_count,
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "low_risk_count": low_count,
            "under_maintenance_count": under_maint_count,
            "average_condition_score": avg_cond,
            "average_priority_score": avg_pri,
            "risk_distribution": {
                "LOW": low_count,
                "MEDIUM": medium_count,
                "HIGH": high_count,
                "CRITICAL": critical_count,
            },
            "asset_type_breakdown": type_breakdown,
            "top_priority_asset": top_asset,
        }

    def get_priorities_queue(self, limit: int = 50, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
        all_enriched = [self._enrich_asset(a) for a in SEED_ASSETS]
        # Rank assets by priority score descending
        sorted_assets = sorted(all_enriched, key=lambda x: x.get("priority_score", 0.0), reverse=True)
        total = len(sorted_assets)

        paginated = sorted_assets[offset : offset + limit]
        queue_items = []
        for idx, asset in enumerate(paginated, start=offset + 1):
            queue_items.append({
                "rank": idx,
                "asset_id": asset["asset_id"],
                "name": asset["name"],
                "asset_type": asset["asset_type"],
                "priority_score": asset["priority_score"],
                "risk_score": asset["risk_score"],
                "risk_level": asset["risk_level"],
                "urgency_score": asset["urgency_score"],
                "impact_score": asset["impact_score"],
                "condition_score": asset["condition_score"],
                "recommended_action": asset["recommended_action"],
                "status": asset["status"],
                "reasons": asset["reasons"],
            })

        return queue_items, total


# Dependency factories for FastAPI injection
def get_ml_adapter() -> MLInferenceAdapter:
    settings = get_settings()
    return MLInferenceAdapter(settings)


def get_domain_services() -> DomainServicesAdapter:
    settings = get_settings()
    return DomainServicesAdapter(settings)


def get_data_repository() -> DataRepositoryAdapter:
    settings = get_settings()
    ml = get_ml_adapter()
    domain = get_domain_services()
    return DataRepositoryAdapter(settings, domain, ml)
