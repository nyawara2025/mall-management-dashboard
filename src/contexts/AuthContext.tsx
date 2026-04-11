import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { login as loginWithN8N } from '../services/auth';

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
      return { ...state, isLoading: true };
    
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
        isLoading: false,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; 
  const WARNING_TIME = 5 * 60 * 1000; 

  const logout = useCallback(() => {
    localStorage.removeItem('geofence_auth_token');
    localStorage.removeItem('geofence_user_data');
    localStorage.removeItem('geofence_user_data_timestamp');
    
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    dispatch({ type: 'LOGOUT' });
    console.log('🔄 [AuthContext] Session ended, redirecting...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }, []);

  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    sessionTimeoutRef.current = setTimeout(() => {
      logout();
      console.log('Session expired');
    }, SESSION_TIMEOUT);

    warningTimeoutRef.current = setTimeout(() => {
      console.log('Session expiring in 5 minutes');
    }, SESSION_TIMEOUT - WARNING_TIME);
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('geofence_auth_token');
      const userStr = localStorage.getItem('geofence_user_data');
      const timestamp = localStorage.getItem('geofence_user_data_timestamp');

      if (token && userStr) {
        try {
          const now = Date.now();
          const sessionAge = timestamp ? now - parseInt(timestamp) : SESSION_TIMEOUT + 1;
          
          if (sessionAge < SESSION_TIMEOUT) {
            const user = JSON.parse(userStr);
            dispatch({
              type: 'RESTORE_SESSION',
              payload: { user, token }
            });
            resetSessionTimeout();
          }
        } catch (error) {
          console.error('Session restoration failed', error);
        }
      }
    };
    initializeAuth();
  }, [resetSessionTimeout]);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const result = await loginWithN8N(username, password);
      
      if (result.success && result.token && result.user) {
        const rawUser = result.user as any;
        
        // Improved normalization to explicitly handle 'political', 'medical', and 'retail'
        const detectedCategory = 
          rawUser.category || 
          rawUser.business_category || 
          rawUser.user?.category || 
          rawUser.user?.business_category || 
          'retail';

        // Add logic to catch the department
        const detectedDepartment = 
          rawUser.department || 
          rawUser.dept || 
          'Admin'; // Default to Admin if not specified


        const normalizedUser: User = {
          ...rawUser,
          category: detectedCategory,
          // Add this line to ensure the department is actually saved!
          department: detectedDepartment
        };

        // Category-agnostic debug log
        console.log(`🚀 TeNEAR ${detectedCategory.toUpperCase()} Logic Initialized:`, {
          received_raw: rawUser.business_category || rawUser.category,
          mapped_to: normalizedUser.category,
          department: normalizedUser.department, // New debug point
          shop_id: normalizedUser.shop_id
        });

        localStorage.setItem('geofence_auth_token', result.token);
        localStorage.setItem('geofence_user_data', JSON.stringify(normalizedUser));
        localStorage.setItem('geofence_user_data_timestamp', Date.now().toString());

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: normalizedUser, token: result.token }
        });

        resetSessionTimeout();
        return { success: true };
      }
      
      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, error: result.error || 'Invalid credentials' };
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      return { success: false, error: 'Network error occurred' };
    }
  }, [resetSessionTimeout]);

  const value = {
    ...state,
    login,
    logout,
    logoutWithConfirmation: () => {
      if (window.confirm('Are you sure you want to log out?')) logout();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
