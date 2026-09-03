import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)


# -----------------------------
# 1. Load historical data
# -----------------------------

DATA_PATH = "ml/notebooks/10_historical_failure_records.csv"

df = pd.read_csv(DATA_PATH)

# Remove accidental whitespace from column names
df.columns = df.columns.str.strip()


# -----------------------------
# 2. Select features and label
# -----------------------------

features = [
    "age_at_failure",
    "days_since_last_maintenance",
    "overdue_days_at_failure",
    "prior_failure_count",
    "traffic_load_at_time"
]

X = df[features]
y = df["failed"]


# -----------------------------
# 3. Train / test split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# -----------------------------
# 4. Scale features
# -----------------------------

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# -----------------------------
# 5. Train Logistic Regression
# -----------------------------

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

model.fit(X_train_scaled, y_train)


# -----------------------------
# 6. Evaluate
# -----------------------------

y_pred = model.predict(X_test_scaled)
y_probability = model.predict_proba(X_test_scaled)[:, 1]

print("=== Risk Model Evaluation ===")

print("Precision:", precision_score(y_test, y_pred))
print("Recall:", recall_score(y_test, y_pred))
print("F1:", f1_score(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_probability))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# -----------------------------
# 7. Save model + scaler
# -----------------------------

MODEL_PATH = "ml/risk_model.pkl"
SCALER_PATH = "ml/risk_scaler.pkl"

joblib.dump(model, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

print("\nModel saved to:", MODEL_PATH)
print("Scaler saved to:", SCALER_PATH)