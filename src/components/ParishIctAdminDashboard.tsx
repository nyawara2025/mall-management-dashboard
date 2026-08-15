import React, { useState, useEffect } from 'react';
import { 
  Shield, UserPlus, RefreshCw, Server, CheckCircle, 
  Database, X, Terminal, ShieldAlert, Wifi, Activity, Key
} from 'lucide-react';

interface ParishIctAdminProps {
  session: { assigned_id: number; name: string; role: string };
  onLogout: () => void;
}

interface AuditLog {
  id: string;
  action_type: string;
  actor_name: string;
  change_justification: string;
  reason_provided: string;
  ip_address: string;
  created_at: string;
}

// ⏱️ Relative Time string Formatter Utility 
const formatRelativeTime = (timestampString: string): string => {
  try {
    const logDate = new Date(timestampString);
    if (isNaN(logDate.getTime())) return timestampString;
    const now = new Date();
    const diffMs = now.getTime() - logDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) { return timestampString; }
};

export const ParishIctAdminDashboard: React.FC<ParishIctAdminProps> = ({ session, onLogout }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'USER'>('NONE');
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Localized Infrastructure State
  const [stats, setStats] = useState({ totalActiveLocalUsers: 0, pendingSyncs: 0 });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // User Provisioning State
  const [userFullName, setUserFullName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userRole, setUserRole] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState<{ name: string; phone: string; pass: string } | null>(null);

  const fetchParishTelemetry = async () => {
    setSyncing(true);
    try {
      // 🚀 Targets a specialized local parish endpoint (scoped strictly to session.assigned_id)
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-parish-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parish_id: session.assigned_id })
      });
      const data = await res.json();
      if (data) {
        setStats({ 
          totalActiveLocalUsers: data.activeUsersCount || 0, 
          pendingSyncs: data.pendingSyncCount || 0 
        });
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error("Local parish telemetric fetch exception:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchParishTelemetry(); }, []);

  const handleProvisionLocalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneratedCredentials(null);
    const cleanPhone = userPhoneNumber.trim().replace(/\s+/g, '');

    const payload = {
      tenant_id: session.assigned_id, // Automatically locked down to their assigned local Parish ID
      phone_number: cleanPhone,
      full_name: userFullName.trim(),
      user_role: userRole
    };

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/provision-parish-user', {
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
        setUserFullName(''); setUserPhoneNumber(''); setUserRole('');
        fetchParishTelemetry();
      } else {
        alert(data.message || "Failed provisioning local profile.");
      }
    } catch (err) {
      console.error("Local provisioning sequence disruption:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* 👑 PARISH CONTROL TOP BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 shadow-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner"><Shield className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-blue-400">ACK {session.name} Hub</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Tier 4 Local Node System Administrator Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setGeneratedCredentials(null); setActiveModal('USER'); }} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 
transition-all shadow-md">
            <UserPlus className="w-3.5 h-3.5" /> + Provision Staff
          </button>
          <button onClick={fetchParishTelemetry} disabled={syncing} className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 font-black text-[10px] tracking-wider px-3 py-2 rounded-lg uppercase transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {/* METRICS SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Active Local Operators</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">{stats.totalActiveLocalUsers}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Uncommitted Local Batches</span>
          <span className="text-3xl font-black text-amber-500 mt-1 block font-mono">{stats.pendingSyncs}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cloudflare Edge Sandbox</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Isolated Boundary Active</span>
          </div>
          <Server className="w-8 h-8 text-slate-800" />
        </div>
      </div>

      {/* WORKSPACE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> Node Telemetry Audit Log
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Tracking data changes made strictly within this parish workspace</p>
            </div>
            <span className="bg-blue-950 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded border border-blue-900/50 uppercase tracking-wide flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 animate-pulse" /> Live Monitoring
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center text-xs text-slate-600 py-16 italic border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              No configuration alterations recorded in the local buffer cache.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 font-mono text-[11px]">
              {auditLogs.map((log) => {
                let badgeStyles = 'text-blue-400 bg-blue-950/50 border-blue-900/40';
                if (log.action_type === 'INSERT') badgeStyles = 'text-emerald-400 bg-emerald-950/50 border-emerald-900/40';
                if (log.action_type === 'UPDATE') badgeStyles = 'text-amber-500 bg-amber-950/50 border-amber-900/40';
                if (log.action_type === 'DELETE') badgeStyles = 'text-rose-400 bg-rose-950/50 border-rose-900/40';

                return (
                  <div key={log.id} className="p-2.5 border border-slate-800/60 rounded-lg bg-slate-950/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-bold uppercase text-[9px] border px-1.5 py-0.5 rounded tracking-wide ${badgeStyles}`}>
                          {log.action_type}
                        </span>
                        <span className="text-slate-300 font-semibold">{log.change_justification}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 space-y-0.5 pt-0.5">
                        <p>Operator: <span className="text-slate-400">{log.actor_name}</span> <span className="text-slate-600">|</span> Client IP: <span className="text-slate-400">{log.ip_address}</span></p>
                        <p className="italic text-slate-500">Reason: <span className="text-slate-400/90 font-sans">{log.reason_provided}</span></p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap bg-slate-900/60 border border-slate-800/40 px-1.5 py-0.5 rounded">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🛡️ POLICY REGULATORY STANDARDS */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-amber-500 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Node Security Profile
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Compliance rules for local data processors</p>
          </div>
          <ul className="space-y-3 text-xs text-slate-400 font-medium">
            <li className="flex items-start gap-2.5 p-2.5 border border-slate-800/50 rounded-lg bg-slate-950/30">
              <input type="checkbox" checked={true} readOnly className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-not-allowed" />
              <div>
                <span className="block text-slate-200 font-bold text-[11px] uppercase tracking-tight">Data Minimization Rule</span>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">Personal data visibility restricted strictly to processing roles. IT Admin view obfuscated.</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 p-2.5 border border-slate-800/50 rounded-lg bg-slate-950/30">
              <input type="checkbox" checked={true} readOnly className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-not-allowed" />
              <div>
                <span className="block text-slate-200 font-bold text-[11px] uppercase tracking-tight">Compulsory MFA Challenges</span>
                <p className="text-[10px] text-slate-500 font-normal mt-0.5">Enforces verification checks on downstream workflows for Vicars and Treasurers.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 🚀 MODAL PROVISIONING COMPONENT LAYER */}
      {activeModal === 'USER' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setActiveModal('NONE')} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Database className="w-4 h-4" /> Provision Local Operator</h3>
            
            {!generatedCredentials ? (
              <form onSubmit={handleProvisionLocalUser} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Full Identity Name</label>
                  <input type="text" placeholder="e.g., Jane Wanjiku" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userFullName} onChange={e => 
setUserFullName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Mobile Contact Phone</label>
                  <input type="text" placeholder="e.g., 0712345678" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userPhoneNumber} onChange={e => 
setUserPhoneNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Assigned Local Role</label>
                  <select required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userRole} onChange={e => setUserRole(e.target.value)}>
                    <option value="">-- Select Functional Role --</option>
                    <option value="VICAR">VICAR (Local Node Approver)</option>
                    <option value="PARISH TREASURER">PARISH_TREASURER (Financials Officer)</option>
                    <option value="PARISH_ADMIN">PARISH_ADMIN (General Operations Clerk)</option>
                    <option value="MINISTRY_LEADER">MINISTRY_LEADER (Department Head)</option>
                    <option value="PCC_MEMBER">PCC_MEMBER (Read-Only Council Member)</option>
                  </select>
                </div>
                
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-800">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-black uppercase tracking-wider">
                    {submitting ? 'Generating...' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-tight">
                  <Key className="w-4 h-4" /> Profile Locked under Temporary Credentials
                </div>
                <div className="text-xs space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                  <div className="flex justify-between"><span className="text-slate-600">User:</span> <span className="text-white font-bold">{generatedCredentials.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Phone:</span> <span className="text-white font-bold">{generatedCredentials.phone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Temp Pass:</span> <span className="text-emerald-400 font-black bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">{generatedCredentials.pass}</span></div>
                </div>
                <button type="button" onClick={() => { setGeneratedCredentials(null); setActiveModal('NONE'); }} className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase text-slate-200">
                  Acknowledge & Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
