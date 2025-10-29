import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useApp } from '../App';
import { userSettingsService, UserSettings } from '../utils/supabase/user-settings-service';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { DataManagementModal } from './modals/DataManagementModal';
import { 
  ArrowLeft, 
  User,
  Bell,
  Palette,
  Globe,
  BookOpen,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Volume2,
  VolumeX,
  Eye,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Languages,
  Clock,
  Target,
  Brain,
  Zap,
  HelpCircle,
  Mail,
  Lock,
  Key,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
  Settings as SettingsIcon
} from 'lucide-react';

export function SettingsPage() {
  const {setCurrentPage, user, language} = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const translations = {
    en: {
      title: "Settings",
      subtitle: "Customize your learning experience",
      backToDashboard: "Back to Dashboard",
      
      // Tabs
      general: "General",
      study: "Study",
      notifications: "Notifications",
      privacy: "Privacy",
      accessibility: "Accessibility",
      account: "Account",
      data: "Data",
      
      // General Settings
      themeTitle: "Theme & Appearance",
      themeDesc: "Choose how Imtehaan looks and feels",
      theme: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
      languageTitle: "Language",
      languageDesc: "Select your preferred language",
      
      // Study Settings
      studyPrefsTitle: "Study Preferences",
      studyPrefsDesc: "Customize your learning experience",
      autoPlay: "Auto-play flashcards",
      autoPlayDesc: "Automatically advance to next card",
      showHints: "Show hints",
      showHintsDesc: "Display helpful hints during study",
      soundEffects: "Sound effects",
      soundEffectsDesc: "Play sounds for interactions",
      vibration: "Vibration feedback",
      vibrationDesc: "Haptic feedback on mobile devices",
      dailyGoal: "Daily study goal (minutes)",
      sessionDuration: "Default session duration (minutes)",
      
      // Notifications
      notificationTitle: "Notification Preferences",
      notificationDesc: "Choose what notifications you want to receive",
      pushNotifications: "Push notifications",
      emailNotifications: "Email notifications",
      studyReminders: "Study reminders",
      achievements: "Achievement notifications",
      weeklyReports: "Weekly progress reports",
      
      // Privacy
      privacyTitle: "Privacy & Security",
      privacyDesc: "Control your data and privacy settings",
      dataSharing: "Share data for improvements",
      analytics: "Usage analytics",
      profileVisibility: "Profile visibility",
      profilePublic: "Public",
      profilePrivate: "Private",
      
      // Accessibility
      accessibilityTitle: "Accessibility",
      accessibilityDesc: "Make Imtehaan more accessible",
      fontSize: "Text size",
      fontSizeSmall: "Small",
      fontSizeMedium: "Medium",
      fontSizeLarge: "Large",
      highContrast: "High contrast mode",
      reducedMotion: "Reduce animations",
      
      // Account
      accountTitle: "Account Information",
      accountDesc: "Manage your account details",
      changePassword: "Change password",
      twoFactor: "Two-factor authentication",
      deleteAccount: "Delete account",
      signOut: "Sign out",
      accountCreated: "Account created",
      lastSignIn: "Last sign in",
      
      // Data
      dataTitle: "Data Management",
      dataDesc: "Export, import, or reset your data",
      exportData: "Export my data",
      importData: "Import data",
      resetProgress: "Reset all progress",
      clearCache: "Clear cache",
      
      // Actions
      save: "Save Changes",
      cancel: "Cancel",
      reset: "Reset to defaults",
      
      // Status messages
      saving: "Saving...",
      saved: "Settings saved successfully!",
      error: "Failed to save settings. Please try again.",
      loading: "Loading settings...",
      noUser: "Please sign in to access settings",
      
      // Descriptions
      exportDesc: "Download all your study data",
      importDesc: "Upload previously exported data",
      resetDesc: "This will delete all your progress permanently",
      cacheDesc: "Clear temporary files and cached data"
    }};
const t = translations.en;

  const tabs = [
    { id: 'general', label: t.general, icon: Monitor },
    { id: 'study', label: t.study, icon: BookOpen },
    { id: 'notifications', label: t.notifications, icon: Bell },
    { id: 'privacy', label: t.privacy, icon: Shield },
    { id: 'accessibility', label: t.accessibility, icon: Eye },
    { id: 'account', label: t.account, icon: User },
    { id: 'data', label: t.data, icon: Database }
  ];

  // Load user settings on component mount
  useEffect(() => {
    if (user?.id) {
      loadUserSettings();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadUserSettings = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await userSettingsService.getUserSettings(user.id);
      
      if (result.error) {
        throw result.error;
      }
      
      if (result.data) {
        setSettings(result.data);
        // Update app language if it differs from settings
        if (result.data.language !== language) {
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({ ...prev!, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user?.id || !settings) return;
    
    setSaveStatus('saving');
    setError(null);
    
    try {
      const result = await userSettingsService.updateUserSettings(user.id, settings);
      
      if (result.error) {
        throw result.error;
      }
      
      // Update app language if changed
      if (settings.language !== language) {
      }
      
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setError('Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = async () => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to reset all settings to default?')) return;
    
    try {
      await userSettingsService.createDefaultSettings(user.id);
      await loadUserSettings();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings');
    }
  };

  const handleSignOut = async () => {
    try {
      // This would typically call a sign out function
      // For now, just redirect to login
      setCurrentPage('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    try {
      const result = await userSettingsService.deleteUserAccount(user.id);
      if (result.success) {
        setCurrentPage('login');
      } else {
        setError('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.noUser}</h2>
          <Button onClick={() => setCurrentPage('login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show error if settings failed to load
  if (error && !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadUserSettings}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2 text-purple-600" />
            {t.themeTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.themeDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.theme}</Label>
            <Select 
              value={settings.theme} 
              onValueChange={(value) => handleSettingChange('theme', value as 'light' | 'dark' | 'system')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center">
                    <Sun className="h-4 w-4 mr-2" />
                    {t.themeLight}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-2" />
                    {t.themeDark}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2" />
                    {t.themeSystem}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            {t.languageTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.languageDesc}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t.languageTitle}</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => handleSettingChange('language', value as 'en')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center">
                    <Languages className="h-4 w-4 mr-2" />
                    English
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-green-600" />
            {t.studyPrefsTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.studyPrefsDesc}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Study Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t.autoPlay}</Label>
                <p className="text-sm text-gray-600">{t.autoPlayDesc}</p>
              </div>
              <Switch 
                checked={settings.auto_play_flashcards}
                onCheckedChange={(checked) => handleSettingChange('auto_play_flashcards', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t.showHints}</Label>
                <p className="text-sm text-gray-600">{t.showHintsDesc}</p>
              </div>
              <Switch 
                checked={settings.show_hints}
                onCheckedChange={(checked) => handleSettingChange('show_hints', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t.soundEffects}</Label>
                <p className="text-sm text-gray-600">{t.soundEffectsDesc}</p>
              </div>
              <Switch 
                checked={settings.sound_effects}
                onCheckedChange={(checked) => handleSettingChange('sound_effects', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t.vibration}</Label>
                <p className="text-sm text-gray-600">{t.vibrationDesc}</p>
              </div>
              <Switch 
                checked={settings.vibration}
                onCheckedChange={(checked) => handleSettingChange('vibration', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Time Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.dailyGoal}</Label>
              <Input
                type="number"
                min="10"
                max="180"
                value={settings.daily_goal_minutes}
                onChange={(e) => handleSettingChange('daily_goal_minutes', parseInt(e.target.value))}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.sessionDuration}</Label>
              <Input
                type="number"
                min="5"
                max="60"
                value={settings.session_duration_minutes}
                onChange={(e) => handleSettingChange('session_duration_minutes', parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-orange-600" />
            {t.notificationTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.notificationDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.pushNotifications}</Label>
            </div>
            <Switch 
              checked={settings.push_notifications}
              onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.emailNotifications}</Label>
            </div>
            <Switch 
              checked={settings.email_notifications}
              onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.studyReminders}</Label>
            </div>
            <Switch 
              checked={settings.study_reminders}
              onCheckedChange={(checked) => handleSettingChange('study_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.achievements}</Label>
            </div>
            <Switch 
              checked={settings.achievement_notifications}
              onCheckedChange={(checked) => handleSettingChange('achievement_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.weeklyReports}</Label>
            </div>
            <Switch 
              checked={settings.weekly_reports}
              onCheckedChange={(checked) => handleSettingChange('weekly_reports', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-600" />
            {t.privacyTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.privacyDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.dataSharing}</Label>
            </div>
            <Switch 
              checked={settings.data_sharing}
              onCheckedChange={(checked) => handleSettingChange('data_sharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.analytics}</Label>
            </div>
            <Switch 
              checked={settings.analytics_enabled}
              onCheckedChange={(checked) => handleSettingChange('analytics_enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.profileVisibility}</Label>
            <Select 
              value={settings.profile_visibility} 
              onValueChange={(value) => handleSettingChange('profile_visibility', value as 'public' | 'private')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{t.profilePublic}</SelectItem>
                <SelectItem value="private">{t.profilePrivate}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-indigo-600" />
            {t.accessibilityTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.accessibilityDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.fontSize}</Label>
            <Select 
              value={settings.font_size} 
              onValueChange={(value) => handleSettingChange('font_size', value as 'small' | 'medium' | 'large')}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t.fontSizeSmall}</SelectItem>
                <SelectItem value="medium">{t.fontSizeMedium}</SelectItem>
                <SelectItem value="large">{t.fontSizeLarge}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.highContrast}</Label>
            </div>
            <Switch 
              checked={settings.high_contrast}
              onCheckedChange={(checked) => handleSettingChange('high_contrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t.reducedMotion}</Label>
            </div>
            <Switch 
              checked={settings.reduced_motion}
              onCheckedChange={(checked) => handleSettingChange('reduced_motion', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-teal-600" />
            {t.accountTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.accountDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Name:</span>
              <span className="text-sm text-gray-600">{user.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">User ID:</span>
              <span className="text-sm text-gray-600 font-mono text-xs">{user.id.slice(0, 8)}...</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowChangePassword(true)}
          >
            <Key className="h-4 w-4 mr-2" />
            {t.changePassword}
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            disabled
          >
            <Lock className="h-4 w-4 mr-2" />
            {t.twoFactor} (Coming Soon)
          </Button>

          <Separator />

          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t.deleteAccount}
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t.signOut}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-gray-600" />
            {t.dataTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.dataDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowDataManagement(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t.exportData}
            </Button>
            <p className="text-xs text-gray-500">{t.exportDesc}</p>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowDataManagement(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t.importData}
            </Button>
            <p className="text-xs text-gray-500">{t.importDesc}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowDataManagement(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.clearCache}
            </Button>
            <p className="text-xs text-gray-500">{t.cacheDesc}</p>
          </div>

          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={() => setShowDataManagement(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t.resetProgress}
            </Button>
            <p className="text-xs text-red-500">{t.resetDesc}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'study':
        return renderStudySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      case 'account':
        return renderAccountSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToDashboard}
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>

            {/* Save Status */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                {saveStatus === 'saving' && (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-600">{t.saving}</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">{t.saved}</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">{t.error}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeTab === tab.id 
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {renderTabContent()}

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={saveStatus === 'saving'}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t.reset}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving' || !hasUnsavedChanges}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Unsaved Changes Indicator */}
                  {hasUnsavedChanges && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">You have unsaved changes</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userId={user.id}
        language={language}
      />

      <DataManagementModal
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
        userId={user.id}
        language={language}
      />
    </div>
  );
}