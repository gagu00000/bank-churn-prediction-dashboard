#!/bin/bash

# Bank Churn Dashboard Setup Script
# This script sets up the complete project including training models

echo "=================================="
echo "Bank Churn Dashboard Setup"
echo "=================================="
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null
then
    echo "❌ Python not found. Please install Python 3.11+"
    exit 1
fi

echo "✓ Python found: $(python --version)"

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✓ Python dependencies installed"

# Train ML models
echo ""
echo "🤖 Training ML models..."
cd backend
python train_models.py

if [ $? -ne 0 ]; then
    echo "❌ Model training failed"
    exit 1
fi

cd ..
echo "✓ ML models trained successfully"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..
echo "✓ Frontend dependencies installed"

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "To start the application:"
echo ""
echo "  Option 1: Using Docker (Recommended)"
echo "    docker-compose up --build"
echo ""
echo "  Option 2: Manual Start"
echo "    Terminal 1: cd backend && python app.py"
echo "    Terminal 2: cd frontend && npm run dev"
echo ""
echo "Access the dashboard at: http://localhost:5173"
echo "API documentation at: http://localhost:8000/docs"
echo ""
