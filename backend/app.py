from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import joblib
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080", "http://127.0.0.1:8080"])  # Enable CORS for frontend

# ===================== Configuration =====================
MODEL_PATH = "xgb_model.pkl"
SCALER_PATH = "scaler.pkl"
DATA_CSV = "all_data.csv"
KEPLER_DATASET = "Kepler_DataSet.csv"
Keplar_Test_Dataset = "keplartest.csv"
METRICS_PATH = "metrics.json"
UPDATE_THRESHOLD = 200  # Number of new rows required to retrain

# ===================== Feature columns =====================
feature_columns = [
    'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 'koi_fpflag_ec',
    'koi_period', 'koi_impact', 'koi_duration', 'koi_depth',
    'koi_prad', 'koi_teq', 'koi_insol', 'koi_model_snr',
    'koi_steff', 'koi_slogg', 'koi_srad', 'koi_kepmag'
]

# Label mappings
LABEL_MAP = {'CONFIRMED': 2, 'CANDIDATE': 1, 'FALSE POSITIVE': 0}
REVERSE_LABEL_MAP = {0: 'FALSE POSITIVE', 1: 'CANDIDATE', 2: 'CONFIRMED'}

# Global variables
model = None
scaler = None
all_data = pd.DataFrame()
new_data_buffer = pd.DataFrame()
current_metrics = {}
test_data = pd.DataFrame()

# ===================== Initialization =====================
def initialize_system():
    """Initialize or load existing model and data"""
    global model, scaler, all_data, new_data_buffer, current_metrics, test_data
    new_data_buffer = pd.DataFrame(columns=feature_columns + ['label'])
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("✔ Model and scaler loaded successfully")
    else:
        model = XGBClassifier(objective='multi:softmax', num_class=3, eval_metric='mlogloss', random_state=42, n_estimators=100, max_depth=5)
        scaler = StandardScaler()
        print("⚠ No pre-trained model found, created new model")
    # Load test data if available
    if os.path.exists(Keplar_Test_Dataset):
        test_data = pd.read_csv(Keplar_Test_Dataset)
        if len(test_data) > 0 and 'koi_disposition' in test_data.columns:
            test_data['label'] = test_data['koi_disposition'].map(LABEL_MAP)
            test_data = test_data.dropna(subset=['label'])
            available_features = [col for col in feature_columns if col in test_data.columns]
            test_data = test_data[available_features + ['label']].copy()
            for col in feature_columns:
                if col not in test_data.columns:
                    test_data[col] = 0
            test_data = test_data[feature_columns + ['label']]
            test_data = test_data.dropna(subset=feature_columns)
            print(f"✔ Loaded {len(test_data)} test rows from {Keplar_Test_Dataset}")
        else:
            test_data = pd.DataFrame()
            print(f"⚠ Test dataset exists but has no valid data")
    else:
        test_data = pd.DataFrame()
        print(f"⚠ No test dataset found at {Keplar_Test_Dataset}")

    if os.path.exists(DATA_CSV):
        all_data = pd.read_csv(DATA_CSV)
        print(f"✔ Loaded {len(all_data)} rows from {DATA_CSV}")
    elif os.path.exists(KEPLER_DATASET):
        print(f"✔ Initializing with Kepler dataset...")
        all_data = pd.read_csv(KEPLER_DATASET)
        if len(all_data) > 0 and 'koi_disposition' in all_data.columns:
            all_data['label'] = all_data['koi_disposition'].map(LABEL_MAP)
            all_data = all_data.dropna(subset=['label'])
            
            available_features = [col for col in feature_columns if col in all_data.columns]
            all_data = all_data[available_features + ['label']].copy()
            for col in feature_columns:
                if col not in all_data.columns:
                    all_data[col] = 0
            all_data = all_data[feature_columns + ['label']]
            rows_before = len(all_data)
            all_data = all_data.dropna(subset=feature_columns)
            print(f"⚠ Removed {rows_before - len(all_data)} rows with missing features")
            all_data.to_csv(DATA_CSV, index=False)
            print(f"✔ Prepared {len(all_data)} rows for training")
            if len(all_data) > 0:
                retrain_model()
    else:
        all_data = pd.DataFrame(columns=feature_columns + ['label'])
        print("⚠ No existing data found, starting with empty dataset")
    if os.path.exists(METRICS_PATH):
        import json
        with open(METRICS_PATH, 'r') as f:
            current_metrics = json.load(f)
        print(f"✔ Loaded metrics")
    else:
        current_metrics = {'accuracy': None, 'last_updated': None, 'total_samples': len(all_data)}

# ===================== Validation Functions =====================
def validate_csv_structure(df):
    """Validate CSV has correct structure for training"""
    errors = []
    
    # Check if CSV has proper headers
    if len(df.columns) == 0:
        errors.append("CSV file appears to be empty or has no column headers")
        return errors
    
    # Check for label column
    if 'label' not in df.columns and 'koi_disposition' not in df.columns:
        errors.append("CSV must include 'label' or 'koi_disposition' column")
        errors.append("Expected columns: " + ", ".join(feature_columns[:5]) + "...")
        errors.append("Your columns: " + ", ".join(df.columns[:5]) + "...")
    
    # Check for feature columns
    available_features = [col for col in feature_columns if col in df.columns]
    if len(available_features) < len(feature_columns) * 0.3:
        errors.append(f"CSV must contain at least {int(len(feature_columns)*0.3)} of the required feature columns")
        errors.append(f"Found {len(available_features)}/{len(feature_columns)} required features")
        errors.append("Missing features: " + ", ".join([col for col in feature_columns if col not in df.columns][:5]) + "...")
    
    return errors

def validate_manual_input(data):
    """Validate manual prediction input"""
    if not data: return ["No input data provided"]
    feature_count = sum(1 for col in feature_columns if col in data and data[col] != '')
    if feature_count < len(feature_columns) * 0.5:
        return [f"At least {int(len(feature_columns)*0.5)} features must be provided"]
    return []

# ===================== Data Processing & Model Training =====================
def process_uploaded_csv(df):
    """Process and standardize uploaded CSV with STRICT missing value handling"""
    print(f"📊 Processing CSV with {len(df)} rows and {len(df.columns)} columns")
    print(f"📋 Column names: {list(df.columns)[:10]}...")  # Show first 10 columns
    
    # Remove completely empty rows
    df_processed = df.copy().dropna(how='all')
    print(f"📊 After removing empty rows: {len(df_processed)} rows")
    
    # Check if we have any valid data
    if len(df_processed) == 0:
        print("✖ No valid data rows found")
        return df_processed
    
    # Handle missing column headers - try to detect if first row is data instead of headers
    if len(df_processed.columns) > 0 and str(df_processed.columns[0]).startswith('Unnamed'):
        print("⚠ Detected unnamed columns - CSV may be missing headers")
        return pd.DataFrame()  # Return empty DataFrame to trigger validation error
    
    # Check for feature columns
    feature_cols_present = [col for col in feature_columns if col in df_processed.columns]
    print(f"📊 Found {len(feature_cols_present)}/{len(feature_columns)} required feature columns")
    
    if len(feature_cols_present) == 0:
        print("✖ No required feature columns found")
        return pd.DataFrame()
    
    # Remove rows where all present features are missing
    if feature_cols_present:
        df_processed = df_processed.dropna(subset=feature_cols_present, how='all')
        print(f"📊 After removing rows with all missing features: {len(df_processed)} rows")
    
    # Handle label column
    if 'koi_disposition' in df_processed.columns and 'label' not in df_processed.columns:
        df_processed['label'] = df_processed['koi_disposition'].map(LABEL_MAP)
        print("📊 Mapped 'koi_disposition' to 'label' column")
    
    # Remove rows without labels
    df_processed = df_processed.dropna(subset=['label'])
    print(f"📊 After removing rows without labels: {len(df_processed)} rows")
    
    if len(df_processed) == 0:
        print("✖ No rows with valid labels found")
        return df_processed
    
    # Select available features and add missing ones
    available_features = [col for col in feature_columns if col in df_processed.columns]
    df_processed = df_processed[available_features + ['label']].copy()
    
    # Add missing feature columns with default values
    for col in feature_columns:
        if col not in df_processed.columns:
            df_processed[col] = 0
            print(f"📊 Added missing column '{col}' with default value 0")
    
    df_processed = df_processed[feature_columns + ['label']].copy()
    
    # Final cleanup - remove rows with any missing features
    rows_before = len(df_processed)
    df_processed = df_processed.dropna(subset=feature_columns)
    if (rows_before - len(df_processed)) > 0:
        print(f"⚠ Removed {rows_before - len(df_processed)} rows with missing feature values")
    
    # ✅ Ensure consistent column order before returning
    df_processed = df_processed.reindex(columns=feature_columns + ['label'])
    
    # Save clean copy for debugging
    df_processed.to_csv("processed.csv", index=False)
    print(f"✅ Final processed data: {len(df_processed)} rows")
    print("📋 Final columns:", list(df_processed.columns))
    return df_processed


def retrain_model():
    """Retrain the model on all available data"""
    global model, scaler, all_data, current_metrics
    if len(all_data) < 10:
        print("✖ Not enough data to train model (minimum 10 samples required)")
        return None
    try:
        X = all_data[feature_columns].astype(float)
        y = all_data['label'].values.astype(int)
        X_scaled = scaler.fit_transform(X)
        model.fit(X_scaled, y)
        y_pred = model.predict(X_scaled)
        accuracy = accuracy_score(y, y_pred)
        report = classification_report(y, y_pred, output_dict=True, zero_division=0)
        current_metrics = {
            'accuracy': round(accuracy, 4), 'last_updated': datetime.now().isoformat(), 'total_samples': len(all_data),
            'class_distribution': {'CONFIRMED': int(np.sum(y == 2)), 'CANDIDATE': int(np.sum(y == 1)), 'FALSE_POSITIVE': int(np.sum(y == 0))},
            'classification_report': {'precision': round(report['weighted avg']['precision'], 4), 'recall': round(report['weighted avg']['recall'], 4), 'f1_score': round(report['weighted avg']['f1-score'], 4)}
        }
        joblib.dump(model, MODEL_PATH); joblib.dump(scaler, SCALER_PATH)
        all_data.to_csv(DATA_CSV, index=False)
        import json
        with open(METRICS_PATH, 'w') as f: json.dump(current_metrics, f, indent=2)
        print(f"✔ Model retrained successfully! Accuracy: {accuracy:.4f}, Total samples: {len(all_data)}")
        return accuracy
    except Exception as e:
        print(f"✖ Error retraining model: {str(e)}")
        return None

# ===================== API Endpoints =====================

@app.route('/predict_manual', methods=['POST'])
def predict_manual():
    """Predict from manual user input"""
    if model is None or scaler is None: return jsonify({"error": "Model not trained yet."}), 400
    try:
        data = request.json
        validation_errors = validate_manual_input(data)
        if validation_errors: return jsonify({"error": "Validation failed", "details": validation_errors}), 400
        transformed_data = {col: float(data[col]) for col in feature_columns if col in data and data[col] != ''}
        df = pd.DataFrame([transformed_data])
        X_new = df.reindex(columns=feature_columns).fillna(all_data[feature_columns].median() if len(all_data) > 0 else 0).astype(float)
        X_scaled = scaler.transform(X_new)
        pred = model.predict(X_scaled)[0]
        proba = model.predict_proba(X_scaled)[0]
        prediction_label = REVERSE_LABEL_MAP.get(int(pred), 'UNKNOWN')
        confidence = float(proba[int(pred)] * 100)
        eq_temp = transformed_data.get('koi_teq', 0); planet_radius = transformed_data.get('koi_prad', 0)
        is_habitable = (180 <= eq_temp <= 310) and (0.5 <= planet_radius <= 2.0)
        
        habitable_zone = "Too Cold" if eq_temp < 180 else "Too Hot" if eq_temp > 310 else "Outer Edge" if 180 <= eq_temp <= 245 else "Inner Edge"

        result = {
        "prediction_label": prediction_label, "confidence": round(confidence, 1), "is_exoplanet": bool(int(pred) > 0),
         "is_habitable": bool(is_habitable), "habitable_zone": habitable_zone,
        "probabilities": {"false_positive": round(float(proba[0]) * 100, 1), "candidate": round(float(proba[1]) * 100, 1), "confirmed": round(float(proba[2]) * 100, 1)}
        }

        return jsonify(result)
    except Exception as e:
        print(f"✖ Prediction error: {str(e)}"); return jsonify({"error": str(e)}), 400

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """Predict from an uploaded CSV file without labels."""
    if model is None or scaler is None: return jsonify({"error": "Model not trained yet."}), 400
    if 'file' not in request.files: return jsonify({"error": "No CSV file uploaded"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"error": "No file selected"}), 400
    try:
        df = pd.read_csv(file)
        print(f"✔ Received batch prediction request: {len(df)} rows")
        original_df = df.copy()
        existing_features = [col for col in feature_columns if col in df.columns]
        if not existing_features: return jsonify({"error": "CSV must contain at least one valid feature column."}), 400
        
        df_features = df[existing_features].reindex(columns=feature_columns).fillna(
            all_data[feature_columns].median() if len(all_data) > 0 else 0).astype(float)
        
        X_scaled = scaler.transform(df_features)
        predictions = model.predict(X_scaled)
        probabilities = model.predict_proba(X_scaled)

        results = []
        for i in range(len(df)):
            pred = predictions[i]; proba = probabilities[i]
            prediction_label = REVERSE_LABEL_MAP.get(int(pred), 'UNKNOWN')
            confidence = float(proba[int(pred)] * 100)
            eq_temp = df_features.iloc[i].get('koi_teq', 0); planet_radius = df_features.iloc[i].get('koi_prad', 0)
            is_habitable = (180 <= eq_temp <= 310) and (0.5 <= planet_radius <= 2.0)
            habitable_zone = "Too Cold" if eq_temp < 180 else "Too Hot" if eq_temp > 310 else "Outer Edge" if 180 <= eq_temp <= 245 else "Inner Edge"
            results.append({
                "original_data": original_df.iloc[i].to_dict(), "prediction_label": prediction_label,
                "confidence": round(confidence, 1), "is_exoplanet": bool(int(pred) > 0), "is_habitable": bool(is_habitable),
                "habitable_zone": habitable_zone,
                "probabilities": {"false_positive": round(float(proba[0])*100,1), "candidate": round(float(proba[1])*100,1), "confirmed": round(float(proba[2])*100,1)}
            })
        print(f"✔ Batch prediction complete. Returning {len(results)} results.")
        return jsonify(results)
    except Exception as e:
        print(f"✖ Batch prediction error: {str(e)}"); return jsonify({"error": str(e)}), 500

@app.route('/update_model', methods=['POST'])
def update_model():
    """Update dataset with new labeled CSV and retrain if threshold reached."""
    global all_data, new_data_buffer
    if 'file' not in request.files: return jsonify({"error": "No CSV file uploaded"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"error": "No file selected"}), 400
    try:
        print(f"📁 Processing uploaded file: {file.filename}")
        df = pd.read_csv(file)
        print(f"📊 Loaded CSV: {len(df)} rows, {len(df.columns)} columns")
        

        

        df_processed = df

        
        new_data_buffer = pd.concat([new_data_buffer, df_processed], ignore_index=True)
        # ✅ Append processed data
        all_data = pd.concat([all_data, df_processed], ignore_index=True)

        # 🧠 Debug: check structure before saving
        print("\n💾 Preparing to save all_data...")
        print("📋 Columns:", list(all_data.columns))
        print("📊 Sample rows:\n", all_data.head().to_string())

        # ✅ Always save with headers
        all_data.to_csv(DATA_CSV, index=False, header=True)
        print(f"✔ Added {len(df_processed)} rows. Buffer: {len(new_data_buffer)} rows\n")

        
        response_data = {"status": "data_added", "rows_added": len(df_processed), "total_rows": len(all_data), "buffer_rows": len(new_data_buffer), "threshold": UPDATE_THRESHOLD}
        
        if len(new_data_buffer) >= UPDATE_THRESHOLD:
            print(f"✔ Buffer threshold reached. Retraining model...")
            acc = retrain_model()
            if acc is not None:
                new_data_buffer = pd.DataFrame(columns=feature_columns + ['label'])
                response_data.update({"status": "model_retrained", "training_accuracy": round(acc, 4), "buffer_rows": 0, "metrics": current_metrics})
            else:
                response_data["status"] = "data_added_retrain_failed"
        return jsonify(response_data), 200
    except Exception as e:
        print(f"✖ Update error: {str(e)}"); return jsonify({"error": str(e)}), 400

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get comprehensive system statistics"""
    stats = {
        "total_data_rows": len(all_data), "buffer_rows": len(new_data_buffer), "threshold": UPDATE_THRESHOLD,
        "model_exists": os.path.exists(MODEL_PATH), "feature_count": len(feature_columns)
    }
    if len(all_data) > 0 and 'label' in all_data.columns:
        label_dist = all_data['label'].value_counts().to_dict()
        stats["label_distribution"] = {"FALSE_POSITIVE": label_dist.get(0, 0), "CANDIDATE": label_dist.get(1, 0), "CONFIRMED": label_dist.get(2, 0)}
    return jsonify(stats)

@app.route('/accuracy', methods=['GET'])
def get_accuracy():
    """Get current model accuracy from stored metrics"""
    global current_metrics
    if model is None: 
        return jsonify({"accuracy": None})
    
    # Return the accuracy stored in current_metrics (from retrain_model)
    accuracy = current_metrics.get('accuracy')
    if accuracy is not None:
        print(f"✔ Returning stored accuracy: {accuracy}")
        return jsonify({"accuracy": accuracy})
    else:
        print("⚠ No accuracy data available")
        return jsonify({"accuracy": None})

@app.route('/test_accuracy', methods=['GET'])
def get_test_accuracy():
    """Get model accuracy on test dataset"""
    global test_data, current_metrics
    if model is None or len(test_data) == 0: 
        return jsonify({"test_accuracy": None, "message": "No test data available"})
    
    try:
        X = test_data[feature_columns].astype(float)
        y = test_data['label'].values.astype(int)
        test_acc = accuracy_score(y, model.predict(scaler.transform(X)))
        
        print(f"✔ Test accuracy calculated: {test_acc:.4f}")
        return jsonify({"test_accuracy": round(test_acc, 4), "test_samples": len(test_data)})
    except Exception as e:
        print(f"✖ Test accuracy calculation error: {str(e)}")
        return jsonify({"test_accuracy": None, "error": str(e)})

@app.route('/csv_template', methods=['GET'])
def get_csv_template():
    """Get a sample CSV template for training data upload"""
    from flask import Response
    
    # Create a sample row with proper headers
    template_data = {
        'koi_disposition': 'CONFIRMED',
        'koi_fpflag_nt': 0,
        'koi_fpflag_ss': 0,
        'koi_fpflag_co': 0,
        'koi_fpflag_ec': 0,
        'koi_period': 9.48803557,
        'koi_impact': 0.146,
        'koi_duration': 2.9575,
        'koi_depth': 616.0,
        'koi_prad': 2.26,
        'koi_teq': 793.0,
        'koi_insol': 93.59,
        'koi_model_snr': 35.8,
        'koi_steff': 5455.0,
        'koi_slogg': 4.467,
        'koi_srad': 0.927,
        'koi_kepmag': 15.347
    }
    
    # Create CSV content
    csv_content = ','.join(template_data.keys()) + '\n'
    csv_content += ','.join(map(str, template_data.values())) + '\n'
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=training_template.csv'}
    )

# ===================== Main =====================
if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Exoplanet Detection API Starting...")
    print("=" * 60)
    initialize_system()
    print("=" * 60)
    print("✔ System ready!")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
