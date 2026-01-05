import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function PasswordChange() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  // Validate password strength
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
    }
    return { valid: true, message: 'Password is strong' };
  };

  // Parse the auth token to get shop context
  const getAuthContext = (): { userId: number; username: string; role: string; shopId: number; mallId: number } | null => {
    try {
      const authToken = localStorage.getItem('geofence_auth_token');
      if (!authToken) return null;

      // Parse the dash-separated token format: userId-username-role-mallId-shopId-timestamp
      const parts = authToken.split('-');
      if (parts.length >= 6) {
        return {
          userId: parseInt(parts[0], 10),
          username: parts[1],
          role: parts[2],
          mallId: parseInt(parts[3], 10),
          shopId: parseInt(parts[4], 10)
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing auth token:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Get authenticated user's context
    const authContext = getAuthContext();
    if (!authContext) {
      setError('Authentication context not found. Please log in again.');
      return;
    }

    // Security Check: Ensure the user can only change their own password
    if (user && authContext.username !== user.username) {
      setError('Security error: You can only change your own password.');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('geofence_auth_token') || ''}`,
          'X-User-Id': authContext.userId.toString(),
          'X-Shop-Id': authContext.shopId.toString(),
          'X-Username': authContext.username
        },
        body: JSON.stringify({
          user_id: authContext.userId,
          username: authContext.username,
          shop_id: authContext.shopId,
          mall_id: authContext.mallId,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Password changed successfully! You will be logged out for security.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Logout after 2 seconds for security
        setTimeout(() => {
          localStorage.removeItem('geofence_auth_token');
          localStorage.removeItem('geofence_user_data');
          localStorage.removeItem('geofence_user_data_timestamp');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(result.error || 'Failed to change password. Please check your current password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = newPassword.length > 0 ? validatePassword(newPassword) : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔐</span>
        <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
      </div>
      
      {/* User context display */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Logged in as:</span> {user?.username}
          <br />
          <span className="font-medium">Shop ID:</span> {user?.shop_id || 'Not assigned'}
          <br />
          <span className="font-medium">Role:</span> {user?.role?.replace('_', ' ')}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Current Password */}
        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
            >
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
            >
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>
          {passwordStrength && (
            <div className={`mt-2 text-sm ${passwordStrength.valid ? 'text-green-600' : 'text-red-600'}`}>
              {passwordStrength.message}
            </div>
          )}
          
          {/* Password requirements */}
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="space-y-1">
              <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</li>
              <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>• One uppercase letter</li>
              <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>• One lowercase letter</li>
              <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>• One number</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : ''}>• One special character</li>
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              confirmPassword.length > 0 && newPassword !== confirmPassword 
                ? 'border-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Confirm new password"
            required
          />
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <div className="mt-1 text-sm text-red-600">Passwords do not match</div>
          )}
          {confirmPassword.length > 0 && newPassword === confirmPassword && (
            <div className="mt-1 text-sm text-green-600">Passwords match</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-700">
          🔒 <strong>Security Notice:</strong> After changing your password, you will be automatically logged out and must log in with your new password. This ensures your session is secured with the new credentials.
        </p>
      </div>
    </div>
  );
}

export default PasswordChange;
