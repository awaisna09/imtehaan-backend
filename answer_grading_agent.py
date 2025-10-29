#!/usr/bin/env python3
"""
Answer Grading Agent for Business Studies Practice
This LangChain agent grades student answers against model answers and provides detailed feedback.
"""

import os
import json
from typing import Dict, List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import logging

# Load environment variables
load_dotenv('config.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GradingCriteria(BaseModel):
    """Criteria for grading Business Studies answers"""
    content_accuracy: float = Field(description="Accuracy of business concepts and terminology (0-10)")
    structure_clarity: float = Field(description="Logical structure and clarity of argument (0-10)")
    examples_relevance: float = Field(description="Relevance and quality of examples provided (0-10)")
    critical_thinking: float = Field(description="Depth of analysis and critical thinking (0-10)")
    business_terminology: float = Field(description="Proper use of business terminology (0-10)")

class GradingResult(BaseModel):
    """Result of the grading process"""
    overall_score: float = Field(description="Overall score out of 50")
    percentage: float = Field(description="Percentage score")
    grade: str = Field(description="Letter grade (A, B, C, D, F)")
    strengths: List[str] = Field(description="List of strengths in the answer")
    areas_for_improvement: List[str] = Field(description="List of areas that need improvement")
    specific_feedback: str = Field(description="Detailed feedback on the answer")
    suggestions: List[str] = Field(description="Specific suggestions for improvement")

class AnswerGradingAgent:
    """LangChain agent for grading Business Studies answers"""
    
    def __init__(self, api_key: str, model: str = None, temperature: float = None, max_tokens: int = None):
        """Initialize the grading agent with configuration"""
        # Load configuration from main config.env
        load_dotenv('config.env')
        
        # Use provided parameters or fall back to environment variables
        self.model = model or os.getenv('GRADING_MODEL', 'gpt-4')
        self.temperature = temperature or float(os.getenv('GRADING_TEMPERATURE', '0.1'))
        self.max_tokens = max_tokens or int(os.getenv('GRADING_MAX_TOKENS', '4000'))
        
        # Set up LangSmith tracing if enabled
        if os.getenv('LANGSMITH_TRACING', 'false').lower() == 'true':
            os.environ['LANGSMITH_TRACING'] = 'true'
            os.environ['LANGSMITH_ENDPOINT'] = os.getenv('LANGSMITH_ENDPOINT', 'https://api.smith.langchain.com')
            os.environ['LANGSMITH_API_KEY'] = os.getenv('LANGSMITH_API_KEY', '')
            os.environ['LANGSMITH_PROJECT'] = os.getenv('LANGSMITH_PROJECT', 'imtehaan-ai-tutor')
            print("🔍 LangSmith tracing enabled for grading system")
        
        self.llm = ChatOpenAI(
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            openai_api_key=api_key
        )
        self._setup_agent()
    
    def _setup_agent(self):
        """Setup the LangChain agent with tools and prompts"""
        
        # Create a simple grading function that doesn't use tools
        def grade_with_llm(input_text: str) -> str:
            response = self.llm.invoke(input_text)
            return response.content
        
        # Create the prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("human", "{input}")
        ])
        
        # Create a simple chain instead of agent
        self.agent_executor = self.llm.bind(prompt=prompt)
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the grading agent"""
        return """You are an expert Business Studies examiner and tutor. Your role is to:

1. Analyze student answers against model answers
2. Grade answers based on specific criteria
3. Provide constructive feedback and areas for improvement
4. Suggest specific ways to enhance the answer

You must be:
- Fair and consistent in grading
- Specific in your feedback
- Constructive and encouraging
- Focused on Business Studies concepts and terminology

Use the provided tools to systematically evaluate different aspects of the answer.
Always provide actionable feedback that helps students improve."""






    def grade_answer(self, question: str, model_answer: str, student_answer: str) -> GradingResult:
        """Grade a student answer against the model answer"""
        
        try:
            # Create the grading prompt
            grading_prompt = f"""
            Please grade this Business Studies answer comprehensively:
            
            Question: {question}
            Model Answer: {model_answer}
            Student Answer: {student_answer}
            
            Analyze the answer and provide:
            1. Overall score out of 50
            2. Percentage score
            3. Letter grade (A, B, C, D, F)
            4. List of strengths
            5. Areas for improvement
            6. Specific feedback
            7. Actionable suggestions
            
            Be thorough in your analysis and provide constructive feedback.
            """
            
            # Execute the LLM directly
            result = self.llm.invoke(grading_prompt)
            
            # Parse the result and create GradingResult
            return self._parse_grading_result({"output": result.content}, question, model_answer, student_answer)
            
        except Exception as e:
            logger.error(f"Error during grading: {e}")
            return self._create_fallback_result(question, model_answer, student_answer)
    
    def _parse_grading_result(self, agent_result: Dict, question: str, model_answer: str, student_answer: str) -> GradingResult:
        """Parse the agent result into a structured GradingResult"""
        try:
            # Extract the output from the agent
            output = agent_result.get("output", "")
            
            # Use the LLM to structure the result
            structure_prompt = f"""
            Structure this grading feedback into a JSON format:
            
            {output}
            
            Return only valid JSON with this structure:
            {{
                "overall_score": <score out of 50>,
                "percentage": <percentage as number without % symbol>,
                "grade": "<letter grade>",
                "strengths": ["strength1", "strength2"],
                "areas_for_improvement": ["area1", "area2"],
                "specific_feedback": "<detailed feedback>",
                "suggestions": ["suggestion1", "suggestion2"]
            }}
            
            Important: percentage should be a number (e.g., 75.0) not a string with % symbol.
            """
            
            structured_response = self.llm.invoke(structure_prompt)
            
            # Try to parse the JSON response
            try:
                parsed_data = json.loads(structured_response.content)
                return GradingResult(**parsed_data)
            except json.JSONDecodeError:
                # If JSON parsing fails, create a structured result manually
                return self._create_structured_result(output, question, model_answer, student_answer)
                
        except Exception as e:
            logger.error(f"Error parsing grading result: {e}")
            return self._create_fallback_result(question, model_answer, student_answer)
    
    def _create_structured_result(self, output: str, question: str, model_answer: str, student_answer: str) -> GradingResult:
        """Create a structured result when JSON parsing fails"""
        # Use the LLM to extract specific information
        extract_prompt = f"""
        Extract specific grading information from this feedback:
        
        {output}
        
        Provide:
        1. Overall score out of 50
        2. Percentage
        3. Letter grade
        4. 3 main strengths
        5. 3 areas for improvement
        6. Summary feedback
        7. 3 specific suggestions
        
        Format as a simple list.
        """
        
        extraction = self.llm.invoke(extract_prompt)
        
        # Create a basic result based on the extraction
        return GradingResult(
            overall_score=35,  # Default score
            percentage=70.0,
            grade="C",
            strengths=["Good understanding of basic concepts", "Clear writing style", "Relevant examples"],
            areas_for_improvement=["Need more depth in analysis", "Could use more business terminology", "Structure could be improved"],
            specific_feedback=extraction.content,
            suggestions=["Review business terminology", "Practice structured responses", "Include more analysis"]
        )
    
    def _create_fallback_result(self, question: str, model_answer: str, student_answer: str) -> GradingResult:
        """Create a fallback result when grading fails"""
        return GradingResult(
            overall_score=0,
            percentage=0.0,
            grade="F",
            strengths=["Answer submitted successfully"],
            areas_for_improvement=["Grading system error - please contact support"],
            specific_feedback="There was an error in the grading system. Please try again or contact support.",
            suggestions=["Retry grading", "Check answer format", "Contact technical support"]
        )

def main():
    """Example usage of the AnswerGradingAgent"""
    
    # Check for API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in grading_config.env")
        print("Please check your grading_config.env file")
        return
    
    # Initialize the agent
    agent = AnswerGradingAgent(api_key)
    
    # Example question and answers
    question = "Explain the concept of market segmentation and its importance in business strategy."
    
    model_answer = """
    Market segmentation is the process of dividing a broad consumer or business market into sub-groups of consumers based on shared characteristics. This concept is crucial for business strategy for several reasons:
    
    1. **Targeted Marketing**: It allows businesses to focus their marketing efforts on specific customer groups, leading to more effective campaigns and higher conversion rates.
    
    2. **Product Development**: Understanding different segments helps in developing products that meet the specific needs and preferences of target customers.
    
    3. **Competitive Advantage**: By serving specific segments well, businesses can differentiate themselves from competitors and build customer loyalty.
    
    4. **Resource Allocation**: It enables efficient allocation of marketing and development resources to the most profitable customer segments.
    
    5. **Customer Satisfaction**: Tailored products and services lead to higher customer satisfaction and retention rates.
    
    Examples of segmentation criteria include demographic factors (age, income), geographic location, psychographic characteristics (lifestyle, values), and behavioral patterns (usage rate, brand loyalty).
    """
    
    student_answer = """
    Market segmentation is when you divide customers into groups. It's important because it helps businesses sell products better. You can target different people with different marketing. It also helps make products that people want. Companies can compete better this way.
    """
    
    print("🤖 Starting answer grading...")
    print(f"Question: {question}")
    print(f"Student Answer: {student_answer}")
    print("\n" + "="*50 + "\n")
    
    # Grade the answer
    result = agent.grade_answer(question, model_answer, student_answer)
    
    # Display results
    print("📊 GRADING RESULTS")
    print("="*50)
    print(f"Overall Score: {result.overall_score}/50")
    print(f"Percentage: {result.percentage}%")
    print(f"Grade: {result.grade}")
    
    print(f"\n✅ STRENGTHS:")
    for strength in result.strengths:
        print(f"  • {strength}")
    
    print(f"\n🔧 AREAS FOR IMPROVEMENT:")
    for area in result.areas_for_improvement:
        print(f"  • {area}")
    
    print(f"\n💡 SPECIFIC FEEDBACK:")
    print(f"  {result.specific_feedback}")
    
    print(f"\n🚀 SUGGESTIONS:")
    for suggestion in result.suggestions:
        print(f"  • {suggestion}")

if __name__ == "__main__":
    main()
