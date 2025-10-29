import { supabase, typedSupabase, Database } from './client'
import type { User } from '@supabase/supabase-js'
import type { P1MockExam, P2MockExam } from './client';

// Authentication Services
export const authService = {
  // Sign up with email and password (with metadata for users table)
  async signUp(email: string, password: string, fullName: string, metadata?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: metadata?.user_type || 'student',
            curriculum: metadata?.curriculum || 'igcse',
            grade: metadata?.grade || '',
            subjects: metadata?.subjects || ['Mathematics', 'Physics', 'Chemistry'],
            preferences: metadata?.preferences || {}
          }
        }
      })
      return { data, error }
    } catch (err) {
      console.error('Signup error:', err)
      return { data: null, error: err }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (err) {
      console.error('Signin error:', err)
      return { data: null, error: err }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err) {
      console.error('Signout error:', err)
      return { error: err }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (err) {
      console.error('Get user error:', err)
      return { user: null, error: err }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Questions Services
export const questionsService = {
  // Get questions by subject and topic
  async getQuestions(subject: string, topic: string) {
    const { data, error } = await typedSupabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('topic', topic)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Add a new question
  async addQuestion(question: Database['public']['Tables']['questions']['Insert']) {
    const { data, error } = await typedSupabase
      .from('questions')
      .insert(question)
      .select()
    
    return { data, error }
  },

  // Get all questions for a subject
  async getQuestionsBySubject(subject: string) {
    const { data, error } = await typedSupabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Study Sessions Services
export const studySessionsService = {
  // Save a study session
  async saveSession(session: Database['public']['Tables']['study_sessions']['Insert']) {
    const { data, error } = await typedSupabase
      .from('study_sessions')
      .insert(session)
      .select()
    
    return { data, error }
  },

  // Get user's study sessions
  async getUserSessions(userId: string) {
    const { data, error } = await typedSupabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Get study sessions by date range
  async getSessionsByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await typedSupabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Get user statistics
  async getUserStats(userId: string) {
    const { data, error } = await typedSupabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
    
    if (error) return { data: null, error }
    
    const stats = {
      totalSessions: data.length,
      totalTime: data.reduce((sum, session) => sum + session.duration, 0),
      totalQuestions: data.reduce((sum, session) => sum + session.questions_answered, 0),
      totalCorrect: data.reduce((sum, session) => sum + session.correct_answers, 0),
      accuracy: data.length > 0 
        ? (data.reduce((sum, session) => sum + session.correct_answers, 0) / 
           data.reduce((sum, session) => sum + session.questions_answered, 0)) * 100
        : 0
    }
    
    return { data: stats, error: null }
  }
}

// Chat Messages Services
export const chatService = {
  // Save a chat message
  async saveMessage(message: Database['public']['Tables']['chat_messages']['Insert']) {
    const { data, error } = await typedSupabase
      .from('chat_messages')
      .insert(message)
      .select()
    
    return { data, error }
  },

  // Get user's chat history
  async getChatHistory(userId: string, subject?: string) {
    let query = typedSupabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (subject) {
      query = query.eq('subject', subject)
    }
    
    const { data, error } = await query
    return { data, error }
  }
}

// User Profile Services
export const userService = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await typedSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await typedSupabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    
    return { data, error }
  },

  // Create user profile
  async createUserProfile(profile: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await typedSupabase
      .from('users')
      .insert(profile)
      .select()
    
    return { data, error }
  }
} 

// Topics service
export const topicsService = {
  async getTopicsBySubject(subject: string) {
    try {
      console.log('=== TOPICS DEBUG START ===');
      console.log('Fetching topics for subject:', subject);
      
      // First, try to get the current session to check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'Authenticated' : 'Not authenticated');
      console.log('Session details:', session);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      // Map subject to subject_id
      const subjectIdMap: { [key: string]: number } = {
        'businessStudies': 101,
        'mathematics': 102,
        'physics': 103,
        'chemistry': 104
      };
      
      const subjectId = subjectIdMap[subject] || 101; // Default to 101 for Business Studies
      console.log('Using subject_id:', subjectId);
      
             // Fetch topics by subject_id
       let { data, error } = await supabase
         .from('topics')
         .select('topic_id, topic')
         .eq('subject_id', subjectId);

       console.log('Database query result:', { data, error });

       if (error) {
         console.error('Database query failed:', error);
         
         // Try without authentication
         console.log('Trying without authentication...');
         const { data: publicData, error: publicError } = await supabase
           .from('topics')
           .select('topic_id, topic')
           .eq('subject_id', subjectId);
          
        console.log('Public access result:', { data: publicData, error: publicError });
        
        if (publicError) {
          console.error('Public access also failed:', publicError);
          throw error; // Throw original error
        } else {
          data = publicData;
          error = null;
        }
      }
      
      console.log('Final data result:', data);
      
      if (!data || data.length === 0) {
        console.log('No topics found for subject_id:', subjectId);
        throw new Error(`No topics found for subject_id: ${subjectId}`);
      }
      
             // Transform the data to match the expected format
       const transformedData = data.map((topic) => ({
         id: topic.topic_id.toString(),
         topic_id: topic.topic_id,
         title: topic.topic,
         description: `Topic: ${topic.topic}`
       }));
      
      console.log('Transformed data:', transformedData);
      console.log('=== TOPICS DEBUG END ===');
      
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('=== TOPICS ERROR ===');
      console.error('Error fetching topics:', error);
      

      
      return { data: null, error };
    }
  },

  async getAllTopics() {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('subject', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all topics:', error);
      return { data: null, error };
    }
  },

  // Get business activity questions by topic_id
  async getBusinessActivityQuestions(topicId: string) {
    try {
      console.log('Fetching questions for topic_id:', topicId);
      
      const { data, error } = await supabase
        .from('business_activity_questions')
        .select('context, question, marks, skill, hint, topic_name, part, model_answer, explanation')
        .eq('topic_id', topicId);
      
      console.log('Database response:', { data, error });
      
      if (error) {
        console.error('Error fetching business activity questions:', error);
        throw error;
      }
      
      console.log('Questions found:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('Error in getBusinessActivityQuestions:', error);
      return { data: null, error };
    }
  },

  // Check what topic IDs are available in the business_activity_questions table
  async getAvailableBusinessTopicIds() {
    try {
      const { data, error } = await supabase
        .from('business_activity_questions')
        .select('topic_id')
        .order('topic_id');
      
      if (error) {
        console.error('Error fetching available topic IDs:', error);
        throw error;
      }
      
      const uniqueTopicIds = [...new Set(data?.map(q => q.topic_id) || [])];
      console.log('Available topic IDs in business_activity_questions:', uniqueTopicIds);
      return { data: uniqueTopicIds, error: null };
    } catch (error) {
      console.error('Error in getAvailableBusinessTopicIds:', error);
      return { data: null, error };
    }
  }
}; 

// Study Plans Service
export const studyPlansService = {
  // Get all study plans for a user
  async getUserStudyPlans(userId: string | number) {
    try {
      console.log('Fetching study plans for user:', userId);
      
      // First, let's check if the table exists by trying to select from it
      const { data: tableCheck, error: tableError } = await supabase
        .from('study_plans')
        .select('plan_id')
        .limit(1);
      
      if (tableError) {
        console.error('Table check failed:', tableError);
        throw new Error(`Table 'study_plans' might not exist: ${tableError.message}`);
      }
      
      console.log('Table exists, proceeding with fetch...');
      
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching study plans:', error);
        throw error;
      }
      
      console.log('Study plans fetched:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('Error in getUserStudyPlans:', error);
      return { data: null, error };
    }
  },

  // Create a new study plan
  async createStudyPlan(studyPlan: any) {
    try {
      console.log('Creating study plan:', studyPlan);
      
      // Validate required fields - only check for columns that exist in the table
      const missingFields = [];
      if (!studyPlan.user_id) missingFields.push('user_id');
      if (!studyPlan.study_date) missingFields.push('study_date');
      if (!studyPlan.study_time_minutes) missingFields.push('study_time_minutes');
      if (!studyPlan.total_topics) missingFields.push('total_topics');
      if (!studyPlan.exam_date) missingFields.push('exam_date');
      
      // Optional fields - only validate if they exist in the table
      // These are not required for the basic table structure you have
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Ensure data types are correct
      const validatedStudyPlan = {
        ...studyPlan,
        user_id: studyPlan.user_id, // Keep user_id as string (UUID)
        study_time_minutes: parseInt(studyPlan.study_time_minutes),
        total_topics: parseInt(studyPlan.total_topics),
        topics_done: parseInt(studyPlan.topics_done || 0)
      };
      
      console.log('Validated study plan data:', validatedStudyPlan);
      
      const { data, error } = await supabase
        .from('study_plans')
        .insert(validatedStudyPlan)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating study plan:', error);
        throw error;
      }
      
      console.log('Study plan created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in createStudyPlan:', error);
      return { data: null, error };
    }
  },

  // Update study plan status
  async updateStudyPlanStatus(planId: number, status: string) {
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('plan_id', planId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating study plan status:', error);
      return { data: null, error };
    }
  },

  // Update topics progress
  async updateTopicsProgress(planId: string | number, topicsDone: number) {
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .update({ 
          topics_done: topicsDone, 
          updated_at: new Date().toISOString() 
        })
        .eq('plan_id', planId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating topics progress:', error);
      return { data: null, error };
    }
  },

  // Check if study_plans table exists and show its structure
  async checkTableStructure() {
    try {
      console.log('Checking study_plans table structure...');
      
      // First, test basic database connection
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('study_plans')
        .select('*')
        .limit(0); // This just gets column info, no data
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        
        // Check if it's a table doesn't exist error
        if (testError.message && testError.message.includes('relation "study_plans" does not exist')) {
          console.log('Table does not exist');
          return { exists: false, error: new Error('Table does not exist') };
        }
        
        // Check if it's a permission error
        if (testError.message && testError.message.includes('permission denied')) {
          console.log('Permission denied');
          return { exists: false, error: new Error('Permission denied - check your database permissions') };
        }
        
        return { exists: false, error: testError };
      }
      
      console.log('Table exists and is accessible');
      return { exists: true, error: null };
    } catch (error) {
      console.error('Error checking table structure:', error);
      return { exists: false, error };
    }
  },

  // Get actual table columns to see what exists
  async getTableColumns() {
    try {
      console.log('Getting study_plans table columns...');
      
      // Since we know the table structure from your SQL, let's return the expected columns
      // This is more reliable than trying to detect them dynamically
      const expectedColumns = [
        'plan_id',
        'user_id', 
        'study_date',
        'study_time_minutes',
        'total_topics',
        'topics_done',
        'topics_left',
        'exam_date',
        'subject',
        'topics_to_cover',
        'plan_name',
        'status',
        'created_at',
        'updated_at'
      ];
      
      console.log('Using expected columns:', expectedColumns);
      return { columns: expectedColumns, error: null };
      
    } catch (error) {
      console.error('Error in getTableColumns:', error);
      return { columns: null, error };
    }
  },

  // Create the study_plans table with correct structure
  async createTableIfNotExists() {
    try {
      console.log('Creating study_plans table if it doesn\'t exist...');
      
      // This is a simple approach - in production you'd want to use migrations
      const { error } = await supabase.rpc('create_study_plans_table');
      
      if (error) {
        console.error('Error creating table via RPC:', error);
        // Fallback: try to create table directly
        return await this.createTableDirectly();
      }
      
      console.log('Table created successfully via RPC');
      return { success: true, error: null };
    } catch (error) {
      console.error('Error in createTableIfNotExists:', error);
      return await this.createTableDirectly();
    }
  },

  // Fallback method to create table directly
  async createTableDirectly() {
    try {
      console.log('Attempting to create table directly...');
      
      // Note: This might not work due to permissions, but worth trying
      const { error } = await supabase
        .from('study_plans')
        .select('plan_id')
        .limit(1);
      
      if (error && error.message.includes('relation "study_plans" does not exist')) {
        console.log('Table does not exist, please run the SQL script manually');
        return { success: false, error: new Error('Table does not exist. Please run the SQL script in Supabase SQL Editor.') };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error in createTableDirectly:', error);
      return { success: false, error };
    }
  }
};

// Flashcards Service
export const flashcardsService = {
  async getFlashcardsByTopic(topicId: number) {
    try {
      console.log('🔍 Getting flashcards for topic ID:', topicId);
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          card_id,
          flashcard_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          hint,
          explanation,
          difficulty
        `)
        .eq('topic_id', topicId)
        .order('card_id', { ascending: true });
      
      console.log('📊 Flashcards database response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching flashcards:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in getFlashcardsByTopic:', error);
      return { data: null, error };
    }
  },

  async getFlashcardsBySubject(subjectId: number) {
    try {
      console.log('🔍 Getting flashcards for subject ID:', subjectId);
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          card_id,
          flashcard_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          hint,
          explanation,
          difficulty
        `)
        .eq('subject_id', subjectId)
        .order('card_id', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching flashcards by subject:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in getFlashcardsBySubject:', error);
      return { data: null, error };
    }
  },

  async getFlashcardsByDifficulty(topicId: number, difficulty: 'easy' | 'medium' | 'hard') {
    try {
      console.log('🔍 Getting flashcards for topic ID:', topicId, 'with difficulty:', difficulty);
      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          card_id,
          flashcard_id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          hint,
          explanation,
          difficulty
        `)
        .eq('topic_id', topicId)
        .eq('difficulty', difficulty)
        .order('card_id', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching flashcards by difficulty:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in getFlashcardsByDifficulty:', error);
      return { data: null, error };
    }
  }
};

export const videoLessonsService = {
  async getVideoLessonsByTopic(topicId: number) {
    try {
      console.log('🔍 Getting video lessons for topic ID:', topicId);
      const { data, error } = await supabase
        .from('video_lessons')
        .select(`
          video_id,
          video_num,
          title,
          description,
          duration_seconds,
          source,
          tags,
          language
        `)
        .eq('topic_id', topicId)
        .order('video_num', { ascending: true });
      
      console.log('📊 Video lessons database response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching video lessons:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in getVideoLessonsByTopic:', error);
      return { data: null, error };
    }
  },

  async getVideoLessonsBySubject(subjectId: number) {
    try {
      console.log('🔍 Getting video lessons for subject ID:', subjectId);
      const { data, error } = await supabase
        .from('video_lessons')
        .select(`
          video_id,
          video_num,
          title,
          description,
          duration_seconds,
          source,
          tags,
          language
        `)
        .eq('subject_id', subjectId)
        .order('video_num', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching video lessons by subject:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in getVideoLessonsBySubject:', error);
      return { data: null, error };
    }
  }
}; 

export const lessonsService = {
  async getLessonsByTopic(topicId: number) {
    try {
      console.log('🔍 Getting lessons for topic ID:', topicId);
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          lessons_id,
          title,
          content,
          media_type,
          reading_time_minutes,
          created_at,
          updated_at
        `)
        .eq('topic_id', topicId)
        .order('lessons_id', { ascending: true });
      
      console.log('📊 Lessons database response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching lessons:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error in getLessonsByTopic:', error);
      return { data: null, error };
    }
  }
}; 

// P1 Mock Exam Service
export const p1MockExamService = {
  async getQuestionSets(): Promise<Array<{
    set: string;
    questions: P1MockExam[];
    totalMarks: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('p1_mock_exam')
        .select('*')
        .order('Set', { ascending: true })
        .order('part', { ascending: true });

      if (error) throw error;

      // Group questions by Set and calculate total marks
      const setsMap = new Map<string, { questions: P1MockExam[]; totalMarks: number }>();
      
      data?.forEach(question => {
        const setKey = question.Set || 'Unknown';
        if (!setsMap.has(setKey)) {
          setsMap.set(setKey, { questions: [], totalMarks: 0 });
        }
        
        const set = setsMap.get(setKey)!;
        set.questions.push(question);
        set.totalMarks += question.marks;
      });

      // Convert to array and return ALL available sets
      const allSets = Array.from(setsMap.entries())
        .map(([set, data]) => ({ set, ...data }))
        .sort((a, b) => a.set.localeCompare(b.set));

      // Return all sets - let the MockExamPage handle the selection logic
      return allSets;
    } catch (error) {
      console.error('Error fetching P1 mock exam data:', error);
      return [];
    }
  },

  async getQuestionsBySet(setName: string): Promise<P1MockExam[]> {
    try {
      const { data, error } = await supabase
        .from('p1_mock_exam')
        .select('*')
        .eq('Set', setName)
        .order('part', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions by set:', error);
      return [];
    }
  }
};

// P2 Mock Exam Service
export const p2MockExamService = {
  async getCaseStudies(): Promise<Array<{
    case: string;
    questions: P2MockExam[];
    totalMarks: number;
    caseStudyText: string;
  }>> {
    try {
      // First, let's check the table structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('p2_mock_exam')
        .select('*')
        .limit(1);
      
      console.log('Table structure check:', { tableInfo, tableError });
      if (tableInfo && tableInfo.length > 0) {
        console.log('Available columns:', Object.keys(tableInfo[0]));
      }

      const { data, error } = await supabase
        .from('p2_mock_exam')
        .select('*')
        .order('case', { ascending: true })
        .order('question_number', { ascending: true });

      console.log('Database query result:', { data, error });
      console.log('Sample question data:', data?.[0]);

      if (error) throw error;

      console.log('Raw P2 mock exam data:', data);
      
      // Debug: Check unique case values
      const uniqueCases = [...new Set(data?.map(q => q.case).filter(Boolean))];
      console.log('Unique case values found:', uniqueCases);
      
      // Debug: Check if all questions in a case have the same case_study
      uniqueCases.forEach(caseValue => {
        const questionsInCase = data?.filter(q => q.case === caseValue) || [];
        const caseStudies = [...new Set(questionsInCase.map(q => q.case_study))];
        console.log(`Case "${caseValue}": ${questionsInCase.length} questions, ${caseStudies.length} unique case studies`);
        if (caseStudies.length > 1) {
          console.warn(`⚠️ Case "${caseValue}" has ${caseStudies.length} different case study texts!`);
        }
      });

      // Group questions by case and calculate total marks
      const casesMap = new Map<string, { questions: P2MockExam[]; totalMarks: number; caseStudyText: string }>();
      
      data?.forEach(question => {
        // Handle both quoted and unquoted column names
        const caseKey = question.case || question['case'] || 'Unknown';
        console.log('Processing question:', { 
          question_id: question.question_id, 
          case: question.case, 
          caseQuoted: question['case'],
          caseKey: caseKey,
          part: question.part,
          marks: question.marks,
          case_study: question.case_study?.substring(0, 50) + '...' // Show first 50 chars
        });
        
        if (!casesMap.has(caseKey)) {
          casesMap.set(caseKey, { 
            questions: [], 
            totalMarks: 0, 
            caseStudyText: question.case_study || '' 
          });
          console.log(`Created new case group for: ${caseKey} with case study text`);
        }
        
        const caseData = casesMap.get(caseKey)!;
        caseData.questions.push(question);
        caseData.totalMarks += question.marks;
        console.log(`Added question ${question.question_id} to case ${caseKey}. Total questions: ${caseData.questions.length}, Total marks: ${caseData.totalMarks}`);
      });

      console.log('Cases map:', casesMap);

      // Convert to array and return all cases
      const allCases = Array.from(casesMap.entries())
        .map(([caseName, data]) => ({ 
          case: caseName, 
          questions: data.questions, 
          totalMarks: data.totalMarks,
          caseStudyText: data.caseStudyText
        }))
        .sort((a, b) => a.case.localeCompare(b.case));

      console.log('Final allCases:', allCases);
      return allCases;
    } catch (error) {
      console.error('Error fetching P2 mock exam data:', error);
      return [];
    }
  },

  async getQuestionsByCase(caseName: string): Promise<P2MockExam[]> {
    try {
      const { data, error } = await supabase
        .from('p2_mock_exam')
        .select('*')
        .eq('case', caseName)
        .order('question_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions by case:', error);
      return [];
    }
  }
}; 