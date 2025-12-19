/**
 * WhatsApp Integration for React Customer Inquiries Dashboard
 * Adds WhatsApp alert functionality to your existing React app
 */

import { supabase } from '../lib/supabase';

interface WhatsAppAlertData {
  shop_id: number;
  event_type: 'qr_scan' | 'group_engagement' | 'order_created' | 'payment_received';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  product_name?: string;
  amount?: number;
  order_reference?: string;
  group_name?: string;
  views?: number;
  shares?: number;
  clicks?: number;
  location?: string;
  timestamp?: string;
}

class WhatsAppIntegration {
  private webhookUrl = 'https://n8n.tenear.com/webhook/whatsapp-alert';
  private webhookSecret = 'your-n8n-webhook-secret';

  /**
   * Send WhatsApp alert to admin via your existing N8N webhook
   */
  async sendAlert(data: WhatsAppAlertData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const payload = {
        event_type: data.event_type,
        data: {
          ...data,
          timestamp: data.timestamp || new Date().toISOString()
        }
      };

      console.log('📱 Sending WhatsApp alert via N8N webhook:', payload);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': this.webhookSecret
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ WhatsApp alert sent successfully');
        return { success: true, message: 'Alert sent successfully' };
      } else {
        const errorText = await response.text();
        throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
      }

    } catch (error) {
      console.error('❌ Failed to send WhatsApp alert:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send QR scan alert - call this when QR code is scanned
   */
  async sendQRScanAlert(shopId: number, customerName: string, customerPhone: string, location: string = 'Shop Entrance') {
    return this.sendAlert({
      shop_id: shopId,
      event_type: 'qr_scan',
      customer_name: customerName,
      customer_phone: customerPhone,
      location: location
    });
  }

  /**
   * Send order alert - call this when order is created
   */
  async sendOrderAlert(
    shopId: number, 
    orderData: {
      customer_name: string;
      customer_phone: string;
      product_name: string;
      amount: number;
      order_reference: string;
    }
  ) {
    return this.sendAlert({
      shop_id: shopId,
      event_type: 'order_created',
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      product_name: orderData.product_name,
      amount: orderData.amount,
      order_reference: orderData.order_reference
    });
  }

  /**
   * Send group engagement alert - call this when ad is viewed/shared
   */
  async sendGroupEngagementAlert(
    shopId: number,
    groupName: string,
    engagementData: {
      views: number;
      shares: number;
      clicks: number;
      ad_type?: string;
    }
  ) {
    return this.sendAlert({
      shop_id: shopId,
      event_type: 'group_engagement',
      group_name: groupName,
      views: engagementData.views,
      shares: engagementData.shares,
      clicks: engagementData.clicks
    });
  }

  /**
   * Send payment confirmation alert
   */
  async sendPaymentAlert(
    shopId: number,
    paymentData: {
      order_reference: string;
      customer_name: string;
      amount: number;
      payment_method?: string;
    }
  ) {
    return this.sendAlert({
      shop_id: shopId,
      event_type: 'payment_received',
      order_reference: paymentData.order_reference,
      customer_name: paymentData.customer_name,
      amount: paymentData.amount
    });
  }

  /**
   * Test WhatsApp connection for admin
   */
  async testConnection(shopId: number) {
    return this.sendAlert({
      shop_id: shopId,
      event_type: 'qr_scan',
      customer_name: 'Test User',
      customer_phone: '+254712345678',
      location: 'Test Location'
    });
  }
}

// Export singleton instance
export const whatsappIntegration = new WhatsAppIntegration();

// Helper function to get admin's personal WhatsApp number
export async function getAdminWhatsAppNumber(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('whatsapp_phone')
      .eq('id', userId)
      .limit(1);

    if (error) {
      console.error('Error fetching admin WhatsApp number:', error);
      return null;
    }

    return data?.[0]?.whatsapp_phone || null;
  } catch (error) {
    console.error('Error in getAdminWhatsAppNumber:', error);
    return null;
  }
}
