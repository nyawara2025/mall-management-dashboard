import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Loading...
          </h2>
          <p className="text-text-secondary">
            Checking authentication status
          </p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Show protected content if authenticated
  return <>{children}</>;
}