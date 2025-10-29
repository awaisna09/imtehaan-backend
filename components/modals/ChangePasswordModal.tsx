import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { X, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { userSettingsService, PasswordChangeRequest } from '../../utils/supabase/user-settings-service';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  language: 'en' | 'ar';
}

export function ChangePasswordModal({ isOpen, onClose, userId }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const translations = {
    en: {
      title: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      changePassword: 'Change Password',
      cancel: 'Cancel',
      success: 'Password changed successfully!',
      error: 'Failed to change password',
      loading: 'Changing password...',
      passwordMismatch: 'New passwords do not match',
      passwordTooShort: 'Password must be at least 8 characters long',
      currentPasswordRequired: 'Current password is required',
      newPasswordRequired: 'New password is required',
      confirmPasswordRequired: 'Please confirm your new password'
    }};
const t = translations;

  const handleInputChange = (field: keyof PasswordChangeRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setStatus('idle');
    setErrorMessage('');
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    if (!formData.currentPassword.trim()) {
      setErrorMessage(t.currentPasswordRequired);
      setStatus('error');
      return false;
    }
    if (!formData.newPassword.trim()) {
      setErrorMessage(t.newPasswordRequired);
      setStatus('error');
      return false;
    }
    if (!formData.confirmPassword.trim()) {
      setErrorMessage(t.confirmPasswordRequired);
      setStatus('error');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage(t.passwordMismatch);
      setStatus('error');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setErrorMessage(t.passwordTooShort);
      setStatus('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setStatus('idle');

    try {
      const result = await userSettingsService.changePassword(userId, formData);
      
      if (result.success) {
        setStatus('success');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(result.error?.message || t.error);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            {t.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Messages */}
            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t.success}
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t.currentPassword}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={isLoading}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t.newPassword}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={isLoading}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t.loading}
                  </div>
                ) : (
                  t.changePassword
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

























