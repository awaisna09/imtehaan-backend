#!/usr/bin/env python3
"""
Unified Backend Service
Combines AI Tutor and Grading API on a single port (8000)
"""

import os
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

# Optional LangChain support
try:
    from langchain_openai import ChatOpenAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("LangChain not available - using OpenAI directly")

# Import grading agents
try:
    from answer_grading_agent import AnswerGradingAgent, GradingResult
    from mock_exam_grading_agent import MockExamGradingAgent, ExamReport, QuestionGrade
    GRADING_AVAILABLE = True
except ImportError:
    GRADING_AVAILABLE = False
    MockExamGradingAgent = None
    ExamReport = None
    QuestionGrade = None
    # Provide a minimal fallback so type references below don't crash import
    class GradingResult(BaseModel):  # type: ignore
        overall_score: float = 0.0
        percentage: float = 0.0
        grade: str = "N/A"
        strengths: List[str] = []
        areas_for_improvement: List[str] = []
        specific_feedback: str = ""
        suggestions: List[str] = []
    print("Grading agent not available - grading endpoints will be disabled")

# Configuration with better error handling
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT", "imtehaan-ai-tutor")
LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")

# AI Tutor Configuration
TUTOR_MODEL = os.getenv("TUTOR_MODEL", "gpt-4")
TUTOR_TEMPERATURE = float(os.getenv("TUTOR_TEMPERATURE", "0.7"))
TUTOR_MAX_TOKENS = int(os.getenv("TUTOR_MAX_TOKENS", "4000"))

# Grading Configuration
GRADING_MODEL = os.getenv("GRADING_MODEL", "gpt-4")
GRADING_TEMPERATURE = float(os.getenv("GRADING_TEMPERATURE", "0.1"))
GRADING_MAX_TOKENS = int(os.getenv("GRADING_MAX_TOKENS", "4000"))

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
ENABLE_DEBUG = os.getenv("ENABLE_DEBUG", "true").lower() == "true"

# Performance Configuration
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOOUT", "30"))
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "10"))

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
ALLOW_CREDENTIALS = os.getenv("ALLOW_CREDENTIALS", "true").lower() == "true"

# Validate required configuration
if not OPENAI_API_KEY:
    print("❌ CRITICAL ERROR: OPENAI_API_KEY not found")
    print("   Please check config.env and ensure OPENAI_API_KEY is set")
    exit(1)

# Set LangSmith environment variables if available
if LANGSMITH_API_KEY:
    os.environ["LANGSMITH_API_KEY"] = LANGSMITH_API_KEY
    os.environ["LANGSMITH_PROJECT"] = LANGSMITH_PROJECT
    os.environ["LANGSMITH_ENDPOINT"] = LANGSMITH_ENDPOINT
    os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING", "true")
    print(f"✅ LangSmith configured: {LANGSMITH_PROJECT}")
else:
    print("⚠️  WARNING: LANGSMITH_API_KEY not found - tracing disabled")

# Initialize FastAPI app
app = FastAPI(
    title="Imtehaan AI EdTech Platform", 
    version="2.0.0",
    description="Unified backend combining AI Tutor and Grading services"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for AI Tutor
class TutorRequest(BaseModel):
    message: str
    topic: str
    lesson_content: Optional[str] = None
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []
    learning_level: Optional[str] = "intermediate"

class TutorResponse(BaseModel):
    response: str
    suggestions: List[str]
    related_concepts: List[str]
    confidence_score: float

class LessonRequest(BaseModel):
    topic: str
    learning_objectives: List[str]
    difficulty_level: str = "intermediate"

class LessonResponse(BaseModel):
    lesson_content: str
    key_points: List[str]
    practice_questions: List[str]
    estimated_duration: int

# Pydantic models for Grading API
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

# Pydantic models for Mock Exam Grading
class MockExamGradingRequest(BaseModel):
    attempted_questions: List[Dict]
    exam_type: str = "P1"  # P1 or P2
    student_id: Optional[str] = None

class QuestionGradeResponse(BaseModel):
    question_id: int
    question_number: int = 1
    part: str = ""
    question_text: str
    student_answer: str
    model_answer: str
    marks_allocated: int
    marks_awarded: float
    percentage_score: float
    feedback: str
    strengths: List[str]
    improvements: List[str]

class MockExamGradingResponse(BaseModel):
    success: bool
    total_questions: int
    questions_attempted: int
    total_marks: int
    marks_obtained: float
    percentage_score: float
    overall_grade: str
    question_grades: List[QuestionGradeResponse]
    overall_feedback: str
    recommendations: List[str]
    strengths_summary: List[str]
    weaknesses_summary: List[str]
    message: str = ""

# Initialize services
class SimpleAITutor:
    def __init__(self):
        self.conversations = {}
    
    def get_response(self, request: TutorRequest) -> TutorResponse:
        """Generate AI tutor response using LangChain directly"""
        
        try:
            # Create conversation context
            conversation_id = f"{request.user_id}_{request.topic}"
            
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = []
            
            # Add user message to conversation
            self.conversations[conversation_id].append({
                "role": "user",
                "content": request.message
            })
            
            # Generate response using LangChain
            if LANGCHAIN_AVAILABLE:
                llm = ChatOpenAI(
                    model=TUTOR_MODEL,
                    temperature=TUTOR_TEMPERATURE,
                    max_tokens=TUTOR_MAX_TOKENS,
                    openai_api_key=OPENAI_API_KEY
                )
                
                # Create context-aware prompt
                prompt = f"""
                You are an expert AI tutor specializing in {request.topic}. 
                The student asks: "{request.message}"
                
                Previous conversation context: {self.conversations[conversation_id][-5:] if len(self.conversations[conversation_id]) > 5 else self.conversations[conversation_id]}
                
                Provide a helpful, educational response that:
                1. Directly addresses the student's question
                2. Uses appropriate difficulty level for {request.learning_level}
                3. Includes relevant examples and explanations
                4. Encourages further learning
                
                Response:
                """
                
                response = llm.invoke(prompt)
                ai_response = response.content
                
            else:
                # Fallback response if LangChain is not available
                ai_response = f"I'm here to help you with {request.topic}! Your question: '{request.message}' is important. Let me provide you with a comprehensive explanation..."
            
            # Add AI response to conversation
            self.conversations[conversation_id].append({
                "role": "assistant",
                "content": ai_response
            })
            
            # Generate suggestions and related concepts
            suggestions = [
                f"Ask me more about {request.topic}",
                "Request practice questions",
                "Get a lesson overview",
                "Ask for clarification"
            ]
            
            related_concepts = [
                f"Advanced {request.topic} concepts",
                f"Real-world applications of {request.topic}",
                f"Common misconceptions about {request.topic}"
            ]
            
            return TutorResponse(
                response=ai_response,
                suggestions=suggestions,
                related_concepts=related_concepts,
                confidence_score=0.95
            )
            
        except Exception as e:
            print(f"Error in AI Tutor: {e}")
            return TutorResponse(
                response=f"I apologize, but I encountered an error while processing your request. Please try again or rephrase your question about {request.topic}.",
                suggestions=["Try rephrasing your question", "Check your internet connection", "Ask a simpler question"],
                related_concepts=[request.topic],
                confidence_score=0.1
            )

# Initialize AI Tutor
ai_tutor = SimpleAITutor()

# Initialize Grading Agents
grading_agent = None
mock_exam_grading_agent = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global grading_agent, mock_exam_grading_agent
    
    if GRADING_AVAILABLE:
        try:
            # Pass grading configuration to the answer grading agent
            grading_agent = AnswerGradingAgent(
                api_key=OPENAI_API_KEY,
                model=GRADING_MODEL,
                temperature=GRADING_TEMPERATURE,
                max_tokens=GRADING_MAX_TOKENS
            )
            print("✅ Answer Grading Agent initialized successfully")
            print(f"   Model: {GRADING_MODEL}")
            print(f"   Temperature: {GRADING_TEMPERATURE}")
            print(f"   Max Tokens: {GRADING_MAX_TOKENS}")
            
            # Initialize mock exam grading agent
            if MockExamGradingAgent:
                mock_exam_grading_agent = MockExamGradingAgent(api_key=OPENAI_API_KEY)
                print("✅ Mock Exam Grading Agent initialized successfully")
        except Exception as e:
            print(f"❌ Error initializing grading agent: {e}")
    else:
        print("⚠️  Grading agent not available - grading endpoints will be disabled")

# ===== AI TUTOR ENDPOINTS =====

@app.post("/tutor/chat", response_model=TutorResponse)
async def chat_with_tutor(request: TutorRequest):
    """Chat with the AI tutor"""
    return ai_tutor.get_response(request)

@app.post("/tutor/lesson", response_model=LessonResponse)
async def create_lesson(request: LessonRequest):
    """Create a structured lesson"""
    try:
        if LANGCHAIN_AVAILABLE:
            llm = ChatOpenAI(
                model=TUTOR_MODEL,
                temperature=0.3,  # Lower temperature for structured content
                max_tokens=TUTOR_MAX_TOKENS,
                openai_api_key=OPENAI_API_KEY
            )
            
            prompt = f"""
            Create a comprehensive lesson on {request.topic} with the following learning objectives:
            {', '.join(request.learning_objectives)}
            
            Difficulty level: {request.difficulty_level}
            
            Provide:
            1. Lesson content (detailed explanation)
            2. Key points (bullet points)
            3. Practice questions (3-5 questions)
            4. Estimated duration in minutes
            
            Format as JSON:
            {{
                "lesson_content": "...",
                "key_points": ["...", "..."],
                "practice_questions": ["...", "..."],
                "estimated_duration": 30
            }}
            """
            
            response = llm.invoke(prompt)
            
            try:
                lesson_data = json.loads(response.content)
                return LessonResponse(**lesson_data)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return LessonResponse(
                    lesson_content=f"Here's a comprehensive lesson on {request.topic} covering {', '.join(request.learning_objectives)}.",
                    key_points=[f"Understanding {request.topic}", f"Key concepts in {request.topic}", f"Applications of {request.topic}"],
                    practice_questions=[f"What is {request.topic}?", f"How does {request.topic} work?", f"Give examples of {request.topic}"],
                    estimated_duration=45
                )
        else:
            return LessonResponse(
                lesson_content=f"Lesson on {request.topic} - {', '.join(request.learning_objectives)}",
                key_points=[f"Introduction to {request.topic}", f"Core concepts", f"Practical applications"],
                practice_questions=[f"Define {request.topic}", f"Explain key concepts", f"Provide examples"],
                estimated_duration=30
            )
            
    except Exception as e:
        print(f"Error creating lesson: {e}")
        raise HTTPException(status_code=500, detail="Error creating lesson")

@app.get("/tutor/health")
async def tutor_health():
    """Health check for AI Tutor service"""
    return {
        "status": "healthy",
        "service": "AI Tutor",
        "langchain_available": LANGCHAIN_AVAILABLE,
        "openai_configured": bool(OPENAI_API_KEY)
    }

# ===== GRADING API ENDPOINTS =====

@app.post("/grade-answer", response_model=GradingResponse)
async def grade_answer(request: GradingRequest):
    """Grade a student answer against the model answer"""
    
    if not GRADING_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Grading service not available"
        )
    
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

@app.post("/grade-mock-exam", response_model=MockExamGradingResponse)
async def grade_mock_exam(request: MockExamGradingRequest):
    """Grade a complete mock exam with all attempted questions"""
    
    if not GRADING_AVAILABLE or not mock_exam_grading_agent:
        raise HTTPException(
            status_code=503, 
            detail="Mock exam grading service not available"
        )
    
    try:
        # Validate input
        if not request.attempted_questions:
            raise HTTPException(
                status_code=400,
                detail="No attempted questions provided"
            )
        
        print(f"📝 Grading {request.exam_type} mock exam with {len(request.attempted_questions)} questions")
        
        # Grade the exam
        report = mock_exam_grading_agent.grade_exam(request.attempted_questions)
        
        # Convert QuestionGrade to QuestionGradeResponse
        question_grades_response = [
            QuestionGradeResponse(
                question_id=g.question_id,
                question_number=g.question_number,
                part=g.part,
                question_text=g.question_text,
                student_answer=g.student_answer,
                model_answer=g.model_answer,
                marks_allocated=g.marks_allocated,
                marks_awarded=g.marks_awarded,
                percentage_score=g.percentage_score,
                feedback=g.feedback,
                strengths=g.strengths,
                improvements=g.improvements
            )
            for g in report.question_grades
        ]
        
        return MockExamGradingResponse(
            success=True,
            total_questions=report.total_questions,
            questions_attempted=report.questions_attempted,
            total_marks=report.total_marks,
            marks_obtained=report.marks_obtained,
            percentage_score=report.percentage_score,
            overall_grade=report.overall_grade,
            question_grades=question_grades_response,
            overall_feedback=report.overall_feedback,
            recommendations=report.recommendations,
            strengths_summary=report.strengths_summary,
            weaknesses_summary=report.weaknesses_summary,
            message="Exam graded successfully"
        )
        
    except Exception as e:
        print(f"❌ Error during mock exam grading: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error during grading: {str(e)}"
        )

@app.get("/grading/health")
async def grading_health():
    """Health check for grading service"""
    return {
        "status": "healthy" if GRADING_AVAILABLE else "unavailable",
        "grading_agent_ready": grading_agent is not None,
        "mock_exam_grading_agent_ready": mock_exam_grading_agent is not None,
        "service": "Answer Grading API"
    }

# ===== UNIFIED ENDPOINTS =====

@app.get("/")
async def root():
    """Root endpoint with unified API information"""
    return {
        "message": "Imtehaan AI EdTech Platform - Unified Backend",
        "version": "2.0.0",
        "services": {
            "ai_tutor": {
                "status": "available",
                "endpoints": {
                    "chat": "/tutor/chat",
                    "lesson": "/tutor/lesson",
                    "health": "/tutor/health"
                }
            },
            "grading": {
                "status": "available" if GRADING_AVAILABLE else "unavailable",
                "endpoints": {
                    "grade_answer": "/grade-answer",
                    "health": "/grading/health"
                }
            }
        },
        "port": 8000,
        "documentation": "/docs"
    }

@app.get("/health")
async def unified_health():
    """Unified health check for all services"""
    return {
        "status": "healthy",
        "services": {
            "ai_tutor": {
                "status": "healthy",
                "langchain_available": LANGCHAIN_AVAILABLE,
                "openai_configured": bool(OPENAI_API_KEY)
            },
            "grading": {
                "status": "healthy" if GRADING_AVAILABLE and grading_agent else "unavailable",
                "agent_ready": grading_agent is not None
            }
        },
        "timestamp": "2025-08-22T22:45:00Z"
    }

if __name__ == "__main__":
    print("🚀 Starting Unified Backend Service...")
    print("📚 AI Tutor endpoints: /tutor/*")
    print("📊 Grading endpoints: /grade-answer, /grading/health")
    print("🔍 Health checks: /health, /tutor/health, /grading/health")
    print("📖 Documentation: http://localhost:8000/docs")
    print("🌐 Server: http://localhost:8000")
    
    uvicorn.run(
        app, 
        host=HOST, 
        port=PORT,
        log_level=LOG_LEVEL.lower()
    )
