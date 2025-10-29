@echo off
echo 🚀 Preparing Imtehaan AI EdTech Platform for Netlify Deployment
echo.

REM Clean up any existing dist
echo 🧹 Cleaning up previous build...
if exist dist rmdir /s /q dist

REM Build the frontend
echo 🔨 Building frontend...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Create deployment package
    echo 📦 Creating deployment package...
    powershell -command "Compress-Archive -Path 'dist\*' -DestinationPath 'imtehaan-frontend.zip' -Force"
    
    echo ✅ Deployment package created: imtehaan-frontend.zip
    echo.
    echo 📋 Next steps:
    echo 1. Go to https://netlify.com
    echo 2. Click 'New site from ZIP'
    echo 3. Upload imtehaan-frontend.zip
    echo 4. Set environment variables in Netlify:
    echo    - VITE_SUPABASE_URL=https://your-project.supabase.co
    echo    - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo    - VITE_API_BASE_URL=https://your-backend-api.com
    echo.
    echo 🔧 Fixes Applied:
    echo    ✅ AI Tutor API calls now use environment variables
    echo    ✅ Image paths fixed for proper loading
    echo    ✅ All components updated for production deployment
    echo.
    echo 🎉 Ready for deployment!
) else (
    echo ❌ Build failed! Please check the errors above.
    exit /b 1
)
