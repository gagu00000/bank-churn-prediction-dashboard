# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Models Not Found Error

**Error**: `"Preprocessor not loaded"` or `"Model not found"`

**Cause**: ML models haven't been trained yet

**Solution**:
```bash
cd backend
python train_models.py
```

**Verification**:
Check if these files exist in `models/` directory:
- `random_forest_model.joblib`
- `xgboost_model.joblib`
- `preprocessor.joblib`

---

### 2. WebSocket Connection Failed

**Error**: `WebSocket connection to 'ws://localhost:8000/ws/stream' failed`

**Possible Causes & Solutions**:

**A. Backend not running**
```bash
# Check if backend is running
curl http://localhost:8000/

# If not, start it
cd backend
python app.py
```

**B. Port blocked by firewall**
- Windows: Check Windows Defender Firewall settings
- Add exception for port 8000

**C. Wrong WebSocket URL**
- Verify in browser console: Should be `ws://localhost:8000/ws/stream`
- Not `wss://` (secure) unless you have SSL configured

**D. CORS issues**
- Check `backend/app.py` CORS configuration
- Ensure frontend URL is in allowed origins

---

### 3. Port Already in Use

**Error**: `Address already in use` or `Port 8000/5173 is already allocated`

**Solution for Windows**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F

# For port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Solution for Linux/Mac**:
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# For port 5173
lsof -ti:5173 | xargs kill -9
```

**Alternative**: Change ports in `docker-compose.yml`

---

### 4. Docker Build Fails

**Error**: `ERROR [internal] load build definition from Dockerfile`

**Solutions**:

**A. Clean Docker cache**
```bash
docker-compose down --volumes
docker system prune -a
docker-compose up --build
```

**B. Check Docker Desktop**
- Ensure Docker Desktop is running
- Check available disk space (need 2GB+)
- Restart Docker Desktop

**C. Memory issues**
- Increase Docker memory allocation in Docker Desktop settings
- Recommended: 4GB+ RAM

---

### 5. Frontend Can't Connect to Backend

**Error**: Network errors, CORS errors, or "Failed to fetch"

**Solutions**:

**A. Verify backend is running**
```bash
# Should return status info
curl http://localhost:8000/
```

**B. Check CORS settings**
In `backend/app.py`, verify:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**C. Check proxy configuration**
In `frontend/vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true
  }
}
```

---

### 6. Module Import Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'` or similar

**Solution**:
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or specific package
pip install fastapi
```

**For frontend**:
```bash
cd frontend
rm -rf node_modules
npm install
```

---

### 7. Python Version Issues

**Error**: `Python version 3.11 or higher is required`

**Solution**:
```bash
# Check Python version
python --version

# If wrong version, install Python 3.11+
# Windows: Download from python.org
# Mac: brew install python@3.11
# Linux: sudo apt install python3.11
```

---

### 8. npm Install Fails

**Error**: Various npm errors during installation

**Solutions**:

**A. Clear npm cache**
```bash
npm cache clean --force
```

**B. Delete and reinstall**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**C. Use specific Node version**
- Requires Node.js 18+
- Use nvm to switch versions if needed

---

### 9. Docker Container Crashes

**Error**: Container exits immediately

**Solutions**:

**A. Check logs**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**B. Verify data file exists**
- Ensure `churn data.csv` is in root directory

**C. Check Docker resources**
- RAM: 4GB+ recommended
- Disk: 2GB+ free space

---

### 10. Live Stream Not Working

**Error**: Stream starts but no predictions appear

**Solutions**:

**A. Check models are trained**
```bash
ls models/
# Should see: random_forest_model.joblib, xgboost_model.joblib, preprocessor.joblib
```

**B. Check backend logs**
```bash
# Look for errors in terminal where backend is running
# Should see: "New WebSocket connection established"
```

**C. Browser console**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for WebSocket connection

---

### 11. Charts Not Displaying

**Error**: Empty chart areas or "Loading..." forever

**Solutions**:

**A. Check API response**
```bash
curl http://localhost:8000/api/stats
# Should return JSON with statistics
```

**B. Browser console errors**
- F12 → Console
- Look for Recharts errors

**C. Data format**
- Verify data structure matches chart expectations

---

### 12. Slow Performance

**Issue**: Application is slow or laggy

**Solutions**:

**A. Reduce stream interval**
In `backend/app.py`:
```python
self.stream_interval = 2  # Increase to 3 or 5
```

**B. Limit prediction history**
In `frontend/src/components/LiveStream.jsx`:
```javascript
const maxPredictions = 10  // Reduce to 5
```

**C. Docker resources**
- Increase Docker memory allocation
- Close other applications

---

### 13. CSV File Not Found

**Error**: `FileNotFoundError: churn data.csv not found`

**Solutions**:

**A. Check file location**
```bash
# File should be in root directory
ls "churn data.csv"
```

**B. Check Docker volume mount**
In `docker-compose.yml`:
```yaml
volumes:
  - ./churn data.csv:/app/churn data.csv
```

**C. File path in code**
In `backend/train_models.py` and `backend/app.py`:
```python
DATA_PATH = Path("../churn data.csv")
```

---

### 14. Build Production Version

**Issue**: Want to deploy to production

**Solutions**:

**A. Frontend production build**
```bash
cd frontend
npm run build
# Output in dist/ folder
```

**B. Update docker-compose for production**
```yaml
frontend:
  command: npm run preview  # Instead of dev
```

**C. Backend production settings**
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

---

### 15. Database Connection (Future Enhancement)

**Note**: Current version uses CSV files, not a database

**To add database support**:
1. Add PostgreSQL/MongoDB to docker-compose.yml
2. Update backend to use SQLAlchemy or Motor
3. Migrate data from CSV to database

---

## 🆘 Still Having Issues?

### Debug Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Docker Desktop running (if using Docker)
- [ ] Models trained (run `train_models.py`)
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] `churn data.csv` in root directory
- [ ] All dependencies installed
- [ ] Firewall allows ports 8000 and 5173
- [ ] No other services using same ports

### Diagnostic Commands

```bash
# Check Python
python --version
python -c "import fastapi; print('FastAPI OK')"

# Check Node
node --version
npm --version

# Check Docker
docker --version
docker-compose --version

# Check ports
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Check API
curl http://localhost:8000/
curl http://localhost:8000/api/stats

# Check models
ls models/

# Check data file
ls "churn data.csv"
```

### Log Locations

**Docker**:
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Local**:
- Backend: Terminal output where `python app.py` runs
- Frontend: Browser Console (F12) + Terminal output

### Clean Slate Reset

If all else fails, start fresh:

```bash
# Stop everything
docker-compose down --volumes

# Clean Docker
docker system prune -a

# Clean Python
rm -rf backend/__pycache__
rm -rf models/*.joblib

# Clean Node
cd frontend
rm -rf node_modules package-lock.json
cd ..

# Reinstall everything
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Train models
cd backend && python train_models.py && cd ..

# Start fresh
docker-compose up --build
```

---

## 📞 Getting Help

1. **Check documentation**: README.md, QUICKSTART.md
2. **Review logs**: Look for specific error messages
3. **API docs**: http://localhost:8000/docs
4. **Browser console**: F12 for frontend errors
5. **Test components**: Run test_generator.py to verify backend

---

**Most issues are resolved by training models first and ensuring all dependencies are installed! 🎯**
