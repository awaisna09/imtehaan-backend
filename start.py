#!/usr/bin/env python3
"""
Simple startup script for Railway deployment
"""

import os
import uvicorn

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port_str = os.environ.get("PORT", "8000")
    try:
        port = int(port_str)
    except ValueError:
        print(f"Warning: Invalid PORT value '{port_str}', using 8000")
        port = 8000
    
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Imtehaan AI EdTech Platform Backend")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🌍 Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'production')}")
    
    # Start the server
    uvicorn.run(
        "unified_backend:app",
        host=host,
        port=port,
        log_level="info",
        access_log=True
    )
