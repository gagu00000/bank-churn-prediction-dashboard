# 🚀 Quick Reference Guide

## Instant Start Commands

### 🐳 Docker (Recommended)
```bash
# First time setup - Train models
python backend/train_models.py

# Start everything
docker-compose up --build

# Access
# Dashboard: http://localhost:5173
# API: http://localhost:8000/docs
```

### 💻 Local Development
```bash
# Terminal 1 - Backend
cd backend
pip install -r ../requirements.txt
python train_models.py
python app.py

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 📊 Features at a Glance

✅ **ML Models**: Random Forest + XGBoost ensemble  
✅ **Real-time Streaming**: Live churn predictions via WebSocket  
✅ **Projector-Optimized**: High contrast, large fonts, stunning visuals  
✅ **Docker Ready**: One-command deployment  
✅ **Interactive Charts**: Recharts + D3.js visualizations  
✅ **Synthetic Data**: Realistic customer data generation  

## 🎯 Key Endpoints

```http
GET  /                      # Health check
GET  /api/stats             # Dataset statistics
GET  /api/churn-analysis    # Detailed analysis
POST /api/predict           # Single prediction
WS   /ws/stream             # Live streaming
```

## 🎨 Dashboard Sections

1. **Key Metrics** - Total customers, churn rate, averages
2. **Charts** - Pie chart, bar charts, distributions  
3. **Live Stream** - Real-time predictions with risk levels
4. **Prediction History** - Last 10 predictions

## ⚡ Quick Troubleshooting

**Models not found?**
```bash
cd backend && python train_models.py
```

**Port in use?**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Docker issues?**
```bash
docker-compose down --volumes
docker system prune -a
docker-compose up --build
```

**Frontend won't connect?**
- Check backend running: http://localhost:8000
- Verify CORS settings in backend/app.py
- Check proxy in frontend/vite.config.js

## 📦 Project Structure
```
churn/
├── backend/           # FastAPI + ML models
│   ├── app.py        # Main API
│   ├── train_models.py
│   └── data_generator.py
├── frontend/         # React + TailwindCSS
│   └── src/
│       ├── App.jsx
│       └── components/
├── models/          # Trained models (generated)
├── docker-compose.yml
└── requirements.txt
```

## 🔑 Key Technologies

**Backend**: FastAPI, scikit-learn, XGBoost, Pandas, WebSockets  
**Frontend**: React, Vite, TailwindCSS, Recharts, Framer Motion  
**DevOps**: Docker, Docker Compose  

## 📈 Performance Expectations

- **Churn Rate**: ~20% (from dataset)
- **Model Accuracy**: 86-88%
- **ROC AUC**: 90-93%
- **Stream Rate**: ~2 predictions/second

## 🎬 Demo Flow

1. Start application
2. View dashboard statistics
3. Click "Start Stream" 
4. Watch real-time predictions
5. Observe risk classifications
6. Check prediction history

## 💡 Pro Tips

✨ Use Docker for instant deployment  
✨ Train models before first run  
✨ Projector mode is optimized for large displays  
✨ WebSocket auto-reconnects if disconnected  
✨ All charts are fully responsive  

## 🔗 Important URLs

- **Dashboard**: http://localhost:5173
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

---

**Ready to predict churn? Run `docker-compose up` and go! 🚀**
