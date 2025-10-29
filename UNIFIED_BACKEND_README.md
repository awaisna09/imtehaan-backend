# Unified Backend Service

## 🎯 **Overview**

This unified backend service consolidates all backend functionality onto a single port (8000), eliminating the need for multiple services running on different ports.

## 🚀 **What's Unified**

### **Before (Multiple Ports):**
- **AI Tutor Service**: Port 8000 (`simple_ai_tutor.py`)
- **Grading API**: Port 8001 (`grading_api.py`)
- **Frontend**: Calls different ports for different services

### **After (Single Port):**
- **Unified Backend**: Port 8000 (`unified_backend.py`)
- **All Services**: AI Tutor + Grading API + Health checks
- **Frontend**: Single endpoint for all backend communication

## 📁 **Files**

### **New Files:**
- `unified_backend.py` - Main unified service
- `start_unified_backend.py` - Startup script
- `UNIFIED_BACKEND_README.md` - This documentation

### **Updated Files:**
- `components/PracticeMode.tsx` - Now calls port 8000 for grading

### **Legacy Files (Can be removed after testing):**
- `grading_api.py` - Separate grading service (port 8001)
- `start_ai_tutor.py` - Old AI tutor startup (port 8000)

## 🔧 **Setup & Usage**

### **1. Start the Unified Backend**
```bash
python start_unified_backend.py
```

### **2. Verify All Services**
```bash
# Main health check
curl http://localhost:8000/health

# AI Tutor health
curl http://localhost:8000/tutor/health

# Grading health
curl http://localhost:8000/grading/health

# Root endpoint
curl http://localhost:8000/
```

### **3. Test Grading (Frontend Integration)**
The frontend now calls:
```
http://localhost:8000/grade-answer
```
Instead of:
```
http://localhost:8001/grade-answer
```

## 🌐 **Available Endpoints**

### **Root & Health**
- `GET /` - Service information
- `GET /health` - Unified health check

### **AI Tutor Service**
- `POST /tutor/chat` - Chat with AI tutor
- `POST /tutor/lesson` - Create structured lessons
- `GET /tutor/health` - AI Tutor health check

### **Grading Service**
- `POST /grade-answer` - Grade student answers
- `GET /grading/health` - Grading service health check

### **API Documentation**
- `GET /docs` - Interactive API documentation (Swagger UI)

## ✅ **Benefits**

1. **Single Port**: All backend services on port 8000
2. **Simplified Deployment**: One service to manage
3. **Better Resource Management**: Shared resources and configuration
4. **Easier Monitoring**: Single health check endpoint
5. **Simplified Frontend**: No need to manage multiple API endpoints
6. **Production Ready**: Easier to deploy and scale

## 🔄 **Migration Steps**

### **1. Stop Old Services**
```bash
# Stop any running services on ports 8000 and 8001
# Use task manager or kill processes
```

### **2. Start Unified Backend**
```bash
python start_unified_backend.py
```

### **3. Test Frontend**
- Navigate to practice page
- Submit an answer for grading
- Verify grading works on port 8000

### **4. Remove Old Files (Optional)**
After confirming everything works:
```bash
# Remove old separate services
rm grading_api.py
rm start_ai_tutor.py
```

## 🧪 **Testing**

### **Test Grading API**
```bash
curl -X POST "http://localhost:8000/grade-answer" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is market segmentation?",
    "model_answer": "Market segmentation is dividing customers into groups.",
    "student_answer": "Market segmentation means grouping customers.",
    "subject": "Business Studies",
    "topic": "Marketing"
  }'
```

### **Test AI Tutor**
```bash
curl -X POST "http://localhost:8000/tutor/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain market segmentation",
    "topic": "Marketing",
    "learning_level": "beginner"
  }'
```

## 🚨 **Troubleshooting**

### **Port Already in Use**
```bash
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <process_id> /F
```

### **Import Errors**
```bash
# Install missing dependencies
pip install -r requirements.txt

# Or install specific packages
pip install fastapi uvicorn langchain langchain-openai openai python-dotenv pydantic
```

### **Environment Variables**
Ensure `config.env` contains the unified configuration:
```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_key_here

# LangSmith API Configuration
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_langsmith_key_here
LANGSMITH_PROJECT=imtehaan-ai-tutor

# Unified Server Configuration
HOST=0.0.0.0
PORT=8000

# AI Tutor Configuration
TUTOR_MODEL=gpt-4
TUTOR_TEMPERATURE=0.7
TUTOR_MAX_TOKENS=4000

# Grading System Configuration
GRADING_MODEL=gpt-4
GRADING_TEMPERATURE=0.1
GRADING_MAX_TOKENS=4000
```

**See `CONFIGURATION_MIGRATION.md` for complete migration guide.**

## 📊 **Monitoring**

### **Health Check Response**
```json
{
  "status": "healthy",
  "services": {
    "ai_tutor": {
      "status": "healthy",
      "langchain_available": true,
      "openai_configured": true
    },
    "grading": {
      "status": "healthy",
      "agent_ready": true
    }
  },
  "timestamp": "2025-08-22T22:45:00Z"
}
```

## 🎉 **Success Indicators**

- ✅ Single backend service running on port 8000
- ✅ All health checks return "healthy"
- ✅ Frontend grading functionality works
- ✅ AI Tutor chat functionality works
- ✅ No more multiple port management

---

**Your backend is now unified and production-ready! 🚀**
