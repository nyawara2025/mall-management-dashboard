import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordChange from '../components/PasswordChange';
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Key,
  LogOut,
  Building2,
  MapPin
} from 'lucide-react';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('password');

  // Check if user can view profile info
  const canViewProfile = user?.role === 'shop_admin' || user?.role === 'super_admin' || user?.role === 'mall_admin';
  
  // Redirect to password tab if profile is not accessible
  const handleTabChange = (tab: 'profile' | 'password' | 'security') => {
    if (tab === 'profile' && !canViewProfile) {
      setActiveTab('password');
    } else {
      setActiveTab(tab);
    }
  };

  // Parse auth token to get additional context
  const getAuthContext = (): { userId: number; shopId: number; mallId: number } | null => {
    try {
      const authToken = localStorage.getItem('geofence_auth_token');
      if (!authToken) return null;

      const parts = authToken.split('-');
      if (parts.length >= 6) {
        return {
          userId: parseInt(parts[0], 10),
          mallId: parseInt(parts[3], 10),
          shopId: parseInt(parts[4], 10)
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const authContext = getAuthContext();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            </div>
            
            {/* User info in header */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Settings Menu</h2>
              </div>
              <div className="p-2">
                <button
                  onClick={() => handleTabChange('password')}
                  className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === 'password'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Key className="w-5 h-5" />
                  <span>Change Password</span>
                </button>
                {canViewProfile && (
                  <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                )}
                <button
                  onClick={() => handleTabChange('security')}
                  className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-3 transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </button>
              </div>
              
              {/* Logout section */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 rounded-md flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
                      <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                    </div>
                  </div>
                  <PasswordChange />
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                    <p className="text-sm text-gray-600">View your account details</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Current user info card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-medium text-blue-800 mb-4">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Username</label>
                        <p className="mt-1 text-gray-900 font-medium">{user?.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Full Name</label>
                        <p className="mt-1 text-gray-900">{user?.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Role</label>
                        <p className="mt-1 text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">User ID</label>
                        <p className="mt-1 text-gray-900">{user?.id || authContext?.userId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location info card */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-medium text-green-800 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Location Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Mall ID</label>
                        <p className="mt-1 text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          {user?.mall_id || authContext?.mallId || 'Not assigned'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Shop ID</label>
                        <p className="mt-1 text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-green-600" />
                          {user?.shop_id || authContext?.shopId || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Access info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="font-medium text-purple-800 mb-4">Access Permissions</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-700">
                          Role: <strong>{user?.role?.replace('_', ' ')}</strong>
                        </span>
                      </div>
                      {user?.mall_access && user.mall_access.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700">
                            Mall Access: <strong>{user.mall_access.join(', ')}</strong>
                          </span>
                        </div>
                      )}
                      {user?.shop_access && user.shop_access.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700">
                            Shop Access: <strong>{user.shop_access.join(', ')}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                    <p className="text-sm text-gray-600">Manage your account security</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Account status */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">Account Status: Active</h3>
                        <p className="text-sm text-green-600">Your account is secure and active.</p>
                      </div>
                    </div>
                  </div>

                  {/* Session info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800">Session Security</h3>
                        <p className="text-sm text-blue-600">
                          Your session is managed securely with token-based authentication. 
                          Tokens are stored locally and automatically expire after 24 hours of inactivity.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Password security */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Key className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-yellow-800">Password Security</h3>
                        <p className="text-sm text-yellow-600">
                          Your password is hashed using bcrypt-style encryption. 
                          Always use a strong password with at least 8 characters, 
                          including uppercase, lowercase, numbers, and special characters.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-800 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('password')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Change Password
                      </button>
                      <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
