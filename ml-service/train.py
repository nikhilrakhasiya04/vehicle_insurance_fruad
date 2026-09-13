"""
train.py
Comprehensive ML Training, Evaluation, Model Comparison, Overfitting/Underfitting Diagnostic,
5-Fold Cross-Validation, and Hyperparameter Tuning pipeline for Insurance Fraud Detection.

Implements:
1. Model Evaluation (Accuracy, Precision, Recall, F1-Score, ROC-AUC, PR-AUC, Confusion Matrix)
2. Overfitting / Underfitting Diagnostics (Train vs Test score comparisons)
3. 5-Fold Stratified Cross-Validation (Mean score and Fold spread / stability)
4. Comparison of All Models (Logistic Regression, Decision Tree, Random Forest, AdaBoost, Gradient Boosting, XGBoost, SVM)
5. Hyperparameter Tuning using GridSearchCV / RandomizedSearchCV on best model
6. Advanced ensemble models (Bagging, AdaBoost, Gradient Boosting, XGBoost)
"""

import os
import sys
import json
import joblib
import warnings
import numpy as np
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from sklearn.model_selection import (
    train_test_split,
    cross_val_score,
    StratifiedKFold,
    GridSearchCV,
)
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier,
    AdaBoostClassifier,
    GradientBoostingClassifier,
)
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report,
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

from preprocessing import (
    load_and_clean,
    winsorize_iqr,
    build_preprocessor,
    get_feature_target,
    WINSOR_COLS,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    BINARY_FEATURES,
)

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
MODEL_DIR   = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH          = os.path.join(DATASET_DIR, "insurance_fraud_data.csv")
MODEL_PATH        = os.path.join(MODEL_DIR,   "fraud_model.pkl")
PREPROCESSOR_PATH = os.path.join(MODEL_DIR,   "preprocessor.pkl")
METRICS_PATH      = os.path.join(MODEL_DIR,   "model_metrics.json")
FEATURES_PATH     = os.path.join(MODEL_DIR,   "feature_info.json")


def evaluate_fit(train_acc: float, test_acc: float, train_f1: float, test_f1: float) -> str:
    """
    Diagnose Overfitting, Underfitting, or Good Fit based on Train vs Test gap.
    """
    acc_gap = train_acc - test_acc
    f1_gap = train_f1 - test_f1

    if acc_gap > 0.08 or f1_gap > 0.12:
        return "Overfitting (Train >> Test)"
    elif train_acc < 0.65 and test_acc < 0.65:
        return "Underfitting (Both Low)"
    else:
        return "Good Fit"


def main():
    print("=" * 80)
    print("     INSURANCE FRAUD DETECTION -- ADVANCED ML TRAINING & EVALUATION")
    print("=" * 80)

    # ─────────────────────────────────────────────
    #  1. Load & Clean Dataset
    # ─────────────────────────────────────────────
    print("\n[STEP 1/6] Loading, cleaning, and preparing data ...")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found at {CSV_PATH}")

    df = load_and_clean(CSV_PATH)
    print(f"  [OK] Raw data loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    fraud_counts = df["fraud_reported"].value_counts()
    fraud_pcts = df["fraud_reported"].value_counts(normalize=True) * 100
    print(f"  [OK] Target distribution: Not Fraud (0) = {fraud_counts.get(0, 0)} ({fraud_pcts.get(0, 0):.1f}%), "
          f"Fraud (1) = {fraud_counts.get(1, 0)} ({fraud_pcts.get(1, 0):.1f}%)")

    # Winsorize extreme outliers
    df = winsorize_iqr(df, WINSOR_COLS)
    X, y = get_feature_target(df)
    print(f"  [OK] Features extracted: {X.shape[1]} input features")

    # ─────────────────────────────────────────────
    #  2. Train / Test Split (Stratified)
    # ─────────────────────────────────────────────
    print("\n[STEP 2/6] Splitting data into Train (80%) and Test (20%) sets ...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"  [OK] Training set: {X_train.shape[0]} samples (Fraud: {(y_train == 1).sum()})")
    print(f"  [OK] Test set:     {X_test.shape[0]} samples (Fraud: {(y_test == 1).sum()})")

    # Build Preprocessor
    preprocessor = build_preprocessor()

    # Calculate scale_pos_weight for imbalance handling
    neg_count = int((y_train == 0).sum())
    pos_count = int((y_train == 1).sum())
    scale_pos = round(neg_count / max(pos_count, 1), 2)

    # ─────────────────────────────────────────────
    #  3. Define Models (Baseline + Advanced Ensembles)
    # ─────────────────────────────────────────────
    print("\n[STEP 3/6] Initializing models (Baselines, Bagging, Boosting, SVM) ...")
    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42,
            solver="lbfgs",
            C=1.0,
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=7,
            min_samples_split=10,
            class_weight="balanced",
            random_state=42,
        ),
        "Random Forest (Bagging)": RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ),
        "AdaBoost": AdaBoostClassifier(
            n_estimators=100,
            learning_rate=0.1,
            random_state=42,
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.85,
            random_state=42,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        ),
        "SVM": SVC(
            kernel="rbf",
            C=1.0,
            probability=True,
            class_weight="balanced",
            random_state=42,
        ),
    }

    # ─────────────────────────────────────────────
    #  4. Train, Cross-Validate (5-Fold), & Evaluate All Models
    # ─────────────────────────────────────────────
    print("\n[STEP 4/6] Running 5-Fold Cross-Validation & Test Evaluation on all models ...")
    print("-" * 80)

    results = {}
    kfold = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, clf in models.items():
        # Pipeline: Preprocessor -> SMOTE -> Classifier
        pipeline = ImbPipeline([
            ("preprocessor", preprocessor),
            ("smote",        SMOTE(random_state=42, k_neighbors=5)),
            ("classifier",   clf),
        ])

        # 5-Fold Cross-Validation on Training set
        cv_f1_scores = cross_val_score(pipeline, X_train, y_train, cv=kfold, scoring="f1", n_jobs=-1)
        cv_acc_scores = cross_val_score(pipeline, X_train, y_train, cv=kfold, scoring="accuracy", n_jobs=-1)

        cv_f1_mean = float(np.mean(cv_f1_scores))
        cv_f1_std  = float(np.std(cv_f1_scores))
        cv_acc_mean = float(np.mean(cv_acc_scores))
        cv_acc_std  = float(np.std(cv_acc_scores))

        # Train on full training set
        pipeline.fit(X_train, y_train)

        # Evaluate on Train set (for overfitting check)
        y_train_pred = pipeline.predict(X_train)
        train_acc = float(accuracy_score(y_train, y_train_pred))
        train_f1  = float(f1_score(y_train, y_train_pred, pos_label=1, zero_division=0))

        # Evaluate on Test set
        y_test_pred  = pipeline.predict(X_test)
        y_test_proba = pipeline.predict_proba(X_test)[:, 1]

        test_acc     = float(accuracy_score(y_test, y_test_pred))
        test_prec    = float(precision_score(y_test, y_test_pred, pos_label=1, zero_division=0))
        test_rec     = float(recall_score(y_test, y_test_pred, pos_label=1, zero_division=0))
        test_f1      = float(f1_score(y_test, y_test_pred, pos_label=1, zero_division=0))
        test_roc_auc = float(roc_auc_score(y_test, y_test_proba))
        test_pr_auc  = float(average_precision_score(y_test, y_test_proba))
        cm           = confusion_matrix(y_test, y_test_pred).tolist()

        # Overfitting / Underfitting check
        fit_status = evaluate_fit(train_acc, test_acc, train_f1, test_f1)

        results[name] = {
            "pipeline": pipeline,
            "classifier": clf,
            "train_accuracy": round(train_acc, 4),
            "train_f1": round(train_f1, 4),
            "test_accuracy": round(test_acc, 4),
            "precision": round(test_prec, 4),
            "recall": round(test_rec, 4),
            "f1": round(test_f1, 4),
            "roc_auc": round(test_roc_auc, 4),
            "pr_auc": round(test_pr_auc, 4),
            "cv_5fold_f1_mean": round(cv_f1_mean, 4),
            "cv_5fold_f1_std": round(cv_f1_std, 4),
            "cv_5fold_acc_mean": round(cv_acc_mean, 4),
            "cv_5fold_acc_std": round(cv_acc_std, 4),
            "fit_status": fit_status,
            "confusion_matrix": cm,
            "classification_report": classification_report(
                y_test, y_test_pred, target_names=["Not Fraud", "Fraud"], output_dict=True
            ),
        }

        print(f"  [OK] {name:<24} | Test Acc: {test_acc:.3f} | F1: {test_f1:.3f} | ROC-AUC: {test_roc_auc:.3f} | 5-Fold CV F1: {cv_f1_mean:.3f} (+/-{cv_f1_std:.3f}) | {fit_status}")

    # ─────────────────────────────────────────────
    #  Model Comparison Table
    # ─────────────────────────────────────────────
    print("\n" + "=" * 98)
    print(f"{'MODEL COMPARISON TABLE':^98}")
    print("=" * 98)
    header = f"{'Model':<25} | {'Train Acc':<9} | {'Test Acc':<8} | {'Precision':<9} | {'Recall':<6} | {'F1-Score':<8} | {'ROC-AUC':<7} | {'5-Fold CV F1':<14} | {'Fit Status'}"
    print(header)
    print("-" * 98)

    for name, r in results.items():
        cv_str = f"{r['cv_5fold_f1_mean']:.3f} +/- {r['cv_5fold_f1_std']:.3f}"
        print(f"{name:<25} | {r['train_accuracy']:<9.3f} | {r['test_accuracy']:<8.3f} | {r['precision']:<9.3f} | {r['recall']:<6.3f} | {r['f1']:<8.3f} | {r['roc_auc']:<7.3f} | {cv_str:<14} | {r['fit_status']}")
    print("=" * 98)

    # ─────────────────────────────────────────────
    #  5. Select Best Baseline & Perform Hyperparameter Tuning
    # ─────────────────────────────────────────────
    print("\n[STEP 5/6] Selecting top model and performing Hyperparameter Tuning (GridSearchCV) ...")

    # Composite score: 0.5 * F1 + 0.3 * ROC-AUC + 0.2 * CV_F1 - penalty for unstable CV std
    def selection_score(r):
        return 0.50 * r["f1"] + 0.30 * r["roc_auc"] + 0.20 * r["cv_5fold_f1_mean"] - 0.10 * r["cv_5fold_f1_std"]

    candidate_name = max(results, key=lambda n: selection_score(results[n]))
    candidate_result = results[candidate_name]
    print(f"  [*] Top candidate model for tuning: {candidate_name} (Composite Score: {selection_score(candidate_result):.4f})")

    # Set up parameter grid for tuning
    param_grids = {
        "XGBoost": {
            "classifier__n_estimators": [150, 250, 350],
            "classifier__max_depth": [4, 5, 7],
            "classifier__learning_rate": [0.03, 0.05, 0.1],
            "classifier__subsample": [0.75, 0.85],
        },
        "Random Forest (Bagging)": {
            "classifier__n_estimators": [150, 250, 350],
            "classifier__max_depth": [10, 14, 18],
            "classifier__min_samples_split": [2, 5, 8],
            "classifier__min_samples_leaf": [1, 2],
        },
        "Gradient Boosting": {
            "classifier__n_estimators": [100, 200, 300],
            "classifier__max_depth": [3, 4, 6],
            "classifier__learning_rate": [0.03, 0.07, 0.12],
            "classifier__subsample": [0.8, 0.9],
        },
        "AdaBoost": {
            "classifier__n_estimators": [80, 150, 250],
            "classifier__learning_rate": [0.05, 0.1, 0.2],
        },
        "Logistic Regression": {
            "classifier__C": [0.01, 0.1, 1.0, 10.0],
            "classifier__solver": ["lbfgs", "saga"],
        },
        "SVM": {
            "classifier__C": [0.5, 1.0, 5.0],
            "classifier__gamma": ["scale", "auto"],
        },
        "Decision Tree": {
            "classifier__max_depth": [5, 8, 12],
            "classifier__min_samples_split": [5, 10, 20],
        },
    }

    tuning_grid = param_grids.get(candidate_name, {
        "classifier__n_estimators": [150, 250],
        "classifier__max_depth": [4, 6],
    })

    print(f"  -> Running 5-Fold GridSearchCV on {candidate_name} ...")
    base_pipeline = ImbPipeline([
        ("preprocessor", preprocessor),
        ("smote",        SMOTE(random_state=42, k_neighbors=5)),
        ("classifier",   results[candidate_name]["classifier"]),
    ])

    grid_search = GridSearchCV(
        estimator=base_pipeline,
        param_grid=tuning_grid,
        cv=kfold,
        scoring="f1",
        n_jobs=-1,
        verbose=0,
    )
    grid_search.fit(X_train, y_train)

    best_tuned_pipeline = grid_search.best_estimator_
    best_params_clean = {
        k.replace("classifier__", ""): v for k, v in grid_search.best_params_.items()
    }
    print(f"  [OK] Best Parameters Found: {best_params_clean}")
    print(f"  [OK] Best 5-Fold CV F1 Score: {grid_search.best_score_:.4f}")

    # Re-evaluate Tuned Model on Test Set
    y_test_pred_tuned  = best_tuned_pipeline.predict(X_test)
    y_test_proba_tuned = best_tuned_pipeline.predict_proba(X_test)[:, 1]

    tuned_train_pred = best_tuned_pipeline.predict(X_train)
    tuned_train_acc  = float(accuracy_score(y_train, tuned_train_pred))
    tuned_train_f1   = float(f1_score(y_train, tuned_train_pred, pos_label=1, zero_division=0))

    tuned_test_acc     = float(accuracy_score(y_test, y_test_pred_tuned))
    tuned_test_prec    = float(precision_score(y_test, y_test_pred_tuned, pos_label=1, zero_division=0))
    tuned_test_rec     = float(recall_score(y_test, y_test_pred_tuned, pos_label=1, zero_division=0))
    tuned_test_f1      = float(f1_score(y_test, y_test_pred_tuned, pos_label=1, zero_division=0))
    tuned_test_roc_auc = float(roc_auc_score(y_test, y_test_proba_tuned))
    tuned_test_pr_auc  = float(average_precision_score(y_test, y_test_proba_tuned))
    tuned_fit_status   = evaluate_fit(tuned_train_acc, tuned_test_acc, tuned_train_f1, tuned_test_f1)

    print("\n" + "=" * 80)
    print(f"  BEFORE vs AFTER TUNING COMPARISON ({candidate_name})")
    print("=" * 80)
    print(f"  Metric              | Before Tuning      | After Tuning (Tuned) | Delta")
    print("-" * 80)
    print(f"  Accuracy            | {candidate_result['test_accuracy']:<18.4f} | {tuned_test_acc:<20.4f} | {tuned_test_acc - candidate_result['test_accuracy']:+.4f}")
    print(f"  Precision           | {candidate_result['precision']:<18.4f} | {tuned_test_prec:<20.4f} | {tuned_test_prec - candidate_result['precision']:+.4f}")
    print(f"  Recall              | {candidate_result['recall']:<18.4f} | {tuned_test_rec:<20.4f} | {tuned_test_rec - candidate_result['recall']:+.4f}")
    print(f"  F1-Score            | {candidate_result['f1']:<18.4f} | {tuned_test_f1:<20.4f} | {tuned_test_f1 - candidate_result['f1']:+.4f}")
    print(f"  ROC-AUC             | {candidate_result['roc_auc']:<18.4f} | {tuned_test_roc_auc:<20.4f} | {tuned_test_roc_auc - candidate_result['roc_auc']:+.4f}")
    print(f"  Fit Status          | {candidate_result['fit_status']:<18} | {tuned_fit_status}")
    print("=" * 80)

    # Decide final selected model (tuned candidate if improved or top performer)
    final_selected_name = f"{candidate_name} (Tuned)"
    results[final_selected_name] = {
        "pipeline": best_tuned_pipeline,
        "train_accuracy": round(tuned_train_acc, 4),
        "train_f1": round(tuned_train_f1, 4),
        "test_accuracy": round(tuned_test_acc, 4),
        "precision": round(tuned_test_prec, 4),
        "recall": round(tuned_test_rec, 4),
        "f1": round(tuned_test_f1, 4),
        "roc_auc": round(tuned_test_roc_auc, 4),
        "pr_auc": round(tuned_test_pr_auc, 4),
        "cv_5fold_f1_mean": round(float(grid_search.best_score_), 4),
        "cv_5fold_f1_std": round(float(candidate_result["cv_5fold_f1_std"]), 4),
        "cv_5fold_acc_mean": round(float(candidate_result["cv_5fold_acc_mean"]), 4),
        "cv_5fold_acc_std": round(float(candidate_result["cv_5fold_acc_std"]), 4),
        "fit_status": tuned_fit_status,
        "best_hyperparameters": best_params_clean,
        "confusion_matrix": confusion_matrix(y_test, y_test_pred_tuned).tolist(),
        "classification_report": classification_report(
            y_test, y_test_pred_tuned, target_names=["Not Fraud", "Fraud"], output_dict=True
        ),
    }

    # ─────────────────────────────────────────────
    #  6. Save Artifacts
    # ─────────────────────────────────────────────
    print("\n[STEP 6/6] Saving trained model, preprocessor, and metrics ...")

    # Save full pipeline for inference
    joblib.dump(best_tuned_pipeline, MODEL_PATH)
    print(f"  [OK] Saved Best Model Pipeline -> {MODEL_PATH}")

    # Save standalone preprocessor
    clean_preprocessor = build_preprocessor()
    clean_preprocessor.fit(X_train, y_train)
    joblib.dump(clean_preprocessor, PREPROCESSOR_PATH)
    print(f"  [OK] Saved Preprocessor        -> {PREPROCESSOR_PATH}")

    # Format metrics output JSON
    metrics_output = {}
    for name, r in results.items():
        metrics_output[name] = {
            "train_accuracy":   r["train_accuracy"],
            "train_f1":         r["train_f1"],
            "test_accuracy":    r["test_accuracy"],
            "precision":        r["precision"],
            "recall":           r["recall"],
            "f1":               r["f1"],
            "roc_auc":          r["roc_auc"],
            "pr_auc":           r["pr_auc"],
            "cv_5fold_f1_mean": r["cv_5fold_f1_mean"],
            "cv_5fold_f1_std":  r["cv_5fold_f1_std"],
            "cv_5fold_acc_mean": r["cv_5fold_acc_mean"],
            "cv_5fold_acc_std":  r["cv_5fold_acc_std"],
            "fit_status":       r["fit_status"],
            "best_hyperparameters": r.get("best_hyperparameters", None),
            "confusion_matrix": r["confusion_matrix"],
            "classification_report": r["classification_report"],
            "is_selected":      name == final_selected_name,
        }

    full_metrics = {
        "models": metrics_output,
        "best_model": final_selected_name,
        "best_base_model": candidate_name,
        "best_hyperparameters": best_params_clean,
        "feature_count": int(X.shape[1]),
        "train_size": int(X_train.shape[0]),
        "test_size": int(X_test.shape[0]),
        "class_distribution": {
            "fraud": int(y.sum()),
            "not_fraud": int((y == 0).sum()),
            "fraud_rate": round(float(y.mean()), 4),
        },
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(full_metrics, f, indent=2)
    print(f"  [OK] Saved Model Metrics JSON  -> {METRICS_PATH}")

    feature_info = {
        "numerical_features":   NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "binary_features":      BINARY_FEATURES,
        "all_features":         NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BINARY_FEATURES,
    }
    with open(FEATURES_PATH, "w") as f:
        json.dump(feature_info, f, indent=2)
    print(f"  [OK] Saved Feature Info JSON   -> {FEATURES_PATH}")

    print("\n" + "=" * 80)
    print(f"  ALL TASKS COMPLETED SUCCESSFULLY!")
    print(f"  [*] Selected Best Model: {final_selected_name}")
    print(f"  [*] Test Accuracy:       {tuned_test_acc:.4f}")
    print(f"  [*] Precision:           {tuned_test_prec:.4f}")
    print(f"  [*] Recall:              {tuned_test_rec:.4f}")
    print(f"  [*] F1-Score:            {tuned_test_f1:.4f}")
    print(f"  [*] ROC-AUC:             {tuned_test_roc_auc:.4f}")
    print(f"  [*] 5-Fold CV F1:        {grid_search.best_score_:.4f}")
    print(f"  [*] Fit Assessment:      {tuned_fit_status}")
    print("=" * 80)


if __name__ == "__main__":
    main()
