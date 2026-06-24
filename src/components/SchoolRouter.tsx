import React from 'react';
import { PublicSchoolHub } from './PublicSchoolHub';

// 🏢 Import the three upcoming new dedicated components
import { DirectorDashboard } from './DirectorDashboard';
import { PrincipalDashboard } from './PrincipalDashboard';
import { SecurityDashboard } from './SecurityDashboard';

interface SchoolRouterProps {
  shopId: number;
  user: any;
  onLogout: () => void;
}

export const SchoolRouter = ({ shopId, user, onLogout }: SchoolRouterProps) => {
  const role = user?.educational_role?.toLowerCase().trim() || 'parent';

  // 1. High-Level Executive Dashboard
  if (role === 'director') {
    return (
      <DirectorDashboard 
        shopId={shopId} 
        user={user} 
        onLogout={onLogout} 
      />
    );
  }

  // 2. Academic Operations & Staff Management Dashboard
  if (role === 'principal') {
    return (
      <PrincipalDashboard 
        shopId={shopId} 
        user={user} 
        onLogout={onLogout} 
      />
    );
  }

  // 3. Asset Management, Gate Logs & Fleet Surveillance Dashboard
  if (role === 'security') {
    return (
      <SecurityDashboard 
        shopId={shopId} 
        user={user} 
        onLogout={onLogout} 
      />
    );
  }

  // 4. Fallback directly to the multi-panel Parent / General Stakeholder Hub
  return (
    <PublicSchoolHub 
      shopId={shopId} 
      user={user} 
    />
  );
};
