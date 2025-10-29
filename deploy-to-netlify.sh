#!/bin/bash

echo "🚀 Preparing Imtehaan AI EdTech Platform for Netlify Deployment"
echo ""

# Clean up any existing dist
echo "🧹 Cleaning up previous build..."
rm -rf dist

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create deployment package
    echo "📦 Creating deployment package..."
    zip -r imtehaan-frontend.zip . -x "*.py" "node_modules/*" "*.log" "*.md" "build-*.js" "build-*.sh" "test-*.js" "test-*.cjs" "*.sql" "supabase/*" "sql/*" "guidelines/*" "hooks/*" "styles/*" "utils/*" "components/*" "*.env*" "*.bat" "*.sh" "docker-compose.yml" "Dockerfile*" "nginx.conf" "*.toml"
    
    echo "✅ Deployment package created: imtehaan-frontend.zip"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://netlify.com"
    echo "2. Click 'New site from ZIP'"
    echo "3. Upload imtehaan-frontend.zip"
    echo "4. Set environment variables in Netlify:"
    echo "   - VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "   - VITE_API_BASE_URL=https://your-backend-api.com"
    echo ""
    echo "🔧 Fixes Applied:"
    echo "   ✅ AI Tutor API calls now use environment variables"
    echo "   ✅ Image paths fixed for proper loading"
    echo "   ✅ All components updated for production deployment"
    echo ""
    echo "🎉 Ready for deployment!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
