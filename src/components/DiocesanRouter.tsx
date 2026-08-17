import React, { useState, useEffect } from 'react';
import { DaughterChurchDashboard } from './DaughterChurchDashboard';
import { ParishERPDashboard } from './ParishERPDashboard';
import { ArchdeaconDashboard } from './ArchdeaconDashboard';
import { BishopDiocesanRadar } from './BishopDiocesanRadar';
import { DiocesanAuthNode } from './DiocesanAuthNode';
import { DiocesanIctAdminDashboard } from './DiocesanIctAdminDashboard';
import { ParishIctAdminDashboard } from './ParishIctAdminDashboard';
import { ParishTreasurerPortal } from './ParishTreasurerPortal';
import { ParishPccDashboard } from './ParishPccDashboard';
import { MinistryLeaderDashboard } from './MinistryLeaderDashboard';
import { DiocesanDepartmentDashboard } from './DiocesanDepartmentDashboard';
import { ArchdeaconryFinanceAuditor } from './ArchdeaconryFinanceAuditor';
import { ArchdeaconryIctDashboard } from './ArchdeaconryIctDashboard';
import { ArchdeaconryMeDashboard } from './ArchdeaconryMeDashboard';

interface DiocesanUserSession {
  user_id: number;
  name: string;
  role: string;
  tier_access: 'DAUGHTER_CHURCH' | 'PARISH' | 'ARCHDEACONRY' | 'DIOCESE';
  assigned_id: number;
  organization_name?: string;
  reporting_period?: string;
}

// ⏱️ Dynamic ISO-8601 Week Code Generator (No Hardcoding)
export const getActiveReportingPeriodCode = (): string => {
  const currentTarget = new Date();
  const dateNumber = currentTarget.getDate();
  currentTarget.setDate(dateNumber + 4 - (currentTarget.getDay() || 7));
  const yearStart = new Date(currentTarget.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((currentTarget.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${currentTarget.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

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

    // 🌟 ADDED LINE 1: Pull the institution/church name profile saved during auth
    const cachedOrgName = localStorage.getItem('ack_erp_organization_name');

    if (cachedTier && cachedId && cachedUserId) {
      setSession({
        user_id: parseInt(cachedUserId, 10),
        name: cachedName || 'Church Official',
        role: cachedRole || 'MEMBER',
        tier_access: cachedTier,
        assigned_id: parseInt(cachedId, 10),
        // 🌟 ADDED LINE 2: Inject the property cleanly into your component session state array
        organization_name: cachedOrgName || undefined
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

      // 🛡️ ROLE COMPLIANCE GUARD: Flexible string inclusion check matching the Diocese logic
      if (session.role.toUpperCase().includes('ICT_SYS_ADMIN')) {
        return (
          <ParishIctAdminDashboard 
            session={{
              ...session,
              organization_name: session.organization_name || "ACK Parish Hub Workspace"
            }} 
            onLogout={() => {
              localStorage.clear(); // 🚀 Wipes out all old sessions instantly
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

      // 💰 TREASURER PORTAL GUARD: Isolate the specialized Financial Return Workspace
      if (session.role.toUpperCase().includes('TREASURER') || session.role.toUpperCase().includes('FINANCE')) {
        return (
          <ParishTreasurerPortal 
            session={{
              ...session,
              // Filled Gap: Ensures organization_name is defined for the compiler, defaulting smoothly
              organization_name: session.organization_name || "ACK St. Barnabas, Otiende Parish"
            }}
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}   
          />
        );
      }

      if (session.role.toUpperCase().includes('MINISTRY') || session.role.toUpperCase().includes('LEADER')) {
        return (
          <MinistryLeaderDashboard 
            session={session} 
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

      // ⚖️ GOVERNANCE COUNCIL GUARD: Isolate Read-Only Strategic Reviews
      if (session.role.toUpperCase().includes('PCC_MEMBER') || session.role.toUpperCase().includes('COUNCIL')) {
        return (
          <ParishPccDashboard 
            session={session} 
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

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

      // Programmatically derive the compliance period for the active multi-tenant layer
      const activePeriodCode = getActiveReportingPeriodCode();

      // Unpack the correct target session object with dynamic fallback values guaranteed
      const archdeaconrySession = {
        ...session,
        organization_name: session.organization_name || localStorage.getItem('ack_erp_organization_name') || "ACK Regional Archdeaconry Office",

        reporting_period: session.reporting_period || activePeriodCode

      };
      
      // 🛡️ ROLE GUARD 1: Route the Archdeacon to the executive dashboard
      if (session.role.toUpperCase() === 'ARCHDEACON') {
        return (
          <ArchdeaconDashboard // 👈 CHANGED FROM ArchdeaconryDashboard
            session={{
              ...archdeaconrySession,
              // 🌟 DOUBLE INSURANCE: Enforce strict string casting for the child prop interface layout contract
              reporting_period: archdeaconrySession.reporting_period || activePeriodCode
            }}
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev'; // 👈 Screen Reset Clear
            }}
          />
        );
      }
     
      // 🛡️ ROLE GUARD 2: M&E OFFICER / SECRETARIAT (Strategic Pillars Target Monitor)
      if (session.role.toUpperCase().includes('ME_OFFICER') || session.role.toUpperCase().includes('STRATEGY') || session.role.toUpperCase().includes('SECRETARY')) {
        return (
          <ArchdeaconryMeDashboard
            session={archdeaconrySession}
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

      // 🛡️ ROLE GUARD 3: REGIONAL FINANCIAL AUDITOR (15% Remittance Desk)
      if (session.role.toUpperCase().includes('FINANCE') || session.role.toUpperCase().includes('AUDITOR') || session.role.toUpperCase().includes('TREASURER')) {
        return (
          <ArchdeaconryFinanceAuditor
            session={archdeaconrySession}
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

      // 🛡️ ROLE GUARD 4: REGIONAL ICT ADMIN (Technical Node Control Console)
      if (session.role.toUpperCase().includes('ADMIN') || session.role.toUpperCase().includes('ICT')) {
        return (
          <ArchdeaconryIctDashboard
            session={archdeaconrySession}
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

      // Default safe fallback if an archdeaconry user has a completely unmapped role string
      return (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 max-w-md mx-auto mt-12 shadow-sm">
          <h2 className="text-sm font-black text-rose-600 uppercase">Role Isolation Exception</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Your profile points to Tier 3, but your assigned role has no active workspace view.</p>
          <button 
            onClick={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }} 
            className="mt-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl"
          >
            Sign Out Safely
          </button>
        </div>
      );

    case 'DIOCESE':

      // 🛡️ ROLE COMPLIANCE GUARD: Divert the Central IT System Administrator to their Data Hub Portal
      if (session.role.toUpperCase().includes('ICT_SYS_ADMIN')) {
        return (
          <DiocesanIctAdminDashboard 
            session={{
              ...session,
              organization_name: session.organization_name || localStorage.getItem('ack_erp_organization_name') || "ACK Central Registry Hub"
            }} 
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }}
          />
        );
      }

      // 👑 EXECUTIVE OFFICE GATEWAY: Route the Bishop to the Read-Only Strategic Monitoring Radar Canvas
      if (session.role.toUpperCase() === 'BISHOP') {
        return (
          <BishopDiocesanRadar 
            session={session} 
            isBishop={true}
            onLogout={() => {
              localStorage.clear();
              onLogout();
              window.location.href = 'https://acknairobidiocese.pages.dev';
            }} 
          />
        );
      }

      // 🏢 CENTRAL MANAGEMENT OFFICE GATEWAY: Route all other Diocese Officials (Finance, Secretaries, Dept Heads)
      return (
        <DiocesanDepartmentDashboard 
          session={{
            ...session,
            organization_name: session.organization_name || localStorage.getItem('ack_erp_organization_name') || "ACK Diocese of Nairobi Central Office"
          }} 
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
