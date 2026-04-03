# 🏦 Bank Customer Churn Prediction Dashboard

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)
![ML](https://img.shields.io/badge/ML-Enabled-orange.svg)

**Real-time ML-powered bank customer churn prediction with live data streaming and stunning projector-optimized visualizations**

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Usage](#usage) • [API Docs](#api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Model Training](#model-training)
- [API Documentation](#api-documentation)
- [Dashboard Features](#dashboard-features)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project is a comprehensive **Bank Customer Churn Prediction System** that combines:

- **Machine Learning Models**: Random Forest, XGBoost ensemble for accurate predictions
- **Real-time Streaming**: WebSocket-based live data streaming with synthetic customer generation
- **Interactive Dashboard**: React-based dashboard with high-contrast, projector-optimized visuals
- **Docker Containerization**: Complete Docker setup for easy deployment
- **RESTful API**: FastAPI backend with full OpenAPI documentation

---

## ✨ Features

### 🤖 Machine Learning
- **Multiple ML Models**: Random Forest & XGBoost ensemble
- **Advanced Preprocessing**: Feature scaling, one-hot encoding, SMOTE for class imbalance
- **Performance Metrics**: Accuracy, Precision, Recall, F1, ROC-AUC
- **Model Persistence**: Trained models saved and loaded efficiently

### 📊 Dashboard
- **Real-time Streaming**: Live churn predictions via WebSocket
- **Projector-Optimized**: High contrast, large fonts, clear visuals
- **Interactive Charts**: Recharts-based visualizations
- **Responsive Design**: Works on all screen sizes
- **Animated UI**: Framer Motion animations for smooth transitions
- **Risk Classification**: CRITICAL, HIGH, MEDIUM, LOW risk levels

### 🔄 Data
- **Synthetic Data Generator**: Realistic customer data generation
- **Live Streaming**: Continuous data flow simulation
- **Historical Analysis**: Stats from 10,000+ customer records
- **Multi-dimensional**: Geography, demographics, financial data

### 🐳 DevOps
- **Docker Compose**: One-command deployment
- **Hot Reloading**: Development mode with auto-reload
- **Network Isolation**: Secure container networking
- **Volume Mounting**: Persistent data storage

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **Python 3.11** - Core programming language
- **scikit-learn** - Machine learning algorithms
- **XGBoost** - Gradient boosting framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **WebSockets** - Real-time communication

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS
- **Recharts** - Chart library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Uvicorn** - ASGI server

---

## 📋 Prerequisites

### Option 1: Using Docker (Recommended)
- Docker Desktop 20.10+
- Docker Compose 2.0+

### Option 2: Local Development
- Python 3.11+
- Node.js 18+
- npm or yarn

---

## 🚀 Quick Start

### Using Docker (Easiest Method)

1. **Clone the repository**
```bash
cd "c:\Users\gagu0\OneDrive\Desktop\dva dashboards\churn"
```

2. **Train the ML models** (first time only)
```bash
python backend/train_models.py
```

3. **Start the application**
```bash
docker-compose up --build
```

4. **Access the dashboard**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development Setup

#### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Train ML models
cd backend
python train_models.py

# Start backend server
python app.py
```

Backend will run on: http://localhost:8000

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

---

## 📁 Project Structure

```
churn/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── train_models.py        # ML model training
│   ├── data_generator.py      # Synthetic data generation
│   ├── Dockerfile             # Backend Docker config
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Header.jsx         # App header
│   │   │   ├── LiveStream.jsx     # Streaming component
│   │   │   ├── ChurnChart.jsx     # Pie chart
│   │   │   └── GeographyChart.jsx # Bar chart
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile             # Frontend Docker config
├── models/                    # Trained ML models (generated)
│   ├── random_forest_model.joblib
│   ├── xgboost_model.joblib
│   ├── preprocessor.joblib
│   └── training_results.json
├── churn data.csv            # Dataset
├── docker-compose.yml        # Docker orchestration
├── requirements.txt          # Python dependencies
├── .gitignore
├── .dockerignore
└── README.md
```

---

## 🎓 Model Training

### Training New Models

```bash
cd backend
python train_models.py
```

The training script will:
1. Load and preprocess data from `churn data.csv`
2. Handle class imbalance with SMOTE
3. Train Random Forest and XGBoost models
4. Evaluate with multiple metrics
5. Save models to `../models/` directory

### Model Performance

Expected metrics (approximate):
- **Accuracy**: 86-88%
- **Precision**: 75-80%
- **Recall**: 80-85%
- **F1 Score**: 77-82%
- **ROC AUC**: 90-93%

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### Health Check
```http
GET /
```

#### Get Statistics
```http
GET /api/stats
```
Returns overall dataset statistics including churn rate, averages, distributions.

#### Get Churn Analysis
```http
GET /api/churn-analysis
```
Returns detailed churn analysis by geography, gender, age groups, etc.

#### Single Prediction
```http
POST /api/predict
Content-Type: application/json

{
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
}
```

#### WebSocket Stream
```http
WS /ws/stream
```
Send: `{"action": "start_stream"}`
Receive: Real-time predictions

### Interactive API Docs
Visit http://localhost:8000/docs for Swagger UI

---

## 🎨 Dashboard Features

### Main Dashboard
- **Total Customers**: Animated counter
- **Churn Rate**: Real-time percentage
- **Geographic Distribution**: Interactive bar chart
- **Churn Distribution**: Pie chart with percentages

### Live Stream Panel
- **Start/Stop Controls**: Toggle streaming
- **Real-time Predictions**: New predictions every 2 seconds
- **Risk Classification**: Visual risk badges
- **Prediction History**: Last 10 predictions with details
- **Probability Visualization**: Animated progress bars

### Projector Optimizations
- High contrast color scheme
- Large, bold fonts with text shadows
- Animated transitions and effects
- Responsive grid layouts
- Glowing effects for emphasis

---

## 🐳 Docker Deployment

### Build and Run
```bash
docker-compose up --build
```

### Run in Background
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Specific Service
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

---

## 💻 Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Test data generator
python data_generator.py

# Retrain models
python train_models.py
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` file in root:
```env
# Backend
PYTHONUNBUFFERED=1
ENVIRONMENT=development

# Frontend
VITE_API_URL=http://localhost:8000
```

---

## 🔧 Troubleshooting

### Models Not Found
**Problem**: API returns "Preprocessor not loaded"

**Solution**:
```bash
cd backend
python train_models.py
```

### WebSocket Connection Failed
**Problem**: Live stream not connecting

**Solution**:
1. Ensure backend is running on port 8000
2. Check browser console for errors
3. Verify firewall settings
4. Try: `ws://localhost:8000/ws/stream`

### Docker Build Fails
**Problem**: Docker build errors

**Solution**:
```bash
# Clean Docker cache
docker-compose down --volumes
docker system prune -a

# Rebuild
docker-compose up --build
```

### Port Already in Use
**Problem**: Port 8000 or 5173 already in use

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

### Frontend Can't Connect to Backend
**Problem**: CORS errors or connection refused

**Solution**:
1. Check backend is running: http://localhost:8000
2. Verify proxy settings in `vite.config.js`
3. Check CORS middleware in `backend/app.py`

---

## 📊 Sample Data Format

### Input Customer Data
```json
{
  "CustomerId": 15634602,
  "Surname": "Hargrave",
  "CreditScore": 619,
  "Geography": "France",
  "Gender": "Female",
  "Age": 42,
  "Tenure": 2,
  "Balance": 0.0,
  "NumOfProducts": 1,
  "HasCrCard": 1,
  "IsActiveMember": 1,
  "EstimatedSalary": 101348.88
}
```

### Prediction Response
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

---

## 🎯 Key Features Explained

### Synthetic Data Generation
- Realistic customer profiles matching dataset schema
- Configurable churn risk levels
- Continuous streaming capability

### ML Model Ensemble
- Multiple models voting for predictions
- Probability averaging for confidence
- Individual model metrics available

### Real-time Streaming
- WebSocket-based bi-directional communication
- Automatic reconnection handling
- Configurable stream intervals

### Projector Optimization
- 1.2x contrast enhancement
- Text shadows for visibility
- Large fonts (minimum 14px)
- High-contrast color palette
- Animated indicators

---

## 📈 Performance Tips

1. **Model Training**: Use SMOTE for better minority class prediction
2. **Streaming**: Adjust `stream_interval` in backend for performance
3. **Frontend**: Limit prediction history to 10-20 items
4. **Docker**: Allocate 4GB+ RAM for smooth operation

---

## 🤝 Contributing

This is a demonstration project showcasing ML + Full Stack + Docker integration.

---

## 📄 License

This project is created for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- Dataset based on bank customer churn data
- Built with modern ML and web technologies
- Optimized for professional presentations

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API docs at http://localhost:8000/docs
3. Check Docker logs: `docker-compose logs`

---

<div align="center">

**Made with ❤️ using Python, React, and Docker**

⭐ **Ready to predict churn in real-time!** ⭐

</div>
