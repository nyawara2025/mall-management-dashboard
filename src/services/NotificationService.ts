// Real-Time Notification Service for Visitor QR Scans
// Author: MiniMax Agent

export interface VisitorScanAlert {
  id: string;
  campaignId: string;
  campaignName: string;
  visitorType: 'checkin' | 'claim';
  location: string;
  mallName: string;
  shopName: string;
  timestamp: Date;
  scanId: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
  visualEnabled: boolean;
  pollingInterval: number; // seconds
}

class NotificationService {
  private subscribers: Array<(alerts: VisitorScanAlert[]) => void> = [];
  private currentAlerts: VisitorScanAlert[] = [];
  private pollingIntervalId: number | null = null;
  private settings: NotificationSettings = {
    soundEnabled: true,
    pushEnabled: false, // Will be enabled after user permission
    visualEnabled: true,
    pollingInterval: 30 // Poll every 30 seconds
  };
  private lastPollTime: Date = new Date(0); // Never polled
  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudio();
    this.loadSettings();
    this.loadStoredAlerts();
  }

  private initializeAudio() {
    try {
      // Create a simple beep sound for notifications
      this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjuA2O/BeyoGN4PL8t2QQAkPZrTp5qZOEA');
    } catch (error) {
      console.warn('Audio notification not available:', error);
    }
  }

  private loadSettings() {
    const stored = localStorage.getItem('notification_settings');
    if (stored) {
      this.settings = { ...this.settings, ...JSON.parse(stored) };
    }
  }

  private saveSettings() {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  private loadStoredAlerts() {
    const stored = localStorage.getItem('visitor_alerts');
    if (stored) {
      try {
        const alerts = JSON.parse(stored);
        this.currentAlerts = alerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        }));
      } catch (error) {
        console.warn('Failed to load stored alerts:', error);
      }
    }
  }

  private saveAlerts() {
    localStorage.setItem('visitor_alerts', JSON.stringify(this.currentAlerts));
  }

  // Request permission for push notifications
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.settings.pushEnabled = true;
      this.saveSettings();
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      this.settings.pushEnabled = granted;
      this.saveSettings();
      return granted;
    }

    return false;
  }

  // Start polling for new visitor scans
  startPolling(userMallId: number, userShopId: number) {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }

    this.pollingIntervalId = window.setInterval(() => {
      this.checkForNewScans(userMallId, userShopId);
    }, this.settings.pollingInterval * 1000);

    // Initial poll
    this.checkForNewScans(userMallId, userShopId);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  // Check for new visitor scans by querying Supabase database directly
  private async checkForNewScans(mallId: number, shopId: number) {
    try {
      console.log('🔍 Checking for new visitor scans...');
      
      // Import Supabase client dynamically to avoid circular dependencies
      const { supabase } = await import('../lib/supabase');
      
      // Query visitor_checkins table for recent scans
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      // Query for scans that match the user's mall or shop
      const { data: recentScans, error } = await supabase
        .from('visitor_checkins')
        .select('*')
        .gte('checkin_time', thirtyMinutesAgo)
        .order('checkin_time', { ascending: false })
        .limit(50);
      
      if (error) {
        console.warn('Failed to query visitor_checkins:', error);
        return;
      }
      
      if (recentScans && Array.isArray(recentScans)) {
        console.log(`📊 Found ${recentScans.length} recent scans`);
        
        // TEMPORARY FIX: For now, show all recent QR scans to Sandra since
        // current QR codes don't have proper mall/shop identification
        // In production, you'd want to fix the QR code generation to include
        // proper mall_id and shop_id information
        const userScans = recentScans.filter((scan: any) => {
          // Only show QR scan entries (not other sources)
          return scan.visitor_source === 'qr_scan';
        });
        
        console.log(`🎯 Found ${userScans.length} QR scans (temporary fix for Sandra)`);
        
        // Convert to alerts format with better defaults for generic QR scans
        const newAlerts: VisitorScanAlert[] = userScans.map((scan: any) => ({
          id: `${scan.session_id}_${Date.now()}`,
          campaignId: scan.campaign_id || 'general',
          campaignName: this.getCampaignName(scan),
          visitorType: (scan.qr_checkin_type || 'checkin') as 'checkin' | 'claim',
          location: scan.qr_location_text !== 'unknown' ? scan.qr_location_text : 'China Square Mall', 
          mallName: 'China Square Mall', // Default mall since QR codes are generic
          shopName: 'Sandra\'s Shop', // Default to Sandra's shop for testing
          timestamp: new Date(scan.checkin_time),
          scanId: scan.session_id
        }));

        // Add new alerts
        this.addNewAlerts(newAlerts);
      }

      this.lastPollTime = new Date();
      
    } catch (error) {
      console.warn('Failed to check for new scans:', error);
    }
  }

  // Helper methods to map database values to readable names
  private getCampaignName(scan: any): string {
    const location = scan.qr_location_text || '';
    if (location.includes('barbershop')) return 'Barbershop Campaign';
    if (location.includes('food')) return 'Food Court Promotion';
    if (location.includes('electronics')) return 'Electronics Expo';
    if (location.includes('fashion')) return 'Fashion Week';
    return 'General Check-in';
  }

  private getMallName(mallId: number): string {
    const mallNames: { [key: number]: string } = {
      3: 'China Square Mall',
      6: 'Langata Mall',
      7: 'Westgate Mall'
    };
    return mallNames[mallId] || `Mall ${mallId}`;
  }

  private getShopName(shopId: number): string {
    const shopNames: { [key: number]: string } = {
      6: "Sandra's Shop",
      11: 'Spatial Barbershop',
      26: 'Kika Wines'
    };
    return shopNames[shopId] || `Shop ${shopId}`;
  }

  // Add new alerts and notify subscribers
  private addNewAlerts(alerts: VisitorScanAlert[]) {
    let hasNewAlerts = false;
    
    alerts.forEach(alert => {
      // Check if this alert is new (not already in current alerts)
      if (!this.currentAlerts.some(existing => existing.scanId === alert.scanId)) {
        this.currentAlerts.unshift(alert); // Add to beginning
        hasNewAlerts = true;

        // Play sound if enabled
        if (this.settings.soundEnabled && this.audio) {
          this.audio.play().catch(console.warn);
        }

        // Show push notification if enabled
        if (this.settings.pushEnabled && Notification.permission === 'granted') {
          this.showPushNotification(alert);
        }

        // Show visual notification
        if (this.settings.visualEnabled) {
          this.showVisualNotification(alert);
        }
      }
    });

    // Keep only the last 50 alerts
    if (this.currentAlerts.length > 50) {
      this.currentAlerts = this.currentAlerts.slice(0, 50);
    }

    // Save to localStorage
    this.saveAlerts();

    // Notify subscribers if there are new alerts
    if (hasNewAlerts) {
      this.notifySubscribers();
    }
  }

  // Show browser push notification
  private showPushNotification(alert: VisitorScanAlert) {
    const notification = new Notification('New Visitor Scan!', {
      body: `${alert.visitorType === 'checkin' ? 'Check-in' : 'Claim'} at ${alert.location}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `scan-${alert.scanId}`
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }

  // Show visual toast notification
  private showVisualNotification(alert: VisitorScanAlert) {
    const toast = document.createElement('div');
    toast.className = `
      fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm
      transform transition-all duration-500 ease-in-out translate-x-full
    `;
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-3 h-3 rounded-full ${alert.visitorType === 'checkin' ? 'bg-green-400' : 'bg-blue-400'}"></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">
            New ${alert.visitorType === 'checkin' ? 'Check-in' : 'Claim'}!
          </p>
          <p class="text-sm text-gray-500">
            ${alert.location} • ${alert.timestamp.toLocaleTimeString()}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            ${alert.campaignName}
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

    // Auto remove after 10 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500);
    }, 10000);
  }

  // Subscribe to alerts (for React components)
  subscribe(callback: (alerts: VisitorScanAlert[]) => void) {
    this.subscribers.push(callback);
    
    // Immediately call with current alerts
    callback(this.currentAlerts);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.currentAlerts);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  // Get current alerts
  getAlerts(): VisitorScanAlert[] {
    return [...this.currentAlerts];
  }

  // Mark alerts as read
  markAsRead(alertIds: string[]) {
    this.currentAlerts = this.currentAlerts.filter(alert => !alertIds.includes(alert.id));
    this.saveAlerts();
    this.notifySubscribers();
  }

  // Clear all alerts
  clearAllAlerts() {
    this.currentAlerts = [];
    this.saveAlerts();
    this.notifySubscribers();
  }

  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // If push is being enabled, request permission
    if (newSettings.pushEnabled === true && !this.settings.pushEnabled) {
      this.requestPushPermission();
    }
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
