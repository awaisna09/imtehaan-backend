# 🚀 **Railway Backend Deployment Guide**

## 📋 **Prerequisites**

1. **GitHub Account** (free)
2. **Railway Account** (free at railway.app)
3. **Your backend code** (already prepared)

## 🚀 **Step-by-Step Deployment**

### **Step 1: Push to GitHub**

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Prepare for Railway deployment"
   ```

2. **Create GitHub Repository**:
   - Go to github.com
   - Click "New repository"
   - Name it: `imtehaan-backend`
   - Make it **Public** (required for free Railway)
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/imtehaan-backend.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy to Railway**

1. **Go to Railway**:
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `imtehaan-backend` repository

3. **Configure Deployment**:
   - Railway will auto-detect Python
   - It will use the `requirements.txt` file
   - The startup command is already configured

### **Step 3: Set Environment Variables**

In Railway dashboard, go to your project → Variables tab and add:

```
OPENAI_API_KEY=your_openai_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=imtehaan-ai-tutor
```

### **Step 4: Get Your Backend URL**

1. **Find the URL**:
   - Go to your Railway project
   - Click on your service
   - Copy the **Public URL** (looks like: `https://your-app-name.railway.app`)

2. **Test the Backend**:
   - Visit: `https://your-app-name.railway.app/health`
   - Should return: `{"status": "healthy"}`

### **Step 5: Update Frontend**

1. **Update Netlify Environment Variables**:
   - Go to your Netlify site dashboard
   - Site settings → Environment variables
   - Update: `VITE_API_BASE_URL=https://your-app-name.railway.app`

2. **Redeploy Frontend**:
   - Trigger a new deployment in Netlify

## 🔧 **Files Created for Railway**

- `railway.json` - Railway configuration
- `Procfile` - Process definition
- `runtime.txt` - Python version
- `start_railway.py` - Railway startup script

## 📊 **Railway Free Tier Limits**

- ✅ **500 hours/month** (enough for personal use)
- ✅ **512MB RAM**
- ✅ **1GB storage**
- ✅ **Custom domains**
- ✅ **Automatic deployments**

## 🎯 **Expected Result**

After deployment:
- ✅ **Backend URL**: `https://your-app-name.railway.app`
- ✅ **Health Check**: `https://your-app-name.railway.app/health`
- ✅ **API Docs**: `https://your-app-name.railway.app/docs`
- ✅ **AI Tutor**: `https://your-app-name.railway.app/tutor/health`

## 🚨 **Troubleshooting**

**If deployment fails:**
1. Check Railway logs in dashboard
2. Ensure all dependencies are in `requirements.txt`
3. Verify environment variables are set

**If backend doesn't start:**
1. Check the startup command in Railway
2. Verify Python version compatibility
3. Check for missing environment variables

---

**Ready to deploy? Let's get your backend live!** 🚀
