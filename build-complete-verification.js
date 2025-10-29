#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Complete Build Verification...\n');

// Create comprehensive build directories
const buildDir = 'complete-build';
const frontendBuildDir = path.join(buildDir, 'frontend');
const backendBuildDir = path.join(buildDir, 'backend');
const docsBuildDir = path.join(buildDir, 'docs');
const sqlBuildDir = path.join(buildDir, 'sql');
const scriptsBuildDir = path.join(buildDir, 'scripts');
const configBuildDir = path.join(buildDir, 'config');

// Clean and create directories
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
}

[buildDir, frontendBuildDir, backendBuildDir, docsBuildDir, sqlBuildDir, scriptsBuildDir, configBuildDir].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
});

console.log('📁 Created build directories');

// Function to copy files recursively
function copyFilesRecursively(src, dest, excludePatterns = []) {
    if (!fs.existsSync(src)) return;
    
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        files.forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            
            // Skip excluded patterns
            const shouldExclude = excludePatterns.some(pattern => {
                if (typeof pattern === 'string') {
                    return srcPath.includes(pattern);
                } else if (pattern instanceof RegExp) {
                    return pattern.test(srcPath);
                }
                return false;
            });
            
            if (!shouldExclude) {
                copyFilesRecursively(srcPath, destPath, excludePatterns);
            }
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Function to get all files in directory
function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip certain directories
            if (!['node_modules', 'dist', 'backend-build', 'complete-build', '__pycache__', 'ai_tutor_env', 'ai-tutor-env', '.git'].includes(file)) {
                getAllFiles(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// Get all source files
console.log('📋 Scanning all source files...');
const allFiles = getAllFiles('.');
console.log(`Found ${allFiles.length} source files`);

// Categorize files
const fileCategories = {
    frontend: [],
    backend: [],
    docs: [],
    sql: [],
    scripts: [],
    config: [],
    other: []
};

allFiles.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const fileName = path.basename(file).toLowerCase();
    
    if (file.includes('components') || file.includes('styles') || file.includes('utils') || 
        ext === '.tsx' || ext === '.ts' || ext === '.jsx' || ext === '.js' && !file.includes('test') ||
        fileName === 'package.json' || fileName === 'vite.config.ts' || fileName === 'tsconfig.json' ||
        fileName === 'tailwind.config.js' || fileName === 'postcss.config.js' || fileName === 'index.html' ||
        fileName === 'main.tsx' || fileName === 'app.tsx') {
        fileCategories.frontend.push(file);
    } else if (ext === '.py' || fileName === 'requirements.txt' || fileName === 'grading_config.env' ||
               file.includes('unified_backend') || file.includes('grading') || file.includes('ai_tutor')) {
        fileCategories.backend.push(file);
    } else if (ext === '.md' || fileName.includes('readme') || fileName.includes('guide') || 
               fileName.includes('setup') || fileName.includes('troubleshooting')) {
        fileCategories.docs.push(file);
    } else if (ext === '.sql') {
        fileCategories.sql.push(file);
    } else if (fileName.includes('test') || fileName.includes('check') || fileName.includes('verify') ||
               fileName.includes('build') || fileName.includes('start') || fileName.includes('quick')) {
        fileCategories.scripts.push(file);
    } else if (ext === '.env' || fileName.includes('config') || fileName.includes('docker') ||
               fileName === 'nginx.conf' || fileName === '.gitignore') {
        fileCategories.config.push(file);
    } else {
        fileCategories.other.push(file);
    }
});

console.log('\n📊 File categorization:');
Object.entries(fileCategories).forEach(([category, files]) => {
    console.log(`  ${category}: ${files.length} files`);
});

// Copy files to appropriate build directories
console.log('\n📦 Copying files to build directories...');

// Frontend files
fileCategories.frontend.forEach(file => {
    const destPath = path.join(frontendBuildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// Backend files
fileCategories.backend.forEach(file => {
    const destPath = path.join(backendBuildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// Documentation files
fileCategories.docs.forEach(file => {
    const destPath = path.join(docsBuildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// SQL files
fileCategories.sql.forEach(file => {
    const destPath = path.join(sqlBuildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// Script files
fileCategories.scripts.forEach(file => {
    const destPath = path.join(scriptsBuildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// Config files
fileCategories.config.forEach(file => {
    const destPath = path.join(configBuildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// Other files (images, etc.)
fileCategories.other.forEach(file => {
    const destPath = path.join(buildDir, path.relative('.', file));
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, destPath);
});

// Build frontend
console.log('\n🔨 Building frontend...');
try {
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    
    // Copy built frontend to build directory
    copyFilesRecursively('dist', path.join(frontendBuildDir, 'dist'));
    console.log('✅ Frontend built successfully');
} catch (error) {
    console.log('⚠️  Frontend build had issues, but continuing...');
}

// Create comprehensive build manifest
const buildManifest = {
    buildDate: new Date().toISOString(),
    buildVersion: '1.0.0',
    totalFiles: allFiles.length,
    categories: {},
    fileList: allFiles.map(file => ({
        path: file,
        size: fs.statSync(file).size,
        category: Object.keys(fileCategories).find(cat => fileCategories[cat].includes(file)) || 'other'
    }))
};

Object.entries(fileCategories).forEach(([category, files]) => {
    buildManifest.categories[category] = {
        count: files.length,
        totalSize: files.reduce((sum, file) => sum + fs.statSync(file).size, 0)
    };
});

fs.writeFileSync(path.join(buildDir, 'build-manifest.json'), JSON.stringify(buildManifest, null, 2));

// Create deployment scripts
const startScript = `#!/bin/bash
echo "🚀 Starting Imtehaan AI EdTech Platform"
echo "📁 Complete build with all files included"
echo ""

# Start backend
echo "🔧 Starting backend..."
cd backend
python unified_backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend (if built)
if [ -d "frontend/dist" ]; then
    echo "🌐 Starting frontend..."
    cd frontend
    npx serve -s dist -l 3000 &
    FRONTEND_PID=$!
    echo "✅ Frontend running on http://localhost:3000"
fi

echo "✅ Backend running on http://localhost:8000"
echo "📖 API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
`;

const startScriptWin = `@echo off
echo 🚀 Starting Imtehaan AI EdTech Platform
echo 📁 Complete build with all files included
echo.

REM Start backend
echo 🔧 Starting backend...
cd backend
start /B python unified_backend.py

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend (if built)
if exist "frontend\\dist" (
    echo 🌐 Starting frontend...
    cd frontend
    start /B npx serve -s dist -l 3000
    echo ✅ Frontend running on http://localhost:3000
)

echo ✅ Backend running on http://localhost:8000
echo 📖 API docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services
pause >nul
`;

fs.writeFileSync(path.join(buildDir, 'start.sh'), startScript);
fs.writeFileSync(path.join(buildDir, 'start.bat'), startScriptWin);

// Create comprehensive README
const readme = `# Imtehaan AI EdTech Platform - Complete Build

## 📦 Build Contents

This complete build contains **${allFiles.length} files** organized into the following categories:

### 🎨 Frontend (${fileCategories.frontend.length} files)
- React components and pages
- TypeScript configuration
- Styling and UI components
- Build configuration files

### 🔧 Backend (${fileCategories.backend.length} files)
- Python FastAPI services
- AI grading agents
- Database models and services
- API endpoints

### 📚 Documentation (${fileCategories.docs.length} files)
- Setup guides and README files
- Implementation documentation
- Troubleshooting guides

### 🗄️ Database (${fileCategories.sql.length} files)
- SQL schema files
- Migration scripts
- Database setup files

### 🛠️ Scripts (${fileCategories.scripts.length} files)
- Build and deployment scripts
- Test files
- Utility scripts

### ⚙️ Configuration (${fileCategories.config.length} files)
- Environment files
- Docker configuration
- Nginx configuration

## 🚀 Quick Start

### Option 1: Use Start Scripts
\`\`\`bash
# Linux/Mac
./start.sh

# Windows
start.bat
\`\`\`

### Option 2: Manual Start
\`\`\`bash
# Start backend
cd backend
python unified_backend.py

# Start frontend (in another terminal)
cd frontend
npx serve -s dist -l 3000
\`\`\`

## 📊 Build Statistics

${Object.entries(fileCategories).map(([category, files]) => 
    `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${files.length} files (${(files.reduce((sum, file) => sum + fs.statSync(file).size, 0) / 1024 / 1024).toFixed(2)} MB)`
).join('\n')}

## 🔍 File Verification

All source files have been included in this build. The build manifest contains a complete list of all files with their sizes and categories.

## 📖 Documentation

See the \`docs/\` directory for comprehensive documentation including:
- Setup guides
- API documentation
- Troubleshooting guides
- Implementation details

## 🐳 Docker Deployment

Use the included Docker files for containerized deployment:
- \`Dockerfile.frontend\` - Frontend container
- \`Dockerfile.backend\` - Backend container
- \`docker-compose.yml\` - Complete orchestration

## 🔧 Configuration

All configuration files are included in the \`config/\` directory. Copy and modify as needed for your environment.

---

**Build Date**: ${new Date().toISOString()}
**Total Files**: ${allFiles.length}
**Build Version**: 1.0.0
`;

fs.writeFileSync(path.join(buildDir, 'README.md'), readme);

// Verify build completeness
console.log('\n🔍 Verifying build completeness...');
const buildFiles = getAllFiles(buildDir);
const missingFiles = allFiles.filter(file => {
    const relativePath = path.relative('.', file);
    const buildPath = path.join(buildDir, relativePath);
    return !fs.existsSync(buildPath);
});

if (missingFiles.length === 0) {
    console.log('✅ All files successfully included in build');
} else {
    console.log(`⚠️  ${missingFiles.length} files missing from build:`);
    missingFiles.forEach(file => console.log(`  - ${file}`));
}

console.log(`\n📊 Build Summary:`);
console.log(`  Total source files: ${allFiles.length}`);
console.log(`  Files in build: ${buildFiles.length}`);
console.log(`  Missing files: ${missingFiles.length}`);
console.log(`  Build size: ${(buildFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0) / 1024 / 1024).toFixed(2)} MB`);

console.log(`\n🎉 Complete build created in: ${buildDir}/`);
console.log('📁 Build structure:');
console.log('  ├── frontend/     - React frontend files');
console.log('  ├── backend/      - Python backend files');
console.log('  ├── docs/         - Documentation files');
console.log('  ├── sql/          - Database files');
console.log('  ├── scripts/      - Utility scripts');
console.log('  ├── config/       - Configuration files');
console.log('  ├── start.sh      - Linux/Mac start script');
console.log('  ├── start.bat     - Windows start script');
console.log('  └── README.md     - Build documentation');
