import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { X, Download, Upload, RefreshCw, Trash2, CheckCircle, AlertCircle, Info, FileText, Database } from 'lucide-react';
import { userSettingsService, DataExport } from '../../utils/supabase/user-settings-service';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  language: 'en' | 'ar';
}

export function DataManagementModal({ isOpen, onClose, userId }: DataManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'manage'>('export');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [exportData, setExportData] = useState<DataExport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      title: 'Data Management',
      export: 'Export Data',
      import: 'Import Data',
      manage: 'Manage Data',
      exportDesc: 'Download all your study data, settings, and progress',
      importDesc: 'Upload previously exported data to restore your settings',
      manageDesc: 'Clear cache, reset progress, or manage your data',
      exportData: 'Export My Data',
      importData: 'Import Data',
      clearCache: 'Clear Cache',
      resetProgress: 'Reset All Progress',
      exportSuccess: 'Data exported successfully!',
      importSuccess: 'Data imported successfully!',
      clearSuccess: 'Cache cleared successfully!',
      resetSuccess: 'Progress reset successfully!',
      exportError: 'Failed to export data',
      importError: 'Failed to import data',
      clearError: 'Failed to clear cache',
      resetError: 'Failed to reset progress',
      loading: 'Processing...',
      cancel: 'Cancel',
      close: 'Close',
      warning: 'Warning',
      resetWarning: 'This will permanently delete all your study progress, activities, and sessions. This action cannot be undone.',
      confirmReset: 'Yes, Reset Everything',
      dataSize: 'Data Size',
      lastUpdated: 'Last Updated',
      records: 'records',
      exportFormat: 'Export Format',
      jsonFormat: 'JSON (Recommended)',
      csvFormat: 'CSV (Spreadsheet)',
      selectFile: 'Select File',
      dragDrop: 'Drag and drop a file here, or click to select',
      invalidFile: 'Invalid file format. Please select a JSON file.',
      fileTooLarge: 'File is too large. Maximum size is 10MB.',
      noFileSelected: 'Please select a file to import.'
    }};
const t = translations;

  const handleExport = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const result = await userSettingsService.exportUserData(userId);
      
      if (result.data) {
        setExportData(result.data);
        setStatus('success');
        setMessage(t.exportSuccess);
        
        // Create and download file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `imtehaan-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setStatus('error');
        setMessage(t.exportError);
      }
    } catch (error) {
      setStatus('error');
      setMessage(t.exportError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    if (!file) {
      setStatus('error');
      setMessage(t.noFileSelected);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setStatus('error');
      setMessage(t.fileTooLarge);
      return;
    }

    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setMessage(t.invalidFile);
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const text = await file.text();
      const importData: DataExport = JSON.parse(text);
      
      const result = await userSettingsService.importUserData(userId, importData);
      
      if (result.success) {
        setStatus('success');
        setMessage(t.importSuccess);
        setTimeout(() => {
          onClose();
          window.location.reload(); // Reload to apply new settings
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.error?.message || t.importError);
      }
    } catch (error) {
      setStatus('error');
      setMessage(t.importError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const result = await userSettingsService.clearUserCache(userId);
      
      if (result.success) {
        setStatus('success');
        setMessage(t.clearSuccess);
      } else {
        setStatus('error');
        setMessage(t.clearError);
      }
    } catch (error) {
      setStatus('error');
      setMessage(t.clearError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetProgress = async () => {
    if (!confirm(t.resetWarning)) return;

    setIsLoading(true);
    setStatus('idle');

    try {
      const result = await userSettingsService.resetUserProgress(userId);
      
      if (result.success) {
        setStatus('success');
        setMessage(t.resetSuccess);
        setTimeout(() => {
          onClose();
          window.location.reload(); // Reload to reset everything
        }, 2000);
      } else {
        setStatus('error');
        setMessage(t.resetError);
      }
    } catch (error) {
      setStatus('error');
      setMessage(t.resetError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStatus('idle');
      setMessage('');
      setExportData(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
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
        
        <CardContent className="space-y-6">
          {/* Status Messages */}
          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['export', 'import', 'manage'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                disabled={isLoading}
                className="flex-1"
              >
                {tab === 'export' && <Download className="h-4 w-4 mr-2" />}
                {tab === 'import' && <Upload className="h-4 w-4 mr-2" />}
                {tab === 'manage' && <RefreshCw className="h-4 w-4 mr-2" />}
                {t[tab]}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Download className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.export}</h3>
                  <p className="text-gray-600 mb-6">{t.exportDesc}</p>
                  
                  {exportData && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{t.dataSize}:</span>
                          <Badge variant="secondary" className="ml-2">
                            {JSON.stringify(exportData).length} bytes
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">{t.lastUpdated}:</span>
                          <Badge variant="secondary" className="ml-2">
                            {new Date(exportData.export_date).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Study Plans:</span>
                          <Badge variant="secondary" className="ml-2">
                            {exportData.study_plans.length} {t.records}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Activities:</span>
                          <Badge variant="secondary" className="ml-2">
                            {exportData.learning_activities.length} {t.records}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t.loading}
                      </div>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {t.exportData}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Upload className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.import}</h3>
                  <p className="text-gray-600 mb-6">{t.importDesc}</p>
                  
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 hover:border-blue-400 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">{t.dragDrop}</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      {t.selectFile}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• {t.jsonFormat}</p>
                    <p>• {t.fileTooLarge}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <RefreshCw className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.manage}</h3>
                  <p className="text-gray-600 mb-6">{t.manageDesc}</p>
                  
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={handleClearCache}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t.clearCache}
                    </Button>
                    
                    <Separator />
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-2">{t.warning}</p>
                          <p className="mb-3">{t.resetWarning}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetProgress}
                            disabled={isLoading}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.confirmReset}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t.close}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

























