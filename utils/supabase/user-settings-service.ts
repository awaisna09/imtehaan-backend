import { supabase } from './client';

export interface UserSettings {
  id?: string;
  user_id: string;
  
  // Theme & Appearance
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  
  // Study Preferences
  auto_play_flashcards: boolean;
  show_hints: boolean;
  sound_effects: boolean;
  vibration: boolean;
  study_reminders: boolean;
  daily_goal_minutes: number;
  session_duration_minutes: number;
  
  // Notifications
  push_notifications: boolean;
  email_notifications: boolean;
  achievement_notifications: boolean;
  weekly_reports: boolean;
  
  // Privacy & Security
  data_sharing: boolean;
  analytics_enabled: boolean;
  profile_visibility: 'public' | 'private';
  
  // Accessibility
  font_size: 'small' | 'medium' | 'large';
  high_contrast: boolean;
  reduced_motion: boolean;
  
  // Account Settings
  email_preferences: {
    marketing: boolean;
    updates: boolean;
    achievements: boolean;
  };
  two_factor_enabled: boolean;
  last_password_change?: string;
  
  // Study Plan Preferences
  preferred_study_times: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  study_plan_template: string;
  auto_schedule_breaks: boolean;
  break_duration_minutes: number;
  
  // Data Management
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  data_retention_days: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DataExport {
  user_settings: UserSettings;
  study_plans: any[];
  learning_activities: any[];
  study_sessions: any[];
  export_date: string;
  export_version: string;
}

export class UserSettingsService {
  // Get user settings
  async getUserSettings(userId: string): Promise<{ data: UserSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // Create default settings if none exist
        return await this.createDefaultSettings(userId);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return { data: null, error };
    }
  }

  // Create default settings for a new user
  async createDefaultSettings(userId: string): Promise<{ data: UserSettings | null; error: any }> {
    try {
      const defaultSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        theme: 'light',
        language: 'en',
        auto_play_flashcards: false,
        show_hints: true,
        sound_effects: true,
        vibration: true,
        study_reminders: true,
        daily_goal_minutes: 30,
        session_duration_minutes: 25,
        push_notifications: true,
        email_notifications: true,
        achievement_notifications: true,
        weekly_reports: true,
        data_sharing: false,
        analytics_enabled: true,
        profile_visibility: 'private',
        font_size: 'medium',
        high_contrast: false,
        reduced_motion: false,
        email_preferences: {
          marketing: false,
          updates: true,
          achievements: true
        },
        two_factor_enabled: false,
        preferred_study_times: {
          morning: true,
          afternoon: true,
          evening: true,
          night: false
        },
        study_plan_template: 'balanced',
        auto_schedule_breaks: true,
        break_duration_minutes: 5,
        auto_backup_enabled: true,
        backup_frequency: 'weekly',
        data_retention_days: 365
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating default settings:', error);
      return { data: null, error };
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<{ data: UserSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return { data: null, error };
    }
  }

  // Change user password
  async changePassword(userId: string, passwordChange: PasswordChangeRequest): Promise<{ success: boolean; error: any }> {
    try {
      // Validate passwords match
      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        return { success: false, error: { message: 'New passwords do not match' } };
      }

      // Validate password strength
      if (passwordChange.newPassword.length < 8) {
        return { success: false, error: { message: 'Password must be at least 8 characters long' } };
      }

      // Update password in auth.users
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.newPassword
      });

      if (error) throw error;

      // Update last_password_change timestamp
      await this.updateUserSettings(userId, {
        last_password_change: new Date().toISOString()
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error };
    }
  }

  // Enable/disable two-factor authentication
  async toggleTwoFactor(userId: string, enabled: boolean): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.updateUserSettings(userId, {
        two_factor_enabled: enabled
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error toggling two-factor:', error);
      return { success: false, error };
    }
  }

  // Export user data
  async exportUserData(userId: string): Promise<{ data: DataExport | null; error: any }> {
    try {
      // Get user settings
      const { data: settings, error: settingsError } = await this.getUserSettings(userId);
      if (settingsError) throw settingsError;

      // Get study plans
      const { data: studyPlans } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId);

      // Get learning activities
      const { data: learningActivities } = await supabase
        .from('learning_activities')
        .select('*')
        .eq('user_id', userId);

      // Get study sessions
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

      const exportData: DataExport = {
        user_settings: settings!,
        study_plans: studyPlans || [],
        learning_activities: learningActivities || [],
        study_sessions: studySessions || [],
        export_date: new Date().toISOString(),
        export_version: '1.0.0'
      };

      return { data: exportData, error: null };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { data: null, error };
    }
  }

  // Import user data
  async importUserData(userId: string, importData: DataExport): Promise<{ success: boolean; error: any }> {
    try {
      // Validate import data
      if (!importData.user_settings || !importData.export_date) {
        return { success: false, error: { message: 'Invalid import data format' } };
      }

      // Update user settings
      const { error: settingsError } = await this.updateUserSettings(userId, importData.user_settings);
      if (settingsError) throw settingsError;

      // Note: For safety, we don't automatically import study plans, activities, or sessions
      // as this could overwrite current data. Users should manually review and import these.

      return { success: true, error: null };
    } catch (error) {
      console.error('Error importing user data:', error);
      return { success: false, error };
    }
  }

  // Clear user cache/data
  async clearUserCache(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // This would typically clear browser cache, but for now we'll just return success
      // In a real implementation, you might clear localStorage, sessionStorage, etc.
      return { success: true, error: null };
    } catch (error) {
      console.error('Error clearing user cache:', error);
      return { success: false, error };
    }
  }

  // Reset user progress (dangerous operation)
  async resetUserProgress(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Delete learning activities
      const { error: activitiesError } = await supabase
        .from('learning_activities')
        .delete()
        .eq('user_id', userId);

      if (activitiesError) throw activitiesError;

      // Delete study sessions
      const { error: sessionsError } = await supabase
        .from('study_sessions')
        .delete()
        .eq('user_id', userId);

      if (sessionsError) throw sessionsError;

      // Reset study plans to default
      const { error: plansError } = await supabase
        .from('study_plans')
        .delete()
        .eq('user_id', userId);

      if (plansError) throw plansError;

      // Reset settings to default
      await this.createDefaultSettings(userId);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error resetting user progress:', error);
      return { success: false, error };
    }
  }

  // Delete user account
  async deleteUserAccount(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Delete all user data
      await this.resetUserProgress(userId);

      // Delete user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId);

      if (settingsError) throw settingsError;

      // Note: The actual user account deletion should be handled by Supabase Auth
      // This function only deletes the associated data

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting user account:', error);
      return { success: false, error };
    }
  }

  // Get user profile information
  async getUserProfile(userId: string): Promise<{ data: any; error: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;

      return { 
        data: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at,
          last_sign_in_at: user?.last_sign_in_at
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  }
}

export const userSettingsService = new UserSettingsService();

























