import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MallApiService } from '../services/auth';
import { Mall } from '../types/auth';
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  Settings,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { MallCard } from './MallCard';
import { Sidebar } from './Sidebar';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [malls, setMalls] = useState<Mall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMalls = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const malls = await MallApiService.fetchMalls(localStorage.getItem('auth_token') || '');
      setMalls(malls);
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMalls();
    }
  }, [user]);

  const handleRefresh = () => {
    fetchMalls();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-5 h-5" />;
      case 'mall_admin':
        return <Building2 className="w-5 h-5" />;
      case 'shop_admin':
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <UserCheck className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'text-primary-500';
      case 'mall_admin':
        return 'text-success';
      case 'shop_admin':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-page-bg flex">
      {/* Sidebar */}
      <Sidebar onLogout={logout} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-surface-bg border-b border-border-subtle">
          <div className="container py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Dashboard
                </h1>
                <p className="text-text-secondary mt-1">
                  Welcome back, {user.full_name}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                {/* User Info */}
                <div className="flex items-center gap-3 bg-page-bg px-4 py-2 rounded-md">
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">
                      {user.full_name}
                    </p>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span className={`text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container py-8">
          {/* Role-based greeting */}
          <div className="mb-8">
            <div className="bg-surface-bg border border-border-subtle rounded-md p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  {getRoleIcon(user.role)}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-text-primary mb-2">
                    {user.role === 'super_admin' && 'Full System Access'}
                    {user.role === 'mall_admin' && 'Mall Management'}
                    {user.role === 'shop_admin' && 'Shop Management'}
                  </h2>
                  <p className="text-text-secondary">
                    {user.role === 'super_admin' && 'You have access to all malls and shops in the system. You can view, manage, and configure all locations.'}
                    {user.role === 'mall_admin' && `You are the administrator for your assigned mall. You can manage all shops within your location.`}
                    {user.role === 'shop_admin' && 'You are the administrator for your assigned shop. You can manage your shop\'s operations and data.'}
                  </p>
                  {user.mall_id && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin className="w-4 h-4" />
                      Assigned Mall ID: {user.mall_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Malls Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                {user.role === 'super_admin' ? 'All Malls' : 'Your Mall'}
                <span className="text-text-secondary font-normal ml-2">
                  ({malls.length} {malls.length === 1 ? 'location' : 'locations'})
                </span>
              </h2>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-text-secondary">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading malls...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-md p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-error mb-1">Error Loading Malls</h3>
                    <p className="text-error text-sm">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-3 text-error underline hover:no-underline text-sm"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Malls Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {malls.map((mall) => (
                  <MallCard
                    key={mall.id}
                    mall={mall}
                    userRole={user.role}
                    userMallId={user.mall_id}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && malls.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No malls found
                </h3>
                <p className="text-text-secondary">
                  {user.role === 'super_admin' 
                    ? 'There are no malls in the system yet.'
                    : 'Your account is not assigned to any mall.'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
