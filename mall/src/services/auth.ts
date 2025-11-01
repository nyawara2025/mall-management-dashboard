import jwt from 'jsonwebtoken';
import { User, AuthToken, Mall } from '../types/auth';

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = 'mall-management-secret-key-2025';

// Base64URL encoding helper
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Create a complete JWT token
function createJWT(payload: AuthToken): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  // Create signature
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Mock user database for authentication
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'bosco': {
    password: 'demo123',
    user: {
      id: 100,
      username: 'bosco',
      role: 'super_admin',
      full_name: 'Bosco Admin',
      mall_id: null,
      shop_id: null,
      active: true
    }
  },
  'jane': {
    password: 'demo123',
    user: {
      id: 5,
      username: 'jane',
      role: 'mall_admin',
      full_name: 'Jane Admin',
      mall_id: 3, // China Square Mall
      shop_id: null,
      active: true
    }
  },
  'faith': {
    password: 'demo123',
    user: {
      id: 6,
      username: 'faith',
      role: 'mall_admin',
      full_name: 'Faith Admin',
      mall_id: 1, // Will be assigned to first mall
      shop_id: null,
      active: true
    }
  },
  'ngina': {
    password: 'demo123',
    user: {
      id: 7,
      username: 'ngina',
      role: 'mall_admin',
      full_name: 'Ngina Admin',
      mall_id: 2, // Will be assigned to second mall
      shop_id: null,
      active: true
    }
  }
};

// Authentication Service
export class AuthService {
  static async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = MOCK_USERS[username.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      return { success: false, error: 'Invalid username or password' };
    }
    
    if (!mockUser.user.active) {
      return { success: false, error: 'Account is inactive' };
    }
    
    // Create JWT token
    const tokenPayload: AuthToken = {
      username: mockUser.user.username,
      role: mockUser.user.role,
      userId: mockUser.user.id,
      mall_id: mockUser.user.mall_id,
      shop_id: mockUser.user.shop_id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const token = createJWT(tokenPayload);
    
    return {
      success: true,
      token,
      user: mockUser.user
    };
  }
  
  static verifyToken(token: string): AuthToken | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }
  
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as AuthToken;
      if (!decoded || !decoded.exp) return true;
      return decoded.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }
  
  // Decode token without verification (for getting user info)
  static decodeToken(token: string): AuthToken | null {
    try {
      const decoded = jwt.decode(token) as AuthToken;
      return decoded;
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
      const response = await fetch(`${this.API_BASE_URL}?token=${token}`);
      
      if (!response.ok) {
        return { success: false, error: `HTTP error! status: ${response.status}` };
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // Direct array of malls
        const malls = data.map(item => item.mall_data || item);
        return { success: true, data: malls };
      } else if (data.mall_data) {
        // Single mall object
        return { success: true, data: [data.mall_data] };
      } else {
        return { success: false, error: 'Invalid response format' };
      }
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