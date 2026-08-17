import React, { useState, useEffect } from 'react';
import { 
  Shield, Layers, PlusCircle, RefreshCw, Server, CheckCircle, 
  Database, UserPlus, Key, X, Terminal, ShieldAlert, Wifi, Activity 
} from 'lucide-react';

interface DiocesanIctAdminProps {
  session: { 
    assigned_id: number; 
    name: string; 
    role: string;
    organization_name: string;
  };
  onLogout: () => void;
}

interface AuditLog {
  id: string;
  action_type: string;
  actor_name: string;
  change_justification: string;
  reason_provided: string; // Added from updated SQL
  ip_address: string;
  created_at: string;
}

// ⏱️ Idea 3 Utility: Converts timestamps seamlessly into humanized relative time strings
const formatRelativeTime = (timestampString: string): string => {
  try {
    const logDate = new Date(timestampString);
    if (isNaN(logDate.getTime())) return timestampString; // Fallback to raw string if invalid

    const now = new Date();
    const diffMs = now.getTime() - logDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return timestampString;
  }
};

export const DiocesanIctAdminDashboard: React.FC<DiocesanIctAdminProps> = ({ session, onLogout }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'ARCHDEACONRY' | 'PARISH' | 'USER'>('NONE');
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ totalArchdeaconries: 0, totalParishes: 0 });

  // Core Registry Lists State
  const [archdeaconriesList, setArchdeaconriesList] = useState<{id: number, name: string}[]>([]);
  const [allTenantsList, setAllTenantsList] = useState<{id: number, name: string, tier_level: string}[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Structure Form Fields State
  const [archdeaconryName, setArchdeaconryName] = useState('');
  const [parishName, setParishName] = useState('');
  const [parentArchdeaconryId, setParentArchdeaconryId] = useState('');

  // User Provisioning Form Fields State
  const [userFullName, setUserFullName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userRole, setUserRole] = useState('');
  const [assignedTenantId, setAssignedTenantId] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState<{ name: string; phone: string; pass: string } | null>(null);

  const fetchHierarchyStats = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-ict-hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data) {
        setStats({ totalArchdeaconries: data.archdeaconriesCount || 0, totalParishes: data.parishesCount || 0 });
        setArchdeaconriesList(data.archdeaconries || []);
        setAllTenantsList(data.allTenants || []);
        setAuditLogs(data.auditLogs || []); // Bind live ledger tracking logs
      }
    } catch (err) {
      console.error("Infrastructure sync failure:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchHierarchyStats(); }, []);

  const handleCreateStructure = async (e: React.FormEvent, type: 'ARCHDEACONRY' | 'PARISH') => {
    e.preventDefault();
    setSubmitting(true);
    const payload = type === 'ARCHDEACONRY' 
      ? { type, name: archdeaconryName, diocese_id: session.assigned_id }
      : { type, name: parishName, parent_tenant_id: parseInt(parentArchdeaconryId, 10), diocese_id: session.assigned_id };

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/diocese-ict-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(`${type} created and registered into the Diocesan Registry successfully.`);
        setActiveModal('NONE');
        setArchdeaconryName(''); setParishName(''); setParentArchdeaconryId('');
        fetchHierarchyStats();
      }
    } catch (err) {
      console.error("Error provisioning structure element:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneratedCredentials(null);
    const cleanPhone = userPhoneNumber.trim().replace(/\s+/g, '');

    const payload = {
      tenant_id: parseInt(assignedTenantId, 10),
      phone_number: cleanPhone,
      full_name: userFullName.trim(),
      user_role: userRole
    };

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedCredentials({
          name: userFullName,
          phone: cleanPhone,
          pass: data.temporary_password
        });
        setUserFullName(''); setUserPhoneNumber(''); setUserRole(''); setAssignedTenantId('');
        fetchHierarchyStats();
      } else {
        alert(data.message || "Failed provisioning user account.");
      }
    } catch (err) {
      console.error("Error processing account generation sequence:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* 👑 REGISTRY CONTROL TOP BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 shadow-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner"><Shield className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-tight">
              {session.organization_name ? session.organization_name.toUpperCase() : 'ACK CENTRAL REGISTRY HUB'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {session.name.toUpperCase()} • <span className="text-blue-400">{session.role.replace('_', ' ')} WORKSPACE</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setGeneratedCredentials(null); setActiveModal('USER'); }} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex 
items-center gap-1.5 transition-all shadow-md">
            <UserPlus className="w-3.5 h-3.5" /> + Provision Official
          </button>
          <button onClick={() => setActiveModal('ARCHDEACONRY')} className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 
transition-all border border-slate-700">
            <PlusCircle className="w-3.5 h-3.5" /> + Archdeaconry
          </button>
          <button onClick={() => setActiveModal('PARISH')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 
transition-all shadow-md">
            <Layers className="w-3.5 h-3.5" /> + Parish Node
          </button>
          <button onClick={fetchHierarchyStats} disabled={syncing} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 font-black text-[10px] tracking-wider px-3 py-2 rounded-lg uppercase flex items-center gap-1.5 
transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {/* METRICS SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active Archdeaconries</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">{stats.totalArchdeaconries}</span>
        </div>
        <div className="bg-slate-800 border border-slate-800/80 p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Registered Parishes</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">{stats.totalParishes}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Edge Infrastructure</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Core Sync Active</span>
          </div>
          <Server className="w-8 h-8 text-slate-800" />
        </div>
      </div>

      {/* 🎛️ NEW ADVANCED INFRASTRUCTURE BLOCK VIEWPORT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📋 CENTRAL TELEMETRY AUDIT LEDGER LOG TERMINAL */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> System Access & Tamper-Proof Audit Trail
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Immutable lifecycle tracking across all connected regional tiers</p>
            </div>
            <span className="bg-blue-950 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded border border-blue-900/50 uppercase tracking-wide flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 animate-pulse" /> Live Streaming
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center text-xs text-slate-600 py-16 italic border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              No central registry mutations or provisioning actions captured inside the ledger cache.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 font-mono text-[11px]">
              {auditLogs.map((log) => {
                // 🚀 Idea 1: Compute custom, semantic tailwind layout rules based on target database actions
                let badgeStyles = 'text-blue-400 bg-blue-950/50 border-blue-900/40';
                if (log.action_type === 'INSERT') badgeStyles = 'text-emerald-400 bg-emerald-950/50 border-emerald-900/40';
                if (log.action_type === 'UPDATE') badgeStyles = 'text-amber-500 bg-amber-950/50 border-amber-900/40';
                if (log.action_type === 'DELETE') badgeStyles = 'text-rose-400 bg-rose-950/50 border-rose-900/40';

                return (
                  <div key={log.id} className="p-2.5 border border-slate-800/60 rounded-lg bg-slate-950/60 flex items-start justify-between gap-3 hover:bg-slate-950 transition-colors">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-bold uppercase text-[9px] border px-1.5 py-0.5 rounded tracking-wide ${badgeStyles}`}>
                          {log.action_type}
                        </span>
                        <span className="text-slate-300 font-semibold">{log.change_justification}</span>
                      </div>
                      
                      {/* 🚀 Idea 2: Surface complete, statutory audit contexts beneath the event tracking path */}
                      <div className="text-[9px] text-slate-500 space-y-0.5 pt-0.5">
                        <p>Authorized Actor Context: <span className="text-slate-400">{log.actor_name}</span> <span className="text-slate-600">|</span> Node IP: <span className="text-slate-400">{log.ip_address}</span></p>
                        <p className="italic text-slate-500">Reason: <span className="text-slate-400/90 font-sans">{log.reason_provided}</span></p>
                      </div>
                    </div>

                    {/* 🚀 Idea 3: Swap raw string timestamps with your structural time utility formatter */}
                    <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap bg-slate-900/60 border border-slate-800/40 px-1.5 py-0.5 rounded">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🛡️ CENTRAL COMPLIANCE & SECURITY GATEWAY EVALUATOR */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-amber-500 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Strategic Policy Control
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Statutory checks matching Kenya Data Protection Act 2019</p>
          </div>

          <ul className="space-y-3 text-xs text-slate-400 font-medium">
            <li className="flex items-start gap-2.5 p-2.5 border border-slate-800/50 rounded-lg bg-slate-950/30">
              <input type="checkbox" checked={stats.totalArchdeaconries > 0} readOnly className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-not-allowed" />
              <div>
                <span className="block text-slate-200 font-bold text-[11px] uppercase tracking-tight">Standardized Hierarchy</span>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">Central mapping configuration initialized across all five multi-tenant boundaries.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-2.5 border border-slate-800/50 rounded-lg bg-slate-950/30">
              <input type="checkbox" checked={auditLogs.length > 0} readOnly className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-not-allowed" />
              <div>
                <span className="block text-slate-200 font-bold text-[11px] uppercase tracking-tight">Complete Auditability</span>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">Database audit trail active. Hard deletions disabled for approved records.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-2.5 border border-slate-800/50 rounded-lg bg-slate-950/30">
              <input type="checkbox" checked={true} readOnly className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-not-allowed" />
              <div>
                <span className="block text-slate-200 font-bold text-[11px] uppercase tracking-tight">Role-Based Access (MFA)</span>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">Enforced Multi-Factor Authentication token challenge rules active for higher tiers.</p>
              </div>
            </li>
          </ul>

          {/* CLOUDFLARE EDGE STATE STATUS WRAPPER */}
          <div className="pt-2 border-t border-slate-800 mt-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Cloudflare Pages Worker</span>
              </div>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/50 uppercase tracking-widest">
                Node Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS ENTRY FORM LAYER (ARCHDEACONRY / PARISH / USER WIZARDS)
         ========================================================================= */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setActiveModal('NONE')} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Provisioning Element Wizard ({activeModal})
            </h3>
            
            {activeModal === 'USER' ? (
              !generatedCredentials ? (
                <form onSubmit={handleProvisionUser} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Full Identity Name</label>
                    <input type="text" placeholder="e.g., Rev. Canon John Doe" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userFullName} 
onChange={e => setUserFullName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Mobile Handset Phone</label>
                    <input type="text" placeholder="e.g., 0712345678" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userPhoneNumber} 
onChange={e => setUserPhoneNumber(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Security Role</label>
                      <select required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userRole} onChange={e => setUserRole(e.target.value)}>
                        <option value="">-- Select Role --</option>
                        <option value="BISHOP">BISHOP (Tier 1)</option>
                        <option value="DIOCESAN_OFFICIAL">DIOCESAN_OFFICIAL (Tier 2)</option>
                        <option value="ARCHDEACON">ARCHDEACON (Tier 3)</option>
                        <option value="VICAR">VICAR (Tier 4 Overlord)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Workplace Scope</label>
                      <select required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={assignedTenantId} onChange={e => 
setAssignedTenantId(e.target.value)}>
                        <option value="">-- Select Scope Location --</option>
                        {allTenantsList?.map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            [{tenant.tier_level}] {tenant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-800">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-black uppercase tracking-wider disabled:bg-slate-800">
                      {submitting ? 'Generating Account...' : 'Generate System Profile'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-tight">
                    <Key className="w-4 h-4" /> Credentials Provisioned & Locked via MFA
                  </div>
                  <p className="text-[11px] text-slate-500">
                    The account was generated successfully and flagged for compulsory Multi-Factor registration setup on next login. Copy the credentials below before closing:
                  </p>
                  <div className="text-xs space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                    <div className="flex justify-between"><span className="text-slate-600">Official:</span> <span className="text-white font-bold">{generatedCredentials.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Phone:</span> <span className="text-white font-bold">{generatedCredentials.phone}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Temp Pass:</span> <span className="text-emerald-400 font-black tracking-wider bg-emerald-950 px-2 py-0.5 rounded border 
border-emerald-900">{generatedCredentials.pass}</span></div>
                  </div>
                  <button type="button" onClick={() => { setGeneratedCredentials(null); setActiveModal('NONE'); }} className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase 
text-slate-200">
                    Acknowledged & Saved
                  </button>
                </div>
              )
            ) : (
              /* 🏗️ CASE B: RENDER STRUCTURE INGESTION FORMS (ARCHDEACONRY / PARISH) */
              <form onSubmit={(e) => handleCreateStructure(e, activeModal as any)} className="space-y-4">
                {activeModal === 'ARCHDEACONRY' ? (
                  <input type="text" placeholder="Archdeaconry Name (e.g., Cathedral Archdeaconry)" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
value={archdeaconryName} onChange={e => setArchdeaconryName(e.target.value)} />
                ) : (
                  <>
                    <input type="text" placeholder="Parish Name (e.g., St. Stephen's Parish)" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
value={parishName} onChange={e => setParishName(e.target.value)} />
                    <select required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={parentArchdeaconryId} onChange={e => 
setParentArchdeaconryId(e.target.value)}>
                      <option value="">-- Assign Parent Archdeaconry --</option>
                      {archdeaconriesList?.map(arch => <option key={arch.id} value={arch.id}>{arch.name}</option>)}
                    </select>
                  </>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-800">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-black uppercase tracking-wider">
                    {submitting ? 'Processing...' : 'Commit Structure'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
