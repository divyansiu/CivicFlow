"""
Impact Engine Service for CivicFlow.
Calculates public consequence (0-100 score) using traffic density, road classification,
and municipal criticality.
Formula defined in Member 2 Team Hand-off & PRD Section 5.3.
"""

from typing import Dict, Any


def calculate_impact_score(asset: Dict[str, Any]) -> float:
    """
    Calculates the 0-100 Public Impact Score.
    
    Formula:
      Impact = (traffic_level * 15) + (25 if criticality == 'HIGH' else (15 if criticality == 'MEDIUM' else 10))
      
    For traffic_level 5 + HIGH criticality: 75 + 25 = 100.0.
    Bounded between 0.0 and 100.0.
    """
    traffic = int(asset.get("traffic_level", 3))
    # Defensive clamp traffic level to 1-5
    traffic_clamped = max(1, min(5, traffic))

    crit = str(asset.get("criticality", "MEDIUM")).upper()
    if crit == "HIGH":
        crit_bonus = 25.0
    elif crit == "MEDIUM":
        crit_bonus = 15.0
    else:
        crit_bonus = 10.0

    raw_impact = (traffic_clamped * 15.0) + crit_bonus
    bounded_score = round(max(0.0, min(100.0, raw_impact)), 1)
    return bounded_score
