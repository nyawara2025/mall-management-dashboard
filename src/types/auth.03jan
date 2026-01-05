// User and Authentication Types
export interface User {
  id: number;
  username: string;
  role: 'super_admin' | 'mall_admin' | 'shop_admin';
  full_name: string;
  mall_id?: number | null;
  shop_id?: number | null;
  shop_name?: string; // Shop name for shop admins
  mall_name?: string; // Mall name for context
  mall_access?: number[]; // Array of mall IDs the user can access
  shop_access?: number[]; // Array of shop IDs the user can access
  active: boolean;
}

export interface AuthToken {
  username: string;
  role: 'super_admin' | 'mall_admin' | 'shop_admin';
  userId: number;
  mall_id?: number | null;
  shop_id?: number | null;
  exp: number;
}

// Mall and Shop Types
export interface Shop {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Mall {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  radius_meters: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  shops?: Shop[];
}

export interface MallData {
  mall_data: Mall;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Theme Configuration for Multi-Mall Support
export interface MallTheme {
  name: string;
  primaryColor: string;
  primaryLight: string;
  primaryDark: string;
  logo?: string;
}

export const MALL_THEMES: Record<string, MallTheme> = {
  default: {
    name: 'Default Mall',
    primaryColor: '#1890FF',
    primaryLight: '#E7F5FF',
    primaryDark: '#096DD9',
  },
  chinaSquare: {
    name: 'China Square Mall',
    primaryColor: '#722ED1',
    primaryLight: '#F9F0FF',
    primaryDark: '#531DAB',
  },
  langataMall: {
    name: 'Langata Mall',
    primaryColor: '#52C41A',
    primaryLight: '#F6FFED',
    primaryDark: '#389E0D',
  },
  nhcMall: {
    name: 'NHC Mall',
    primaryColor: '#FA8C16',
    primaryLight: '#FFF7E6',
    primaryDark: '#D46B08',
  }
};

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
