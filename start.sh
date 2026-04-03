#!/bin/bash

# Quick start script for Bank Churn Dashboard

echo "🚀 Starting Bank Churn Dashboard..."
echo ""

# Check if models exist
if [ ! -d "models" ] || [ -z "$(ls -A models)" ]; then
    echo "⚠️  Models not found. Training models first..."
    cd backend
    python train_models.py
    cd ..
fi

# Start with Docker
if command -v docker-compose &> /dev/null; then
    echo "🐳 Starting with Docker Compose..."
    docker-compose up
else
    echo "⚠️  Docker Compose not found. Starting manually..."
    
    # Start backend
    echo "Starting backend..."
    cd backend
    python app.py &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    echo "Starting frontend..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo "✅ Application started!"
    echo "   Backend PID: $BACKEND_PID"
    echo "   Frontend PID: $FRONTEND_PID"
    echo ""
    echo "Press Ctrl+C to stop..."
    
    # Wait for user interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi
