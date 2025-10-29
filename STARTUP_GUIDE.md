# 🚀 Imtehaan AI EdTech Platform - Startup Guide

This guide will help you run both the backend and frontend servers smoothly without errors.

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- OpenAI API key
- Supabase project credentials

## 🔧 Backend Setup (Python FastAPI)

### 1. Install Python Dependencies
```bash
# Create virtual environment
python -m venv ai-tutor-env

# Activate virtual environment
# Windows:
ai-tutor-env\Scripts\activate
# macOS/Linux:
source ai-tutor-env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables
```bash
# Copy the example config file
cp config.env.example config.env

# Edit config.env with your actual API keys
# REQUIRED: OPENAI_API_KEY
# OPTIONAL: LANGSMITH_API_KEY
```

### 3. Start Backend Server
```bash
# Development mode
python start_ai_tutor.py

# Production mode
python start_production.py

# Or directly with uvicorn
uvicorn simple_ai_tutor:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Verify Backend
- Health check: http://localhost:8000/tutor/health
- API docs: http://localhost:8000/docs
- LangChain status: http://localhost:8000/tutor/langchain-status

## 🌐 Frontend Setup (React + Vite)

### 1. Install Node Dependencies
```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Configure Frontend Environment
Create a `.env.local` file in the root directory:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Frontend Server
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Verify Frontend
- Frontend: http://localhost:5173
- Should connect to backend at http://localhost:8000

## 🐳 Docker Deployment (Optional)

### 1. Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Troubleshooting Common Issues

### Backend Issues

#### OpenAI API Key Error
```
❌ CRITICAL ERROR: OPENAI_API_KEY not found
```
**Solution**: Ensure `config.env` file exists and contains `OPENAI_API_KEY=your_actual_key`

#### LangChain Import Error
```
❌ LangChain not available - using OpenAI directly
```
**Solution**: Install LangChain: `pip install langchain langchain-openai`

#### Port Already in Use
```
OSError: [Errno 98] Address already in use
```
**Solution**: 
- Kill process using port 8000: `lsof -ti:8000 | xargs kill -9`
- Or change port in `simple_ai_tutor.py`

### Frontend Issues

#### Supabase Connection Error
```
Error: Invalid API key
```
**Solution**: Check `.env.local` file and verify Supabase credentials

#### Backend Connection Error
```
Failed to fetch from AI Tutor
```
**Solution**: 
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify proxy configuration in `vite.config.ts`

#### Build Errors
```
Module not found: Can't resolve '@components'
```
**Solution**: Check import paths and ensure all components exist

## 📊 Health Check Commands

### Backend Health
```bash
curl http://localhost:8000/tutor/health
```

### Frontend Health
```bash
curl http://localhost:5173
```

### Database Health
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/"
```

## 🚀 Production Deployment

### 1. Environment Variables
Ensure all production environment variables are set:
- `OPENAI_API_KEY`
- `LANGSMITH_API_KEY` (optional)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. Backend Production
```bash
# Use production script
python start_production.py

# Or with gunicorn
gunicorn simple_ai_tutor:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 3. Frontend Production
```bash
# Build optimized version
npm run build

# Serve with nginx or similar
npx serve -s dist -l 5173
```

## 📝 Logs and Monitoring

### Backend Logs
- Development: Console output
- Production: `ai_tutor.log` file
- Docker: `docker-compose logs ai-tutor-backend`

### Frontend Logs
- Development: Browser console + Vite dev server
- Production: Browser console + server logs

## 🔒 Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Enable CORS** only for trusted origins
4. **Rate limiting** for API endpoints
5. **Input validation** for all user inputs

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure both servers are running
4. Check network connectivity between services
5. Review the troubleshooting section above

## 🎯 Quick Start Commands

```bash
# Terminal 1 - Backend
cd /path/to/project
python -m venv ai-tutor-env
source ai-tutor-env/bin/activate  # or ai-tutor-env\Scripts\activate on Windows
pip install -r requirements.txt
python start_ai_tutor.py

# Terminal 2 - Frontend
cd /path/to/project
npm install
npm run dev
```

Both servers should now be running smoothly! 🎉
