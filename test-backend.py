#!/usr/bin/env python3
"""
Test backend that works without API keys
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Imtehaan AI EdTech Platform - Test Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Imtehaan AI EdTech Platform Backend - Test Mode"}

@app.get("/health")
async def health():
    return {"status": "healthy", "mode": "test"}

@app.get("/tutor/health")
async def tutor_health():
    return {"status": "healthy", "tutor": "test-mode"}

@app.post("/tutor/chat")
async def tutor_chat(request: dict):
    return {
        "response": "This is a test response. Please add your OpenAI API key to Railway for full functionality.",
        "suggestions": ["Add OPENAI_API_KEY to Railway environment variables"],
        "related_concepts": ["API Configuration"],
        "confidence_score": 0.8
    }

@app.post("/grade-answer")
async def grade_answer(request: dict):
    return {
        "score": 0.8,
        "feedback": "Test grading response. Add OpenAI API key for real grading.",
        "suggestions": ["Configure API keys in Railway"]
    }

if __name__ == "__main__":
    port_str = os.environ.get("PORT", "8000")
    try:
        port = int(port_str)
    except ValueError:
        port = 8000
    
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Test Backend on {host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")
