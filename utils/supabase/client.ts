import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, publicAnonKey } from './info'

export const supabase = createClient(supabaseUrl, publicAnonKey)

// Database types (you can generate these from your Supabase dashboard)
export interface P1MockExam {
  question_id: number;
  part: string;
  case_study: string;
  question: string;
  solution: string;
  hint: string | null;
  topic_name: string;
  marks: number;
  image: string | null;
  Set: string | null;
}

export interface P2MockExam {
  question_id: number;
  case_study: string;
  image_url: string | null;
  question: string;
  question_number: number;
  part: string;
  marks: number;
  case: string | null;
  answer?: string;
}

// New Study Plan interface matching the database table
export interface StudyPlan {
  plan_id: number;
  user_id: string | number;
  study_date: string;
  study_time_minutes: number;
  total_topics: number;
  topics_done: number;
  topics_left: number;
  exam_date: string;
  // Optional fields - only present if columns exist in table
  subject?: string;
  topics_to_cover?: string[];
  plan_name?: string;
  status?: 'active' | 'completed' | 'paused';
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          topic: string
          duration: number
          questions_answered: number
          correct_answers: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          topic: string
          duration: number
          questions_answered: number
          correct_answers: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          topic?: string
          duration?: number
          questions_answered?: number
          correct_answers?: number
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          subject: string
          topic: string
          question: string
          options: string[]
          correct_answer: string
          difficulty: 'easy' | 'medium' | 'hard'
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          topic: string
          question: string
          options: string[]
          correct_answer: string
          difficulty: 'easy' | 'medium' | 'hard'
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          topic?: string
          question?: string
          options?: string[]
          correct_answer?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          explanation?: string
          created_at?: string
        }
      }
      business_activity_questions: {
        Row: {
          question_id: string
          topic_id: string | null
          topic_name: string | null
          context: string | null
          part: string | null
          question: string | null
          marks: number | null
          skill: string | null
          model_answer: string | null
          explanation: string | null
          hint: string | null
        }
        Insert: {
          question_id: string
          topic_id?: string | null
          topic_name?: string | null
          context?: string | null
          part?: string | null
          question?: string | null
          marks?: number | null
          skill?: string | null
          model_answer?: string | null
          explanation?: string | null
          hint?: string | null
        }
        Update: {
          question_id?: string
          topic_id?: string | null
          topic_name?: string | null
          context?: string | null
          part?: string | null
          question?: string | null
          marks?: number | null
          skill?: string | null
          model_answer?: string | null
          explanation?: string | null
          hint?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          response?: string
          created_at?: string
        }
      }
      flashcards: {
        Row: {
          card_id: number
          flashcard_id: string
          subject_id: number | null
          topic_id: number | null
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: string
          hint: string | null
          explanation: string | null
          difficulty: 'easy' | 'medium' | 'hard'
        }
        Insert: {
          card_id?: number
          flashcard_id: string
          subject_id?: number | null
          topic_id?: number | null
          question: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: string
          hint?: string | null
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
        }
        Update: {
          card_id?: number
          flashcard_id?: string
          subject_id?: number | null
          topic_id?: number | null
          question?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_option?: string
          hint?: string | null
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
        }
      }
      subjects: {
        Row: {
          subject_id: number
          subject_name: string
          description: string | null
        }
        Insert: {
          subject_id: number
          subject_name: string
          description?: string | null
        }
        Update: {
          subject_id?: number
          subject_name?: string
          description?: string | null
        }
      }
      topics: {
        Row: {
          topic_id: number
          subject_id: number | null
          title: string
          description: string | null
        }
        Insert: {
          topic_id: number
          subject_id?: number | null
          title: string
          description?: string | null
        }
        Update: {
          topic_id?: number
          subject_id?: number | null
          title?: string
          description?: string | null
        }
      }
      video_lessons: {
        Row: {
          video_id: string
          video_num: number | null
          subject_id: number | null
          topic_id: number | null
          title: string
          description: string | null
          duration_seconds?: number | null // Made optional to fix linter error
          source: string | null
          tags: string[] | null
          language: string | null
        }
        Insert: {
          video_id: string
          video_num?: number | null
          subject_id?: number | null
          topic_id?: number | null
          title: string
          description?: string | null
          duration_seconds?: number | null
          source?: string | null
          tags?: string[] | null
          language?: string | null
        }
        Update: {
          video_id?: string
          video_num?: number | null
          subject_id?: number | null
          topic_id?: number | null
          title?: string
          description?: string | null
          duration_seconds?: number | null
          source?: string | null
          tags?: string[] | null
          language?: string | null
        }
      }
      lessons: {
        Row: {
          lessons_id: number
          topic_id: number | null
          title: string
          content: string
          media_type: string | null
          reading_time_minutes: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          lessons_id?: number
          topic_id?: number | null
          title?: string
          content?: string
          media_type?: string | null
          reading_time_minutes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          lessons_id?: number
          topic_id?: number | null
          title?: string
          content?: string
          media_type?: string | null
          reading_time_minutes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      p1_mock_exam: {
        Row: P1MockExam;
        Insert: Omit<P1MockExam, 'question_id'>;
        Update: Partial<Omit<P1MockExam, 'question_id'>>;
      };
    }
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Typed Supabase client
export const typedSupabase = createClient<Database>(supabaseUrl, publicAnonKey) 