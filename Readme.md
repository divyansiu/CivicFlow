# 🚧 CivicFlow
### AI-Powered Predictive Maintenance for Public Infrastructure

CivicFlow is an **AI-powered predictive maintenance platform** designed to help authorities identify infrastructure assets that are likely to require maintenance and prioritize them based on **risk, urgency, and public impact**.

Instead of waiting for infrastructure to fail or relying only on reactive complaints, CivicFlow combines infrastructure condition, maintenance history, complaints, inspections, and other relevant signals to provide **data-driven maintenance priorities**.

<img width="1919" height="790" alt="image" src="https://github.com/user-attachments/assets/ec0d25f9-85a7-41bf-93e2-1019d0442f11" />
<img width="1919" height="921" alt="image" src="https://github.com/user-attachments/assets/c47c65ae-2a85-4f06-96fb-947a17016056" />
<img width="1919" height="928" alt="image" src="https://github.com/user-attachments/assets/1f8c7b31-8322-473b-b41e-323318ed2fdf" />

---

# 🚨 Problem

Public infrastructure such as:

- Roads
- Streetlights
- Bridges
- Drainage systems
- Water infrastructure
- Public buildings

requires continuous inspection and maintenance.

However, maintenance resources are limited, and authorities need to answer a critical question:

> **Which infrastructure should be inspected or maintained first?**

Traditional reactive approaches often identify problems only after they become serious.

CivicFlow aims to shift the process from:

**Reactive Maintenance**

to:

**Predictive → Prioritized → Preventive Maintenance**

---

# 💡 Our Solution

CivicFlow analyzes infrastructure-related data and produces an actionable maintenance priority for each asset.

## Core Workflow

```text
Infrastructure Data
        ↓
Feature Engineering
        ↓
AI Risk Prediction
        ↓
Risk Score
        ↓
Urgency + Impact Analysis
        ↓
Maintenance Priority
        ↓
Explainable Recommendation
        ↓
Decision Dashboard
```

The platform doesn't only answer:

> "Is this asset risky?"

It also answers:

> **"Why is it risky, how urgent is it, what is the potential impact, and should it be prioritized for maintenance?"**

---

# 🎯 Key Features

## 1. Infrastructure Asset Registry

Maintain information about infrastructure assets including:

- Asset ID
- Asset type
- Location
- Age
- Condition
- Operational information

---

## 2. Predictive Risk Scoring

The ML system analyzes relevant infrastructure features and estimates the likelihood that an asset requires maintenance.

Example:

```text
Risk Score: 91 / 100
Risk Level: CRITICAL
```

---

## 3. Urgency Scoring

Determines how quickly an asset may require attention based on factors such as:

- Current condition
- Recent complaints
- Deterioration indicators
- Previous maintenance
- Other relevant signals

---

## 4. Impact Scoring

Estimates the potential public impact associated with an infrastructure asset.

For example:

- Traffic importance
- Population/service exposure
- Critical infrastructure role
- Potential disruption

---

## 5. Maintenance Priority

CivicFlow combines risk, urgency, and impact to create a prioritized maintenance queue.

Example:

```text
Asset       Risk    Urgency    Impact    Priority
--------------------------------------------------
RD-102       91       86         94       CRITICAL
RD-087       89       80         90       CRITICAL
SL-204       81       72         76       HIGH
RD-143       72       64         68       HIGH
```

This helps decision-makers focus limited resources on the assets requiring the most attention.

---

## 6. Explainable Predictions

CivicFlow provides understandable reasons behind a high-risk prediction.

Example:

```text
Why is RD-102 high risk?

✓ Poor infrastructure condition
✓ High number of recent complaints
✓ Repeated previous maintenance
✓ High environmental exposure
✓ High public/traffic impact
```

This makes the prediction easier for authorities and evaluators to understand and trust.

---

## 7. GIS Infrastructure Map

Infrastructure assets can be visualized geographically using:

- React-Leaflet
- OpenStreetMap

Assets can be represented according to their risk level:

```text
🟢 Low Risk
🟡 Medium Risk
🟠 High Risk
🔴 Critical
```

This provides a geographical view of infrastructure risk.

---

## 8. Maintenance History

The platform can display historical maintenance activity associated with an infrastructure asset.

This helps identify assets with recurring maintenance problems.

---

## 9. Maintenance Recommendations

Based on the asset's risk and priority, CivicFlow can provide actionable recommendations such as:

> **Immediate inspection recommended.**

or

> **Schedule preventive maintenance.**

---

# 🧠 AI / ML Approach

The initial MVP uses a **Random Forest classifier** as the baseline predictive model.

The model can use infrastructure-related features such as:

- Asset age
- Condition score
- Complaint frequency
- Previous maintenance
- Inspection information
- Environmental exposure
- Usage/traffic indicators
- Infrastructure-specific attributes

## Prediction Pipeline

```text
Raw Infrastructure Data
          ↓
Feature Engineering
          ↓
Random Forest
          ↓
Maintenance Risk
          ↓
Risk Score
```

The ML model is integrated directly into the FastAPI backend.

---

# 🏗️ System Architecture

```text
                     DATA SOURCES
                          │
                          ▼
                  ┌─────────────────┐
                  │    SQLite DB    │
                  └────────┬────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Feature Engineering │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Random Forest ML  │
                └──────────┬──────────┘
                           │
                           ▼
                       Risk Score
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
              Urgency    Impact    History
                 │         │         │
                 └─────────┼─────────┘
                           ▼
                    Priority Engine
                           │
                           ▼
                    Explanation Engine
                           │
                           ▼
                       FastAPI API
                           │
                           ▼
                      React Frontend
                         │       │
                         ▼       ▼
                    Dashboard  GIS Map
```

---

# 🔄 End-to-End Application Flow

A typical CivicFlow workflow is:

```text
1. Infrastructure data enters the system
                    ↓
2. Data is processed and features are generated
                    ↓
3. ML model predicts maintenance risk
                    ↓
4. Risk score is calculated
                    ↓
5. Urgency is evaluated
                    ↓
6. Potential public impact is evaluated
                    ↓
7. Priority score is generated
                    ↓
8. Reasons behind the prediction are generated
                    ↓
9. Maintenance recommendation is produced
                    ↓
10. Result appears on the dashboard and GIS map
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- JavaScript
- React-Leaflet
- OpenStreetMap
- Recharts

## Backend

- Python
- FastAPI
- Pydantic

## Machine Learning

- Python
- Scikit-learn
- Random Forest
- Pandas
- NumPy

## Database

- SQLite

SQLite is used for the MVP because it provides **zero database setup and fast local development**.

For production deployment, the architecture can be migrated to a persistent database such as PostgreSQL/PostGIS.

## Deployment

- Vercel — Frontend
- Render — Backend

---

# 📁 Project Structure

```text
predictive-maintenance/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── database/
│   │   └── config/
│   │
│   ├── data/
│   │   ├── seed/
│   │   ├── raw/
│   │   └── processed/
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── utils/
│
├── ml-lab/
│   ├── notebooks/
│   ├── experiments/
│   └── README.md
│
├── docs/
│   ├── architecture/
│   ├── research/
│   ├── api/
│   └── presentation/
│
├── .gitignore
├── README.md
└── LICENSE
```

## ML Organization

The repository separates ML experimentation from production application code:

```text
ml-lab/
    ↓
Research / experiments / notebooks

backend/app/ml/
    ↓
Production ML code used by the application
```

This prevents experimentation code from being mixed with the application's runtime logic.

---

# ⚙️ Technical Installation & Setup

Follow the steps below to run CivicFlow locally.

## Prerequisites

Make sure the following are installed:

- **Python 3.12+**
- **Node.js 18+ + npm**
- **Git**

Verify the installations:

```bash
python --version
node --version
npm --version
git --version
```

---

# Step 1: Clone the Repository

```bash
git clone https://github.com/divyansiu/CivicFlow.git
cd CivicFlow
```

> **Important:** All backend commands must be run from the **project root** (`CivicFlow/`), not from inside the `backend/` folder.

---

# Step 2: Backend Setup

## 1. Install Python dependencies

From the **project root**:

```bash
pip install -r backend/requirements.txt
```

### Optional: Use a virtual environment

#### Windows PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

## 2. Start the FastAPI backend

From the **project root** (`CivicFlow/`):

```bash
python -m uvicorn backend.app.main:app --port 8000 --reload
```

> ⚠️ **Do NOT run** `uvicorn app.main:app` from inside the `backend/` folder — this will fail. Always use `python -m uvicorn backend.app.main:app` from the project root.

Backend API:

```text
http://localhost:8000
```

Swagger UI (interactive API docs):

```text
http://localhost:8000/docs
```

The SQLite database (`backend/data/civicflow.db`) is **pre-seeded** with 60 Bengaluru road assets and 136 maintenance records — no manual database setup required.

---

# Step 3: Frontend Setup

Open a **new terminal window or tab**.

## 1. Navigate to the frontend

```bash
cd frontend
```

## 2. Install dependencies (first time only)

```bash
npm install
```

## 3. Start the Vite development server

```bash
npm run dev
```

Frontend application:

```text
http://localhost:5173
```

The frontend automatically proxies all `/api` requests to the FastAPI backend at `http://localhost:8000`.

---

# Step 4: Run the Complete System

You need **two terminals** open simultaneously.

### Terminal 1 — Backend (from project root)

```bash
# Windows
python -m uvicorn backend.app.main:app --port 8000 --reload

# macOS / Linux
python3 -m uvicorn backend.app.main:app --port 8000 --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Access:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:8000
Swagger  → http://localhost:8000/docs
```

---

# 🔌 Technical Runtime Flow

```text
React Frontend
      ↓
FastAPI API
      ↓
Database / Services
      ↓
Feature Engineering
      ↓
Random Forest
      ↓
Risk Score
      ↓
Urgency + Impact
      ↓
Priority Engine
      ↓
Explanation + Recommendation
      ↓
JSON Response
      ↓
React Dashboard / GIS / Priority Queue
```

---

# 🧪 Step 5: Running Tests

To verify backend scoring engines, database persistence, and integration tests:

```bash
python -m pytest backend/tests -v
```

A successful test run helps verify that the main backend components are working together correctly.

---

# 📡 Step 6: API Documentation

After starting the backend, open:

```text
http://localhost:8000/docs
```

FastAPI provides interactive Swagger documentation for testing the backend endpoints.

## Core API Endpoints

```text
GET  /api/dashboard
GET  /api/assets
GET  /api/assets/{id}
GET  /api/assets/{id}/history
GET  /api/priorities
POST /api/predict
```

These APIs support the dashboard, asset details, history, priority queue, and prediction workflow.

---

# 📊 Example

Consider a road asset:

## Road RD-102

```text
Condition: Poor
Age: 12 years
Recent Complaints: 18
Previous Repairs: 5
Environmental Exposure: High
Traffic: High
```

CivicFlow may produce:

```text
Risk Score       → 91 / 100
Urgency          → 86 / 100
Impact           → 94 / 100
Priority         → CRITICAL
```

## Recommendation

> **Immediate inspection and preventive maintenance recommended.**

The decision is supported by the underlying infrastructure signals rather than presenting an unexplained prediction.

---

# 🌍 Scalability

Although the initial MVP focuses on infrastructure that can be demonstrated reliably within the hackathon, the architecture is designed to support additional infrastructure categories.

Potential expansion:

```text
                    CivicFlow
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           Roads    Streetlights  Bridges
             │          │          │
             └──────────┼──────────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
          Drainage     Water   Buildings
```

The underlying architecture can remain consistent while infrastructure-specific features and prediction models are added.

---

# 🚀 Future Scope

Potential future capabilities include:

- Real-time IoT sensor integration
- Computer vision for infrastructure damage detection
- Weather and environmental API integration
- Mobile field inspection
- Automated inspection reports
- Advanced deterioration forecasting
- Maintenance cost estimation
- Budget optimization
- Multi-city deployment
- Government system integration
- Infrastructure-specific ML models
- Real-time alerts and notifications

These capabilities are considered future extensions beyond the initial MVP.

---

# ⚠️ MVP Philosophy

CivicFlow follows a simple principle:

> **Build the smallest system that demonstrates the complete predictive-maintenance decision loop.**

Rather than adding unnecessary complexity, the MVP prioritizes:

- Reliable prediction
- Explainability
- Risk prioritization
- Clear visualization
- Actionable recommendations
- Strong demonstration value

---

# 🎯 Why CivicFlow?

Traditional maintenance often asks:

> **"What is already broken?"**

CivicFlow aims to ask:

> **"What is likely to need attention next, and what should we prioritize?"**

By combining **prediction + explanation + prioritization**, CivicFlow aims to help infrastructure authorities make faster and more informed maintenance decisions.

---

# 🏁 Core Product Flow

```text
DATA
  ↓
PREDICT
  ↓
RISK
  ↓
URGENCY + IMPACT
  ↓
PRIORITY
  ↓
EXPLAIN
  ↓
RECOMMEND
  ↓
ACTION
```

---

# 👥 Team

**Team:** CivicFlow

Built as a hackathon project focused on applying AI and data-driven decision-making to public infrastructure maintenance.

---

# 📜 License

This project is developed for hackathon and educational purposes.

See `LICENSE` for details.
