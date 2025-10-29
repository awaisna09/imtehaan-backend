#!/usr/bin/env node

/**
 * Comprehensive Build Script for Imtehaan AI EdTech Platform
 * This script ensures all files are properly built and included
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Imtehaan AI EdTech Platform Build Process...\n');

// Build configuration
const buildConfig = {
  frontend: {
    buildDir: 'dist',
    sourceDir: '.',
    publicDir: 'public'
  },
  backend: {
    buildDir: 'backend-build',
    sourceFiles: [
      'unified_backend.py',
      'answer_grading_agent.py',
      'mock_exam_grading_agent.py',
      'requirements.txt',
      'config.env.example',
      'grading_config.env'
    ]
  },
  static: {
    files: [
      'README.md',
      'UNIFIED_BACKEND_README.md',
      'QUICK_SETUP.md',
      'GRADING_SYSTEM_README.md',
      'docker-compose.yml',
      'Dockerfile*',
      '*.sql',
      '*.md'
    ]
  }
};

// Utility functions
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`📄 Copied: ${src} -> ${dest}`);
  } catch (error) {
    console.warn(`⚠️  Could not copy ${src}: ${error.message}`);
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source directory does not exist: ${src}`);
    return;
  }
  
  ensureDir(dest);
  
  const items = fs.readdirSync(src);
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

function createBuildManifest() {
  const manifest = {
    buildDate: new Date().toISOString(),
    version: '1.0.0',
    platform: 'imtehaan-ai-edtech',
    components: {
      frontend: {
        built: true,
        buildDir: buildConfig.frontend.buildDir
      },
      backend: {
        built: true,
        buildDir: buildConfig.backend.buildDir
      }
    },
    files: {
      frontend: [],
      backend: [],
      static: []
    }
  };

  // Scan built files
  if (fs.existsSync(buildConfig.frontend.buildDir)) {
    const frontendFiles = getAllFiles(buildConfig.frontend.buildDir);
    manifest.files.frontend = frontendFiles;
  }

  if (fs.existsSync(buildConfig.backend.buildDir)) {
    const backendFiles = getAllFiles(buildConfig.backend.buildDir);
    manifest.files.backend = backendFiles;
  }

  fs.writeFileSync('build-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('📋 Build manifest created: build-manifest.json');
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main build process
async function build() {
  try {
    // Step 1: Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync(buildConfig.frontend.buildDir)) {
      fs.rmSync(buildConfig.frontend.buildDir, { recursive: true });
    }
    if (fs.existsSync(buildConfig.backend.buildDir)) {
      fs.rmSync(buildConfig.backend.buildDir, { recursive: true });
    }
    console.log('✅ Cleanup completed\n');

    // Step 2: Install dependencies
    runCommand('npm install', 'Installing frontend dependencies');

    // Step 3: Build frontend
    runCommand('npm run build', 'Building frontend (TypeScript + Vite)');

    // Step 4: Create backend build directory
    ensureDir(buildConfig.backend.buildDir);

    // Step 5: Copy backend files
    console.log('📦 Copying backend files...');
    buildConfig.backend.sourceFiles.forEach(file => {
      if (fs.existsSync(file)) {
        copyFile(file, path.join(buildConfig.backend.buildDir, file));
      } else {
        console.warn(`⚠️  Backend file not found: ${file}`);
      }
    });

    // Copy additional Python files
    const pythonFiles = fs.readdirSync('.').filter(file => 
      file.endsWith('.py') && !buildConfig.backend.sourceFiles.includes(file)
    );
    pythonFiles.forEach(file => {
      copyFile(file, path.join(buildConfig.backend.buildDir, file));
    });

    // Copy SQL files
    const sqlFiles = fs.readdirSync('.').filter(file => file.endsWith('.sql'));
    sqlFiles.forEach(file => {
      copyFile(file, path.join(buildConfig.backend.buildDir, file));
    });

    console.log('✅ Backend files copied\n');

    // Step 6: Copy static files and documentation
    console.log('📄 Copying static files and documentation...');
    const staticFiles = [
      'README.md',
      'UNIFIED_BACKEND_README.md',
      'QUICK_SETUP.md',
      'GRADING_SYSTEM_README.md',
      'docker-compose.yml',
      'requirements.txt',
      'config.env.example',
      'grading_config.env'
    ];

    staticFiles.forEach(file => {
      if (fs.existsSync(file)) {
        copyFile(file, path.join(buildConfig.backend.buildDir, file));
      }
    });

    // Copy all markdown files
    const mdFiles = fs.readdirSync('.').filter(file => file.endsWith('.md'));
    mdFiles.forEach(file => {
      copyFile(file, path.join(buildConfig.backend.buildDir, file));
    });

    console.log('✅ Static files copied\n');

    // Step 7: Create production configuration
    console.log('⚙️  Creating production configuration...');
    
    // Create production config.env
    const prodConfig = `# Production Configuration for Imtehaan AI EdTech Platform
# Generated on ${new Date().toISOString()}

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
`;

    fs.writeFileSync(
      path.join(buildConfig.backend.buildDir, 'config.env.production'),
      prodConfig
    );

    // Create startup script
    const startupScript = `#!/bin/bash
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
`;

    fs.writeFileSync(
      path.join(buildConfig.backend.buildDir, 'start.sh'),
      startupScript
    );

    // Make startup script executable
    try {
      execSync(`chmod +x ${path.join(buildConfig.backend.buildDir, 'start.sh')}`);
    } catch (error) {
      console.warn('⚠️  Could not make start.sh executable (this is normal on Windows)');
    }

    console.log('✅ Production configuration created\n');

    // Step 8: Create deployment instructions
    console.log('📋 Creating deployment instructions...');
    
    const deploymentInstructions = `# Imtehaan AI EdTech Platform - Deployment Instructions

## Build Information
- Build Date: ${new Date().toISOString()}
- Version: 1.0.0
- Platform: Imtehaan AI EdTech Platform

## Frontend Build
The frontend has been built and is located in the \`dist\` directory.
- Built with Vite + React + TypeScript
- Optimized for production
- Includes all necessary assets and dependencies

## Backend Build
The backend files are located in the \`backend-build\` directory.
- Python FastAPI application
- All dependencies listed in requirements.txt
- Configuration files included

## Quick Start

### 1. Backend Setup
\`\`\`bash
cd backend-build
pip3 install -r requirements.txt
cp config.env.example config.env
# Edit config.env with your API keys
./start.sh
\`\`\`

### 2. Frontend Setup
\`\`\`bash
# Serve the frontend (choose one method)
# Method 1: Using Python
cd dist
python3 -m http.server 3000

# Method 2: Using Node.js (if you have it)
npx serve -s dist -l 3000

# Method 3: Using any web server
# Copy contents of dist/ to your web server root
\`\`\`

### 3. Full Stack with Docker
\`\`\`bash
# Use the included docker-compose.yml
docker-compose up -d
\`\`\`

## Configuration
1. Copy \`config.env.example\` to \`config.env\`
2. Add your OpenAI API key
3. Optionally add LangSmith API key for tracing
4. Adjust other settings as needed

## Production Deployment
1. Set up a reverse proxy (nginx/Apache)
2. Configure SSL certificates
3. Set up environment variables
4. Use a process manager (PM2, systemd)
5. Set up monitoring and logging

## Support
For issues and support, refer to the documentation files included in this build.
`;

    fs.writeFileSync('DEPLOYMENT.md', deploymentInstructions);
    console.log('✅ Deployment instructions created: DEPLOYMENT.md\n');

    // Step 9: Create build manifest
    createBuildManifest();

    // Step 10: Final summary
    console.log('🎉 Build completed successfully!\n');
    console.log('📁 Build Output:');
    console.log(`   Frontend: ${buildConfig.frontend.buildDir}/`);
    console.log(`   Backend:  ${buildConfig.backend.buildDir}/`);
    console.log(`   Static:   Various files copied to backend-build/`);
    console.log('\n📋 Next Steps:');
    console.log('   1. Configure your API keys in backend-build/config.env');
    console.log('   2. Start the backend: cd backend-build && ./start.sh');
    console.log('   3. Serve the frontend: cd dist && python3 -m http.server 3000');
    console.log('   4. Open http://localhost:3000 in your browser');
    console.log('\n📖 See DEPLOYMENT.md for detailed instructions');

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build();
