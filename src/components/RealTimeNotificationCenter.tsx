// Real-Time Notification Center - Uses Fast Polling (5s intervals)
// Compatible with existing custom supabase client
// Zero breaking changes - can be used alongside existing components
// Author: MiniMax Agent

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Clock, MapPin, Store } from 'lucide-react';
import { realTimeNotificationService, NotificationData } from '../services/RealTimeNotificationService';

interface RealTimeNotificationCenterProps {
  user: any; // Current logged-in user
  className?: string;
  showToast?: boolean; // Show visual toast notifications
  autoPlaySound?: boolean; // Play sound on new notifications
}

interface NotificationAlert {
  id: string;
  shop_id: number;
  visitor_phone: string;
  checkin_time: string;
  mall_name?: string;
  shop_name?: string;
  timestamp: Date;
}

export const RealTimeNotificationCenter: React.FC<RealTimeNotificationCenterProps> = ({ 
  user, 
  className = '',
  showToast = true,
  autoPlaySound = false
}) => {
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(autoPlaySound);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    try {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjuA2O/BeyoGN4PL8t2QQAkPZrTp5qZOEA');
      audioRef.current.volume = 0.3;
    } catch (error) {
      console.warn('Audio notification not available:', error);
    }
  }, []);

  // Subscribe to fast polling notifications
  useEffect(() => {
    if (!user) return;

    // Start the fast polling service
    realTimeNotificationService.startPolling(user);
    setIsConnected(true);

    // Subscribe to notifications
    const handleNotifications = (notifications: NotificationData[]) => {
      console.log('🔔 Received notifications:', notifications.length);
      
      // Convert notifications to alerts
      const newAlerts: NotificationAlert[] = notifications.map(notification => ({
        id: notification.id,
        shop_id: notification.shop_id,
        visitor_phone: notification.visitor_phone,
        checkin_time: notification.checkin_time,
        mall_name: notification.mall_name,
        shop_name: notification.shop_name,
        timestamp: new Date(notification.timestamp)
      }));

      // Add to existing alerts (keep max 20)
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));

      // Play sound if enabled
      if (soundEnabled && audioRef.current && newAlerts.length > 0) {
        audioRef.current.play().catch(console.warn);
      }

      // Show toast notification for new alerts
      if (showToast && newAlerts.length > 0) {
        newAlerts.forEach(alert => showToastNotification(alert));
      }
    };

    realTimeNotificationService.subscribe(handleNotifications);

    return () => {
      realTimeNotificationService.stopPolling();
      setIsConnected(false);
    };
  }, [user, showToast, soundEnabled]);

  const showToastNotification = (alert: NotificationAlert) => {
    const toast = document.createElement('div');
    toast.className = `
      fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm
      transform transition-all duration-500 ease-in-out translate-x-full
    `;
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            New Visitor Check-in!
          </p>
          <p class="text-sm text-gray-500">
            ${alert.shop_name || `Shop ${alert.shop_id}`} • ${alert.timestamp.toLocaleTimeString()}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Phone: ${alert.visitor_phone}
          </p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 8 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, 8000);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Get service status
  const serviceStatus = realTimeNotificationService.getStatus();

  if (!user) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative p-2 rounded-lg transition-colors duration-200
            ${alerts.length > 0 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            ${!isConnected ? 'opacity-50' : ''}
            ${className}
          `}
          title={isConnected ? 'Live Notifications (Fast Poll)' : 'Connecting...'}
        >
          {soundEnabled ? (
            <Bell className="w-5 h-5" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}
          
          {/* Connection indicator */}
          <div className={`absolute -top-0 -right-0 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-yellow-400'
          }`} />
          
          {/* Polling indicator */}
          <div className={`absolute -bottom-0 -right-0 w-1.5 h-1.5 rounded-full animate-pulse ${
            serviceStatus.isPolling ? 'bg-blue-400' : 'bg-gray-300'
          }`} />
          
          {/* Unread count badge */}
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {alerts.length > 9 ? '9+' : alerts.length}
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Live Notifications
                    {isConnected && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Fast Poll (5s)
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-1 rounded ${soundEnabled ? 'text-green-600' : 'text-gray-400'}`}
                      title={soundEnabled ? 'Sound On' : 'Sound Off'}
                    >
                      {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-600">
                    🔄 Polling every 5 seconds
                  </span>
                  <span className="text-blue-600">
                    {serviceStatus.callbackCount} listener{serviceStatus.callbackCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Alerts List */}
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {isConnected ? 'No recent visitor alerts' : 'Connecting to live updates...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Fast polling notifications will appear here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Status Indicator */}
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                          </div>
                          
                          {/* Alert Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                New Check-in
                              </p>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(alert.timestamp)}
                              </span>
                            </div>
                            
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center text-xs text-gray-600">
                                <Store className="w-3 h-3 mr-1" />
                                <span>{alert.shop_name || `Shop ${alert.shop_id}`}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <span className="font-mono">📱 {alert.visitor_phone}</span>
                              </div>
                              {alert.mall_name && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span>{alert.mall_name}</span>
                                </div>
                              )}
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
                      {alerts.length} alert{alerts.length !== 1 ? 's' : ''} total
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
};

export default RealTimeNotificationCenter;
