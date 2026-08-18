import React, { useState, useEffect } from 'react';
import { 
  Server, ShieldAlert, Key, UserPlus, Sliders, Database, 
  Settings, RefreshCw, LogOut, CheckCircle2, AlertCircle, FileText 
} from 'lucide-react';

interface SystemHealthLog {
  ping_latency_ms: number;
  supabase_pool_status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  mpesa_gateway_sync: 'ONLINE' | 'ERROR';
  last_snapshot_time: string;
}

interface StagedUserRecord {
  id: string;
  email: string;
  role: string;
  staged_at: string;
  status: 'PENDING_VICAR_APPROVAL' | 'ACTIVE' | 'REVOKED';
}

interface DaughterChurchIctDashboardProps {
  session: {
    user_id: number;
    name: string;
    role: string;
    tier_access: string;
    assigned_id: number;
    organization_name?: string;
  };
  onLogout: () => void;
}

export const DaughterChurchIctDashboard: React.FC<DaughterChurchIctDashboardProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'provisioning' | 'constants'>('infrastructure');
  const [refreshing, setRefreshing] = useState(false);

  // ⚙️ Infrastructure Monitor Metrics Cache
  const [systemState, setSystemState] = useState<SystemHealthLog>({
    ping_latency_ms: 14,
    supabase_pool_status: 'CONNECTED',
    mpesa_gateway_sync: 'ONLINE',
    last_snapshot_time: '06:00:00 EAT'
  });

  // 👥 Staged Local User Account Buffers
  const [stagedUsers, setStagedUsers] = useState<StagedUserRecord[]>([
    { id: "usr_9021", email: "clerk.kufuga@ack.or.ke", role: "PARISH_DATA_CLERK", staged_at: "2026-08-17", status: "PENDING_VICAR_APPROVAL" },
    { id: "usr_4432", email: "leader.youth@ack.or.ke", role: "MINISTRY_LEADER", staged_at: "2026-08-15", status: "ACTIVE" }
  ]);

  // 📝 User Entry Configuration Fields (Maker Phase)
  const [targetRole, setTargetRole] = useState('PARISH_DATA_CLERK');
  const [submittingUser, setSubmittingUser] = useState(false);

  const [targetPhone, setTargetPhone] = useState('');
  const [targetFullName, setTargetFullName] = useState('');

  // State to capture and display the plain-text password returned by your n8n workflow
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // 🚀 ACTION: Stage User Structural Row Node via n8n Endpoint
  const handleStageUserShell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhone.trim() || !targetFullName.trim()) return;

    setSubmittingUser(true);
    setGeneratedPassword(null); // Clear any previous password credentials

    try {
      const response = await fetch('https://n8n.tenear.com/ack-provision-archdeaconry-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_user_id: session.user_id,
          phone_number: targetPhone.trim(),
          full_name: targetFullName.trim(),
          user_role: targetRole,
          tenant_id: session.assigned_id, // Hard-pinned to current multi-tenant assembly node
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Expecting n8n to return: { success: true, temp_password: "ACK-XXXX-2026" }
        setGeneratedPassword(data.temp_password);
        setTargetPhone('');
        setTargetFullName('');
      } else {
        alert("Server Validation Error: Database constraint conflict or invalid arguments.");
      }
    } catch (err) {
      console.error("Failed to propagate system account shell row", err);
    } finally {
      setSubmittingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* 1. Global Infrastructure Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Server className="text-blue-400 h-5 w-5" />
            <h1 className="font-bold text-lg tracking-tight uppercase">
              {session.organization_name || "ACK LOCAL ASSEMBLY ARCHITECTURE DESK"}
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Technical Operator: <span className="text-slate-200 font-medium">{session.name}</span> | Target: {session.role} Workspace
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            Tier: {session.tier_access}
          </span>
          <button onClick={onLogout} className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 border border-red-900 text-red-200 text-xs px-3 py-1.5 rounded-lg font-medium 
transition-all">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* 2. Content Tabs Selector */}
        <div className="flex gap-1 border-b border-slate-800 mb-6 pb-px">
          <button onClick={() => setActiveTab('infrastructure')} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 
transition-all ${activeTab === 'infrastructure' ? 'border-blue-500 text-blue-400 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            <Sliders className="h-4 w-4" /> System Dashboard
          </button>
          <button onClick={() => setActiveTab('provisioning')} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all 
${activeTab === 'provisioning' ? 'border-blue-500 text-blue-400 bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            <UserPlus className="h-4 w-4" /> Add Church Staff
          </button>
        </div>

        {/* TAB WORKSPACE AREA 2: USER PRE-PROVISIONING SYSTEM */}
        {activeTab === 'provisioning' && (
          <div className="space-y-6">

            {/* 🔑 DYNAMIC SUCCESS MODAL: Displays the temporary credentials */}
            {generatedPassword && (
              <div className="bg-blue-950 border border-blue-700 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
                <div>
                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide">Temporary Password Generated Successfully</h4>
                  <p className="text-xs text-slate-300 mt-1">Copy and share these login credentials securely with the church worker. This password will not be shown again.</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg font-mono text-sm text-emerald-400 select-all font-bold">
                    {generatedPassword}
                  </div>
                </div>
                <button 
                  onClick={() => setGeneratedPassword(null)} 
                  className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                >
                  Clear Display
                </button>
              </div>
            )}

            {/* The Account Entry Form — REWRITTEN FOR ORDINARY USERS */}
            <form onSubmit={handleStageUserShell} className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-4 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide">Setup Profile for Vicar Approval</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Enter the worker's details. The account is created in a pending state until approved by the Vicar.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={targetFullName} 
                  onChange={(e) => setTargetFullName(e.target.value)}
                  placeholder="e.g. Eric Nyawara" 
                  className="w-full bg-slate-900 border border-slate-700 text-xs p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Phone Number</label>
                <input 
                  type="text" 
                  required 
                  value={targetPhone} 
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="e.g. 0712345678" 
                  className="w-full bg-slate-900 border border-slate-700 text-xs p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Assigned Church Role</label>
                <select 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="PARISH_DATA_CLERK">PARISH_DATA_CLERK</option>
                  <option value="TREASURER">TREASURER</option>
                  <option value="MINISTRY_LEADER">MINISTRY_LEADER</option>
                  <option value="CHURCH_ELDER">CHURCH_ELDER</option>
                </select>
              </div>
              <div>
                <button type="submit" disabled={submittingUser} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold text-xs p-2.5 rounded-lg flex items-center justify-center gap-1.5 
transition-all">
                  <UserPlus className="h-4 w-4" /> {submittingUser ? "Saving profile..." : "Save Staff Profile"}
                </button>
              </div>
            </form>

            {/* System Access Monitoring Logs Table — REWRITTEN FOR ORDINARY USERS */}
            <div className="bg-slate-800/20 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="text-slate-400 h-4 w-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Staff Account List</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Staff Email Address</th>
                      <th className="py-2.5 px-3">Assigned Role</th>
                      <th className="py-2.5 px-3">Date Added</th>
                      <th className="py-2.5 px-3 text-right">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {stagedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-200">{user.email}</td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{user.staged_at}</td>
                        <td className="py-3 px-3 text-right">
                          {user.status === 'PENDING_VICAR_APPROVAL' ? (
                            <span className="text-amber-400 font-medium inline-flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> AWAITING VICAR APPROVAL
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> ACTIVE & APPROVED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* 👆 This closes the activeTab === 'provisioning' condition block cleanly */}
      </main>
    </div>
  );
};
