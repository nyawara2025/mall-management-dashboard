// ✅ UPDATED auth.ts with REAL Database IDs (from n8n/SQL results)
// Replace the placeholder IDs with actual IDs from your database query

import { User, AuthToken } from '../types/auth';

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// Types for auth services
export interface AuthService {
  login(username: string, password: string): Promise<LoginResponse>;
  verifyToken(token: string): Promise<AuthToken | null>;
  logout(): void;
}

export interface MallApiService {
  fetchMalls(token: string): Promise<any[]>;
  fetchShops(authToken?: AuthToken): Promise<any[]>;
}

export interface UserData {
  password: string;
  user: User;
}

// Real users from user's database (UPDATED with actual IDs)
export const REAL_USERS = new Map<string, UserData>([
  // Super Admin - Overall System Admin
  ['bosco', {
    password: 'demo123',
    user: { 
      id: 100, 
      username: 'bosco', 
      full_name: 'Bosco Developer', 
      role: 'super_admin', 
      mall_id: null, 
      shop_id: null, 
      active: true 
    }
  }],

  // Mall Admins
  ['jane', {
    password: 'demo123',
    user: { 
      id: 5, 
      username: 'jane', 
      full_name: 'Jane Smith - Mall Admin', 
      role: 'mall_admin', 
      mall_id: 3, 
      shop_id: null, 
      active: true 
    }
  }],
  ['faith', {
    password: 'demo123',
    user: { 
      id: 10, 
      username: 'faith', 
      full_name: 'Faith Admin', 
      role: 'mall_admin', 
      mall_id: 6, 
      shop_id: null, 
      active: true 
    }
  }],
  ['ngina', {
    password: 'demo123',
    user: { 
      id: 11, 
      username: 'ngina', 
      full_name: 'Ngina Admin', 
      role: 'mall_admin', 
      mall_id: 7, 
      shop_id: null, 
      active: true 
    }
  }],

  // Shop Admins (UPDATED with real database IDs)
  ['ben', {
    password: 'demo123',
    user: { 
      id: 6, 
      username: 'ben', 
      full_name: 'Ben Johnson - Shop Admin', 
      role: 'shop_admin', 
      mall_id: null, 
      shop_id: 3, 
      active: true 
    }
  }],
  // NEW USERS - Replace these placeholder IDs with actual IDs from your query:
  ['sandra', {
    password: 'demo123',
    user: { 
      id: 12,
      username: 'sandra', 
      full_name: 'Sandra - Kika Wines & Spirits', 
      role: 'shop_admin', 
      mall_id: 6, 
      shop_id: 6, 
      active: true 
    }
  }],
  ['andrew', {
    password: 'demo123',
    user: { 
      id: 13,
      username: 'andrew', 
      full_name: 'Andrew - The Phone Shop', 
      role: 'shop_admin', 
      mall_id: 6, 
      shop_id: 7, 
      active: true 
    }
  }],
  ['fred', {
    password: 'demo123',
    user: { 
      id: 14,
      username: 'fred', 
      full_name: 'Fred - Cleanshelf SupaMarket', 
      role: 'shop_admin', 
      mall_id: 6, 
      shop_id: 8, 
      active: true 
    }
  }],
  ['ibrahim', {
    password: 'demo123',
    user: { 
      id: 15,
      username: 'ibrahim', 
      full_name: 'Ibrahim - Maliet Salon & Spa', 
      role: 'shop_admin', 
      mall_id: 7, 
      shop_id: 9, 
      active: true 
    }
  }]
]);

// Real malls from user's database
export const REAL_MALLS = [
  { id: 3, name: 'China Square', latitude: -1.32429000, longitude: 36.80310000, radius_meters: 75.00, address: 'China Square, Langata', active: true },
  { id: 6, name: 'Langata Mall', latitude: -1.32361000, longitude: 36.78304000, radius_meters: 50.00, address: 'Langata Mall, Langata', active: true },
  { id: 7, name: 'NHC Mall', latitude: -1.31729000, longitude: 36.78841000, radius_meters: 50.00, address: 'NHC Mall, Langata', active: true }
];

// Real shops from user's database
export const REAL_SHOPS = [
  // China Square (mall_id=3)
  { id: 3, name: 'Spatial Barber Shop', mall_id: 3, latitude: -1.32429000, longitude: 36.80310000, radius_meters: 75.00, description: 'Professional barber shop services', active: true },
  { id: 4, name: 'Mall Cafe', mall_id: 3, latitude: -1.32415000, longitude: 36.80325000, radius_meters: 50.00, description: 'Coffee and light meals', active: true },
  
  // Langata Mall (mall_id=6)
  { id: 6, name: 'Kika Wines & Spirits', mall_id: 6, latitude: -1.32361000, longitude: 36.78304000, radius_meters: 50.00, description: 'Wine and spirits store', active: true },
  { id: 7, name: 'The Phone Shop', mall_id: 6, latitude: -1.32361000, longitude: 36.78304000, radius_meters: 50.00, description: 'Mobile phones and accessories', active: true },
  { id: 8, name: 'Cleanshelf SupaMarket', mall_id: 6, latitude: -1.32361000, longitude: 36.78304000, radius_meters: 50.00, description: 'Supermarket and grocery store', active: true },
  
  // NHC Mall (mall_id=7)
  { id: 9, name: 'Maliet Salon & Spa', mall_id: 7, latitude: -1.31729000, longitude: 36.78841000, radius_meters: 50.00, description: 'Beauty salon and spa services', active: true },
  { id: 10, name: 'Gravity CBC Resource Center', mall_id: 7, latitude: -1.31729000, longitude: 36.78841000, radius_meters: 50.00, description: 'Educational resource center', active: true },
  { id: 11, name: 'Hydramist Drinking Water Services', mall_id: 7, latitude: -1.31729000, longitude: 36.78841000, radius_meters: 50.00, description: 'Water services and products', active: true }
];

// Generate a simple auth token (Base64 encoded)
function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    mallId: user.mall_id,
    shopId: user.shop_id,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
  };
  return btoa(JSON.stringify(payload));
}

// Decode and validate auth token
export function parseAuthToken(token: string): AuthToken | null {
  try {
    const decoded = JSON.parse(atob(token));
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      mall_id: decoded.mallId,
      shop_id: decoded.shopId,
      exp: decoded.exp || Date.now() + 24 * 60 * 60 * 1000 // Default to 24 hours
    };
  } catch (error) {
    return null;
  }
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userData = REAL_USERS.get(username.toLowerCase());
      
      if (!userData || userData.password !== password || !userData.user.active) {
        resolve({ success: false, error: 'Invalid username or password' });
        return;
      }

      const token = generateToken(userData.user);
      resolve({ 
        success: true, 
        token,
        user: userData.user
      });
    }, 500);
  });
}

export function verifyToken(token: string): Promise<AuthToken | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const authToken = parseAuthToken(token);
      resolve(authToken);
    }, 300);
  });
}

export function fetchMalls(token: string): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(REAL_MALLS);
    }, 300);
  });
}

export function fetchShops(authToken?: AuthToken): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let shops = [...REAL_SHOPS];
      
      if (!authToken) {
        // If no auth token, return all shops
        resolve(shops);
        return;
      }

      // Role-based filtering
      switch (authToken.role) {
        case 'super_admin':
          // Super admin sees all shops across all malls
          resolve(shops);
          break;
          
        case 'mall_admin':
          // Mall admin sees shops only in their mall
          if (authToken.mall_id) {
            shops = shops.filter(shop => shop.mall_id === authToken.mall_id);
          }
          resolve(shops);
          break;
          
        case 'shop_admin':
          // CRITICAL FIX: Shop admin sees ONLY their assigned shop
          if (authToken.shop_id) {
            shops = shops.filter(shop => shop.id === authToken.shop_id);
          }
          resolve(shops);
          break;
          
        default:
          // Default: return all shops
          resolve(shops);
      }
    }, 300);
  });
}

// Service implementations
export const AuthService: AuthService = {
  login,
  verifyToken,
  logout: () => {
    // Clear any stored tokens if needed
    localStorage.removeItem('authToken');
  }
};

export const MallApiService: MallApiService = {
  fetchMalls,
  fetchShops
};
