#!/usr/bin/env python3
"""
Mock Exam Grading Agent
This agent grades complete mock exams by evaluating all attempted questions.
"""

import os
import json
from typing import List, Dict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
import logging

# Load environment variables
load_dotenv('config.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QuestionGrade(BaseModel):
    """Grade for a single question"""
    question_id: int
    question_number: int = 1
    part: str = ""
    question_text: str
    student_answer: str
    model_answer: str
    marks_allocated: int
    marks_awarded: float = Field(description="Marks awarded to the student")
    percentage_score: float = Field(description="Percentage score for this question")
    feedback: str = Field(description="Detailed feedback on the answer")
    strengths: List[str] = Field(description="List of strengths in the answer")
    improvements: List[str] = Field(description="Areas that need improvement")


class ExamReport(BaseModel):
    """Complete exam grading report"""
    total_questions: int
    questions_attempted: int
    total_marks: int
    marks_obtained: float
    percentage_score: float
    overall_grade: str = Field(description="Letter grade: A+, A, B+, B, C+, C, D, F")
    question_grades: List[QuestionGrade]
    overall_feedback: str = Field(description="Overall exam performance feedback")
    recommendations: List[str] = Field(description="Recommendations for improvement")
    strengths_summary: List[str] = Field(description="Overall strengths")
    weaknesses_summary: List[str] = Field(description="Overall weaknesses")


class MockExamGradingAgent:
    """Agent for grading complete mock exams"""
    
    def __init__(self, api_key: str):
        """Initialize the grading agent"""
        self.llm = ChatOpenAI(
            model=os.getenv('GRADING_MODEL', 'gpt-4-turbo-preview'),
            temperature=0.3,
            max_tokens=4000,
            openai_api_key=api_key
        )
        logger.info("✅ Mock Exam Grading Agent initialized")
    
    def grade_exam(self, attempted_questions: List[Dict]) -> ExamReport:
        """
        Grade a complete mock exam
        
        Args:
            attempted_questions: List of attempted questions with question, student_answer, and model_answer
            
        Returns:
            ExamReport with detailed grading results
        """
        try:
            logger.info(f"📝 Grading exam with {len(attempted_questions)} attempted questions")
            
            # Calculate total marks
            total_marks = sum(q.get('marks', 0) for q in attempted_questions)
            
            # Grade each question
            question_grades = []
            for q in attempted_questions:
                grade = self._grade_single_question(q)
                question_grades.append(grade)
            
            # Calculate overall scores
            marks_obtained = sum(g.marks_awarded for g in question_grades)
            percentage_score = (marks_obtained / total_marks * 100) if total_marks > 0 else 0
            
            # Generate overall feedback
            overall_feedback = self._generate_overall_feedback(question_grades, percentage_score)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(question_grades, percentage_score)
            
            # Generate strengths and weaknesses summary
            strengths, weaknesses = self._generate_summaries(question_grades)
            
            # Determine overall grade
            overall_grade = self._calculate_grade(percentage_score)
            
            report = ExamReport(
                total_questions=len(attempted_questions),
                questions_attempted=len(attempted_questions),
                total_marks=total_marks,
                marks_obtained=marks_obtained,
                percentage_score=round(percentage_score, 2),
                overall_grade=overall_grade,
                question_grades=question_grades,
                overall_feedback=overall_feedback,
                recommendations=recommendations,
                strengths_summary=strengths,
                weaknesses_summary=weaknesses
            )
            
            logger.info(f"✅ Exam graded successfully. Score: {percentage_score}% ({overall_grade})")
            return report
            
        except Exception as e:
            logger.error(f"❌ Error grading exam: {e}")
            return self._create_fallback_report(attempted_questions)
    
    def _grade_single_question(self, question: Dict) -> QuestionGrade:
        """Grade a single question"""
        try:
            question_id = question.get('question_id', 0)
            question_text = question.get('question', '')
            student_answer = question.get('user_answer', '')
            model_answer = question.get('solution') or question.get('model_answer', '')
            marks = question.get('marks', 0)
            part = question.get('part', '')
            question_number = question.get('question_number', 0) if 'question_number' in question else question_id
            
            if not model_answer:
                # If no model answer provided, award marks based on effort
                return QuestionGrade(
                    question_id=question_id,
                    question_number=question_number,
                    part=part,
                    question_text=question_text,
                    student_answer=student_answer,
                    model_answer="No model answer available",
                    marks_allocated=marks,
                    marks_awarded=marks * 0.5 if student_answer.strip() else 0,
                    percentage_score=50.0 if student_answer.strip() else 0.0,
                    feedback="Your answer has been recorded. Detailed grading requires a model answer.",
                    strengths=["Answer submitted"] if student_answer.strip() else ["Attempt made"],
                    improvements=["Keep practicing"] if student_answer.strip() else ["Try to provide an answer"]
                )
            
            # Grade using LLM
            grading_prompt = f"""
You are an expert examiner grading a Business Studies mock exam question. Please evaluate the student's answer comprehensively.

QUESTION:
{question_text}

MODEL ANSWER:
{model_answer}

STUDENT'S ANSWER:
{student_answer}

MARKS ALLOCATED: {marks}

Please provide:
1. Marks awarded (0 to {marks})
2. Percentage score (0 to 100)
3. Detailed feedback on the answer
4. 2-3 key strengths
5. 2-3 areas for improvement

Be fair, constructive, and encouraging. Consider:
- Understanding of the topic
- Use of appropriate business terminology
- Structure and clarity of response
- Relevance of the content
- Depth of analysis

Return your response in this JSON format:
{{
    "marks_awarded": <number between 0 and {marks}>,
    "percentage_score": <number between 0 and 100>,
    "feedback": "<detailed feedback>",
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2"]
}}
"""
            
            response = self.llm.invoke(grading_prompt)
            
            # Parse the response
            try:
                result = json.loads(response.content)
            except json.JSONDecodeError:
                # Try to extract JSON from the response
                content = response.content
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    result = json.loads(content[json_start:json_end])
                else:
                    raise ValueError("Could not parse JSON response")
            
            return QuestionGrade(
                question_id=question_id,
                question_number=question_number,
                part=part,
                question_text=question_text,
                student_answer=student_answer,
                model_answer=model_answer,
                marks_allocated=marks,
                marks_awarded=float(result.get('marks_awarded', marks * 0.5)),
                percentage_score=float(result.get('percentage_score', 50.0)),
                feedback=result.get('feedback', 'Good effort on this question.'),
                strengths=result.get('strengths', ['Answer submitted']),
                improvements=result.get('improvements', ['Keep practicing'])
            )
            
        except Exception as e:
            logger.error(f"Error grading question {question_id}: {e}")
            return QuestionGrade(
                question_id=question.get('question_id', 0),
                question_number=question.get('question_number', 0),
                part=question.get('part', ''),
                question_text=question.get('question', ''),
                student_answer=question.get('user_answer', ''),
                model_answer=question.get('solution') or question.get('model_answer', 'No model answer'),
                marks_allocated=question.get('marks', 0),
                marks_awarded=0.0,
                percentage_score=0.0,
                feedback="Error in grading system. Please contact support.",
                strengths=["Answer submitted"],
                improvements=["Grading error occurred"]
            )
    
    def _generate_overall_feedback(self, question_grades: List[QuestionGrade], percentage: float) -> str:
        """Generate overall feedback for the exam"""
        avg_percentage = sum(g.percentage_score for g in question_grades) / len(question_grades) if question_grades else 0
        
        if percentage >= 90:
            return f"Outstanding performance! You scored {percentage}%, demonstrating excellent mastery of Business Studies concepts. Your understanding is exceptional across all topics covered."
        elif percentage >= 80:
            return f"Excellent work! Your score of {percentage}% shows strong understanding of the material. You have a solid grasp of key concepts and can apply them effectively."
        elif percentage >= 70:
            return f"Good performance with {percentage}%. You demonstrate a solid understanding of most concepts. With some focused practice, you can achieve even better results."
        elif percentage >= 60:
            return f"Satisfactory performance at {percentage}%. You understand the basics but need to strengthen your knowledge in several areas. Keep studying!"
        elif percentage >= 50:
            return f"Below expectations at {percentage}%. Focus on understanding core concepts and improving your answer structure. More practice will help you improve significantly."
        else:
            return f"Needs improvement at {percentage}%. Review the fundamental concepts and work on building your understanding. Don't give up - consistent effort will lead to progress."
    
    def _generate_recommendations(self, question_grades: List[QuestionGrade], percentage: float) -> List[str]:
        """Generate recommendations based on performance"""
        recommendations = []
        
        if percentage < 60:
            recommendations.append("Review fundamental Business Studies concepts thoroughly")
            recommendations.append("Practice writing structured answers with clear points")
            recommendations.append("Focus on using appropriate business terminology")
        elif percentage < 80:
            recommendations.append("Strengthen understanding in weaker topic areas")
            recommendations.append("Practice providing more detailed analysis in answers")
            recommendations.append("Work on connecting concepts to real-world examples")
        else:
            recommendations.append("Continue practicing with more challenging questions")
            recommendations.append("Focus on refining your critical analysis skills")
            recommendations.append("Maintain your excellent study habits")
        
        # Find questions with lowest scores
        low_scores = sorted(question_grades, key=lambda x: x.percentage_score)[:3]
        if low_scores:
            recommendations.append(f"Pay special attention to Question {low_scores[0].question_number} Part {low_scores[0].part} - scored {low_scores[0].percentage_score}%")
        
        return recommendations
    
    def _generate_summaries(self, question_grades: List[QuestionGrade]) -> tuple[List[str], List[str]]:
        """Generate strengths and weaknesses summaries"""
        strengths = []
        weaknesses = []
        
        # Analyze common patterns
        all_strengths = [s for g in question_grades for s in g.strengths]
        all_improvements = [i for g in question_grades for i in g.improvements]
        
        # Count occurrences
        strength_counts = {}
        improvement_counts = {}
        
        for s in all_strengths:
            strength_counts[s] = strength_counts.get(s, 0) + 1
        
        for i in all_improvements:
            improvement_counts[i] = improvement_counts.get(i, 0) + 1
        
        # Get top 3 strengths
        strengths = sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        strengths = [s[0] for s in strengths]
        
        # Get top 3 areas for improvement
        weaknesses = sorted(improvement_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        weaknesses = [w[0] for w in weaknesses]
        
        if not strengths:
            strengths = ["Consistent effort across questions", "Completed all questions"]
        
        if not weaknesses:
            weaknesses = ["Continue practicing", "Maintain focus and effort"]
        
        return strengths, weaknesses
    
    def _calculate_grade(self, percentage: float) -> str:
        """Calculate letter grade from percentage"""
        if percentage >= 97:
            return "A+"
        elif percentage >= 93:
            return "A"
        elif percentage >= 87:
            return "B+"
        elif percentage >= 83:
            return "B"
        elif percentage >= 77:
            return "C+"
        elif percentage >= 73:
            return "C"
        elif percentage >= 65:
            return "D"
        else:
            return "F"
    
    def _create_fallback_report(self, attempted_questions: List[Dict]) -> ExamReport:
        """Create a fallback report when grading fails"""
        total_marks = sum(q.get('marks', 0) for q in attempted_questions)
        
        return ExamReport(
            total_questions=len(attempted_questions),
            questions_attempted=len(attempted_questions),
            total_marks=total_marks,
            marks_obtained=0.0,
            percentage_score=0.0,
            overall_grade="F",
            question_grades=[],
            overall_feedback="Error in grading system. Please try again or contact support.",
            recommendations=["Retry the grading", "Contact technical support"],
            strengths_summary=["Answers submitted successfully"],
            weaknesses_summary=["Grading system error"]
        )


def main():
    """Example usage"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found")
        return
    
    agent = MockExamGradingAgent(api_key)
    
    # Example attempted questions
    attempted_questions = [
        {
            'question_id': 1,
            'question': 'Explain the concept of market segmentation.',
            'user_answer': 'Market segmentation is dividing customers into groups',
            'solution': 'Market segmentation is the process of dividing a market into groups of customers with similar needs and characteristics...',
            'marks': 10,
            'part': 'A'
        }
    ]
    
    report = agent.grade_exam(attempted_questions)
    
    print("\n📊 EXAM REPORT")
    print("=" * 50)
    print(f"Score: {report.marks_obtained}/{report.total_marks} marks ({report.percentage_score}%)")
    print(f"Grade: {report.overall_grade}")
    print(f"\nFeedback: {report.overall_feedback}")


if __name__ == "__main__":
    main()

