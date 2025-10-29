#!/usr/bin/env python3
"""
Simple startup script for Railway deployment
"""

import os
import uvicorn

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting server on {host}:{port}")
    
    # Start the server
    uvicorn.run(
        "unified_backend:app",
        host=host,
        port=port,
        log_level="info"
    )
