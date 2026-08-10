import React, { createContext, useContext } from 'react';

// 📋 Strict Type Definition matching your ack_system_audit_trail table parameters
interface AuditPayload {
  action_type: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'REJECTION' | 'OVERRIDE';
  target_table: string;
  target_row_id: string | null;
  old_data_snapshot: Record<string, any> | null;
  new_data_snapshot: Record<string, any> | null;
  mandatory_audit_reason: string;
}

interface AuditContextType {
  auditAction: (payload: AuditPayload) => Promise<boolean>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ currentUserId: number; children: React.ReactNode }> = ({ currentUserId, children }) => {
  
  const auditAction = async (payload: AuditPayload): Promise<boolean> => {
    try {
      // Direct, unified pipeline handshake to your central n8n route
      const response = await fetch('https://n8n.tenear.com/webhook/ack-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor_user_id: currentUserId,
          ...payload,
          // Middleware will supplement IP address server-side to prevent client-side spoofing
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('CRITICAL: Audit trail logging pipeline failed:', error);
      // In production, you can fallback to caching failed audits in IndexedDB here
      return false;
    }
  };

  return (
    <AuditContext.Provider value={{ auditAction }}>
      {children}
    </AuditContext.Provider>
  );
};

// Custom hook to be cleanly imported by ParishERPDashboard, ArchDeaconryDashboard, etc.
export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used within an AuditProvider');
  return context;
};
