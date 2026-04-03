# Models Directory

This directory will contain trained machine learning models after running `train_models.py`.

## Expected Files

After training, this directory will contain:

- `random_forest_model.joblib` - Trained Random Forest classifier
- `xgboost_model.joblib` - Trained XGBoost classifier
- `preprocessor.joblib` - Data preprocessing pipeline
- `training_results.json` - Model performance metrics

## Training Models

To train the models, run:

```bash
cd backend
python train_models.py
```

This will:
1. Load data from `churn data.csv`
2. Preprocess and split data
3. Apply SMOTE for class balance
4. Train Random Forest and XGBoost models
5. Evaluate performance
6. Save models to this directory

## Model Performance

Expected metrics:
- Accuracy: 86-88%
- Precision: 75-80%
- Recall: 80-85%
- F1 Score: 77-82%
- ROC AUC: 90-93%

## Note

The models directory is intentionally empty in the repository. Models are generated during setup and are excluded from version control due to their size.
