#!/usr/bin/env python3
"""
FastAPI endpoint for answer grading
Integrates with the existing AI tutor system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from answer_grading_agent import AnswerGradingAgent, GradingResult

# Load environment variables
load_dotenv('grading_config.env')

app = FastAPI(title="Answer Grading API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class GradingRequest(BaseModel):
    question: str
    model_answer: str
    student_answer: str
    subject: str = "Business Studies"
    topic: str = ""

class GradingResponse(BaseModel):
    success: bool
    result: GradingResult
    message: str = ""

# Initialize the grading agent
grading_agent = None

@app.on_event("startup")
async def startup_event():
    """Initialize the grading agent on startup"""
    global grading_agent
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Warning: OPENAI_API_KEY not found. Grading will not work.")
        return
    
    try:
        grading_agent = AnswerGradingAgent(api_key)
        print("✅ Answer Grading Agent initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing grading agent: {e}")

@app.post("/grade-answer", response_model=GradingResponse)
async def grade_answer(request: GradingRequest):
    """Grade a student answer against the model answer"""
    
    if not grading_agent:
        raise HTTPException(
            status_code=500, 
            detail="Grading agent not initialized. Check API key configuration."
        )
    
    try:
        # Validate input
        if not request.student_answer.strip():
            raise HTTPException(
                status_code=400, 
                detail="Student answer cannot be empty"
            )
        
        if not request.model_answer.strip():
            raise HTTPException(
                status_code=400, 
                detail="Model answer cannot be empty"
            )
        
        # Grade the answer
        result = grading_agent.grade_answer(
            request.question,
            request.model_answer,
            request.student_answer
        )
        
        return GradingResponse(
            success=True,
            result=result,
            message="Answer graded successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during grading: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "grading_agent_ready": grading_agent is not None,
        "service": "Answer Grading API"
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Answer Grading API for Business Studies",
        "endpoints": {
            "grade_answer": "/grade-answer",
            "health": "/health"
        },
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    
    # Check if API key is available
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in grading_config.env")
        print("Please add your OpenAI API key to grading_config.env")
        exit(1)
    
    print("🚀 Starting Answer Grading API...")
    print("📚 Endpoint: http://localhost:8001")
    print("📖 Documentation: http://localhost:8001/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
