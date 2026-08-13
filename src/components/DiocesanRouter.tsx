import React, { useState, useEffect } from 'react';
import { DaughterChurchDashboard } from './DaughterChurchDashboard';
import { ParishERPDashboard } from './ParishERPDashboard';
import { ArchdeaconryDashboard } from './ArchdeaconryDashboard';
import { BishopDiocesanRadar } from './BishopDiocesanRadar';
import { DiocesanAuthNode } from './DiocesanAuthNode';
import { DiocesanIctAdminDashboard } from './DiocesanIctAdminDashboard';


interface DiocesanUserSession {
  user_id: number;
  name: string;
  role: string;
  tier_access: 'DAUGHTER_CHURCH' | 'PARISH' | 'ARCHDEACONRY' | 'DIOCESE';
  assigned_id: number;
}

export const DiocesanRouter: React.FC<{ user: any; onLogout: () => void }> = ({ onLogout }) => {
  const [session, setSession] = useState<DiocesanUserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the tier profile cached by your new n8n authentication webhook
    const cachedTier = localStorage.getItem('ack_erp_tier_access') as any;
    const cachedId = localStorage.getItem('ack_erp_assigned_id');
    const cachedName = localStorage.getItem('ack_erp_user_name');
    const cachedRole = localStorage.getItem('ack_erp_user_role');

    // 🧠 INJECT THIS LINE: Extract your user primary account record key index dynamically
    const cachedUserId = localStorage.getItem('ack_erp_user_id');

    if (cachedTier && cachedId && cachedUserId) {
      setSession({
        user_id: parseInt(cachedUserId, 10),
        name: cachedName || 'Church Official',
        role: cachedRole || 'MEMBER',
        tier_access: cachedTier,
        assigned_id: parseInt(cachedId, 10)
      });
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6 text-center text-xs font-bold">Initializing Diocesan Channel Access...</div>;

  // 🔒 If not logged into the ERP, display the new hierarchical login workflow panel
  if (!session) {
    return <DiocesanAuthNode onAuthSuccess={() => window.location.reload()} />;
  }

  // 🎛️ Render the custom workspace layout based on their assigned structural tier level
  switch (session.tier_access.toUpperCase()) {
    case 'DAUGHTER_CHURCH':
      return (
        <DaughterChurchDashboard 
          session={session} 
          onLogout={() => {
            localStorage.clear(); // 🚀 Wipes out all old sessions instantly
            onLogout();
            window.location.href = 'https://acknairobidiocese.pages.dev';
          }} 
        />
      );
    case 'PARISH':
      return (
        <ParishERPDashboard 
          session={session} 
          onLogout={() => {
            localStorage.clear();
            onLogout();
            window.location.href = 'https://acknairobidiocese.pages.dev';
          }} 
        />
      );
    case 'ARCHDEACONRY':
      return (
        <ArchdeaconryDashboard 
          session={session} 
          onLogout={() => {
            localStorage.clear();
            onLogout();
            window.location.href = 'https://acknairobidiocese.pages.dev';
          }} 
        />
      );
    case 'DIOCESE':

      // 🛡️ ROLE COMPLIANCE GUARD: Divert the Central IT System Administrator to their Data Hub Portal
      if (session.role.toUpperCase().includes('DIOCESAN_OFFICIAL')) {
        return <DiocesanIctAdminDashboard session={session} />;
      }

      // 👑 DEFAULT PATHWAY: Route the Bishop to the Read-Only Strategic Monitoring View Canvas

      return (
        <BishopDiocesanRadar 
          session={session} 
          isBishop={session.role === 'BISHOP'}
          onLogout={() => {
            localStorage.clear();
            onLogout();
            window.location.href = 'https://acknairobidiocese.pages.dev';
          }} 
        />
      );
    default:
      return <div className="p-6 text-red-600 font-bold">Unauthorized System Access Profile Level Exception.</div>;
  }

};
