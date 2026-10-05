import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# 1. Load train and test splits
train_df = pd.read_csv("backend/data/processed/train.csv")
test_df = pd.read_csv("backend/data/processed/test.csv")

# 2. Map categorical surface type to numeric encoding
surface_mapping = {"asphalt": 0, "concrete": 1, "composite": 2}
train_df["surface_type"] = train_df["surface_type"].map(surface_mapping)
test_df["surface_type"] = test_df["surface_type"].map(surface_mapping)

feature_cols = [
    "age_years",
    "surface_type",
    "traffic_level",
    "condition_score",
    "pothole_count",
    "previous_repairs",
    "days_since_last_repair",
    "rainfall_30d_mm",
    "complaints_30d",
    "overdue_inspection"
]

X_train = train_df[feature_cols]
y_train = train_df["target_30d"]

X_test = test_df[feature_cols]
y_test = test_df["target_30d"]

# 3. Train Random Forest Classifier
print("Training Random Forest model (100 estimators)...")
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=6,
    min_samples_split=5,
    random_state=42,
    class_weight="balanced"
)
rf.fit(X_train, y_train)

# 4. Evaluate on held-out test data
y_pred = rf.predict(X_test)
y_prob = rf.predict_proba(X_test)[:, 1]

metrics = {
    "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
    "precision": round(float(precision_score(y_test, y_pred)), 4),
    "recall": round(float(recall_score(y_test, y_pred)), 4),
    "f1_score": round(float(f1_score(y_test, y_pred)), 4),
    "roc_auc": round(float(roc_auc_score(y_test, y_prob)), 4)
}

# 5. Extract Feature Importances for Explainability
importances = dict(zip(feature_cols, [round(float(v), 4) for v in rf.feature_importances_]))
sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

print("\n--- MODEL EVALUATION METRICS ---")
for k, v in metrics.items():
    print(f"  {k.upper()}: {v * 100:.2f}%" if k != "roc_auc" else f"  {k.upper()}: {v:.4f}")

print("\n--- TOP 5 FEATURE IMPORTANCES (EXPLAINABILITY) ---")
for feat, imp in list(sorted_importances.items())[:5]:
    print(f"  {feat}: {imp * 100:.2f}% contribution")

# 6. Save Model Artifacts
joblib.dump(rf, "backend/app/ml/model.pkl")

with open("backend/app/ml/metrics.json", "w", encoding="utf-8") as f:
    json.dump({
        "metrics": metrics,
        "feature_importances": sorted_importances,
        "features": feature_cols,
        "model_version": "rf_v1.0"
    }, f, indent=2)

print("\nSaved model to backend/app/ml/model.pkl")
print("Saved evaluation metrics to backend/app/ml/metrics.json")
