#!/bin/bash

# Imtehaan AI EdTech Platform - Complete Build Script
# This script creates a comprehensive build with all necessary files

set -e  # Exit on any error

echo "🚀 Starting Complete Build for Imtehaan AI EdTech Platform..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed."
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Clean previous builds
clean_builds() {
    print_status "Cleaning previous builds..."
    
    # Remove build directories
    rm -rf dist/
    rm -rf backend-build/
    rm -rf build/
    rm -f build-manifest.json
    rm -f DEPLOYMENT.md
    
    print_success "Previous builds cleaned"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    npm install
    
    print_success "Frontend dependencies installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend (React + TypeScript + Vite)..."
    
    # TypeScript compilation
    npx tsc --noEmit
    
    # Vite build
    npm run build
    
    print_success "Frontend built successfully"
}

# Create backend build directory
create_backend_build() {
    print_status "Creating backend build structure..."
    
    mkdir -p backend-build
    mkdir -p backend-build/logs
    mkdir -p backend-build/static
    
    print_success "Backend build structure created"
}

# Copy backend files
copy_backend_files() {
    print_status "Copying backend files..."
    
    # Core Python files
    cp unified_backend.py backend-build/
    cp answer_grading_agent.py backend-build/
    cp mock_exam_grading_agent.py backend-build/
    cp grading_api.py backend-build/ 2>/dev/null || true
    cp simple_ai_tutor.py backend-build/ 2>/dev/null || true
    cp start_ai_tutor.py backend-build/ 2>/dev/null || true
    cp start_unified_backend.py backend-build/ 2>/dev/null || true
    cp start_production.py backend-build/ 2>/dev/null || true
    
    # Configuration files
    cp requirements.txt backend-build/
    cp config.env.example backend-build/
    cp grading_config.env backend-build/ 2>/dev/null || true
    
    # SQL files
    cp *.sql backend-build/ 2>/dev/null || true
    
    # Documentation
    cp *.md backend-build/ 2>/dev/null || true
    
    # Docker files
    cp docker-compose.yml backend-build/
    cp Dockerfile* backend-build/ 2>/dev/null || true
    cp nginx.conf backend-build/ 2>/dev/null || true
    
    print_success "Backend files copied"
}

# Create production configuration
create_production_config() {
    print_status "Creating production configuration..."
    
    cat > backend-build/config.env.production << EOF
# Production Configuration for Imtehaan AI EdTech Platform
# Generated on $(date)

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# LangSmith API Configuration (Optional)
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=imtehaan-ai-tutor

# Server Configuration
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
ENABLE_DEBUG=false

# Performance Configuration
REQUEST_TIMEOUT=30
MAX_CONCURRENT_REQUESTS=10

# CORS Configuration
ALLOWED_ORIGINS=*
ALLOW_CREDENTIALS=true
EOF

    print_success "Production configuration created"
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Main startup script
    cat > backend-build/start.sh << 'EOF'
#!/bin/bash
# Imtehaan AI EdTech Platform - Production Startup Script

echo "🚀 Starting Imtehaan AI EdTech Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "⚠️  config.env not found. Copying from example..."
    cp config.env.example config.env
    echo "📝 Please edit config.env with your API keys before running again."
    exit 1
fi

# Start the unified backend
echo "🚀 Starting unified backend server..."
python3 unified_backend.py
EOF

    # Windows startup script
    cat > backend-build/start.bat << 'EOF'
@echo off
REM Imtehaan AI EdTech Platform - Windows Startup Script

echo 🚀 Starting Imtehaan AI EdTech Platform...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Check if config.env exists
if not exist "config.env" (
    echo ⚠️  config.env not found. Copying from example...
    copy config.env.example config.env
    echo 📝 Please edit config.env with your API keys before running again.
    pause
    exit /b 1
)

REM Start the unified backend
echo 🚀 Starting unified backend server...
python unified_backend.py
EOF

    # Make scripts executable
    chmod +x backend-build/start.sh
    
    print_success "Startup scripts created"
}

# Create deployment documentation
create_deployment_docs() {
    print_status "Creating deployment documentation..."
    
    cat > DEPLOYMENT.md << EOF
# Imtehaan AI EdTech Platform - Deployment Guide

## Build Information
- Build Date: $(date)
- Version: 1.0.0
- Platform: Imtehaan AI EdTech Platform

## Quick Start

### Option 1: Using Docker (Recommended)
\`\`\`bash
# Build and start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
\`\`\`

### Option 2: Manual Setup

#### Backend Setup
\`\`\`bash
cd backend-build
pip3 install -r requirements.txt
cp config.env.example config.env
# Edit config.env with your API keys
./start.sh  # On Linux/Mac
# or
start.bat   # On Windows
\`\`\`

#### Frontend Setup
\`\`\`bash
# Serve the frontend
cd dist
python3 -m http.server 3000

# Or using Node.js
npx serve -s dist -l 3000
\`\`\`

## Configuration

1. **Backend Configuration**: Edit \`backend-build/config.env\`
   - Add your OpenAI API key
   - Optionally add LangSmith API key for tracing
   - Adjust other settings as needed

2. **Frontend Configuration**: Environment variables
   - VITE_SUPABASE_URL: Your Supabase URL
   - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
   - VITE_API_BASE_URL: Backend API URL

## Production Deployment

### Using Docker
1. Set up environment variables in \`.env\` file
2. Run: \`docker-compose up -d\`
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificates

### Manual Deployment
1. Set up a web server (nginx/Apache)
2. Copy \`dist/\` contents to web server root
3. Configure reverse proxy for API calls
4. Set up process manager (PM2, systemd)
5. Configure monitoring and logging

## Health Checks
- Frontend: http://localhost (or your domain)
- Backend API: http://localhost:8000/health
- Backend Tutor: http://localhost:8000/tutor/health
- Backend Grading: http://localhost:8000/grading/health

## Troubleshooting

### Common Issues
1. **Port already in use**: Change ports in docker-compose.yml
2. **API connection failed**: Check VITE_API_BASE_URL
3. **OpenAI API errors**: Verify OPENAI_API_KEY in config.env
4. **Database connection**: Check Supabase configuration

### Logs
- Backend logs: \`backend-build/logs/\`
- Docker logs: \`docker-compose logs\`

## Support
For issues and support, refer to the documentation files included in this build.
EOF

    print_success "Deployment documentation created"
}

# Create build manifest
create_build_manifest() {
    print_status "Creating build manifest..."
    
    cat > build-manifest.json << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "platform": "imtehaan-ai-edtech",
  "components": {
    "frontend": {
      "built": true,
      "buildDir": "dist",
      "framework": "React + TypeScript + Vite",
      "bundler": "Vite"
    },
    "backend": {
      "built": true,
      "buildDir": "backend-build",
      "framework": "FastAPI + Python",
      "ai": "OpenAI GPT-4 + LangChain"
    }
  },
  "files": {
    "frontend": [
      "dist/index.html",
      "dist/assets/",
      "dist/static/"
    ],
    "backend": [
      "backend-build/unified_backend.py",
      "backend-build/answer_grading_agent.py",
      "backend-build/mock_exam_grading_agent.py",
      "backend-build/requirements.txt",
      "backend-build/config.env.example",
      "backend-build/start.sh",
      "backend-build/start.bat"
    ],
    "documentation": [
      "DEPLOYMENT.md",
      "build-manifest.json"
    ]
  },
  "endpoints": {
    "frontend": "http://localhost:3000",
    "backend": "http://localhost:8000",
    "health": "http://localhost:8000/health",
    "api_docs": "http://localhost:8000/docs"
  }
}
EOF

    print_success "Build manifest created"
}

# Main build process
main() {
    echo
    print_status "Starting complete build process..."
    echo
    
    # Step 1: Check dependencies
    check_dependencies
    echo
    
    # Step 2: Clean previous builds
    clean_builds
    echo
    
    # Step 3: Install frontend dependencies
    install_frontend_deps
    echo
    
    # Step 4: Build frontend
    build_frontend
    echo
    
    # Step 5: Create backend build
    create_backend_build
    echo
    
    # Step 6: Copy backend files
    copy_backend_files
    echo
    
    # Step 7: Create production config
    create_production_config
    echo
    
    # Step 8: Create startup scripts
    create_startup_scripts
    echo
    
    # Step 9: Create deployment docs
    create_deployment_docs
    echo
    
    # Step 10: Create build manifest
    create_build_manifest
    echo
    
    # Final summary
    echo "================================================================"
    print_success "Build completed successfully!"
    echo
    print_status "Build Output:"
    echo "  📁 Frontend: dist/"
    echo "  📁 Backend:  backend-build/"
    echo "  📄 Docs:     DEPLOYMENT.md"
    echo "  📋 Manifest: build-manifest.json"
    echo
    print_status "Next Steps:"
    echo "  1. Configure API keys in backend-build/config.env"
    echo "  2. Start backend: cd backend-build && ./start.sh"
    echo "  3. Serve frontend: cd dist && python3 -m http.server 3000"
    echo "  4. Or use Docker: docker-compose up -d"
    echo
    print_status "Access URLs:"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  🔧 Backend:  http://localhost:8000"
    echo "  📚 API Docs: http://localhost:8000/docs"
    echo
    print_success "Happy coding! 🚀"
}

# Run the build
main "$@"
