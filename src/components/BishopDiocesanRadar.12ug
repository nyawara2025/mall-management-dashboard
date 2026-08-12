import React, { useState, useEffect } from 'react';
import { 
  Award, RefreshCw, LogOut, Users, DollarSign, Briefcase, 
  TrendingUp, BarChart2, ShieldAlert, FileText, X 
} from 'lucide-react';

interface RadarMetrics {
  total_attendance: number;
  total_finances_kes: number;
  active_projects_count: number;
  plan_compliance_percentage: number;
}

interface ProjectLog {
  id: string;
  project_name: string;
  location_church_name: string;
  allocated_budget_kes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface LedgerTransaction {
  id: string;
  transaction_reference: string;
  fund_purpose: string;
  amount_kes: number;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

interface BishopRadarProps {
  session: any;
  onLogout: () => void;
  isBishop?: boolean; 
}

// 🚀 STEP 2: Destructure isBishop here and default it to false for standard Diocesan Officials
export const BishopDiocesanRadar: React.FC<BishopRadarProps> = ({ session, onLogout, isBishop = false }) => {
  // 📊 Core Strategic Plan Monitoring State Layers
  const [metrics, setMetrics] = useState<RadarMetrics | null>(null);
  const [projectLogs, setProjectLogs] = useState<ProjectLog[]>([]);
  const [ledger, setLedger] = useState<LedgerTransaction[]>([]);
  
  // ⚙️ Component Lifecycle and UI Visibility Toggles
  const [refreshing, setRefreshing] = useState(false);
  const [metricFormOpen, setMetricFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 📝 KPI Metric Form Controlled Input Buffers
  const [period, setPeriod] = useState('');
  const [attendance, setAttendance] = useState('');
  const [sacraments, setSacraments] = useState('');
  const [milestones, setMilestones] = useState('');
  const [financeTarget, setFinanceTarget] = useState('');

  // 🔄 Unified Data Fetcher Engine
  const fetchRadarData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-diocesan-radar-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data) {
        setMetrics(data.metrics || null);
        setProjectLogs(data.projects || []);
        setLedger(data.ledger || []);
      }
    } catch (err) {
      console.error("Error synchronizing diocesan radar telemetry:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRadarData();
  }, [session.assigned_id]);

  const handleSubmitMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-submit-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id,
          reporting_period: period,
          worship_attendance: parseInt(attendance, 10) || 0,
          sacraments_administered: parseInt(sacraments, 10) || 0,
          milestones_completed: parseInt(milestones, 10) || 0,
          finance_reached: parseFloat(financeTarget) || 0.00
        })
      });
      if (res.ok) {
        alert("Strategic KPI metrics broadcasted across the diocese successfully!");
        setMetricFormOpen(false);
        setPeriod('');
        setAttendance('');
        setSacraments('');
        setMilestones('');
        setFinanceTarget('');
        fetchRadarData();
      }
    } catch (err) {
      console.error("Failed uploading metrics:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-12">
      {/* 👑 EXECUTIVE NAVIGATION TOP BAR */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center text-white shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Diocesan Executive Radar</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {session.name} • <span className="text-blue-700">{session.role} Workspace Panel</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* 🚀 SAFETY CHECK: Only render the upload button if the user is NOT the Bishop */}
          {!isBishop && (
            <button 
              onClick={() => setMetricFormOpen(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
            >
              ➕ Log KPI Data
            </button>
          )}

          <button 
            onClick={fetchRadarData}
            disabled={refreshing}
            className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={onLogout}
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* 📊 SUMMARY TRACKING GRID (2026–2030 Flagship KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Aggregated Attendance</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.total_attendance?.toLocaleString() || '0'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Consolidated Finance Ledger</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5 font-mono">
            KES {metrics?.total_finances_kes?.toLocaleString() || '0.00'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-purple-700 bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Strategic Plan Flagships</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.active_projects_count || '0'} Projects
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-amber-700 bg-amber-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">M&E Plan Compliance</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.plan_compliance_percentage || '0'}% Target
          </span>
        </div>
      </div>

      {/* 🎛️ MULTI-COLUMN CONTENT VIEWPORT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📋 MONITORING & EVALUATION DEVELOPMENT PROJECT TRACKER */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                <BarChart2 className="w-4 h-4" /> Institutional Project Matrix
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Real-time status updates from Parishes</p>
            </div>
          </div>

          {projectLogs.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">
              No development or tactical ministry projects currently logged in the system ledger.
            </div>
          ) : (
            <div className="space-y-3">
              {projectLogs.map((project) => (
                <div key={project.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">{project.project_name}</span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">📍 Venue Context: {project.location_church_name}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="text-[9px] font-bold text-slate-500 font-mono bg-slate-200 px-2 py-1 rounded-md">
                      Budget KES: {project.allocated_budget_kes?.toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🛡️ SECURITY AUDIT & INSTITUTIONAL GAPS CHECKLIST */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-amber-700">
              <ShieldAlert className="w-4 h-4" /> Strategic Evaluation Checklist
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Target indicators monitored by the Bishop's Office</p>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2 p-2 border border-slate-50 rounded-lg bg-slate-50/30">
              <input type="checkbox" checked={!!metrics?.total_finances_kes} readOnly className="mt-0.5 rounded text-blue-700 focus:ring-blue-700" />
              <div>
                <span className="block text-slate-800 font-bold text-[11px] uppercase tracking-tight">Eliminate Fragmented Collections</span>
                <p className="text-[10px] text-slate-400 font-normal">Automated M-Pesa ledger routing through church transaction tables.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 p-2 border border-slate-50 rounded-lg bg-slate-50/30">
              <input type="checkbox" checked={projectLogs.length > 0} readOnly className="mt-0.5 rounded text-blue-700 focus:ring-blue-700" />
              <div>
                <span className="block text-slate-800 font-bold text-[11px] uppercase tracking-tight">Adequate Project Follow-up</span>
                <p className="text-[10px] text-slate-400 font-normal">Live milestones status dashboard for tracking strategic plan flagships.</p>
              </div>
            </li>
            <li className="flex items-start gap-2 p-2 border border-slate-50 rounded-lg bg-slate-50/30">
              <input type="checkbox" checked={!!metrics?.total_attendance} readOnly className="mt-0.5 rounded text-blue-700 focus:ring-blue-700" />
              <div>
                <span className="block text-slate-800 font-bold text-[11px] uppercase tracking-tight">Evidence-Based Decision Making</span>
                <p className="text-[10px] text-slate-400 font-normal">Aggregated worship attendance logs updated at Parish level.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* 📊 CONSOLIDATED DIOCESAN TRANSACTION LEDGER */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                <FileText className="w-4 h-4" /> Real-Time Financial Ledger
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Consolidated live income streams from all connected regional tiers</p>
            </div>
            <button 
              onClick={() => fetchRadarData()}
              className="self-start sm:self-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg uppercase transition-colors"
            >
              🔄 Refresh Ledger
            </button>
          </div>

          {ledger.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
              No recent M-Pesa transaction records found matching this diocesan profile.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3 text-right">Amount (KES)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-mono text-[11px] font-bold text-slate-900 uppercase">
                        {tx.transaction_reference}
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                          {tx.fund_purpose?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {Number(tx.amount_kes).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                          tx.payment_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {tx.payment_status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-slate-400 font-semibold font-mono">
                        {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🏛️ MODAL PANEL LAYER: STRATEGIC KPI INSIGHTS ENTRY MODAL */}
      {metricFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setMetricFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                <TrendingUp className="w-4 h-4" /> Submit Strategic KPI Entry
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Log verified metric benchmarks for local evaluation</p>
            </div>

            <form onSubmit={handleSubmitMetric} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Reporting Period (e.g., 2026-Q1)" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                  value={period} 
                  onChange={e => setPeriod(e.target.value.toUpperCase())} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Worship Attendance</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={attendance} 
                    onChange={e => setAttendance(e.target.value)} 
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Sacraments Run</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={sacraments} 
                    onChange={e => setSacraments(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Milestones Met</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={milestones} 
                    onChange={e => setMilestones(e.target.value)} 
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Finance Reached (KES)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={financeTarget} 
                    onChange={e => setFinanceTarget(e.target.value)} 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Uploading Metrics...' : 'Broadcast KPI Update'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
