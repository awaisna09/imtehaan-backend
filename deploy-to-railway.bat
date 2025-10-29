@echo off
echo 🚀 Deploying Imtehaan Backend to Railway
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
)

echo 📋 Next steps:
echo 1. Create a new repository on GitHub:
echo    - Go to https://github.com/new
echo    - Name: imtehaan-backend
echo    - Make it PUBLIC (required for free Railway)
echo    - Don't initialize with README
echo.
echo 2. Connect to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/imtehaan-backend.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy to Railway:
echo    - Go to https://railway.app
echo    - Sign up with GitHub
echo    - New Project → Deploy from GitHub repo
echo    - Select imtehaan-backend
echo.
echo 4. Set Environment Variables in Railway:
echo    - OPENAI_API_KEY=your_openai_api_key
echo    - LANGSMITH_API_KEY=your_langsmith_api_key
echo    - LANGSMITH_PROJECT=imtehaan-ai-tutor
echo.
echo 5. Get your backend URL and update Netlify:
echo    - VITE_API_BASE_URL=https://your-app-name.railway.app
echo.
echo 🎉 Your backend will be live and accessible to everyone!
