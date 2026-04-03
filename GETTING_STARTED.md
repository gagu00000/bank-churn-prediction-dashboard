# 🎯 Getting Started - Step by Step Guide

Welcome to the Bank Customer Churn Prediction Dashboard! This guide will walk you through getting the project up and running.

## 📋 Prerequisites Check

Before you begin, ensure you have:

- [ ] Python 3.11 or higher
- [ ] Node.js 18 or higher
- [ ] Docker Desktop (recommended) or Docker CLI
- [ ] 4GB+ free RAM
- [ ] 2GB+ free disk space
- [ ] Internet connection (for initial setup)

Check versions:
```bash
python --version
node --version
docker --version
docker-compose --version
```

---

## 🚀 Option 1: Quick Start with Docker (Recommended)

### Step 1: Verify Setup
```bash
# Run verification script
python verify.py
```

### Step 2: Train ML Models
```bash
cd backend
python train_models.py
cd ..
```

Expected output:
```
✓ Loaded 10000 records
✓ Train set: 8800 samples
✓ Test set: 2000 samples
Training Random Forest Classifier...
  Accuracy:  0.8650
  ROC AUC:   0.9120
✓ Model saved
Training XGBoost Classifier...
  Accuracy:  0.8712
  ROC AUC:   0.9231
✓ Model saved
```

### Step 3: Start Application
```bash
docker-compose up --build
```

Wait for:
```
backend_1   | INFO: Uvicorn running on http://0.0.0.0:8000
frontend_1  | ➜ Local: http://localhost:5173/
```

### Step 4: Access Dashboard
Open your browser to: **http://localhost:5173**

### Step 5: Test Live Streaming
1. Click the "Start Stream" button
2. Watch real-time predictions appear
3. Observe risk classifications and probabilities

✅ **Done!** You're now running the complete system.

---

## 🛠 Option 2: Manual Development Setup

### Step 1: Verify Setup
```bash
python verify.py
```

### Step 2: Install Backend Dependencies
```bash
# Install Python packages
pip install -r requirements.txt
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Train ML Models
```bash
cd backend
python train_models.py
cd ..
```

### Step 5: Start Backend (Terminal 1)
```bash
cd backend
python app.py
```

You should see:
```
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Application startup complete
✓ Loaded 4 models
```

### Step 6: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.11  ready in 543 ms
➜ Local:   http://localhost:5173/
```

### Step 7: Access Dashboard
Open: **http://localhost:5173**

---

## 🧪 Verify Everything Works

### Check Backend API
```bash
# Test health endpoint
curl http://localhost:8000/

# Test statistics endpoint
curl http://localhost:8000/api/stats
```

### Check Frontend
1. Open http://localhost:5173
2. You should see:
   - Header with "Connected" status
   - Statistics cards with numbers
   - Charts displaying data
   - Live Stream section

### Test Live Streaming
1. Click "Start Stream" button
2. Within 2 seconds, you should see:
   - "LIVE" indicator turns green
   - First prediction appears
   - Risk level badge shows
   - Probability bar animates

### Check API Documentation
Visit: **http://localhost:8000/docs**

You should see interactive Swagger UI with all endpoints.

---

## 📊 Understanding the Dashboard

### Main Sections

1. **Key Metrics** (Top Row)
   - Total Customers
   - Churned Customers
   - Churn Rate
   - Avg Credit Score

2. **Additional Stats** (Second Row)
   - Average Age
   - Average Balance
   - Credit Score

3. **Charts** (Middle)
   - Churn Distribution (Pie Chart)
   - Geography Distribution (Bar Chart)

4. **Breakdowns** (Lower Middle)
   - By Geography (France, Spain, Germany)
   - By Gender (Male, Female)

5. **Live Stream** (Bottom)
   - Start/Stop controls
   - Latest prediction highlight
   - Recent predictions list (last 10)

---

## 🎮 Using the Live Stream

### Start Streaming
1. Scroll to "Live Churn Prediction Stream"
2. Click green "Start Stream" button
3. Watch the "LIVE" indicator turn green

### Understanding Predictions
Each prediction shows:
- **Customer ID**: Unique identifier
- **Age**: Customer age
- **Geography**: Country (France/Spain/Germany)
- **Churn Probability**: 0-100%
- **Risk Level**:
  - 🔴 **CRITICAL** (≥75%): Immediate action needed
  - 🟠 **HIGH** (50-74%): Attention required
  - 🟡 **MEDIUM** (30-49%): Monitor closely
  - 🟢 **LOW** (<30%): Stable customer

### Stop Streaming
Click the red "Stop Stream" button

---

## 🎯 Making Single Predictions

### Using the API

```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "CustomerId": 15634602,
    "CreditScore": 619,
    "Geography": "France",
    "Gender": "Female",
    "Age": 42,
    "Tenure": 2,
    "Balance": 0,
    "NumOfProducts": 1,
    "HasCrCard": 1,
    "IsActiveMember": 1,
    "EstimatedSalary": 101348.88
  }'
```

Response:
```json
{
  "prediction": 1,
  "churn_probability": 0.7532,
  "risk_level": "HIGH",
  "model_predictions": {
    "random_forest": 1,
    "xgboost": 1
  },
  "model_probabilities": {
    "random_forest": 0.78,
    "xgboost": 0.73
  }
}
```

### Using API Docs
1. Visit http://localhost:8000/docs
2. Find `/api/predict` endpoint
3. Click "Try it out"
4. Fill in customer data
5. Click "Execute"
6. See prediction result

---

## 📁 Project Files Overview

### Key Files You Might Edit

**Backend**:
- `backend/app.py` - API endpoints and logic
- `backend/train_models.py` - ML model training
- `backend/data_generator.py` - Synthetic data

**Frontend**:
- `frontend/src/App.jsx` - Main app component
- `frontend/src/components/Dashboard.jsx` - Dashboard
- `frontend/src/components/LiveStream.jsx` - Streaming
- `frontend/src/index.css` - Styles

**Configuration**:
- `docker-compose.yml` - Docker setup
- `requirements.txt` - Python deps
- `frontend/package.json` - Node deps

---

## 🎨 Customization Ideas

### Change Stream Speed
In `backend/app.py`:
```python
self.stream_interval = 2  # Change to 1, 3, 5, etc.
```

### Modify Risk Thresholds
In `backend/app.py`:
```python
def get_risk_level(probability: float) -> str:
    if probability >= 0.75:  # Adjust these
        return "CRITICAL"
    elif probability >= 0.50:
        return "HIGH"
    # ...
```

### Change Colors
In `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#0073e6',  // Change color
  }
}
```

### Add New Charts
Create new component in `frontend/src/components/`

---

## 🐛 Common First-Time Issues

### "Models not found"
**Solution**: Train models first
```bash
cd backend && python train_models.py
```

### "Port already in use"
**Solution**: Kill process using port
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### "Module not found"
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
cd frontend && npm install
```

### Docker not starting
**Solution**: Check Docker Desktop is running

---

## 📚 Next Steps

Once everything is running:

1. **Explore the API**: http://localhost:8000/docs
2. **Read full docs**: See [README.md](README.md)
3. **Understand structure**: See [STRUCTURE.md](STRUCTURE.md)
4. **Troubleshoot**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
5. **Customize**: Edit components and styles
6. **Deploy**: Prepare for production

---

## 🎓 Learning Resources

### Understanding the Code

**Backend**:
- FastAPI Tutorial: https://fastapi.tiangolo.com/tutorial/
- scikit-learn Guide: https://scikit-learn.org/stable/user_guide.html
- XGBoost Documentation: https://xgboost.readthedocs.io/

**Frontend**:
- React Tutorial: https://react.dev/learn
- TailwindCSS Docs: https://tailwindcss.com/docs
- Recharts Examples: https://recharts.org/en-US/examples

**DevOps**:
- Docker Tutorial: https://docs.docker.com/get-started/
- Docker Compose: https://docs.docker.com/compose/

---

## ✅ Success Checklist

- [ ] Python and Node.js installed
- [ ] Dependencies installed
- [ ] Models trained successfully
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Dashboard displays correctly
- [ ] Live stream works
- [ ] API responds to requests
- [ ] Docker containers running (if using Docker)

---

## 🆘 Need Help?

1. Run verification: `python verify.py`
2. Check logs for errors
3. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. Review [README.md](README.md)
5. Check browser console (F12)

---

**Congratulations! You're ready to predict customer churn in real-time! 🎉**

Access your dashboard at: **http://localhost:5173**

API documentation at: **http://localhost:8000/docs**
