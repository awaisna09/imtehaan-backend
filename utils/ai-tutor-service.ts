// AI Tutor Service for React Frontend
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TutorResponse {
  response: string;
  suggestions: string[];
  related_concepts: string[];
  confidence_score: number;
}

interface LessonResponse {
  lesson_content: string;
  key_points: string[];
  practice_questions: string[];
  estimated_duration: number;
}

class AITutorService {
  private baseURL: string;
  private conversationHistory: ConversationMessage[];
  private currentTopic: string | null;
  private userId: string | null;

  constructor() {
    // Use environment variable for API URL or fallback to localhost
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.conversationHistory = [];
    this.currentTopic = null;
    this.userId = null;
  }

  // Set user ID for conversation tracking
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Set current topic
  setCurrentTopic(topic: string): void {
    this.currentTopic = topic;
  }

  // Add message to conversation history
  addToHistory(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({ 
      role, 
      content, 
      timestamp: new Date().toISOString() 
    });
    
    // Keep only last 20 messages to prevent memory issues
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  // Get conversation history
  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Send message to AI Tutor with enhanced LangChain integration
  async sendMessage(message: string, lessonContent?: string): Promise<{
    success: boolean;
    data?: TutorResponse;
    error?: string;
  }> {
    try {
      // Enhanced request body for LangChain AI tutor
      const requestBody = {
        message: message,
        topic: this.currentTopic || 'Business Studies',
        lesson_content: lessonContent,
        user_id: this.userId || 'anonymous',
        conversation_history: this.conversationHistory,
        learning_level: 'intermediate'
      };

      console.log('🤖 Sending message to LangChain AI Tutor:', {
        topic: this.currentTopic,
        message: message.substring(0, 100) + '...',
        hasLessonContent: !!lessonContent
      });

      const response = await fetch(`${this.baseURL}/tutor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TutorResponse = await response.json();
      
      // Log successful LangChain response
      console.log('✅ LangChain AI Tutor response received:', {
        responseLength: data.response.length,
        suggestions: data.suggestions.length,
        relatedConcepts: data.related_concepts.length,
        confidence: data.confidence_score
      });
      
      // Add messages to conversation history
      this.addToHistory('user', message);
      this.addToHistory('assistant', data.response);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Error sending message to AI Tutor:', error);
      
      // Add error message to conversation
      this.addToHistory('assistant', 'I apologize, but I\'m having trouble connecting right now. Please try again.');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          response: 'I apologize, but I\'m having trouble connecting right now. Please try again.',
          suggestions: ['Check your internet connection', 'Try again in a moment', 'Contact support if the problem persists'],
          related_concepts: [],
          confidence_score: 0.0
        }
      };
    }
  }

  // Generate custom lesson
  async generateLesson(
    topic: string, 
    learningObjectives: string[], 
    difficultyLevel: string = 'intermediate'
  ): Promise<{
    success: boolean;
    data?: LessonResponse;
    error?: string;
  }> {
    try {
      const requestBody = {
        topic: topic,
        learning_objectives: learningObjectives,
        difficulty_level: difficultyLevel
      };

      const response = await fetch(`${this.baseURL}/tutor/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LessonResponse = await response.json();
      return { success: true, data: data };

    } catch (error) {
      console.error('Error generating lesson:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get available topics
  async getAvailableTopics(): Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/tutor/topics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.topics };

    } catch (error) {
      console.error('Error fetching topics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/tutor/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data };

    } catch (error) {
      console.error('Health check failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Test LangChain AI Tutor connection
  async testLangChainConnection(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log('🧪 Testing LangChain AI Tutor connection...');
      
      const testMessage = "Hello! Can you briefly explain what Business Strategy means?";
      const response = await this.sendMessage(testMessage);
      
      if (response.success && response.data) {
        console.log('✅ LangChain AI Tutor connection test successful!');
        return { 
          success: true, 
          data: {
            message: 'LangChain AI Tutor is working perfectly!',
            response: response.data.response,
            confidence: response.data.confidence_score
          }
        };
      } else {
        throw new Error('Failed to get response from LangChain AI Tutor');
      }

    } catch (error) {
      console.error('❌ LangChain AI Tutor connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get suggested questions based on topic
  getSuggestedQuestions(topic: string): string[] {
    const suggestions = [
      `Can you explain ${topic} with a real-world example?`,
      `What are the key differences between ${topic} and related concepts?`,
      `How would you apply ${topic} in a business scenario?`,
      `What are common mistakes people make when learning about ${topic}?`,
      `Can you give me a practice question about ${topic}?`,
      `What are the main benefits of understanding ${topic}?`,
      `How does ${topic} relate to other business concepts?`,
      `Can you break down ${topic} into simpler parts?`
    ];
    
    return suggestions.slice(0, 4); // Return first 4 suggestions
  }

  // Export conversation history
  exportConversation(): void {
    const conversation = {
      topic: this.currentTopic,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      messages: this.conversationHistory
    };
    
    const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-conversation-${this.currentTopic}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const aiTutorService = new AITutorService();

export default aiTutorService;
