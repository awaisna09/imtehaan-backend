import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Logo } from './Logo';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  BookOpen,
  Brain,
  Lightbulb,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  subject?: string;
  attachments?: string[];
}

interface AIChatbotProps {
  language: 'en';
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const translations = {
  en: {
    title: "AI Study Assistant",
    placeholder: "Ask me anything about your studies...",
    send: "Send",
    minimize: "Minimize",
    maximize: "Maximize", 
    close: "Close",
    typing: "AI is typing...",
    suggestions: [
      "Explain photosynthesis",
      "Help with calculus",
      "IGCSE exam tips",
      "Chemistry formulas"
    ],
    welcomeMessage: "Hi! I'm your AI study assistant. I can help you with British and IB curricula questions. What would you like to learn today?",
    errorMessage: "Sorry, I encountered an error. Please try again.",
    quickActions: {
      explain: "Explain this topic",
      practice: "Give me practice questions",
      tips: "Study tips",
      examples: "Show examples"
    }
  }};export function AIChatbot({ language, onClose, isMinimized = false, onToggleMinimize }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations.en;

  useEffect(() => {
    // Add welcome message on mount
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: t.welcomeMessage,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language, t.welcomeMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      en: [
        "Great question! Let me break this down for you step by step...",
        "Based on the British/IB curriculum, here's what you need to know...",
        "I'd be happy to help with that! Here's a comprehensive explanation...",
        "This is a common exam topic. Let me explain it clearly...",
        "Perfect! This concept is fundamental to understanding..."
      ],
      ar: [
        "سؤال ممتاز! دعني أوضح لك هذا خطوة بخطوة...",
        "بناءً على المنهج البريطاني/البكالوريا الدولية، إليك ما تحتاج لمعرفته...",
        "سأكون سعيداً لمساعدتك في ذلك! إليك شرح شامل...",
        "هذا موضوع شائع في الامتحانات. دعني أوضحه بوضوح...",
        "ممتاز! هذا المفهوم أساسي لفهم..."
      ]
    };

    const randomResponse = responses[language][Math.floor(Math.random() * responses[language].length)];
    
    // Add more specific responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('math') || lowerMessage.includes('رياضيات') || lowerMessage.includes('calculus')) {
      return true 
        ? `${randomResponse}\n\nFor mathematics, I recommend breaking complex problems into smaller steps. Would you like me to work through a specific example with you?`
        : `${randomResponse}\n\nبالنسبة للرياضيات، أنصح بتقسيم المسائل المعقدة إلى خطوات أصغر. هل تريد مني أن أعمل على مثال محدد معك؟`;
    }
    
    if (lowerMessage.includes('physics') || lowerMessage.includes('فيزياء')) {
      return true
        ? `${randomResponse}\n\nPhysics concepts often build on each other. Understanding the fundamentals is key. What specific topic in physics are you working on?`
        : `${randomResponse}\n\nمفاهيم الفيزياء غالباً ما تبنى على بعضها البعض. فهم الأساسيات هو المفتاح. ما الموضوع المحدد في الفيزياء الذي تعمل عليه؟`;
    }
    
    if (lowerMessage.includes('chemistry') || lowerMessage.includes('كيمياء')) {
      return true
        ? `${randomResponse}\n\nChemistry is all about understanding how atoms and molecules interact. Visual learning can be very helpful here. Would you like me to explain using diagrams?`
        : `${randomResponse}\n\nالكيمياء تدور حول فهم كيف تتفاعل الذرات والجزيئات. التعلم البصري يمكن أن يكون مفيداً جداً هنا. هل تريد مني أن أشرح باستخدام الرسوم البيانية؟`;
    }
    
    return `${randomResponse}\n\nI'm here to help you succeed in your British and IB curriculum studies. Feel free to ask me anything!`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await generateAIResponse(inputValue);
      
      setIsTyping(false);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: t.errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 h-16 p-4 shadow-lg border-imtehaan-accent z-50">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-imtehaan-accent" />
            <span className="text-sm font-medium">{t.title}</span>
            {isTyping && (
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-imtehaan-accent rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-imtehaan-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-imtehaan-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-xl border-imtehaan-accent z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-imtehaan-gradient-accent text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">{t.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 chat-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} chat-message-enter`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-imtehaan-primary text-white' 
                    : 'bg-imtehaan-accent text-white'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-imtehaan-primary text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-imtehaan-accent text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-imtehaan-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-imtehaan-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-imtehaan-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{t.typing}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {t.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs border-imtehaan-accent text-imtehaan-accent hover:bg-imtehaan-accent hover:text-white"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-imtehaan-accent hover:bg-imtehaan-accent-dark text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Floating Chat Button Component
interface FloatingChatButtonProps {
  onClick: () => void;
  language: 'en';
  hasUnread?: boolean;
}

export function FloatingChatButton({ onClick, language, hasUnread = false }: FloatingChatButtonProps) {
  const tooltipText = 'AI Study Assistant';

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-imtehaan-gradient-accent text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow relative"
      >
        <MessageCircle className="h-6 w-6" />
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-imtehaan-error rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </Button>
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {tooltipText}
      </div>
    </div>
  );
}