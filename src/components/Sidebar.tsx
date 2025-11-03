import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Store,
  MapPin,
  UserCheck,
  Megaphone
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ onLogout, onViewChange }: SidebarProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '#',
      icon: Home,
      current: currentView === 'dashboard',
      action: () => {
        setCurrentView('dashboard');
        onViewChange?.('dashboard');
      }
    },
    {
      name: 'Campaign Management',
      href: '#',
      icon: Megaphone,
      current: currentView === 'campaigns',
      action: () => {
        setCurrentView('campaigns');
        onViewChange?.('campaigns');
      },
      role: 'shop_admin'
    },
    {
      name: 'Malls',
      href: '#',
      icon: Building2,
      current: false,
      role: 'super_admin'
    },
    {
      name: 'Shops',
      href: '#',
      icon: Store,
      current: false,
      role: 'super_admin'
    },
    {
      name: 'Analytics',
      href: '#',
      icon: BarChart3,
      current: false,
    },
    {
      name: 'Users',
      href: '#',
      icon: Users,
      current: false,
      role: 'super_admin'
    },
    {
      name: 'Settings',
      href: '#',
      icon: Settings,
      current: false,
      role: 'super_admin'
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigationItems.filter(item => {
    // If item has specific role requirement
    if (item.role && item.role !== user?.role) return false;
    
    if (user?.role === 'super_admin') {
      // Super admin sees all items except those with specific role restrictions
      return !item.role || item.role === 'super_admin';
    }
    if (user?.role === 'mall_admin') {
      // Mall admins see Dashboard, Campaign Management (if added), and Analytics
      return ['Dashboard', 'Analytics'].includes(item.name);
    }
    if (user?.role === 'shop_admin') {
      // Shop admins see Dashboard, Campaign Management, and Analytics
      return ['Dashboard', 'Campaign Management', 'Analytics'].includes(item.name);
    }
    return false;
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border-subtle">
        <div className="bg-primary-100 p-2 rounded-lg">
          <Building2 className="w-6 h-6 text-primary-700" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">
            Mall Management
          </h1>
          <p className="text-xs text-text-secondary">
            System Dashboard
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="bg-page-bg p-2 rounded-lg">
            <UserCheck className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.full_name}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {user?.role?.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
        {user?.mall_id && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
            <MapPin className="w-3 h-3" />
            <span>Mall ID: {user.mall_id}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-border-subtle">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-error hover:bg-error/5 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-surface-bg border-r border-border-subtle">
        <SidebarContent />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-surface-bg p-2 rounded-md shadow-md border border-border-subtle"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-text-primary" />
          ) : (
            <Menu className="w-6 h-6 text-text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-surface-bg border-r border-border-subtle z-50">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
