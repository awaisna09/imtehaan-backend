# Grading System Configuration Guide

This guide explains how to configure your AI grading system with the new `grading_config.env` file.

## 🔑 **Configuration File Setup**

### **1. Create Your Configuration File**

Copy the `grading_config.env` file and update it with your actual API keys:

```bash
cp grading_config.env grading_config.env.local
```

### **2. Update API Keys**

Edit `grading_config.env.local` with your actual keys:

```env
# OpenAI API Configuration
OPENAI_API_KEY="your-actual-openai-api-key-here"

# LangSmith API Configuration for Tracing and Monitoring
LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="your-actual-langsmith-api-key-here"
LANGSMITH_PROJECT="grading"
```

## 🚀 **Configuration Options**

### **OpenAI Settings**
- `GRADING_MODEL`: AI model to use (default: "gpt-4")
- `GRADING_TEMPERATURE`: Creativity level 0-1 (default: 0.1)
- `GRADING_MAX_TOKENS`: Maximum response length (default: 4000)

### **LangSmith Tracing**
- `LANGSMITH_TRACING`: Enable/disable tracing (default: "true")
- `LANGSMITH_ENDPOINT`: LangSmith API endpoint
- `LANGSMITH_API_KEY`: Your LangSmith API key
- `LANGSMITH_PROJECT`: Project name for tracing

### **Server Settings**
- `GRADING_HOST`: Server host (default: "0.0.0.0")
- `GRADING_PORT`: Server port (default: 8001)

### **Performance Settings**
- `REQUEST_TIMEOUT`: Request timeout in seconds (default: 30)
- `MAX_CONCURRENT_REQUESTS`: Concurrent request limit (default: 10)

## 🔧 **How to Use**

### **1. Start the Grading API**
```bash
python grading_api.py
```

### **2. Test the Configuration**
```bash
python answer_grading_agent.py
```

### **3. Check LangSmith Tracing**
If enabled, you'll see:
```
🔍 LangSmith tracing enabled for grading system
```

## 📊 **LangSmith Benefits**

With LangSmith tracing enabled, you get:

- **Request Monitoring**: Track all grading requests
- **Performance Analytics**: Monitor response times and token usage
- **Error Tracking**: Identify and debug issues
- **Cost Analysis**: Monitor API usage and costs
- **Quality Metrics**: Track grading consistency and accuracy

## 🛡️ **Security Notes**

- **Never commit** your actual API keys to version control
- **Use environment variables** for production deployments
- **Rotate keys regularly** for security
- **Monitor usage** to prevent abuse

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **API Key Not Found**
   - Check `grading_config.env` file exists
   - Verify API key is correct
   - Ensure no extra spaces or quotes

2. **LangSmith Not Working**
   - Verify LangSmith API key is valid
   - Check internet connectivity
   - Ensure project name exists in LangSmith

3. **Configuration Not Loading**
   - Restart the grading API after changes
   - Check file permissions
   - Verify file path is correct

## 📁 **File Structure**

```
your-project/
├── grading_config.env          # Configuration template
├── grading_config.env.local    # Your actual keys (gitignored)
├── answer_grading_agent.py     # Grading agent
├── grading_api.py              # FastAPI server
└── GRADING_CONFIG_README.md    # This file
```

## 🚀 **Next Steps**

1. **Update your API keys** in the configuration file
2. **Test the system** with the new configuration
3. **Monitor performance** in LangSmith dashboard
4. **Customize settings** based on your needs

## 📞 **Support**

If you encounter issues:
1. Check the console output for error messages
2. Verify your API keys are correct
3. Test the configuration step by step
4. Check LangSmith dashboard for tracing data

---

**Happy Grading! 🎓✨**
