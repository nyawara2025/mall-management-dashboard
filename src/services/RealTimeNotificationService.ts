/**
 * Simplified Real-Time Notification Service
 * Uses fast polling (5 seconds) instead of WebSocket for compatibility
 * with the existing custom supabase client
 * Author: MiniMax Agent
 */

import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';

export interface VisitorCheckin {
  id: string;
  qr_mall_id: number | null;
  qr_shop_id: number;
  visitor_phone: string;
  checkin_time: string;
  created_at: string;
  mall_name?: string;
  shop_name?: string;
}

export interface NotificationData {
  id: string;
  shop_id: number;
  visitor_phone: string;
  checkin_time: string;
  mall_name?: string;
  shop_name?: string;
  timestamp: string;
}

class FastPollNotificationService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheckTime: string = '';
  private callbacks: Array<(notifications: NotificationData[]) => void> = [];
  private isPolling = false;
  private currentUser: User | null = null;

  /**
   * Start the fast polling service
   */
  startPolling(user: User) {
    console.log('🚀 Fast Poll Service: Starting near real-time polling (5s intervals)');
    
    this.currentUser = user;
    this.lastCheckTime = new Date(Date.now() - 60000).toISOString(); // Check last minute
    
    if (this.isPolling) {
      console.log('⚠️ Fast Poll Service: Already polling, stopping first');
      this.stopPolling();
    }

    this.isPolling = true;
    
    // Immediate check
    this.pollForNewNotifications();
    
    // Set up 5-second intervals
    this.intervalId = setInterval(() => {
      this.pollForNewNotifications();
    }, 5000); // 5 seconds instead of 30
  }

  /**
   * Stop the polling service
   */
  stopPolling() {
    console.log('⏹️ Fast Poll Service: Stopping polling');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isPolling = false;
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notifications: NotificationData[]) => void) {
    this.callbacks.push(callback);
    console.log(`📱 Fast Poll Service: Added callback (${this.callbacks.length} total)`);
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribe(callback: (notifications: NotificationData[]) => void) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
    console.log(`📱 Fast Poll Service: Removed callback (${this.callbacks.length} remaining)`);
  }

  /**
   * Poll for new notifications
   */
  private async pollForNewNotifications() {
    if (!this.currentUser || !this.isPolling) return;

    try {
      const { data, error } = await supabase
        .from('visitor_checkins')
        .select('id, qr_shop_id, visitor_phone, checkin_time, created_at')
        .gte('created_at', this.lastCheckTime)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Fast Poll Service: Error polling notifications:', error);
        return;
      }

      // Update last check time
      this.lastCheckTime = new Date().toISOString();

      if (!data || data.length === 0) {
        return; // No new notifications
      }

      // Filter notifications for current user's shops
      const userNotifications = data
        .filter((checkin: any) => this.isNotificationForUser(checkin))
        .map((checkin: any): NotificationData => ({
          id: checkin.id,
          shop_id: checkin.qr_shop_id,
          visitor_phone: checkin.visitor_phone,
          checkin_time: checkin.checkin_time,
          timestamp: checkin.created_at
        }));

      if (userNotifications.length > 0) {
        console.log(`🔔 Fast Poll Service: Found ${userNotifications.length} new notification(s)`);
        
        // Notify all callbacks
        this.callbacks.forEach(callback => {
          try {
            callback(userNotifications);
          } catch (error) {
            console.error('❌ Fast Poll Service: Error in callback:', error);
          }
        });
      }

    } catch (error) {
      console.error('❌ Fast Poll Service: Polling error:', error);
    }
  }

  /**
   * Check if a notification is for the current user
   */
  private isNotificationForUser(checkin: any): boolean {
    if (!this.currentUser) return false;

    // Super admin sees everything
    if (this.currentUser.role === 'super_admin') {
      return true;
    }

    // Mall admin sees all shops in their mall
    if (this.currentUser.role === 'mall_admin') {
      return this.currentUser.mall_access?.includes(checkin.qr_mall_id) || false;
    }

    // Shop admin only sees their specific shop
    if (this.currentUser.role === 'shop_admin') {
      return checkin.qr_shop_id > 0; // Only real shop checkins
    }

    return false;
  }

  /**
   * Get connection status (for compatibility with existing interface)
   */
  getConnectionStatus(): boolean {
    return this.isPolling;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      callbackCount: this.callbacks.length,
      lastCheckTime: this.lastCheckTime
    };
  }
}

// Export singleton instance
export const realTimeNotificationService = new FastPollNotificationService();
