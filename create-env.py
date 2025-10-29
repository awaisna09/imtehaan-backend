#!/usr/bin/env python3
"""
Quick script to create .env file with your API keys
"""

env_content = """# Environment Variables for Imtehaan AI EdTech Platform Backend
# Generated from your API keys

# OpenAI API Configuration
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# LangSmith Configuration (Optional - for AI tracing)
LANGSMITH_API_KEY=YOUR_LANGSMITH_API_KEY_HERE
LANGSMITH_PROJECT=imtehaan
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_TRACING=true

# Backend Configuration
HOST=0.0.0.0
PORT=8000

# Environment
RAILWAY_ENVIRONMENT=production
"""

try:
    with open('.env', 'w') as f:
        f.write(env_content)
    print("✅ .env file created successfully!")
    print("📁 Location: .env")
    print("\n🚀 Next steps:")
    print("1. Commit and push to GitHub:")
    print("   git add .env")
    print("   git commit -m 'Add environment variables'")
    print("   git push origin main")
    print("\n2. Railway will automatically redeploy with the new environment variables")
    print("\n3. Test your backend:")
    print("   https://your-app.railway.app/health")
except Exception as e:
    print(f"❌ Error creating .env file: {e}")
