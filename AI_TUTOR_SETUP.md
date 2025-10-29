# AI Tutor Service Setup Guide

This guide will help you set up the AI Tutor service that integrates LangChain with OpenAI API for your React frontend.

## 🚀 Features

- **Intelligent Tutoring**: AI-powered explanations and guidance
- **Custom Tools**: Specialized tools for topic explanation, question answering, and practice generation
- **Conversation Memory**: Maintains context across chat sessions
- **Lesson Generation**: Creates custom lessons based on learning objectives
- **Real-time Chat**: Interactive conversations with the AI tutor

## 📋 Prerequisites

- Python 3.8 or higher
- OpenAI API key
- LangChain API key (optional, for enhanced features)
- Node.js and npm (for frontend integration)

## 🛠️ Installation

### 1. Clone and Setup Python Environment

```bash
# Create virtual environment
python -m venv ai-tutor-env

# Activate virtual environment
# On Windows:
ai-tutor-env\Scripts\activate
# On macOS/Linux:
source ai-tutor-env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# LangChain API Configuration (optional)
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_PROJECT=ai-tutor-project
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### 3. Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file

#### LangChain API Key (Optional)
1. Go to [LangChain Platform](https://smith.langchain.com/)
2. Sign up or log in
3. Create a new project
4. Get your API key
5. Copy and paste into your `.env` file

## 🚀 Running the Service

### Start the AI Tutor Backend

```bash
# Make sure your virtual environment is activated
python ai_tutor_service.py
```

The service will start on `http://localhost:8000`

### Test the Service

```bash
# Health check
curl http://localhost:8000/tutor/health

# Get available topics
curl http://localhost:8000/tutor/topics

# Test chat (replace with your actual data)
curl -X POST http://localhost:8000/tutor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is business strategy?",
    "topic": "Business Strategy",
    "user_id": "test_user"
  }'
```

## 🔧 Frontend Integration

### 1. Import the AI Tutor Service

```javascript
import aiTutorService from './utils/ai-tutor-service';
```

### 2. Initialize the Service

```javascript
// Set user ID and topic
aiTutorService.setUserId(user.id);
aiTutorService.setCurrentTopic(selectedTopic.title);

// Test connection
const healthCheck = await aiTutorService.healthCheck();
console.log('AI Tutor Service Status:', healthCheck);
```

### 3. Send Messages

```javascript
// Send a message to the AI Tutor
const response = await aiTutorService.sendMessage(
  "Can you explain marketing strategy?",
  lessonContent // Optional: include lesson content for context
);

if (response.success) {
  console.log('AI Response:', response.data.response);
  console.log('Suggestions:', response.data.suggestions);
  console.log('Related Concepts:', response.data.related_concepts);
} else {
  console.error('Error:', response.error);
}
```

### 4. Generate Custom Lessons

```javascript
const lesson = await aiTutorService.generateLesson(
  "Digital Marketing",
  ["Understand social media marketing", "Learn about SEO", "Explore content marketing"],
  "intermediate"
);

if (lesson.success) {
  console.log('Lesson Content:', lesson.data.lesson_content);
  console.log('Key Points:', lesson.data.key_points);
  console.log('Practice Questions:', lesson.data.practice_questions);
}
```

## 🎯 API Endpoints

### POST `/tutor/chat`
Main endpoint for AI tutor conversations.

**Request Body:**
```json
{
  "message": "What is business strategy?",
  "topic": "Business Strategy",
  "lesson_content": "Optional lesson content for context",
  "user_id": "user123",
  "conversation_history": [],
  "learning_level": "intermediate"
}
```

**Response:**
```json
{
  "response": "Business strategy is a comprehensive plan...",
  "suggestions": [
    "Can you explain with a real-world example?",
    "What are the key differences from other concepts?"
  ],
  "related_concepts": ["marketing", "operations", "finance"],
  "confidence_score": 0.9
}
```

### POST `/tutor/generate-lesson`
Generate custom lessons for topics.

**Request Body:**
```json
{
  "topic": "Digital Marketing",
  "learning_objectives": ["Understand social media", "Learn SEO basics"],
  "difficulty_level": "intermediate"
}
```

### GET `/tutor/topics`
Get list of available topics.

### GET `/tutor/health`
Health check endpoint.

## 🛠️ Customization

### Adding New Tools

1. Create a new tool class inheriting from `BaseTool`:

```python
class CustomTool(BaseTool):
    name = "custom_tool"
    description = "Description of what this tool does"
    
    def _run(self, input_param: str) -> str:
        # Your tool logic here
        return "Tool result"
```

2. Add it to the tools list:

```python
tools = [
    TopicExplanationTool(),
    QuestionAnsweringTool(),
    PracticeQuestionGeneratorTool(),
    ConceptClarificationTool(),
    CustomTool()  # Add your new tool
]
```

### Modifying Prompts

Edit the system prompt in the `ChatPromptTemplate` to change the AI tutor's personality and behavior.

### Adding New Topics

Modify the `get_available_topics()` function to include your custom topics.

## 🔒 Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **CORS Configuration**: Configure CORS properly for production
- **Rate Limiting**: Implement rate limiting for production use
- **Input Validation**: Validate all user inputs
- **Error Handling**: Implement proper error handling and logging

## 🚀 Production Deployment

### Environment Variables
Set proper environment variables in your production environment.

### CORS Configuration
Update CORS settings to only allow your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Logging
Implement proper logging for production:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Monitoring
Add health checks and monitoring endpoints for production use.

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
2. **API Key Issues**: Verify your API keys are correct and have sufficient credits
3. **CORS Errors**: Check CORS configuration in production
4. **Memory Issues**: Monitor conversation history size

### Debug Mode

Enable debug mode by setting:

```python
import logging
logging.getLogger().setLevel(logging.DEBUG)
```

## 📚 Additional Resources

- [LangChain Documentation](https://python.langchain.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🤝 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify your API keys and configuration
3. Test with simple requests first
4. Check the health endpoint

---

**Happy Coding! 🎉**
