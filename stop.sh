#!/bin/bash

# Developer Tools Platform - Stop Script
# This script stops the backend and frontend servers

echo "Stopping Developer Tools Platform..."

# Find and kill backend processes
BACKEND_PIDS=$(ps aux | grep "manage.py runserver" | grep -v grep | awk '{print $2}')
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Stopping backend server(s)..."
    kill $BACKEND_PIDS
    echo "✓ Backend stopped"
else
    echo "No backend server running"
fi

# Find and kill frontend processes
FRONTEND_PIDS=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Stopping frontend server(s)..."
    kill $FRONTEND_PIDS
    echo "✓ Frontend stopped"
else
    echo "No frontend server running"
fi

echo ""
echo "All servers stopped."
