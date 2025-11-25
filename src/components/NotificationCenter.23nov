// Real-Time Visitor Alert Component
// Displays live notifications when visitors scan QR codes
// Author: MiniMax Agent

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Settings, X, Clock, MapPin, Store } from 'lucide-react';
import { notificationService, VisitorScanAlert, NotificationSettings } from '../services/NotificationService';

interface NotificationCenterProps {
  user: any; // Current logged-in user
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ user, className = '' }) => {
  const [alerts, setAlerts] = useState<VisitorScanAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Subscribe to alerts when component mounts
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newAlerts) => {
      setAlerts(newAlerts);
    });

    return unsubscribe;
  }, []);

  // Helper function to extract mall_id and shop_id from different user object formats
  const getUserIdentifiers = (user: any) => {
    // Handle different user object structures from different components
    // Dashboard: user.mall_access[0], CampaignManagement: user.mall_id
    let mallId = user?.mall_id || user?.mallId || user?.mall?.id || 0;
    let shopId = user?.shop_id || user?.shopId || user?.shop?.id || 0;
    
    // Handle mall_access array format (Dashboard users)
    if (mallId === 0 && user?.mall_access && user.mall_access.length > 0) {
      mallId = user.mall_access[0];
    }
    
    return { mallId: Number(mallId), shopId: Number(shopId) };
  };

  // Start polling when user is available
  useEffect(() => {
    if (user && !isPolling) {
      console.log('🔔 Starting notification polling for user:', user);
      
      const { mallId, shopId } = getUserIdentifiers(user);
      
      if (mallId > 0 && shopId > 0) {
        notificationService.startPolling(mallId, shopId);
        setIsPolling(true);
        console.log('🔔 Notification polling started with IDs:', { mallId, shopId });
      } else {
        console.warn('🔔 Cannot start notifications: missing mall_id or shop_id', { 
          mallId, 
          shopId, 
          userKeys: Object.keys(user || {}),
          user 
        });
      }
    }

    return () => {
      if (isPolling) {
        console.log('🔔 Stopping notification polling');
        notificationService.stopPolling();
        setIsPolling(false);
      }
    };
  }, [user, isPolling]);

  const handleSettingsChange = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    notificationService.updateSettings(updatedSettings);
  };

  const markAsRead = (alertIds: string[]) => {
    notificationService.markAsRead(alertIds);
  };

  const clearAllAlerts = () => {
    notificationService.clearAllAlerts();
  };

  const unreadAlerts = alerts.filter(alert => !alert.id.startsWith('read_'));
  const recentAlerts = alerts.slice(0, 10); // Show only recent 10 alerts

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const requestPushPermission = async () => {
    const granted = await notificationService.requestPushPermission();
    if (granted) {
      setSettings(prev => ({ ...prev, pushEnabled: true }));
    }
  };

  try {
    // Don't render notification center if user is invalid or missing required data
    if (!user) {
      return null;
    }

    // Don't render if user has no mall access
    const { mallId, shopId } = getUserIdentifiers(user);
    if (mallId === 0 && (!user?.mall_access || user.mall_access.length === 0)) {
      return null;
    }

    return (
      <>
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              relative p-2 rounded-lg transition-colors duration-200
              ${alerts.length > 0 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
              ${className}
            `}
            title="Notifications"
          >
            {settings.soundEnabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
            
            {/* Unread count badge */}
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Notification Panel */}
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Visitor Alerts</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Settings Panel */}
                  {showSettings && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Settings</h4>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sound Alerts</span>
                          <button
                            onClick={() => handleSettingsChange({ soundEnabled: !settings.soundEnabled })}
                            className={`p-1 rounded ${settings.soundEnabled ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          </button>
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Browser Notifications</span>
                          <button
                            onClick={settings.pushEnabled ? () => handleSettingsChange({ pushEnabled: false }) : requestPushPermission}
                            className={`px-2 py-1 rounded text-xs ${
                              settings.pushEnabled 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {settings.pushEnabled ? 'Enabled' : 'Enable'}
                          </button>
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Visual Alerts</span>
                          <button
                            onClick={() => handleSettingsChange({ visualEnabled: !settings.visualEnabled })}
                            className={`p-1 rounded ${settings.visualEnabled ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {settings.visualEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                          </button>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerts List */}
                <div className="max-h-80 overflow-y-auto">
                  {recentAlerts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No visitor alerts yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        You'll see notifications here when visitors scan your QR codes
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {recentAlerts.map((alert) => (
                        <div 
                          key={alert.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            {/* Status Indicator */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${
                                alert.visitorType === 'checkin' ? 'bg-green-400' : 'bg-blue-400'
                              }`} />
                            </div>
                            
                            {/* Alert Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {alert.visitorType === 'checkin' ? 'New Check-in' : 'New Claim'}
                                </p>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTime(alert.timestamp)}
                                </span>
                              </div>
                              
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center text-xs text-gray-600">
                                  <Store className="w-3 h-3 mr-1" />
                                  <span>{alert.shopName}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span>{alert.location}</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {alert.campaignName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {alerts.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {alerts.length} total alert{alerts.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={clearAllAlerts}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('❌ NotificationCenter error:', error);
    // Return null to prevent breaking parent component
    return null;
  }
};

export default NotificationCenter;
