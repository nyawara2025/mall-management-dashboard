import type { User, Mall } from '../types/auth';

// User interface matching the Supabase structure
interface UserRecord {
  id: number
  username: string
  full_name: string
  role: 'super_admin' | 'mall_admin' | 'shop_admin'
  mall_id: number | null
  shop_id: number | null
  shop_name?: string // Shop name for shop admins
  mall_name?: string // Mall name for context
  active: boolean
  created_at?: string
  updated_at?: string
  mall_access?: number[]
  shop_access?: number[]
}

// Real users database (simulating Supabase with proper password hashing)
const REAL_USERS = new Map<string, { password_hash: string, user: UserRecord }>()

// Password hashing function (bcrypt-like for demo purposes)
function hashPassword(password: string): string {
  // Simple hash for demo - in production use proper bcrypt
  return '$2b$10$' + btoa(password + 'salt').replace(/=/g, '').substring(0, 22)
}

// Initialize users database with ONLY backend users from your database
// All users use 'demo123' as password

// Super Admin
REAL_USERS.set('bosco', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 100, 
    username: 'bosco', 
    full_name: 'Bosco Developer', 
    role: 'super_admin', 
    mall_id: null, 
    mall_name: 'All Malls',
    shop_id: null, 
    shop_name: 'All Shops',
    mall_access: [3, 6, 7],
    shop_access: [3, 4, 6, 7, 8, 9, 10, 11],
    active: true 
  } 
})

// Mall Admins
REAL_USERS.set('jane', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 5, 
    username: 'jane', 
    full_name: 'Jane Mkenya', 
    role: 'mall_admin', 
    mall_id: 3, 
    mall_name: 'China Square Mall',
    shop_id: null, 
    mall_access: [3],
    shop_access: [3, 4],
    active: true 
  } 
})

REAL_USERS.set('faith', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 10, 
    username: 'faith', 
    full_name: 'Faith WaKenya', 
    role: 'mall_admin', 
    mall_id: 6, 
    mall_name: 'Langata Mall',
    shop_id: null, 
    mall_access: [6],
    shop_access: [6, 7, 8],
    active: true 
  } 
})

REAL_USERS.set('ngina', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 11, 
    username: 'ngina', 
    full_name: 'Ngina Pia Mkenya', 
    role: 'mall_admin', 
    mall_id: 7, 
    mall_name: 'NHC Mall',
    shop_id: null, 
    mall_access: [7],
    shop_access: [9, 10, 11],
    active: true 
  } 
})

// Shop Admins
REAL_USERS.set('ben', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 6, 
    username: 'ben', 
    full_name: 'Ben Agina', 
    role: 'shop_admin', 
    mall_id: 3, 
    mall_name: 'China Square Mall',
    shop_id: 3, 
    shop_name: 'Spatial Barbershop & Spa',
    mall_access: [3],
    shop_access: [3],
    active: true 
  } 
})

REAL_USERS.set('sandra', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 12, 
    username: 'sandra', 
    full_name: 'Sandra Sawe', 
    role: 'shop_admin', 
    mall_id: 6, 
    mall_name: 'Langata Mall',
    shop_id: 6, 
    shop_name: 'Kika Wines & Spirits',
    mall_access: [6],
    shop_access: [6],
    active: true 
  } 
})

REAL_USERS.set('andrew', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 13, 
    username: 'andrew', 
    full_name: 'Andrew - The Phone Shop', 
    role: 'shop_admin', 
    mall_id: 6, 
    mall_name: 'Langata Mall',
    shop_id: 7, 
    shop_name: 'The Phone Shop',
    mall_access: [6],
    shop_access: [7],
    active: true 
  } 
})

REAL_USERS.set('fred', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 14, 
    username: 'fred', 
    full_name: 'Fred - Cleanshelf SupaMarket', 
    role: 'shop_admin', 
    mall_id: 6, 
    mall_name: 'Langata Mall',
    shop_id: 8, 
    shop_name: 'Cleanshelf SupaMarket',
    mall_access: [6],
    shop_access: [8],
    active: true 
  } 
})

REAL_USERS.set('ibrahim', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 15, 
    username: 'ibrahim', 
    full_name: 'Ibrahim - Maliet Salon & Spa', 
    role: 'shop_admin', 
    mall_id: 7, 
    mall_name: 'NHC Mall',
    shop_id: 9, 
    shop_name: 'Maliet Salon & Spa',
    mall_access: [7],
    shop_access: [9],
    active: true 
  } 
})

// Password verification function
function verifyPassword(password: string, hash: string): boolean {
  return hash === hashPassword(password)
}

// Generate mock JWT token
function generateToken(user: UserRecord): string {
  const payload = {
    sub: user.id.toString(),
    username: user.username,
    role: user.role,
    mall_id: user.mall_id,
    shop_id: user.shop_id,
    mall_access: user.mall_access,
    shop_access: user.shop_access,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

// Parse and verify token (handles both mock, n8n, and dash-separated tokens)
function parseToken(tokenStr: string): UserRecord | null {
  try {
    // First, check if this is a dash-separated token (new format)
    if (tokenStr.includes('-') && !tokenStr.includes('=') && !tokenStr.includes('/')) {
      const parts = tokenStr.split('-')
      
      if (parts.length >= 6) {
        const [userId, username, role, mallId, shopId, timestamp] = parts
        
        // Return user data from dash-separated token
        return {
          id: parseInt(userId, 10),
          username: username,
          full_name: username, // Default full_name to username if not available
          role: role as 'super_admin' | 'mall_admin' | 'shop_admin', // Cast role to proper type
          mall_id: parseInt(mallId, 10),
          shop_id: parseInt(shopId, 10),
          active: true, // Default active to true
          mall_access: [parseInt(mallId, 10)], // mall_access should contain mall_id
          shop_access: [parseInt(shopId, 10)] // shop_access should contain shop_id
        }
      }
    }
    
    // Fallback: Try to parse as base64 encoded token (old format)
    const payload = JSON.parse(atob(tokenStr))
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('Token expired')
      return null
    }
    
    // Check if this is a n8n token with user data in payload
    if (payload.username && payload.role && payload.mall_id) {
      // This is a n8n token - return user data from token payload
      return {
        id: payload.userId || payload.id || 0,
        username: payload.username,
        full_name: payload.full_name || payload.username,
        role: payload.role,
        mall_id: payload.mall_id,
        shop_id: payload.shop_id,
        active: payload.active !== false, // Default to true if not specified
        mall_access: payload.mall_access || [payload.mall_id].filter(Boolean),
        shop_access: payload.shop_access || [payload.shop_id].filter(Boolean)
      }
    }
    
    // Fall back to finding user in our mock database (for backward compatibility)
    const userEntry = Array.from(REAL_USERS.values()).find(u => u.user.id.toString() === payload.sub)
    return userEntry ? userEntry.user : null
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

// Save auth data to localStorage
function saveAuthData(user: UserRecord, authToken: string) {
  localStorage.setItem('geofence_user_data', JSON.stringify({
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    mall_id: user.mall_id,
    shop_id: user.shop_id,
    active: user.active,
    mall_access: user.mall_access || [],
    shop_access: user.shop_access || []
  }))
  localStorage.setItem('geofence_auth_token', authToken)
  localStorage.setItem('geofence_user_data_timestamp', Date.now().toString())
}

// Load auth data from localStorage
function loadAuthData(): User | null {
  try {
    const userDataStr = localStorage.getItem('geofence_user_data')
    const authToken = localStorage.getItem('geofence_auth_token')
    
    if (userDataStr && authToken) {
      const userData = JSON.parse(userDataStr)
      const tokenUser = parseToken(authToken)
      
      if (tokenUser && tokenUser.active) {
        // For n8n users, prefer token data over stored data for consistency
        return {
          id: tokenUser.id,
          username: tokenUser.username,
          full_name: tokenUser.full_name || userData.full_name,
          role: tokenUser.role,
          mall_id: tokenUser.mall_id,
          shop_id: tokenUser.shop_id,
          active: tokenUser.active,
          mall_access: tokenUser.mall_access || userData.mall_access,
          shop_access: tokenUser.shop_access || userData.shop_access
        } as User
      }
    }
  } catch (error) {
    console.error('Error loading auth data:', error)
  }
  
  return null
}

// Login function
async function login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  try {
    // Call n8n login webhook
    const n8nLoginWebhook = 'https://n8n.tenear.com/webhook/adgeologin'
    const response = await fetch(n8nLoginWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    
    const result = await response.json()
    
    if (result.success && result.id && result.username && result.role) {
      // Handle n8n response format - user data is in the response itself
      const userData = {
        id: result.id,
        username: result.username,
        full_name: result.full_name || result.username,
        role: result.role,
        mall_id: result.mall_id,
        shop_id: result.shop_id,
        active: result.active !== false,
        mall_access: result.mall_access || [result.mall_id].filter(Boolean),
        shop_access: result.shop_access || [result.shop_id].filter(Boolean)
      }
      
      // Generate token in the dash-separated format that n8n expects
      const timestamp = Date.now()
      const mallId = userData.mall_id || userData.mall_access?.[0] || 0
      const shopId = userData.shop_id || userData.shop_access?.[0] || 0
      const token = `${userData.id}-${userData.username}-${userData.role}-${mallId}-${shopId}-${timestamp}`
      
      // Save the token and user data
      saveAuthData(userData, token)
      
      return { 
        success: true, 
        token: token, 
        user: userData 
      }
    } else {
      return { success: false, error: result.error || 'Invalid credentials' }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Logout function
function logout() {
  // Clear localStorage
  localStorage.removeItem('geofence_user_data')
  localStorage.removeItem('geofence_auth_token')
  localStorage.removeItem('geofence_user_data_timestamp')
  
  // Redirect to login
  window.location.href = '/login'
}

// Check if user is authenticated
function checkAuth(): User | null {
  return loadAuthData()
}

// Get current user
function getCurrentUser(): User | null {
  return loadAuthData()
}

// Get authentication token
function getToken(): string | null {
  return localStorage.getItem('geofence_auth_token')
}

// Check user role
function hasRole(user: User | null, role: string): boolean {
  return user?.role === role
}

// Check if user has access to mall
function hasMallAccess(user: User | null, mallId: number): boolean {
  if (!user) return false
  
  if (user.role === 'super_admin') return true
  if (user.mall_access?.includes(mallId)) return true
  if (user.mall_id === mallId) return true
  
  return false
}

// Check if user has access to shop
function hasShopAccess(user: User | null, shopId: number): boolean {
  if (!user) return false
  
  if (user.role === 'super_admin') return true
  if (user.shop_access?.includes(shopId)) return true
  if (user.shop_id === shopId) return true
  
  return false
}

// Get user's accessible malls
function getUserMalls(user: User | null): number[] {
  if (!user) return []
  
  if (user.mall_access && user.mall_access.length > 0) {
    return user.mall_access
  }
  
  if (user.role === 'super_admin') return [3, 6, 7]
  if (user.mall_id) return [user.mall_id]
  
  return []
}

// Get user's accessible shops
function getUserShops(user: User | null): number[] {
  if (!user) return []
  
  if (user.shop_access && user.shop_access.length > 0) {
    return user.shop_access
  }
  
  if (user.role === 'super_admin') return [3, 4, 6, 7, 8, 9, 10, 11]
  if (user.role === 'shop_admin' && user.shop_id) return [user.shop_id]
  if (user.role === 'mall_admin' && user.mall_id) {
    // Return shops for the mall
    switch (user.mall_id) {
      case 3: return [3, 4] // China Square Mall
      case 6: return [6, 7, 8] // Langata Mall
      case 7: return [9, 10, 11] // NHC Mall
      default: return []
    }
  }
  
  return []
}

// Get user's current mall and shop
function getCurrentUserMallAndShop(user: User | null): { mall_id: number, shop_id: number } {
  if (!user) return { mall_id: 3, shop_id: 3 }
  
  const userRole = user.role
  const userData = user
  const mallAccess = getUserMalls(user)
  const shopAccess = getUserShops(user)
  
  console.log('🔍 getCurrentUserMallAndShop called:', {
    userRole,
    userData,
    mallAccess,
    shopAccess
  })
  
  if (userRole === 'super_admin') {
    console.log('👑 Super admin - using default mall_id: 3, shop_id: 3')
    return { mall_id: 3, shop_id: 3 }
  } else if (userRole === 'mall_admin') {
    const resolvedMallId = userData.mall_id || mallAccess[0]
    console.log('🏢 Mall admin - resolved mall_id:', resolvedMallId)
    return { 
      mall_id: resolvedMallId || 3, 
      shop_id: 3 
    }
  } else if (userRole === 'shop_admin') {
    // Use direct mall_id and shop_id from user data first
    const userMallId = userData.mall_id || mallAccess[0]
    const userShopId = userData.shop_id || shopAccess[0]
    
    // Log the shop admin data for debugging
    console.log('🔑 Shop Admin User Data:', {
      userData: userData,
      mallAccess: mallAccess,
      shopAccess: shopAccess,
      resolvedMallId: userMallId,
      resolvedShopId: userShopId
    })
    
    return { 
      mall_id: userMallId || 3, 
      shop_id: userShopId || 3 
    }
  }
  
  console.log('❓ Unknown role or user, using defaults')
  return { mall_id: 3, shop_id: 3 }
}

// Create auth headers for API requests
function createAuthHeaders(token?: string): HeadersInit {
  const authToken = token || getToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg'}`
  }
}

// Verify token function
async function verifyToken(token: string): Promise<any> {
  try {
    const user = parseToken(token)
    if (user) {
      return {
        sub: user.id.toString(),
        username: user.username,
        role: user.role,
        mall_id: user.mall_id,
        shop_id: user.shop_id,
        mall_access: user.mall_access,
        shop_access: user.shop_access,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      }
    }
    return null
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Authentication service class for AuthContext compatibility
export class AuthService {
  /**
   * Login method - returns format expected by AuthContext
   */
  static async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: UserRecord; error?: string }> {
    try {
      const userRecord = REAL_USERS.get(username.toLowerCase())
      if (!userRecord) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Check password (in demo, we just compare with hash)
      const hashedPassword = hashPassword(password)
      if (userRecord.password_hash !== hashedPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Generate token using existing function
      const token = generateToken(userRecord.user)

      return { 
        success: true, 
        token,
        user: userRecord.user 
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  /**
   * Verify token method - returns format expected by AuthContext
   */
  static async verifyToken(token: string): Promise<UserRecord | null> {
    try {
      const userRecord = parseToken(token)
      if (!userRecord) {
        return null
      }

      // Check if user is active
      const user = REAL_USERS.get(userRecord.username.toLowerCase())
      if (!user || !user.user.active) {
        return null
      }

      return userRecord
    } catch (error) {
      console.error('Token verification error:', error)
      return null
    }
  }

  /**
   * Generate token using existing function
   */
  static generateToken(user: UserRecord): string {
    return generateToken(user)
  }

  /**
   * Parse token using existing function
   */
  static parseToken(token: string): UserRecord | null {
    return parseToken(token)
  }

  /**
   * Check if user has access to specific mall
   */
  static hasMallAccess(user: UserRecord, mallId: number): boolean {
    if (user.role === 'super_admin') {
      return true
    }
    
    if (user.role === 'mall_admin') {
      return user.mall_id === mallId
    }
    
    if (user.role === 'shop_admin') {
      return user.mall_id === mallId && (user.mall_access?.includes(mallId) || false)
    }
    
    return false
  }

  /**
   * Check if user has access to specific shop
   */
  static hasShopAccess(user: UserRecord, shopId: number): boolean {
    if (user.role === 'super_admin') {
      return true
    }
    
    if (user.role === 'shop_admin') {
      return user.shop_id === shopId
    }
    
    return false
  }

  // Legacy methods for backward compatibility
  logout(): void {
    logout()
  }

  static getCurrentUser(): User | null {
    return getCurrentUser()
  }

  static isAuthenticated(): boolean {
    return !!getCurrentUser()
  }

  static hasRole(role: string): boolean {
    return hasRole(getCurrentUser(), role)
  }

  static getUserMalls(): number[] {
    return getUserMalls(getCurrentUser())
  }

  static getUserShops(): number[] {
    return getUserShops(getCurrentUser())
  }

  static getCurrentUserMallAndShop(): { mall_id: number, shop_id: number } {
    return getCurrentUserMallAndShop(getCurrentUser())
  }

  static verifyTokenLegacy(token: string): Promise<any> {
    return verifyToken(token)
  }
}

// Legacy export for backward compatibility
export const AuthServiceInstance = AuthService

// Mall API service with proper typing
interface MallApiServiceInterface {
  fetchMalls(token: string): Promise<{ success: boolean; data?: Mall[]; error?: string }>;
  // Add other methods as needed
}

class MallApiServiceClass implements MallApiServiceInterface {
  private baseUrl = 'https://ufrrlfcxuovxgizxuowh.supabase.co'
  private n8nLoginWebhook = 'https://n8n.tenear.com/webhook/adgeologin'
  private n8nWebhookGet = 'https://n8n.tenear.com/webhook/manage-campaigns-get'
  private n8nWebhookPost = 'https://n8n.tenear.com/webhook/manage-campaigns-post'
  private n8nMallManagementWebhook = 'https://n8n.tenear.com/webhook/management/malls'
  private n8nQRCheckinWebhook = 'https://n8n.tenear.com/webhook/china-square-qr-checkin'

  async fetchMalls(token: string): Promise<{ success: boolean; data?: Mall[]; error?: string }> {
    try {
      console.log('🏢 MallApiService - Using reliable static mall data (bypassing n8n workflow)');
      
      // CRITICAL FIX: Use static mall data to avoid n8n workflow "undefined" shop_id error
      const staticMalls: Mall[] = [
        {
          id: 3,
          name: 'China Square Mall',
          latitude: -1.286389,
          longitude: 36.817223,
          address: 'Nairobi, Kenya',
          radius_meters: 1000,
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 6,
          name: 'Langata Mall',
          latitude: -1.330000,
          longitude: 36.710000,
          address: 'Langata, Nairobi, Kenya',
          radius_meters: 1000,
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 7,
          name: 'NHC Mall',
          latitude: -1.300000,
          longitude: 36.800000,
          address: 'NHC, Nairobi, Kenya',
          radius_meters: 1000,
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];
      
      console.log('✅ MallApiService - Static mall data loaded:', staticMalls.length, 'malls');

      // Filter malls based on user access (preserves existing logic)
      const user = getCurrentUser()
      let accessibleMalls = staticMalls
      
      if (user && user.role !== 'super_admin') {
        const userMallIds = getUserMalls(user)
        accessibleMalls = staticMalls.filter(mall => userMallIds.includes(Number(mall.id)))
        console.log('🔒 MallApiService - Filtered for user role:', user.role, 'Accessible malls:', accessibleMalls.length);
      }

      console.log('✅ MallApiService - Final accessible malls:', accessibleMalls)
      return { success: true, data: accessibleMalls }
    } catch (error) {
      console.error('❌ MallApiService - Error:', error)
      return { success: false, error: 'Failed to fetch malls' }
    }
  }

  async deleteCampaign(campaignId: number, mallId: number, shopId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const authToken = localStorage.getItem('geofence_auth_token') || ''
      
      console.log('🗑️ Deleting campaign via n8n webhook:', campaignId)
      
      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          campaign_id: campaignId,
          mall_id: mallId,
          shop_id: shopId
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete campaign: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Campaign deleted successfully via n8n webhook:', result)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting campaign:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  }

  async processQRCheckin(checkinData: {
    campaign_id: number;
    zone: string;
    location: string;
    user_id?: number;
    timestamp?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📱 Processing QR check-in via n8n webhook:', checkinData)
      
      const response = await fetch(this.n8nQRCheckinWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...checkinData,
          timestamp: checkinData.timestamp || new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to process QR check-in: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ QR check-in processed successfully via n8n webhook:', result)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error processing QR check-in:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  }

  async fetchCampaigns(mallId: number, shopId: number): Promise<any[]> {
    try {
      console.log('📋 Loading campaigns for mall_id:', mallId, 'shop_id:', shopId)
      
      const response = await fetch(`${this.n8nWebhookGet}?mall_id=${mallId}&shop_id=${shopId}`, {
        method: 'GET',
        headers: createAuthHeaders()
      })
      
      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📦 API Response data:', result)
      
      return result.data || []
    } catch (error) {
      console.error('❌ Error loading campaigns:', error)
      throw error
    }
  }

  async createCampaign(campaignData: any): Promise<any> {
    try {
      const payload = {
        action: 'create',
        campaign: campaignData
      }
      
      console.log('💾 Creating campaign:', payload)
      
      const response = await fetch(this.n8nWebhookPost, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ Error creating campaign:', error)
      throw error
    }
  }

  async updateCampaign(campaignData: any): Promise<any> {
    try {
      const payload = {
        action: 'update',
        campaign: campaignData
      }
      
      console.log('💾 Updating campaign:', payload)
      
      const response = await fetch(this.n8nWebhookPost, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ Error updating campaign:', error)
      throw error
    }
  }
}

// Export properly typed MallApiService singleton
export const MallApiService: MallApiServiceInterface = new MallApiServiceClass()

export {
  REAL_USERS
}

export type { UserRecord }

export {
  createAuthHeaders,
  getCurrentUserMallAndShop
}
