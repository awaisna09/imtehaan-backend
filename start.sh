#!/bin/bash

# Railway startup script for Imtehaan AI EdTech Platform Backend

echo "🚀 Starting Imtehaan AI EdTech Platform Backend"

# Check if python3 exists, otherwise use python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found!"
    exit 1
fi

echo "📍 Using Python command: $PYTHON_CMD"

# Get port from Railway environment variable
PORT=${PORT:-8000}
HOST=${HOST:-0.0.0.0}

echo "🌐 Host: $HOST"
echo "🔌 Port: $PORT"
echo "🌍 Environment: ${RAILWAY_ENVIRONMENT:-production}"

# Start the server
exec $PYTHON_CMD unified_backend.py