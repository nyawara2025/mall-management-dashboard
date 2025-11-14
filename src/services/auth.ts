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

// Initialize users database with ONLY backend users from database screenshot
// All users use 'demo123' as password for consistency

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
REAL_USERS.set('faith', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 5, 
    username: 'faith', 
    full_name: 'Faith Wakenya', 
    role: 'mall_admin', 
    mall_id: 3,
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
    id: 10, 
    username: 'ngina', 
    full_name: 'Ngina Pia WaKenya', 
    role: 'mall_admin', 
    mall_id: 7,
    mall_name: 'NHC Mall',
    shop_id: null, 
    mall_access: [7],
    shop_access: [9, 10, 11],
    active: true 
  } 
})

REAL_USERS.set('jane', { 
  password_hash: hashPassword('demo123'), 
  user: { 
    id: 11, 
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

// Shop Admins - Using exact mappings provided by user
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

// Authentication service
export class AuthService {
  /**
   * Authenticate user with username and password
   */
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const userRecord = REAL_USERS.get(username.toLowerCase())
      if (!userRecord) {
        return null
      }

      // Check password (in demo, we just compare with hash)
      const hashedPassword = hashPassword(password)
      if (userRecord.password_hash !== hashedPassword) {
        return null
      }

      // Return user object without password
      return {
        ...userRecord.user,
        password: undefined // Remove password from response
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  /**
   * Get user by username
   */
  static getUser(username: string): User | null {
    const userRecord = REAL_USERS.get(username.toLowerCase())
    if (!userRecord) {
      return null
    }

    return {
      ...userRecord.user,
      password: undefined
    }
  }

  /**
   * Generate authentication token
   */
  static generateToken(user: User): string {
    const timestamp = Date.now()
    const mallId = user.mall_id || ''
    const shopId = user.shop_id || ''
    
    // Generate token in format: ID-USERNAME-ROLE-MALL_ID-SHOP_ID-TIMESTAMP
    const token = `${user.id}-${user.username}-${user.role}-${mallId}-${shopId}-${timestamp}`
    return btoa(token) // Base64 encode for security
  }

  /**
   * Parse authentication token
   */
  static parseToken(token: string): User | null {
    try {
      const decoded = atob(token) // Base64 decode
      const [id, username, role, mallId, shopId, timestamp] = decoded.split('-')
      
      // Find user in our database
      const user = this.getUser(username)
      if (!user || user.id !== parseInt(id)) {
        return null
      }

      return {
        ...user,
        mall_id: mallId ? parseInt(mallId) : null,
        shop_id: shopId ? parseInt(shopId) : null,
        // Add any other token-derived data if needed
      }
    } catch (error) {
      console.error('Token parsing error:', error)
      return null
    }
  }

  /**
   * Validate token and return user
   */
  static validateToken(token: string): User | null {
    const user = this.parseToken(token)
    if (!user) {
      return null
    }

    // Additional validation if needed
    if (!user.active) {
      return null
    }

    return user
  }

  /**
   * Check if user has access to specific mall
   */
  static hasMallAccess(user: User, mallId: number): boolean {
    if (user.role === 'super_admin') {
      return true
    }
    
    if (user.role === 'mall_admin') {
      return user.mall_id === mallId
    }
    
    if (user.role === 'shop_admin') {
      return user.mall_id === mallId && user.mall_access?.includes(mallId)
    }
    
    return false
  }

  /**
   * Check if user has access to specific shop
   */
  static hasShopAccess(user: User, shopId: number): boolean {
    if (user.role === 'super_admin') {
      return true
    }
    
    if (user.role === 'shop_admin') {
      return user.shop_id === shopId
    }
    
    return false
  }
}

export default AuthService
