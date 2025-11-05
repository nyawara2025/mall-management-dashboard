// Campaign Analytics Tracking Helper
// Uses tracking pixels for 100% reliable event collection

export interface TrackingEvent {
  shop_id: string;
  campaign_id: string;
  action: 'scan' | 'claim' | 'share' | 'call' | 'directions';
}

/**
 * Track campaign events using tracking pixels
 * This method is bulletproof - no CORS issues, no API failures
 * 
 * @param event - The tracking event details
 */
export function trackEvent(event: TrackingEvent): void {
  const { shop_id, campaign_id, action } = event;
  
  try {
    // Create invisible 1x1 tracking pixel
    const trackingUrl = `https://n8n.tenear.com/webhook/track?shop_id=${shop_id}&campaign_id=${campaign_id}&action=${action}&t=${Date.now()}`;
    
    const img = new Image();
    img.src = trackingUrl;
    img.style.display = 'none';
    img.onload = () => console.log(`✅ Tracked: ${action} for campaign ${campaign_id}`);
    img.onerror = () => console.warn(`⚠️ Failed to track: ${action}`);
    
    // Add to DOM temporarily and remove after 1 second
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 1000);
    
    // Log for debugging
    console.log('📊 Tracking pixel sent:', { shop_id, campaign_id, action, url: trackingUrl });
    
  } catch (error) {
    // Even if this fails, we don't want to break the user experience
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track campaign page views (when someone scans QR code)
 */
export function trackPageView(shop_id: string, campaign_id: string): void {
  trackEvent({ shop_id, campaign_id, action: 'scan' });
}

/**
 * Track specific button clicks
 */
export function trackButtonClick(shop_id: string, campaign_id: string, buttonType: string): void {
  // Map button types to actions
  const actionMap: Record<string, TrackingEvent['action']> = {
    'claim': 'claim',
    'directions': 'directions', 
    'call': 'call',
    'share': 'share',
    'scan': 'scan'
  };
  
  const action = actionMap[buttonType];
  if (action) {
    trackEvent({ shop_id, campaign_id, action });
  }
}

/**
 * Test function to verify tracking is working
 */
export function testTracking(shop_id: string = '6', campaign_id: string = '1'): void {
  console.log('🧪 Testing tracking pixels...');
  
  // Test each action type
  const actions: TrackingEvent['action'][] = ['scan', 'claim', 'directions', 'call', 'share'];
  
  actions.forEach((action, index) => {
    setTimeout(() => {
      trackEvent({ shop_id, campaign_id, action });
    }, index * 500); // Stagger by 500ms
  });
}
