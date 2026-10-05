"""
Urgency Engine Service for CivicFlow.
Computes operational time-sensitivity (0-100 score) using physical deterioration,
citizen complaints, and overdue inspection signals.
Formula defined in Member 2 Team Hand-off & PRD Section 5.2.
"""

from typing import Dict, Any


def calculate_urgency_score(asset: Dict[str, Any]) -> float:
    """
    Calculates the 0-100 Urgency Score.
    
    Formula:
      Urgency = 0.35 * (100 - condition_score) + 0.35 * (complaints_30d * 5) + 0.30 * (overdue_inspection * 100)
      
    Bounded between 0.0 and 100.0.
    """
    condition = float(asset.get("condition_score", 70.0))
    complaints = int(asset.get("complaints_30d", 0))
    overdue = int(asset.get("overdue_inspection", 0))

    # Deterioration component: lower condition score means higher urgency
    deterioration_term = 0.35 * (100.0 - condition)

    # Citizen grievance spike component (each complaint counts for 5 urgency points, capped at 100 before weighting)
    complaint_points = min(100.0, complaints * 5.0)
    complaints_term = 0.35 * complaint_points

    # Inspection overdue penalty: 100 points if overdue
    overdue_term = 0.30 * (100.0 if overdue > 0 else 0.0)

    total_urgency = deterioration_term + complaints_term + overdue_term
    
    # Defensive bounding to 0-100 range
    bounded_score = round(max(0.0, min(100.0, total_urgency)), 1)
    return bounded_score
