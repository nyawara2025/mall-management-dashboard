import { User, AuthToken, Mall, Shop } from '../types/auth';

// Browser-compatible token generation
function generateSimpleToken(user: User): string {
  const timestamp = Date.now();
  const tokenData = `${user.id}-${user.username}-${user.role}-${user.mall_id || ''}-${user.shop_id || ''}-${timestamp}`;
  return btoa(tokenData); // Browser built-in Base64 encoding
}

// Real database users - PLACEHOLDER DATA, UPDATE WITH ACTUAL DATABASE IDs
// Run the SQL query to get actual user data:
// SELECT id, username, full_name, role, mall_id, shop_id, active FROM users ORDER BY id;
const REAL_USERS = new Map<string, { password_hash: string; user: User }>();

// Super Admin
REAL_USERS.set('bosco', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 1, // UPDATE WITH ACTUAL ID FROM DATABASE
    username: 'bosco', 
    full_name: 'Bosco Mukira',
    role: 'super_admin', 
    mall_id: null, 
    shop_id: null, 
    active: true 
  } 
});

// Mall Admins
REAL_USERS.set('jane', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 2, // UPDATE WITH ACTUAL ID FROM DATABASE
    username: 'jane', 
    full_name: 'Jane Wangui',
    role: 'mall_admin', 
    mall_id: 3, // China Square Mall
    shop_id: null, 
    active: true 
  } 
});

REAL_USERS.set('faith', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 3, // UPDATE WITH ACTUAL ID FROM DATABASE
    username: 'faith', 
    full_name: 'Faith Njeri',
    role: 'mall_admin', 
    mall_id: 6, // Langata Mall
    shop_id: null, 
    active: true 
  } 
});

REAL_USERS.set('ngina', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 4, // UPDATE WITH ACTUAL ID FROM DATABASE
    username: 'ngina', 
    full_name: 'Ngina Wanjiku',
    role: 'mall_admin', 
    mall_id: 7, // NHC Mall
    shop_id: null, 
    active: true 
  } 
});

// Shop Admins - Current
REAL_USERS.set('ben', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 5, // UPDATE WITH ACTUAL ID FROM DATABASE
    username: 'ben', 
    full_name: 'Ben - Spatial Barbershop',
    role: 'shop_admin', 
    mall_id: 3, // China Square Mall
    shop_id: 3, // Spatial Barbershop
    active: true 
  } 
});

// Shop Admins - Missing Users (need to be added to database)
REAL_USERS.set('sandra', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 6, // TEMPORARY ID - will be assigned when added to database
    username: 'sandra', 
    full_name: 'Sandra - Kika Wines',
    role: 'shop_admin', 
    mall_id: 6, // Langata Mall - UPDATE WITH ACTUAL ID (matching database)
    shop_id: 6, // Sandra's actual shop_id in database
    active: true 
  } 
});

REAL_USERS.set('andrew', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 7, // TEMPORARY ID - will be assigned when added to database
    username: 'andrew', 
    full_name: 'Andrew - The Phone Shop',
    role: 'shop_admin', 
    mall_id: 6, // Langata Mall
    shop_id: 3, // The Phone Shop - UPDATE WITH ACTUAL ID (needs to be added to database first)
    active: true 
  } 
});

REAL_USERS.set('fred', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 8, // TEMPORARY ID - will be assigned when added to database
    username: 'fred', 
    full_name: 'Fred - Cleanshelf SupaMarket',
    role: 'shop_admin', 
    mall_id: 6, // Langata Mall
    shop_id: 4, // Cleanshelf Supamarket - UPDATE WITH ACTUAL ID (needs to be added to database first)
    active: true 
  } 
});

REAL_USERS.set('ibrahim', { 
  password_hash: '$2b$10$demo123hashedpassword', 
  user: { 
    id: 9, // TEMPORARY ID - will be assigned when added to database
    username: 'ibrahim', 
    full_name: 'Ibrahim - Maliet Salon & Spa',
    role: 'shop_admin', 
    mall_id: 7, // NHC Mall
    shop_id: 5, // Maliet Salon & Spa - UPDATE WITH ACTUAL ID (needs to be added to database first)
    active: true 
  } 
});

// FIXED: Real mall data with CORRECT mall_ids matching the database
// Run the SQL query to get actual mall data:
// SELECT id, name, latitude, longitude, address, radius_meters, active FROM malls ORDER BY id;
const REAL_MALLS: Mall[] = [
  {
    id: 3, // FIXED: China Square Mall - was 1, now 3
    name: 'China Square',
    latitude: -1.2921, // UPDATE WITH ACTUAL COORDINATES FROM DATABASE
    longitude: 36.8219,
    address: 'Langata, Nairobi', // UPDATE WITH ACTUAL ADDRESS FROM DATABASE
    radius_meters: 150.00, // UPDATE WITH ACTUAL RADIUS FROM DATABASE
    active: true,
    created_at: '2024-01-15T10:00:00Z', // UPDATE WITH ACTUAL TIMESTAMPS
    updated_at: '2024-01-15T10:00:00Z',
    shops: [
      { 
        id: 1, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'Spatial Barbershop', 
        created_at: '2024-01-15T10:00:00Z', 
        updated_at: '2024-01-15T10:00:00Z' 
      },
      { 
        id: 2, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'Mall Cafe', 
        created_at: '2024-01-15T11:00:00Z', 
        updated_at: '2024-01-15T11:00:00Z' 
      }
    ]
  },
  {
    id: 6, // FIXED: Langata Mall - was 2, now 6
    name: 'Langata Mall',
    latitude: -1.323957, // UPDATE WITH ACTUAL COORDINATES FROM DATABASE
    longitude: 36.782825,
    address: 'Langata, Nairobi', // UPDATE WITH ACTUAL ADDRESS FROM DATABASE
    radius_meters: 150.00, // UPDATE WITH ACTUAL RADIUS FROM DATABASE
    active: true,
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z',
    shops: [
      { 
        id: 3, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'Kika Wines', 
        created_at: '2024-01-16T11:00:00Z', 
        updated_at: '2024-01-16T12:00:00Z' 
      },
      { 
        id: 4, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'The Phone Shop', 
        created_at: '2024-01-16T12:00:00Z', 
        updated_at: '2024-01-16T13:00:00Z' 
      },
      { 
        id: 5, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'Cleanshelf Supamarket', 
        created_at: '2024-01-16T13:00:00Z', 
        updated_at: '2024-01-16T14:00:00Z' 
      }
    ]
  },
  {
    id: 7, // FIXED: NHC Mall - was 3, now 7
    name: 'NHC Mall',
    latitude: -1.317435, // UPDATE WITH ACTUAL COORDINATES FROM DATABASE
    longitude: 36.7882,
    address: 'Langata, Nairobi', // UPDATE WITH ACTUAL ADDRESS FROM DATABASE
    radius_meters: 150.00, // UPDATE WITH ACTUAL RADIUS FROM DATABASE
    active: true,
    created_at: '2024-01-17T12:00:00Z',
    updated_at: '2024-01-17T12:00:00Z',
    shops: [
      { 
        id: 6, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'Maliet Salon & Spa', 
        created_at: '2024-01-17T12:00:00Z', 
        updated_at: '2024-01-17T13:00:00Z' 
      },
      { 
        id: 7, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'CBC Resource Centre', 
        created_at: '2024-01-17T13:00:00Z', 
        updated_at: '2024-01-17T13:00:00Z' 
      },
      { 
        id: 8, // UPDATE WITH ACTUAL SHOP ID FROM DATABASE
        name: 'Hydramist Drinking Water Services', 
        created_at: '2024-01-17T14:00:00Z', 
        updated_at: '2024-01-17T14:00:00Z' 
      }
    ]
  }
];

// Authentication Service
export class AuthService {
  static async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const realUser = REAL_USERS.get(username.toLowerCase());
    
    if (!realUser) {
      return { success: false, error: 'User not found' };
    }
    
    // For demo purposes, compare against the hashed password
    // In production, you'd use bcrypt.compare(password, realUser.password_hash)
    const isValidPassword = password === 'demo123'; // Simple demo validation
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid username or password' };
    }
    
    if (!realUser.user.active) {
      return { success: false, error: 'Account is inactive' };
    }
    
    // Create simple token (browser-compatible)
    const token = generateSimpleToken(realUser.user);
    
    return {
      success: true,
      token,
      user: realUser.user
    };
  }
  
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
  
  static verifyToken(token: string): AuthToken | null {
    try {
      // Decode the token format: userId-username-role-mallId-shopId-timestamp
      const decodedString = atob(token);
      const [userId, username, role, mallId, shopId, timestamp] = decodedString.split('-');
      
      // Basic validation
      if (!userId || !username || !role || !timestamp) return null;
      
      // Check if token is expired
      const tokenTime = parseInt(timestamp);
      const expirationTime = tokenTime + (24 * 60 * 60) * 1000; // 24 hours in milliseconds
      
      if (Date.now() > expirationTime) {
        return null; // Token expired
      }
      
      // Create AuthToken object
      return {
        username,
        role: role as 'super_admin' | 'mall_admin' | 'shop_admin',
        userId: parseInt(userId),
        mall_id: mallId ? parseInt(mallId) : null,
        shop_id: shopId ? parseInt(shopId) : null,
        exp: expirationTime
      };
    } catch (error) {
      return null;
    }
  }
  
  static isTokenValid(token: string): boolean {
    return this.verifyToken(token) !== null;
  }
  
  static decodeToken(token: string): AuthToken | null {
    try {
      const decodedString = atob(token);
      const [userId, username, role, mallId, shopId, timestamp] = decodedString.split('-');
      
      if (!userId || !username || !role || !timestamp) return null;
      
      return {
        username,
        role: role as 'super_admin' | 'mall_admin' | 'shop_admin',
        userId: parseInt(userId),
        mall_id: mallId ? parseInt(mallId) : null,
        shop_id: shopId ? parseInt(shopId) : null,
        exp: parseInt(timestamp) + (24 * 60 * 60) * 1000
      };
    } catch {
      return null;
    }
  }
  
  static getCurrentUser(): User | null {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !userData) return null;
      
      // Verify token is still valid
      if (!this.isTokenValid(token)) {
        this.logout();
        return null;
      }
      
      // Parse user data
      const user = JSON.parse(userData) as User;
      
      // Update user data with any changes from the REAL_USERS map
      const realUser = REAL_USERS.get(user.username);
      if (realUser) {
        return realUser.user;
      }
      
      return user;
    } catch {
      return null;
    }
  }
}

// API Service for Mall Management
export class MallApiService {
  private static readonly API_BASE_URL = 'https://n8n.tenear.com/webhook/management/malls';
  
  static async fetchMalls(token: string): Promise<{ success: boolean; data?: Mall[]; error?: string }> {
    try {
      // Decode token to get user role and mall_id for filtering
      const authToken = AuthService.decodeToken(token);
      if (!authToken) {
        return { success: false, error: 'Invalid token' };
      }

      // Use real data with proper role-based filtering
      let filteredMalls = REAL_MALLS;
      
      if (authToken.role === 'mall_admin' && authToken.mall_id) {
        // Mall admins can only see their assigned mall
        filteredMalls = REAL_MALLS.filter(mall => mall.id === authToken.mall_id);
      } else if (authToken.role === 'shop_admin' && authToken.mall_id) {
        // Shop admins can only see malls for their assigned shop
        filteredMalls = REAL_MALLS.filter(mall => mall.id === authToken.mall_id);
      }
      // Super admins see all malls (no filtering needed)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { 
        success: true, 
        data: filteredMalls
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  static async fetchMallDetails(mallId: number, token: string): Promise<{ success: boolean; data?: Mall; error?: string }> {
    try {
      const mallsResponse = await this.fetchMalls(token);
      if (!mallsResponse.success || !mallsResponse.data) {
        return { success: false, error: 'Failed to fetch malls' };
      }
      
      const mall = mallsResponse.data.find(m => m.id === mallId);
      if (!mall) {
        return { success: false, error: 'Mall not found or access denied' };
      }
      
      return { success: true, data: mall };
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  // CRITICAL FIX: This method now properly filters shops for shop admins
  static async fetchShops(mallId: number, token: string): Promise<{ success: boolean; data?: Shop[]; error?: string }> {
    try {
      const mallsResponse = await this.fetchMalls(token);
      if (!mallsResponse.success || !mallsResponse.data) {
        return { success: false, error: 'Failed to fetch malls' };
      }
      
      const mall = mallsResponse.data.find(m => m.id === mallId);
      if (!mall) {
        return { success: false, error: 'Mall not found or access denied' };
      }
      
      // Get all shops for this mall
      let shops = mall.shops || [];
      
      // CRITICAL FIX: For shop admins, only return their specific assigned shop
      const authToken = AuthService.decodeToken(token);
      if (authToken?.role === 'shop_admin' && authToken.shop_id) {
        // Shop admins can only see their own assigned shop
        shops = shops.filter(shop => shop.id === authToken.shop_id);
      }
      // Mall admins and super admins see all shops in the mall
      
      return { success: true, data: shops };
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  static async createMall(mallData: Partial<Mall>, token: string): Promise<{ success: boolean; data?: Mall; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMall: Mall = {
        id: Math.max(...REAL_MALLS.map(m => m.id)) + 1,
        name: mallData.name || 'New Mall',
        latitude: mallData.latitude || -1.2921,
        longitude: mallData.longitude || 36.8219,
        address: mallData.address || 'Unknown Location',
        radius_meters: mallData.radius_meters || 500,
        active: mallData.active !== undefined ? mallData.active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        shops: []
      };
      
      return { success: true, data: newMall };
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  static async updateMall(mallId: number, mallData: Partial<Mall>, token: string): Promise<{ success: boolean; data?: Mall; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingMall = REAL_MALLS.find(m => m.id === mallId);
      if (!existingMall) {
        return { success: false, error: 'Mall not found' };
      }
      
      const updatedMall: Mall = {
        ...existingMall,
        ...mallData,
        updated_at: new Date().toISOString()
      };
      
      return { success: true, data: updatedMall };
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  static async deleteMall(mallId: number, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingMall = REAL_MALLS.find(m => m.id === mallId);
      if (!existingMall) {
        return { success: false, error: 'Mall not found' };
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  static createAuthHeaders(token: string): HeadersInit {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}

// Export service objects for easy importing
export const AuthServiceExports = {
  login: AuthService.login.bind(AuthService),
  logout: AuthService.logout.bind(AuthService),
  decodeToken: AuthService.decodeToken.bind(AuthService),
  verifyToken: AuthService.verifyToken.bind(AuthService),
  isTokenValid: AuthService.isTokenValid.bind(AuthService),
  getCurrentUser: AuthService.getCurrentUser.bind(AuthService)
};

export const MallApiServiceExports = {
  fetchMalls: MallApiService.fetchMalls.bind(MallApiService),
  fetchMallDetails: MallApiService.fetchMallDetails.bind(MallApiService),
  createMall: MallApiService.createMall.bind(MallApiService),
  updateMall: MallApiService.updateMall.bind(MallApiService),
  deleteMall: MallApiService.deleteMall.bind(MallApiService),
  fetchShops: MallApiService.fetchShops.bind(MallApiService),
  createAuthHeaders: MallApiService.createAuthHeaders.bind(MallApiService)
};

// Individual exports for easier importing
export const login = AuthService.login;
export const logout = AuthService.logout;
export const decodeToken = AuthService.decodeToken;
export const verifyToken = AuthService.verifyToken;
export const isTokenValid = AuthService.isTokenValid;
export const getCurrentUser = AuthService.getCurrentUser;

// Utility function for creating auth headers
export function createAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const fetchMalls = MallApiService.fetchMalls;
export const fetchMallDetails = MallApiService.fetchMallDetails;
export const createMall = MallApiService.createMall;
export const updateMall = MallApiService.updateMall;
export const deleteMall = MallApiService.deleteMall;
export const fetchShops = MallApiService.fetchShops;
export const createAuthHeadersFromService = MallApiService.createAuthHeaders;
