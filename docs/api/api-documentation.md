# CivicFlow — Backend API Documentation
**Owner:** Member 3 — Backend Core / API  
**Status:** Frozen MVP Contract (P0 Core + P1 Simulation)  
**Base URL:** `http://localhost:8000/api`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI) / `http://localhost:8000/redoc` (ReDoc)

---

## 1. Architecture & Ownership Boundaries

The CivicFlow backend follows a strict **4-Member Architecture**:
- **Member 1 (Frontend):** Consumes `/api/*` REST endpoints; has zero direct database or ML access.
- **Member 2 (ML Provider):** Delivers maintenance risk prediction inference via `backend.app.ml.predict`.
- **Member 3 (Backend Core / API):** Owns `main.py`, `api/*`, `schemas/*`, `config/*`, orchestrating requests into validated domain outputs.
- **Member 4 (DB & Domain Services):** Owns SQLite persistence, repositories, and domain services (`priority_engine`, `urgency_engine`, `impact_engine`, `explanations`).

```
React Frontend (M1)
       ↓
FastAPI Routes (M3)
       ↓
Application Orchestration (M3)
       ↓
 ┌──────────────────────┬──────────────────────┐
 │                      │                      │
ML Inference (M2)   Domain Services (M4)   Database / Repos (M4)
 │                      │                      │
 └──────────────────────┴──────────────────────┘
       ↓
Standardized Response (M3)
```

---

## 2. Decision Logic Contract

### Priority Formula (PRD Section 5.4)
$$\text{Priority Score} = 0.50 \times \text{Risk} + 0.25 \times \text{Urgency} + 0.25 \times \text{Impact}$$

### Risk Level Bands (PRD Section 5.5)
- **0 – 24:** `LOW` (Routine monitoring)
- **25 – 49:** `MEDIUM` (Inspect / plan maintenance)
- **50 – 74:** `HIGH` (Priority inspection)
- **75 – 100:** `CRITICAL` (Immediate inspection / dispatch)

---

## 3. Endpoints Specification

### 3.1 `GET /api/dashboard`
- **Method:** `GET`
- **Purpose:** Surfaces high-level operational KPIs, risk distribution, and the `#1` highest-priority asset.
- **Request Parameters:** None.
- **Response Status:** `200 OK`
- **Response Schema:** `DashboardResponse`
```json
{
  "total_assets": 6,
  "critical_risk_count": 2,
  "high_risk_count": 2,
  "medium_risk_count": 1,
  "low_risk_count": 1,
  "under_maintenance_count": 1,
  "average_condition_score": 51.5,
  "average_priority_score": 64.2,
  "risk_distribution": {
    "LOW": 1,
    "MEDIUM": 1,
    "HIGH": 2,
    "CRITICAL": 2
  },
  "asset_type_breakdown": {
    "road": 4,
    "streetlight": 1,
    "bridge": 1
  },
  "top_priority_asset": {
    "asset_id": "RD-042",
    "asset_type": "road",
    "name": "Outer Ring Road KM 14",
    "latitude": 28.5355,
    "longitude": 77.391,
    "age_years": 8.0,
    "condition_score": 38.0,
    "criticality": "HIGH",
    "status": "ACTIVE",
    "risk_score": 85.5,
    "risk_level": "CRITICAL",
    "priority_score": 84.8,
    "urgency_score": 87.0,
    "impact_score": 82.5
  }
}
```

---

### 3.2 `GET /api/assets`
- **Method:** `GET`
- **Purpose:** Retrieves paginated list of infrastructure assets with optional filtering.
- **Query Parameters:**
  - `asset_type` *(string, optional)*: Filter by type (`road`, `streetlight`, `bridge`).
  - `risk_level` *(string, optional)*: Filter by risk band (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  - `status` *(string, optional)*: Filter by operational status (`ACTIVE`, `UNDER_MAINTENANCE`, `INSPECTION_PENDING`).
  - `limit` *(int, default=50, min=1, max=500)*: Max items.
  - `offset` *(int, default=0, min=0)*: Pagination offset.
- **Response Status:** `200 OK`
- **Response Schema:** `AssetListResponse`
```json
{
  "items": [
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
      "risk_score": 79.5,
      "risk_level": "CRITICAL",
      "priority_score": 82.1,
      "urgency_score": 75.0,
      "impact_score": 91.5
    }
  ],
  "total": 6,
  "limit": 50,
  "offset": 0
}
```

---

### 3.3 `GET /api/assets/{id}`
- **Method:** `GET`
- **Purpose:** Retrieves complete decision and condition details for a single asset.
- **Path Parameters:**
  - `id` *(string, required)*: Asset identifier (e.g. `RD-021`).
- **Response Status:** `200 OK`
- **Error Status:** `404 Not Found` if asset does not exist.
- **Response Schema:** `AssetDetailResponse`
```json
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
  "risk_score": 79.5,
  "risk_level": "CRITICAL",
  "priority_score": 82.1,
  "urgency_score": 75.0,
  "impact_score": 91.5,
  "recommended_action": "Immediate inspection / dispatch",
  "reasons": [
    "Poor current condition",
    "High recent complaint frequency",
    "Multiple previous repairs",
    "High environmental exposure",
    "High public criticality"
  ],
  "last_inspected": "2026-09-15",
  "zone": "North Corridor"
}
```

---

### 3.4 `GET /api/assets/{id}/history`
- **Method:** `GET`
- **Purpose:** Retrieves historical maintenance records, citizen complaints, and engineering inspection logs.
- **Path Parameters:**
  - `id` *(string, required)*: Asset identifier (e.g. `RD-021`).
- **Response Status:** `200 OK`
- **Error Status:** `404 Not Found` if asset does not exist.
- **Response Schema:** `HistoryResponse`
```json
{
  "asset_id": "RD-021",
  "maintenance_records": [
    {
      "maintenance_id": "MNT-101",
      "asset_id": "RD-021",
      "date": "2025-11-12",
      "type": "Bituminous Pothole Patching",
      "severity": "HIGH",
      "cost": 45000.0,
      "downtime_hours": 8.0,
      "description": "Emergency patch repair on eastbound carriage lane."
    }
  ],
  "complaints": [
    {
      "complaint_id": "CMP-801",
      "asset_id": "RD-021",
      "date": "2026-09-28",
      "category": "Deep Pothole / Vehicle Damage",
      "severity": "CRITICAL",
      "status": "OPEN",
      "description": "Large crater near intersection damaging suspension."
    }
  ],
  "inspections": [
    {
      "inspection_id": "INS-301",
      "asset_id": "RD-021",
      "date": "2026-09-15",
      "score": 42.0,
      "defect_type": "Alligator Cracking & Severe Ravelling",
      "inspector": "Eng. R. Sharma (PWD Inspection Unit)",
      "notes": "Pavement degradation accelerating under commercial vehicle axle loads."
    }
  ]
}
```

---

### 3.5 `GET /api/priorities`
- **Method:** `GET`
- **Purpose:** Returns the operational priority queue sorted strictly in descending order of priority score.
- **Query Parameters:**
  - `limit` *(int, default=50, min=1, max=500)*: Number of items.
  - `offset` *(int, default=0, min=0)*: Pagination offset.
- **Response Status:** `200 OK`
- **Response Schema:** `PriorityQueueResponse`
```json
{
  "items": [
    {
      "rank": 1,
      "asset_id": "RD-042",
      "name": "Outer Ring Road KM 14",
      "asset_type": "road",
      "priority_score": 84.8,
      "risk_score": 85.5,
      "risk_level": "CRITICAL",
      "urgency_score": 87.0,
      "impact_score": 82.5,
      "condition_score": 38.0,
      "recommended_action": "Immediate inspection / dispatch",
      "status": "ACTIVE",
      "reasons": [
        "Poor current condition",
        "High recent complaint frequency",
        "Multiple previous repairs",
        "High environmental exposure",
        "High public criticality"
      ]
    }
  ],
  "total": 6,
  "limit": 50,
  "offset": 0
}
```

---

### 3.6 `POST /api/predict`
- **Method:** `POST`
- **Purpose:** On-demand prediction and decision scoring for an asset feature vector.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:** `PredictionRequest`
```json
{
  "asset_id": "RD-021",
  "asset_type": "road",
  "age_years": 12,
  "condition_score": 42,
  "complaints_30d": 8,
  "previous_repairs": 3,
  "rainfall_30d": 220,
  "usage_level": "high"
}
```
- **Response Status:** `200 OK`
- **Response Schema:** `PredictionResponse`
```json
{
  "asset_id": "RD-021",
  "risk_score": 87.0,
  "risk_level": "CRITICAL",
  "urgency_score": 82.0,
  "impact_score": 91.0,
  "priority_score": 86.8,
  "recommended_action": "Immediate inspection / dispatch",
  "reasons": [
    "Poor current condition",
    "High recent complaint frequency",
    "Multiple previous repairs",
    "High environmental exposure",
    "High public criticality"
  ],
  "maintenance_required_30d": true,
  "maintenance_probability": 0.87,
  "model_version": "v1.0.0-rf-baseline"
}
```

---

### 3.7 `POST /api/simulate` *(P1 Feature)*
- **Method:** `POST`
- **Purpose:** What-if maintenance scenario analysis evaluating the potential impact of an intervention.
- **Request Body:** `SimulationRequest`
```json
{
  "asset_id": "RD-021",
  "intervention_type": "Resurfacing & Drainage Overhaul",
  "condition_gain": 40.0,
  "complaints_reduction_percent": 80.0
}
```
- **Response Status:** `200 OK`
- **Response Schema:** `SimulationResponse`
```json
{
  "asset_id": "RD-021",
  "intervention_type": "Resurfacing & Drainage Overhaul",
  "before": { ... },
  "after": { ... },
  "risk_delta": 28.5,
  "priority_delta": 24.2,
  "summary": "Simulated Resurfacing & Drainage Overhaul improved condition from 42.0 to 82.0, reducing risk score by 28.5 pts (CRITICAL -> HIGH) and priority score by 24.2 pts."
}
```

---

## 4. Error Responses

All error responses adhere to standard HTTP status codes and provide a uniform JSON structure:

```json
{
  "detail": "Asset with ID 'RD-999' not found.",
  "error_code": "HTTP_404",
  "timestamp": "2026-10-05T12:00:00.000000Z"
}
```

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `HTTP_400` | Malformed request or invalid parameters |
| `404` | `HTTP_404` | Asset identifier not found |
| `422` | `VALIDATION_ERROR` | Schema validation error with field diagnostics |
| `500` | `INTERNAL_SERVER_ERROR` | Internal error (safe response without leaking stack traces or SQL) |
| `502` | `HTTP_502` | Downstream ML inference failure |
