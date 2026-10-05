import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

np.random.seed(42)
NUM_SAMPLES = 1500

# Load live weather baseline if fetched
base_rainfall = 138.2
weather_file = "backend/data/raw/weather_bengaluru.json"
if os.path.exists(weather_file):
    with open(weather_file, "r", encoding="utf-8") as f:
        w_json = json.load(f)
        base_rainfall = float(w_json.get("total_rainfall_30d_mm", 138.2))

# Load dynamically fetched OSM roads
osm_file = "backend/data/raw/osm_roads.json"
real_osm_roads = []
if os.path.exists(osm_file):
    with open(osm_file, "r", encoding="utf-8") as f:
        real_osm_roads = json.load(f)

asset_ids = [f"RD-{i:04d}" for i in range(1, NUM_SAMPLES + 1)]
age_years = np.random.randint(1, 21, size=NUM_SAMPLES)
surface_types = np.random.choice(["asphalt", "concrete", "composite"], size=NUM_SAMPLES, p=[0.7, 0.2, 0.1])
traffic_level = np.random.choice([1, 2, 3, 4, 5], size=NUM_SAMPLES, p=[0.15, 0.25, 0.30, 0.20, 0.10])

base_condition = 100 - (age_years * 2.5) - (traffic_level * 4) + np.random.normal(0, 8, size=NUM_SAMPLES)
condition_score = np.clip(np.round(base_condition, 1), 5.0, 100.0)

pothole_count = np.where(
    condition_score < 40,
    np.random.poisson(lam=8, size=NUM_SAMPLES),
    np.random.poisson(lam=1.5, size=NUM_SAMPLES)
)
pothole_count = np.clip(pothole_count, 0, 25)

previous_repairs = np.clip(np.random.poisson(lam=age_years * 0.3), 0, 12)
days_since_last_repair = np.random.randint(30, 1800, size=NUM_SAMPLES)

# Sample rainfall around the real 30-day recorded baseline
rainfall_30d_mm = np.clip(
    np.round(np.random.normal(base_rainfall, 45, size=NUM_SAMPLES), 1),
    10.0, 450.0
)

complaint_factor = (100 - condition_score) * 0.1 + (traffic_level * 0.8)
complaints_30d = np.clip(np.random.poisson(lam=np.maximum(0.2, complaint_factor * 0.3)), 0, 20)
overdue_inspection = np.random.choice([0, 1], size=NUM_SAMPLES, p=[0.75, 0.25])

surface_effect = np.where(surface_types == "asphalt", 0.25, np.where(surface_types == "concrete", -0.25, 0.0))

stress = (
    - 4.8
    + 0.055 * (100 - condition_score)
    + 0.12 * pothole_count
    + 0.08 * age_years
    + 0.15 * traffic_level
    + 0.003 * rainfall_30d_mm
    + 0.14 * complaints_30d
    + 0.35 * overdue_inspection
    + surface_effect
    + np.random.normal(0, 0.4, size=NUM_SAMPLES)
)

failure_prob = 1.0 / (1.0 + np.exp(-stress))
target_30d = (failure_prob >= 0.50).astype(int)

df = pd.DataFrame({
    "asset_id": asset_ids,
    "age_years": age_years,
    "surface_type": surface_types,
    "traffic_level": traffic_level,
    "condition_score": condition_score,
    "pothole_count": pothole_count,
    "previous_repairs": previous_repairs,
    "days_since_last_repair": days_since_last_repair,
    "rainfall_30d_mm": rainfall_30d_mm,
    "complaints_30d": complaints_30d,
    "overdue_inspection": overdue_inspection,
    "target_30d": target_30d
})

train_df, test_df = train_test_split(df, test_size=0.20, random_state=42, stratify=df["target_30d"])

os.makedirs("backend/data/processed", exist_ok=True)
os.makedirs("backend/data/seed", exist_ok=True)

train_df.to_csv("backend/data/processed/train.csv", index=False)
test_df.to_csv("backend/data/processed/test.csv", index=False)

bengaluru_lat, bengaluru_lon = 12.9716, 77.5946
seed_assets = []

for idx, (_, row) in enumerate(df.head(60).iterrows()):
    if idx < len(real_osm_roads):
        osm = real_osm_roads[idx]
        road_name = f"{osm['name']} ({row['asset_id']})"
        lat = osm["latitude"]
        lon = osm["longitude"]
    else:
        road_name = f"Road Segment {row['asset_id']}"
        lat = round(bengaluru_lat + float(np.random.uniform(-0.06, 0.06)), 6)
        lon = round(bengaluru_lon + float(np.random.uniform(-0.06, 0.06)), 6)

    criticality = "HIGH" if row["traffic_level"] >= 4 else ("MEDIUM" if row["traffic_level"] >= 2 else "LOW")
    
    seed_assets.append({
        "asset_id": row["asset_id"],
        "asset_type": "road",
        "name": road_name,
        "latitude": lat,
        "longitude": lon,
        "age_years": int(row["age_years"]),
        "condition_score": float(row["condition_score"]),
        "surface_type": str(row["surface_type"]),
        "traffic_level": int(row["traffic_level"]),
        "pothole_count": int(row["pothole_count"]),
        "previous_repairs": int(row["previous_repairs"]),
        "days_since_last_repair": int(row["days_since_last_repair"]),
        "rainfall_30d_mm": float(row["rainfall_30d_mm"]),
        "complaints_30d": int(row["complaints_30d"]),
        "overdue_inspection": int(row["overdue_inspection"]),
        "criticality": criticality,
        "status": "ACTIVE"
    })

with open("backend/data/seed/assets.json", "w", encoding="utf-8") as f:
    json.dump(seed_assets, f, indent=2)

# Generate realistic lifecycle seed records linked to the 60 road assets
seed_maintenance = []
seed_complaints = []
seed_inspections = []

maintenance_types = ["Pothole Patching", "Asphalt Resurfacing", "Crack Sealing", "Drainage Clearance", "Surface Milling"]
complaint_categories = ["Pothole Hazard", "Water Logging", "Surface Cracking", "Erosion Near Kerb", "Rough Riding Surface"]
defect_types = ["Alligator Cracking", "Severe Potholes", "Longitudinal Cracks", "Minor Surface Wear", "Normal Aging"]

m_id = 1
c_id = 1
i_id = 1

for asset in seed_assets:
    a_id = asset["asset_id"]
    n_repairs = min(asset["previous_repairs"], 3)
    
    # Past maintenance records
    for r in range(n_repairs):
        seed_maintenance.append({
            "maintenance_id": f"MNT-{m_id:04d}",
            "asset_id": a_id,
            "maintenance_date": f"2025-{np.random.randint(1, 13):02d}-{np.random.randint(1, 28):02d}",
            "type": np.random.choice(maintenance_types),
            "severity": "HIGH" if asset["condition_score"] < 50 else "MEDIUM",
            "cost": int(np.random.randint(25000, 180000)),
            "downtime_days": int(np.random.randint(1, 4))
        })
        m_id += 1

    # Citizen complaint records
    n_complaints = min(asset["complaints_30d"], 4)
    for c in range(n_complaints):
        seed_complaints.append({
            "complaint_id": f"CMP-{c_id:04d}",
            "asset_id": a_id,
            "date": f"2026-09-{np.random.randint(1, 29):02d}",
            "category": np.random.choice(complaint_categories),
            "severity": "HIGH" if asset["traffic_level"] >= 4 else "MEDIUM",
            "status": np.random.choice(["PENDING", "IN_REVIEW", "RESOLVED"], p=[0.4, 0.4, 0.2])
        })
        c_id += 1

    # Inspection records
    seed_inspections.append({
        "inspection_id": f"INS-{i_id:04d}",
        "asset_id": a_id,
        "date": f"2026-08-{np.random.randint(1, 29):02d}",
        "score": float(asset["condition_score"]),
        "defect_type": "Normal Aging" if asset["condition_score"] > 75 else np.random.choice(defect_types),
        "notes": f"Inspection completed for {asset['name']}. Visual distress score: {asset['condition_score']}."
    })
    i_id += 1

with open("backend/data/seed/maintenance.json", "w", encoding="utf-8") as f:
    json.dump(seed_maintenance, f, indent=2)

with open("backend/data/seed/complaints.json", "w", encoding="utf-8") as f:
    json.dump(seed_complaints, f, indent=2)

with open("backend/data/seed/inspections.json", "w", encoding="utf-8") as f:
    json.dump(seed_inspections, f, indent=2)

print("Generated train.csv, test.csv, assets.json, maintenance.json, complaints.json, and inspections.json.")