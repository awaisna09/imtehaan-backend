# 🔐 **Railway Environment Variables Setup**

## 🚀 **How to Add Environment Variables to Railway**

### **Step 1: Go to Railway Dashboard**
1. Visit: https://railway.app
2. Go to your project: `imtehaan-backend`
3. Click on your service

### **Step 2: Add Environment Variables**
Go to the **Variables** tab and add these variables:

| Variable Name | Value |
|---------------|-------|
| `OPENAI_API_KEY` | `[Your OpenAI API Key]` |
| `LANGSMITH_API_KEY` | `[Your LangSmith API Key]` |
| `LANGSMITH_PROJECT` | `imtehaan` |
| `LANGSMITH_ENDPOINT` | `https://api.smith.langchain.com` |
| `LANGSMITH_TRACING` | `true` |

### **Step 3: Redeploy**
After adding all variables:
- Railway will **automatically redeploy**
- Your backend will start with the API keys
- No more "OPENAI_API_KEY not found" errors

## 🎯 **Expected Result**

After adding the environment variables, you should see:
- ✅ **"Grading agent initialized successfully"**
- ✅ **"AI Tutor agent initialized successfully"**
- ✅ **All endpoints working**
- ✅ **Backend fully functional**

## 🔗 **Test Your Backend**

Once environment variables are set:
- **Health**: `https://your-app.railway.app/health`
- **API Docs**: `https://your-app.railway.app/docs`
- **AI Tutor**: `https://your-app.railway.app/tutor/health`

## 📋 **Next Steps**

1. **Get your Railway URL** (like `https://your-app.railway.app`)
2. **Update Netlify**:
   - Go to Netlify dashboard
   - Update: `VITE_API_BASE_URL=https://your-app.railway.app`
   - Redeploy frontend

---

**Your backend will be fully working once you add these environment variables to Railway!** 🚀