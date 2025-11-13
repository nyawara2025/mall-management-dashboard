import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { AuthService } from '../services/auth';

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('geofence_auth_token');
      const userStr = localStorage.getItem('geofence_user_data');

      if (token && userStr) {
        try {
          // Verify token is still valid
          const decoded = await AuthService.verifyToken(token);
          if (decoded) {
            const user = JSON.parse(userStr);
            dispatch({
              type: 'RESTORE_SESSION',
              payload: { user, token }
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('geofence_auth_token');
            localStorage.removeItem('geofence_user_data');
          }
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('geofence_auth_token');
          localStorage.removeItem('geofence_user_data');
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await AuthService.login(username, password);

      if (result.success && result.token && result.user) {
        // Store in localStorage
        localStorage.setItem('geofence_auth_token', result.token);
        localStorage.setItem('geofence_user_data', JSON.stringify(result.user));

        // Update state
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.user,
            token: result.token
          }
        });

        return { success: true };
      } else {
        dispatch({ type: 'AUTH_ERROR' });
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, error: 'An error occurred during login' };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('geofence_auth_token');
    localStorage.removeItem('geofence_user_data');

    // Update state
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    login,
    logout,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to check if user has required role
export function hasRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false;

  const roleHierarchy = {
    'shop_admin': 1,
    'mall_admin': 2,
    'super_admin': 3
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

// Helper function to check if user can access specific mall
export function canAccessMall(user: User | null, mallId: number): boolean {
  if (!user) return false;

  // Super admin can access all malls
  if (user.role === 'super_admin') {
    return true;
  }

  // Mall admin can only access their assigned mall
  if (user.role === 'mall_admin') {
    return user.mall_id === mallId;
  }

  // Shop admin can access malls where their shop is located
  if (user.role === 'shop_admin') {
    // This would need additional API call to check shop's mall
    // For now, return false
    return false;
  }

  return false;
}
