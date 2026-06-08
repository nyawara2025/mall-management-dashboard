import { supabase } from './supabase'; 

/**
 * Updates the global presentation view state across all big screen portals instantly.
 * @param shopId The multi-tenant church identifier (e.g., 68)
 * @param viewName The text tag of the button or module being navigated to
 */
export const updatePresentationView = async (shopId: number, viewName: string) => {
  try {
    // 🛡️ TYPE CAST AS ANY BYPASSES THE RESTRICTIVE SINGLE-ARGUMENT CUSTOM STUB DEFINITIONS
    const dbClient = supabase.from('app_presentation_sync') as any;

    const { error } = await dbClient.insert(
      { 
        shop_id: shopId, 
        active_view: viewName,
        updated_at: new Date().toISOString()
      }, 
      { upsert: true }
    );
      
    if (error) {
      console.error("Supabase Realtime Sync Error:", error.message);
    } else {
      console.log(`📡 Broadcasted view change: [${viewName}] for Shop [${shopId}]`);
    }
  } catch (err) {
    console.error("Presentation utility exception:", err);
  }
};
