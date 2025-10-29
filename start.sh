#!/bin/bash

# Railway startup script for Imtehaan AI EdTech Platform Backend

echo "🚀 Starting Imtehaan AI EdTech Platform Backend"

# Get port from Railway environment variable
PORT=${PORT:-8000}
HOST=${HOST:-0.0.0.0}

echo "🌐 Host: $HOST"
echo "🔌 Port: $PORT"
echo "🌍 Environment: ${RAILWAY_ENVIRONMENT:-production}"

# Use uvicorn directly with the correct Python path
exec uvicorn unified_backend:app --host $HOST --port $PORT