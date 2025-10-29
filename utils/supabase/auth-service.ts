import { supabase } from './client';

export interface UserCredentials {
  email: string;
  password: string;
  full_name: string;
  user_type?: 'student' | 'teacher' | 'admin';
  curriculum?: 'igcse' | 'o-levels' | 'a-levels' | 'edexcel' | 'ib';
  grade?: string;
  subjects?: string[];
  preferences?: any;
}

export interface AuthResult {
  data: any;
  error: any;
}

export class AuthService {
  // Sign up using Supabase Auth only
  static async signUp(credentials: UserCredentials): Promise<AuthResult> {
    try {
      // Create user directly with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            user_type: credentials.user_type || 'student',
            curriculum: credentials.curriculum || 'igcse',
            grade: credentials.grade || 'Year 10',
            subjects: credentials.subjects || ['Mathematics', 'Physics', 'Chemistry'],
            preferences: credentials.preferences || {}
          }
        }
      });

      if (authError) {
        return { data: null, error: authError };
      }

      // The trigger function should automatically create the user profile
      // We don't need to manually handle password hashing or user table updates
      return { data: authData, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        data: null,
        error: { message: 'Sign up failed. Please try again.' }
      };
    }
  }

  // Sign in using Supabase Auth only
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Sign in directly with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { data: null, error: authError };
      }

      // Get the user profile from our users table
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.warn('Profile not found, but auth successful:', profileError);
          // Return auth data even if profile is missing (trigger might still be processing)
          return { data: authData, error: null };
        }

        // Return combined auth and profile data
        return {
          data: { 
            auth: authData, 
            profile: profileData 
          }, 
          error: null 
        };
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        data: null,
        error: { message: 'Sign in failed. Please try again.' }
      };
    }
  }

  // Sign out using Supabase Auth
  static async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: 'Sign out failed.' } };
    }
  }

  // Get current user using Supabase Auth
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { data: null, error };
      }

      // Get user profile from users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile not found for current user:', profileError);
        // Return auth user data even if profile is missing
        return { data: { auth: user, profile: null }, error: null };
      }

      return { 
        data: { 
          auth: user, 
          profile: profileData 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { data: null, error: { message: 'Failed to get user data.' } };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Get user session
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { data: session, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
