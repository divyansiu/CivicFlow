# 🏙️ CivicFlow — Predictive Maintenance Platform for Public Infrastructure

## 🚧 Problem

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

## 💡 Our Solution

CivicFlow analyzes infrastructure-related data and produces an actionable maintenance priority for each asset.

### Core workflow

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

## 🎯 Key Features

### 1. Infrastructure Asset Registry

Maintain information about infrastructure assets including:

- Asset ID
- Asset type
- Location
- Age
- Condition
- Operational information

---

### 2. Predictive Risk Scoring

The ML system analyzes relevant infrastructure features and estimates the likelihood that an asset requires maintenance.

Example:

```text
Risk Score: 91 / 100
Risk Level: CRITICAL
```

---

### 3. Urgency Scoring

Determines how quickly an asset may require attention based on factors such as:

- Current condition
- Recent complaints
- Deterioration indicators
- Previous maintenance
- Other relevant signals

---

### 4. Impact Scoring

Estimates the potential public impact associated with an infrastructure asset.

For example:

- Traffic importance
- Population/service exposure
- Critical infrastructure role
- Potential disruption

---

### 5. Maintenance Priority

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

### 6. Explainable Predictions

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

This makes the prediction easier for authorities and judges to understand and trust.

---

### 7. GIS Infrastructure Map

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

### 8. Maintenance History

The platform can display historical maintenance activity associated with an infrastructure asset.

This helps identify assets with recurring maintenance problems.

---

### 9. Maintenance Recommendations

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

The prediction pipeline is:

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
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Urgency     Impact     History
              │          │          │
              └──────────┼──────────┘
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
                    │         │
                    ▼         ▼
                Dashboard   GIS Map
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

For a production deployment, the architecture can be migrated to a persistent database such as PostgreSQL/PostGIS.

## Deployment

- Vercel — Frontend
- Render — Backend

---

# ⚙️ Installation & Getting Started

Follow these steps to set up and run CivicFlow locally on any machine.

### Prerequisites

Ensure you have the following installed:
- **Python**: Version `3.10` or higher (`python --version`)
- **Node.js**: Version `18.x` or higher (`node --version`) and **npm** (`npm --version`)
- **Git**: (`git --version`)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/divyansiu/CivicFlow.git
cd CivicFlow
```

---

### Step 2: Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   - **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **On macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize and seed the SQLite database:**
   The SQLite database initializes and automatically seeds 60 Bengaluru road assets and operational logs on startup, or you can pre-seed it directly:
   ```bash
   python -c "from app.database import init_db; init_db()"
   ```

5. **Start the FastAPI backend server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **API URL:** `http://localhost:8000`
   - **Interactive API Docs (Swagger UI):** `http://localhost:8000/docs`

---

### Step 3: Frontend Setup

Open a new terminal window or tab:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   - **Frontend Application URL:** `http://localhost:5173`

---

### Step 4: Running Tests (Optional)

To verify backend scoring engines, database persistence, and integration tests:

```bash
cd backend
python -m pytest tests -v
```

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

### ML organization

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

# 🔄 Application Flow

A typical CivicFlow workflow:

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

# 📊 Example

Consider a road asset:

### Road RD-102

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

### Recommendation

> **Immediate inspection and preventive maintenance recommended.**

The decision is supported by the underlying infrastructure signals rather than presenting an unexplained prediction.

---

# 🌍 Scalability

Although the initial MVP focuses on infrastructure types that can be demonstrated reliably within the hackathon, the architecture is designed to support additional infrastructure categories.

Potential future expansion:

```text
                 CivicFlow
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
     Roads      Streetlights    Bridges
       │             │             │
       └─────────────┼─────────────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Drainage     Water    Buildings
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

# 🎯 Why CivicFlow?

Traditional maintenance often asks:

> **"What is already broken?"**

CivicFlow aims to ask:

> **"What is likely to need attention next, and what should we prioritize?"**

By combining **prediction + explanation + prioritization**, CivicFlow aims to help infrastructure authorities make faster and more informed maintenance decisions.

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

# 👥 Team

**Team:** CivicFlow

Built as a hackathon project focused on applying AI and data-driven decision-making to public infrastructure maintenance.

---

# 📜 License

This project is developed for hackathon and educational purposes.

See `LICENSE` for details.
