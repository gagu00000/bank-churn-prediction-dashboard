"""
Machine Learning Model Training Pipeline
Trains multiple models for churn prediction with hyperparameter tuning
Includes: Random Forest, XGBoost, and Neural Network
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, roc_auc_score, classification_report,
    confusion_matrix
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import joblib
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# TensorFlow imports (with fallback)
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, regularizers
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠ TensorFlow not available - Neural Network training will be skipped")


class ChurnModelTrainer:
    """Train and evaluate multiple ML models for churn prediction"""
    
    def __init__(self, data_path: str, models_dir: str = None):
        self.data_path = Path(data_path)
        
        # Dynamic models directory - works for Docker and local
        if models_dir:
            self.models_dir = Path(models_dir)
        elif Path("/app/models").exists():
            self.models_dir = Path("/app/models")
        else:
            # Local development - use project root models folder
            self.models_dir = Path(__file__).resolve().parent.parent / "models"
        
        self.models_dir.mkdir(parents=True, exist_ok=True)
        print(f"📂 Models directory: {self.models_dir}")
        
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.preprocessor = None
        
        self.models = {}
        self.results = {}
        
    def load_and_preprocess_data(self):
        """Load and preprocess the dataset"""
        print("Loading dataset...")
        self.df = pd.read_csv(self.data_path)
        print(f"✓ Loaded {len(self.df)} records")
        
        # Drop unnecessary columns
        drop_cols = ['RowNumber', 'CustomerId', 'Surname']
        self.df = self.df.drop(columns=drop_cols, errors='ignore')
        
        # Separate features and target
        X = self.df.drop('Exited', axis=1)
        y = self.df['Exited']
        
        print(f"\nDataset Info:")
        print(f"  Total samples: {len(self.df)}")
        print(f"  Features: {len(X.columns)}")
        print(f"  Churned: {y.sum()} ({y.mean()*100:.2f}%)")
        print(f"  Not churned: {len(y) - y.sum()} ({(1-y.mean())*100:.2f}%)")
        
        # Encode categorical variables
        categorical_features = ['Geography', 'Gender']
        numerical_features = [col for col in X.columns if col not in categorical_features]
        
        # Create preprocessing pipeline
        from sklearn.preprocessing import OneHotEncoder
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_features),
                ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features)
            ])
        
        # Fit and transform
        X_processed = self.preprocessor.fit_transform(X)
        
        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X_processed, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Handle class imbalance with SMOTE
        print("\nApplying SMOTE for class imbalance...")
        smote = SMOTE(random_state=42)
        self.X_train, self.y_train = smote.fit_resample(self.X_train, self.y_train)
        
        print(f"✓ Train set: {len(self.X_train)} samples")
        print(f"✓ Test set: {len(self.X_test)} samples")
        
        # Save preprocessor
        joblib.dump(self.preprocessor, self.models_dir / "preprocessor.joblib")
        print(f"✓ Saved preprocessor")
        
    def train_random_forest(self):
        """Train Random Forest Classifier"""
        print("\n" + "="*60)
        print("Training Random Forest Classifier...")
        print("="*60)
        
        rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
        
        rf_model.fit(self.X_train, self.y_train)
        self.models['random_forest'] = rf_model
        
        # Evaluate
        y_pred = rf_model.predict(self.X_test)
        y_prob = rf_model.predict_proba(self.X_test)[:, 1]
        
        self.results['random_forest'] = self._evaluate_model(y_pred, y_prob, "Random Forest")
        
        # Save model
        joblib.dump(rf_model, self.models_dir / "random_forest_model.joblib")
        print("✓ Model saved")
        
    def train_xgboost(self):
        """Train XGBoost Classifier"""
        print("\n" + "="*60)
        print("Training XGBoost Classifier...")
        print("="*60)
        
        xgb_model = XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='logloss',
            use_label_encoder=False
        )
        
        xgb_model.fit(self.X_train, self.y_train)
        self.models['xgboost'] = xgb_model
        
        # Evaluate
        y_pred = xgb_model.predict(self.X_test)
        y_prob = xgb_model.predict_proba(self.X_test)[:, 1]
        
        self.results['xgboost'] = self._evaluate_model(y_pred, y_prob, "XGBoost")
        
        # Save model
        joblib.dump(xgb_model, self.models_dir / "xgboost_model.joblib")
        print("✓ Model saved")
    
    def train_neural_network(self):
        """Train Neural Network Classifier using TensorFlow/Keras"""
        if not TF_AVAILABLE:
            print("\n⚠ Skipping Neural Network - TensorFlow not available")
            return
        
        print("\n" + "="*60)
        print("Training Neural Network Classifier...")
        print("="*60)
        
        # Build the model
        input_dim = self.X_train.shape[1]
        
        model = keras.Sequential([
            layers.Input(shape=(input_dim,)),
            layers.Dense(128, activation='relu', 
                        kernel_regularizer=regularizers.l2(0.01)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(64, activation='relu',
                        kernel_regularizer=regularizers.l2(0.01)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(32, activation='relu',
                        kernel_regularizer=regularizers.l2(0.01)),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            
            layers.Dense(16, activation='relu'),
            layers.Dense(1, activation='sigmoid')
        ])
        
        # Compile
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', keras.metrics.AUC(name='auc')]
        )
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_auc',
                patience=10,
                restore_best_weights=True,
                mode='max'
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=0.0001
            )
        ]
        
        # Train
        print("Training neural network (this may take a few minutes)...")
        history = model.fit(
            self.X_train, self.y_train,
            validation_split=0.2,
            epochs=100,
            batch_size=32,
            callbacks=callbacks,
            verbose=0
        )
        
        self.models['neural_network'] = model
        
        # Evaluate
        y_prob = model.predict(self.X_test, verbose=0).flatten()
        y_pred = (y_prob >= 0.5).astype(int)
        
        self.results['neural_network'] = self._evaluate_model(y_pred, y_prob, "Neural Network")
        
        # Save model
        model.save(self.models_dir / "neural_network_model.keras")
        print("✓ Neural Network model saved")
        
        # Also save training history
        history_data = {
            'loss': [float(x) for x in history.history['loss']],
            'val_loss': [float(x) for x in history.history.get('val_loss', [])],
            'accuracy': [float(x) for x in history.history['accuracy']],
            'val_accuracy': [float(x) for x in history.history.get('val_accuracy', [])],
            'auc': [float(x) for x in history.history.get('auc', [])],
            'val_auc': [float(x) for x in history.history.get('val_auc', [])]
        }
        with open(self.models_dir / "nn_training_history.json", 'w') as f:
            json.dump(history_data, f, indent=2)
        print("✓ Training history saved")
        
    def _evaluate_model(self, y_pred, y_prob, model_name: str) -> dict:
        """Evaluate model performance"""
        metrics = {
            'accuracy': accuracy_score(self.y_test, y_pred),
            'precision': precision_score(self.y_test, y_pred),
            'recall': recall_score(self.y_test, y_pred),
            'f1': f1_score(self.y_test, y_pred),
            'roc_auc': roc_auc_score(self.y_test, y_prob)
        }
        
        print(f"\n{model_name} Results:")
        print(f"  Accuracy:  {metrics['accuracy']:.4f}")
        print(f"  Precision: {metrics['precision']:.4f}")
        print(f"  Recall:    {metrics['recall']:.4f}")
        print(f"  F1 Score:  {metrics['f1']:.4f}")
        print(f"  ROC AUC:   {metrics['roc_auc']:.4f}")
        
        # Confusion matrix
        cm = confusion_matrix(self.y_test, y_pred)
        print(f"\nConfusion Matrix:")
        print(f"  TN: {cm[0,0]}, FP: {cm[0,1]}")
        print(f"  FN: {cm[1,0]}, TP: {cm[1,1]}")
        
        return metrics
    
    def train_all_models(self):
        """Train all models"""
        self.load_and_preprocess_data()
        self.train_random_forest()
        self.train_xgboost()
        self.train_neural_network()  # Add Neural Network
        
        # Save results summary
        self._save_results()
        
    def _save_results(self):
        """Save training results to JSON"""
        results_path = self.models_dir / "training_results.json"
        with open(results_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n✓ Results saved to {results_path}")
        
    def compare_models(self):
        """Generate model comparison visualization"""
        print("\n" + "="*60)
        print("Model Comparison")
        print("="*60)
        
        metrics_df = pd.DataFrame(self.results).T
        print(metrics_df)
        
        # Find best model
        best_model = metrics_df['roc_auc'].idxmax()
        print(f"\n🏆 Best Model: {best_model}")
        print(f"   ROC AUC: {metrics_df.loc[best_model, 'roc_auc']:.4f}")


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("BANK CUSTOMER CHURN PREDICTION - MODEL TRAINING")
    print("="*60)
    
    # Dynamic data path - works for Docker and local development
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    
    # Try multiple possible data locations
    possible_paths = [
        Path("/app/churn data.csv"),  # Docker
        project_root / "churn data.csv",  # Project root
        script_dir / "churn data.csv",  # Backend folder
    ]
    
    data_path = None
    for path in possible_paths:
        if path.exists():
            data_path = str(path)
            break
    
    if data_path is None:
        print("❌ Error: Could not find 'churn data.csv'")
        print("   Searched in:")
        for p in possible_paths:
            print(f"     - {p}")
        return
    
    print(f"📂 Data file: {data_path}")
    
    # Initialize trainer
    trainer = ChurnModelTrainer(data_path)
    
    # Train all models
    trainer.train_all_models()
    
    # Compare results
    trainer.compare_models()
    
    print("\n" + "="*60)
    print("✓ Training Complete!")
    print("="*60)


if __name__ == "__main__":
    main()
