#!/bin/bash

# Developer Tools Platform - Startup Script
# This script starts the backend and frontend servers

set -e

echo "================================"
echo "Developer Tools Platform v3.0.0"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting PostgreSQL and Redis with Docker...${NC}"
    docker-compose up -d db redis
    echo "Waiting for PostgreSQL to be ready (15 seconds)..."
    sleep 15
else
    echo -e "${GREEN}✓ PostgreSQL is already running${NC}"
fi

# Navigate to backend
cd backend

# Check if migrations exist
if [ ! -f "teams/migrations/0001_initial.py" ]; then
    echo -e "${YELLOW}Creating migrations...${NC}"
    python3 manage.py makemigrations
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
python3 manage.py migrate --noinput

echo -e "${GREEN}✓ Database migrations complete${NC}"
echo ""

# Start backend server in background
echo -e "${YELLOW}Starting backend server on port 8003...${NC}"
python3 manage.py runserver 0.0.0.0:8003 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"

# Navigate to frontend
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend server in background
echo -e "${YELLOW}Starting frontend server on port 5173...${NC}"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"

# Wait a moment for servers to start
sleep 5

echo ""
echo "================================"
echo -e "${GREEN}✓ Platform is now running!${NC}"
echo "================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8003/api"
echo "Admin:    http://localhost:8003/admin"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or use: ./stop.sh"
echo ""
echo "View logs:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"
echo ""
