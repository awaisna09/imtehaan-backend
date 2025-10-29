# Configuration Migration Guide

## 🚀 **Migrating to Unified Backend Configuration**

This guide helps you migrate from the old separate configuration files to the new unified backend configuration.

## 📁 **Old vs New Configuration**

### **Before (Separate Files):**
- `config.env` - AI Tutor configuration
- `grading_config.env` - Grading API configuration
- Different ports (8000, 8001)
- Separate environment variables

### **After (Unified):**
- `config.env` - Single unified configuration
- All services on port 8000
- Centralized environment variables
- Consistent configuration structure

## 🔄 **Migration Steps**

### **Step 1: Backup Current Configuration**
```bash
# Backup your current configuration files
cp config.env config.env.backup
cp grading_config.env grading_config.env.backup
```

### **Step 2: Update Main Configuration**
Replace your `config.env` with the new unified structure:

```env
# Unified Backend Configuration
# This file contains all configuration for the unified AI Tutor and Grading API

# OpenAI API Configuration
OPENAI_API_KEY=your_actual_openai_key_here

# LangSmith API Configuration
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_actual_langsmith_key_here
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

# Logging Configuration
LOG_LEVEL=INFO
ENABLE_DEBUG=true

# Performance Configuration
REQUEST_TIMEOUT=30
MAX_CONCURRENT_REQUESTS=10

# CORS Configuration
ALLOWED_ORIGINS=*
ALLOW_CREDENTIALS=true
```

### **Step 3: Remove Old Configuration Files**
```bash
# Remove the old separate grading configuration
rm grading_config.env
rm grading_config.env.local
```

### **Step 4: Update Dependencies**
```bash
# Install unified backend dependencies
pip install -r requirements.txt
```

## 🔧 **Configuration Options Explained**

### **AI Tutor Settings:**
- `TUTOR_MODEL`: OpenAI model for AI Tutor (default: gpt-4)
- `TUTOR_TEMPERATURE`: Creativity level (0.0-1.0, default: 0.7)
- `TUTOR_MAX_TOKENS`: Maximum response length (default: 4000)

### **Grading Settings:**
- `GRADING_MODEL`: OpenAI model for grading (default: gpt-4)
- `GRADING_TEMPERATURE`: Consistency level (0.0-1.0, default: 0.1)
- `GRADING_MAX_TOKENS`: Maximum grading response (default: 4000)

### **Server Settings:**
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

### **Performance Settings:**
- `REQUEST_TIMEOUT`: Request timeout in seconds (default: 30)
- `MAX_CONCURRENT_REQUESTS`: Concurrent request limit (default: 10)

### **CORS Settings:**
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `ALLOW_CREDENTIALS`: Allow credentials in requests (default: true)

## ✅ **Verification Steps**

### **1. Check Configuration Loading**
```bash
# Test configuration loading
python -c "
from dotenv import load_dotenv
import os
load_dotenv('config.env')
print(f'OpenAI API Key: {os.getenv(\"OPENAI_API_KEY\")[:20]}...')
print(f'Port: {os.getenv(\"PORT\")}')
print(f'Grading Model: {os.getenv(\"GRADING_MODEL\")}')
"
```

### **2. Test Unified Backend**
```bash
# Start the unified backend
python start_unified_backend.py
```

### **3. Verify Endpoints**
```bash
# Test health endpoints
curl http://localhost:8000/health
curl http://localhost:8000/tutor/health
curl http://localhost:8000/grading/health
```

## 🚨 **Common Issues & Solutions**

### **Issue: "OPENAI_API_KEY not found"**
**Solution:** Ensure your `config.env` has the correct API key:
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### **Issue: "Port already in use"**
**Solution:** Check what's using port 8000:
```bash
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### **Issue: "Module not found"**
**Solution:** Install dependencies:
```bash
pip install -r requirements.txt
```

### **Issue: "Grading agent not initialized"**
**Solution:** Check LangSmith configuration in `config.env`:
```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_langsmith_key
```

## 🔍 **Configuration Validation**

### **Required Fields:**
- ✅ `OPENAI_API_KEY` - Must be valid OpenAI API key
- ✅ `PORT` - Server port (default: 8000)

### **Optional Fields (with defaults):**
- ⚠️ `LANGSMITH_API_KEY` - For tracing and monitoring
- ⚠️ `TUTOR_MODEL` - AI Tutor model (default: gpt-4)
- ⚠️ `GRADING_MODEL` - Grading model (default: gpt-4)

## 📊 **Environment Variable Reference**

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | - | **Required** OpenAI API key |
| `LANGSMITH_API_KEY` | - | LangSmith API key for tracing |
| `LANGSMITH_PROJECT` | imtehaan-ai-tutor | LangSmith project name |
| `HOST` | 0.0.0.0 | Server host address |
| `PORT` | 8000 | Server port |
| `TUTOR_MODEL` | gpt-4 | AI Tutor model |
| `TUTOR_TEMPERATURE` | 0.7 | AI Tutor creativity |
| `GRADING_MODEL` | gpt-4 | Grading model |
| `GRADING_TEMPERATURE` | 0.1 | Grading consistency |
| `LOG_LEVEL` | INFO | Logging level |
| `ENABLE_DEBUG` | true | Debug mode |

## 🎉 **Migration Complete!**

After following these steps:
- ✅ Single configuration file (`config.env`)
- ✅ All services on port 8000
- ✅ Unified backend running
- ✅ Consistent environment variables
- ✅ Simplified deployment

Your backend is now unified and easier to manage!
