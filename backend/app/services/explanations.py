"""
Explanation & Recommendation Service for CivicFlow.
Generates 3-5 grounded, fact-based explanations based strictly on actual asset
attributes and operational logs (PRD Section 8).
Determines transparent recommended actions mapped to priority and risk bands (PRD Section 5.5).
"""

from typing import List, Dict, Any


def generate_grounded_reasons(asset: Dict[str, Any]) -> List[str]:
    """
    Extracts 3-5 grounded human-readable evidence reasons for priority ranking.
    Adheres strictly to PRD Section 8.2: Never invent evidence.
    """
    reasons: List[str] = []

    condition = float(asset.get("condition_score", 100.0))
    complaints = int(asset.get("complaints_30d", 0))
    repairs = int(asset.get("previous_repairs", 0))
    potholes = int(asset.get("pothole_count", 0))
    age = float(asset.get("age_years", 0.0))
    overdue = int(asset.get("overdue_inspection", 0))
    rain = float(asset.get("rainfall_30d_mm", 0.0))
    traffic = int(asset.get("traffic_level", 1))
    crit = str(asset.get("criticality", "")).upper()
    asset_type = str(asset.get("asset_type", "ROAD")).upper()

    # Physical Condition
    if condition < 50.0:
        reasons.append("Poor current physical condition")

    # Grievances
    if complaints >= 3:
        reasons.append("High recent citizen grievance frequency")

    # Repair history
    if repairs >= 3:
        reasons.append("Multiple previous patch repairs on record")

    # Surface Distress / Potholes (for Roads)
    if potholes >= 3:
        reasons.append("Observable surface distress and potholes")

    # Age
    if age >= 10.0:
        reasons.append("Advanced infrastructure age")

    # Overdue Inspection
    if overdue > 0:
        reasons.append("Overdue routine maintenance inspection")

    # Rainfall Exposure
    if rain >= 160.0:
        reasons.append("Elevated environmental exposure and rainfall")

    # Arterial Traffic
    if traffic >= 4:
        reasons.append("Heavy traffic loading on arterial corridor")

    # Criticality
    if crit == "HIGH":
        reasons.append("Designated high-priority municipal corridor")

    # Streetlight specific
    if asset_type == "STREETLIGHT" and complaints >= 2:
        reasons.append("Persistent nocturnal luminaire outage reports")

    # Bridge specific
    if asset_type == "BRIDGE" and condition < 60.0:
        reasons.append("Structural inspection warning threshold exceeded")

    if not reasons:
        reasons.append("Asset within normal operating tolerances")

    # Return top 3 to 5 grounded reasons (PRD Section 8.2)
    return reasons[:4]


def determine_recommended_action(priority_score: float, asset_type: str = "ROAD") -> str:
    """
    Maps calculated priority score into PRD Section 5.5 transparent recommended actions:
      75-100 -> Immediate inspection / dispatch
      50-74  -> Priority inspection
      25-49  -> Inspect / plan maintenance
      0-24   -> Routine monitoring
    """
    a_type = asset_type.upper()
    if priority_score >= 75.0:
        if a_type == "STREETLIGHT":
            return "Emergency electrical repair dispatch"
        elif a_type == "BRIDGE":
            return "Emergency structural inspection dispatch"
        return "Immediate inspection / dispatch"
    elif priority_score >= 50.0:
        return "Priority inspection"
    elif priority_score >= 25.0:
        return "Inspect / plan maintenance"
    else:
        return "Routine monitoring"
