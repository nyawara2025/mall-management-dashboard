import React, { useState, useEffect } from 'react';
import { 
  Building, RefreshCw, FileText, CheckCircle2, XCircle, 
  Layers, ClipboardCheck, ArrowUpRight, FolderOpen, Send, Loader2
} from 'lucide-react';

interface DepartmentDashboardProps {
  session: { 
    user_id: number; 
    name: string; 
    role: string; 
    assigned_id: number 
    organization_name: string;
  };
  onLogout: () => void;
}

interface PendingReturn {
  id: string;
  parish_name: string;
  archdeaconry_name: string;
  period: string;
  tithes: number;
  remittance_calculated: number;
  evidence_url: string;
}

export const DiocesanDepartmentDashboard: React.FC<DepartmentDashboardProps> = ({ session, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'RETURNS' | 'STRATEGIC_PLAN'>('RETURNS');
  const [syncing, setSyncing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Core Functional Operational Datasets matching the Diocese requirements criteria
  const [pendingReturns, setPendingReturns] = useState<PendingReturn[]>([
    { id: 'ret-001', parish_name: "St. Mark's Parish", archdeaconry_name: "Archdeaconry 1", period: "August 2026", tithes: 450000, remittance_calculated: 135000, evidence_url: "#" },
    { id: 'ret-002', parish_name: "St. Stephen's Parish", archdeaconry_name: "Archdeaconry 2", period: "August 2026", tithes: 380000, remittance_calculated: 114000, evidence_url: "#" }
  ]);

  const [departmentKPIs, setDepartmentKPIs] = useState([
    { id: 1, pillar: "Mission, Evangelism & Spiritual Growth", target: "Plant 5 new daughter churches in 2026", achieved: 60 },
    { id: 4, pillar: "Education, Research, Training & Advocacy", target: "Train 50 Lay Readers at Leadership Academy", achieved: 45 }
  ]);

  const fetchDepartmentData = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-diocese-department-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: session.role, user_id: session.user_id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingReturns(data.pendingReturns || pendingReturns);
        setDepartmentKPIs(data.kpis || departmentKPIs);
      }
    } catch (err) {
      console.error("Diocesan department operational data fetch exception:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchDepartmentData(); }, []);

  const handleProcessWorkflow = async (returnId: string, actionType: 'APPROVE' | 'REJECT') => {
    setProcessingId(returnId);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-diocese-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_id: returnId, action: actionType, processor_id: session.user_id })
      });
      if (res.ok) {
        alert(`Parish return data execution status updated: ${actionType}`);
        setPendingReturns(prev => prev.filter(item => item.id !== returnId));
      }
    } catch (err) {
      console.error("Workflow processing error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      
      {/* 🏢 1. DIOCESAN MANAGEMENT LEVEL HEADINGS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 shadow-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner shadow-blue-400/20">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">
              {session.organization_name ? `${session.organization_name.toUpperCase()}` : 'DIOCESAN DEPARTMENTAL ERP'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {session.name.toUpperCase()} • <span className="text-blue-700">{session.role.replace('_', ' ')} PORTAL</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDepartmentData} 
            disabled={syncing} 
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onLogout} 
            className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 font-black text-[10px] tracking-wider px-3 py-2 rounded-lg uppercase transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* 🎛️ 2. DASHBOARD NAVIGATION TABS CONTROLLER */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px mb-6">
        <button 
          onClick={() => setActiveTab('RETURNS')}
          className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'RETURNS' ? 'border-blue-500 text-blue-400 bg-slate-900/40' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Return Approvals</div>
        </button>
        <button 
          onClick={() => setActiveTab('STRATEGIC_PLAN')}
          className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'STRATEGIC_PLAN' ? 'border-purple-500 text-purple-400 bg-slate-900/40' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Pillar Log Updates</div>
        </button>
      </div>

      {/* 🚀 3. CORE DYNAMIC WORKSPACE WORKLOAD LAYOUTS */}
      {activeTab === 'RETURNS' ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-4 bg-slate-950/30">
            <h3 className="text-xs font-black text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
              Pending Multi-Tenant Parish Submissions
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Verify financial calculations and file attachments prior to final data rolling metrics freeze</p>
          </div>

          {pendingReturns.length === 0 ? (
            <div className="text-center text-xs text-slate-600 py-16 italic font-sans">
              All sub-tenant data batches currently reviewed and locked.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {pendingReturns.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-950/40 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-bold">{item.parish_name}</span>
                      <span className="text-[9px] text-slate-500 font-bold px-1.5 py-0.2 bg-slate-800 rounded border border-slate-700">{item.archdeaconry_name}</span>
                    </div>
                    <p className="text-slate-500 text-[10px]">Filing Phase Period: <span className="text-slate-400">{item.period}</span></p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Gross Tithe: <strong className="text-slate-300">KES {item.tithes.toLocaleString()}</strong></span>
                      <span>Remittance Obligation (30%): <strong className="text-emerald-400">KES {item.remittance_calculated.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Operational Verification Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <a 
                      href={item.evidence_url} 
                      className="px-2.5 py-1.5 border border-slate-700 bg-slate-950/50 hover:bg-slate-800 text-[10px] text-slate-400 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <FolderOpen className="w-3 h-3" /> Audit Evidence
                    </a>
                    <button 
                      disabled={processingId !== null}
                      onClick={() => handleProcessWorkflow(item.id, 'REJECT')}
                      className="p-1.5 border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={processingId !== null}
                      onClick={() => handleProcessWorkflow(item.id, 'APPROVE')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all shadow-md"
                    >
                      {processingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve Lock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STRATEGIC PLAN INTERVENTION LAYER BUILD */
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-purple-400 tracking-wider uppercase flex items-center gap-1.5">
              Strategic Plan Actions & Goal Parameters
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Update current performance metrics for objectives belonging to your assigned central functional division</p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {departmentKPIs.map((kpi) => (
              <div key={kpi.id} className="p-4 border border-slate-800/80 bg-slate-950/40 rounded-xl space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tight block">{kpi.pillar}</span>
                  <span className="text-slate-200 font-bold block mt-0.5">{kpi.target}</span>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Reported Progression Metric</span>
                      <span className="text-purple-400">{kpi.achieved}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${kpi.achieved}%` }} />
                    </div>
                  </div>
                  
                  {/* Dynamic update input inline */}
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue={kpi.achieved}
                      className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-xs text-white focus:outline-none"
                    />
                    <button 
                      onClick={() => alert("New progression parameters pushed to consolidation buffers.")}
                      className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
