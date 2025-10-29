#!/usr/bin/env python3
"""
Railway-specific startup script for Imtehaan AI EdTech Platform Backend
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def main():
    """Start the FastAPI application for Railway deployment"""
    
    # Get port from Railway environment variable
    port = int(os.environ.get("PORT", 8000))
    
    # Get host (Railway provides this)
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Imtehaan AI EdTech Platform Backend")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🌐 Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'production')}")
    
    # Start the server
    uvicorn.run(
        "unified_backend:app",
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    main()
