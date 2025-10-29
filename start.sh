#!/bin/bash
echo "🚀 Starting Imtehaan AI EdTech Platform"
echo "📁 Complete build with all files included"
echo ""

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "⚠️  config.env not found, copying from example..."
    cp config.env.example config.env
    echo "📝 Please update config.env with your settings"
fi

# Start backend
echo "🔧 Starting backend..."
python unified_backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend (if built)
if [ -d "dist" ]; then
    echo "🌐 Starting frontend..."
    npx serve -s dist -l 3000 &
    FRONTEND_PID=$!
    echo "✅ Frontend running on http://localhost:3000"
fi

echo "✅ Backend running on http://localhost:8000"
echo "📖 API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
