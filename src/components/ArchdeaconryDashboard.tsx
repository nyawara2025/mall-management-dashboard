import React, { useState, useEffect } from 'react';
import { 
  Globe, RefreshCw, LogOut, Users, DollarSign, Landmark, 
  TrendingUp, BarChart3, ShieldCheck, FileSpreadsheet, X, AlertTriangle 
} from 'lucide-react';

interface ArchdeaconryMetrics {
  total_attendance: number;
  total_regional_funds_kes: number;
  active_parishes_count: number;
  regional_compliance_rate: number;
}

interface ParishPerformanceRow {
  parish_id: string;
  parish_name: string;
  total_attendance_rollup: number;
  total_funds_kes: number;
  last_submission_period: string;
  verification_status: string; // 🚀 ADDED: Tracks 'APPROVED_LOCKED', 'PENDING_VICAR_REVIEW', etc.
  metrics_log_id?: string;
}

interface ArchdeaconryDashboardProps {
  session: {
    name: string;
    role: string;
    assigned_id: number;
    user_id: number;
  };
  onLogout: () => void;
}

export const ArchdeaconryDashboard: React.FC<ArchdeaconryDashboardProps> = ({ session, onLogout }) => {
  // 📊 Local Operational State Management
  const [metrics, setMetrics] = useState<ArchdeaconryMetrics | null>(null);
  const [parishPerformances, setParishPerformances] = useState<ParishPerformanceRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 🎛️ NEW: Timeline and Action Management Controls
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-W31'); // Mid-2026 System Anchor
  const [selectedParishLog, setSelectedParishLog] = useState<ParishPerformanceRow | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [submittingCorrection, setSubmittingCorrection] = useState<boolean>(false);

  // 🔄 Consolidated Archdeaconry Data Fetcher Engine
  const fetchArchdeaconryData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-archdeaconry-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tenant_id: session.assigned_id,
          reporting_period: selectedPeriod
        })
      });
      const data = await res.json();
      if (data) {
        setMetrics(data.metrics || null);
        setParishPerformances(data.parishes || []);
      }
    } catch (err) {
      console.error("Error synchronizing archdeaconry metrics:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArchdeaconryData();
  }, [session.assigned_id, selectedPeriod]);


  // 👔 Archdeaconry Regional Remanding Workspace (Section 8 Control)
  const handleRequestModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParishLog || !correctionReason.trim()) return;

    setSubmittingCorrection(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-archdeacon-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics_log_id: selectedParishLog.metrics_log_id,
          archdeacon_user_id: session.user_id,
          tenant_id: session.assigned_id,
          parish_id: selectedParishLog.parish_id,
          feedback_notes: correctionReason,
          action_intent: 'CORRECTION_REQUESTED'
        })
      });

      if (res.ok) {
        alert(`Correction request successfully dispatched to ${selectedParishLog.parish_name} workspace.`);
        setSelectedParishLog(null);
        setCorrectionReason('');
        fetchArchdeaconryData(); // Refreshes state table changes
      } else {
        alert("Workflow exception encountered. Verify middleware connection parameters.");
      }
    } catch (err) {
      console.error("Critical failure executing regional oversight rollback:", err);
    } finally {
      setSubmittingCorrection(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased p-4 sm:p-6 pb-12">
      
      {/* 👑 REGIONAL ARCHDEACONRY TOP BAR */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-800 rounded-xl flex items-center justify-center text-white shadow-md shadow-purple-100">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Archdeaconry Regional Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {session.name} • <span className="text-purple-700">{session.role.replace('_', ' ')} Workspace Panel</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* 📅 TIMELINE PICKER FILTER: Dynamically updates your n8n pipelines when changed */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Period:</span>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="2026-W31">2026-W31</option>
              <option value="2026-W32">2026-W32</option>
              <option value="2026-W33">2026-W33</option>
              <option value="2026-W34">2026-W34</option>
            </select>
          </div>

          <button 
            onClick={fetchArchdeaconryData}
            disabled={refreshing}
            className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-700' : ''}`} />
          </button>
          
          <button 
            onClick={onLogout}
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-[10px] tracking-wider px-4 py-2.5 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-sm shadow-red-50"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* 📊 SUMMARY REGIONAL METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Archdeaconry Attendance</span>
            <span className="block text-2xl font-black text-slate-900 tracking-tight">{metrics?.total_attendance?.toLocaleString() || '0'}</span>
          </div>
          <div className="text-purple-700 bg-purple-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"><Users className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Consolidated Capital Stream</span>
            <span className="block text-2xl font-black text-slate-900 tracking-tight font-mono text-emerald-600">KES {metrics?.total_regional_funds_kes?.toLocaleString() || '0.00'}</span>
          </div>
          <div className="text-emerald-700 bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"><DollarSign className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Supervised Parishes</span>
            <span className="block text-2xl font-black text-slate-900 tracking-tight">{metrics?.active_parishes_count || '0'} Jurisdictions</span>
          </div>
          <div className="text-blue-700 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"><Landmark className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">M&E Verification Audit</span>
            <span className="block text-2xl font-black text-slate-900 tracking-tight">{metrics?.regional_compliance_rate || '0'}% Compliance</span>
          </div>
          <div className="text-amber-700 bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"><TrendingUp className="w-5 h-5" /></div>
        </div>
      </div>

      {/* 🎛️ CORE PANELS: REGIONAL WORKFLOW MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* 📋 PARISH PERFORMANCE LEDGER MATRIX (SPANS 2 COLUMNS FOR METRIC ACCURACY) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-purple-800">
              <BarChart3 className="w-4 h-4" /> Parish Performance Ledger Matrix
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Compliance oversight tracking from monitored regional collection lines</p>
          </div>

          {parishPerformances.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">
              No subordinate parish returns registered under this regional workspace node for week {selectedPeriod}.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-3.5">Parish Name</th>
                    <th className="p-3.5 font-mono">Period</th>
                    <th className="p-3.5 text-right">Attendance Roll</th>
                    <th className="p-3.5 text-right">Funds (KES)</th>
                    <th className="p-3.5 text-center">Status Badge</th>
                    <th className="p-3.5 text-center">Audit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {parishPerformances.map((row) => {
                    const status = String(row.verification_status).toUpperCase();
                    const isApproved = status === 'APPROVED_LOCKED';
                    const isReturned = status === 'RETURNED_FOR_CORRECTION' || status === 'CORRECTION_REQUESTED';
                    const isPending = status === 'PENDING_VICAR_REVIEW';

                    return (
                      <tr key={row.parish_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 uppercase max-w-[220px] truncate">{row.parish_name}</td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-[10px] text-slate-700">{row.last_submission_period}</span>
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-800">{row.total_attendance_rollup?.toLocaleString() || '0'}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          {Number(row.total_funds_kes).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          {/* 🎨 DYNAMIC RE-ENGINEERED ENUM STATUS BADGES */}
                          <span className={`inline-flex text-[9px] border px-2 py-0.5 rounded font-black tracking-wide uppercase ${
                            isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            isReturned ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isApproved ? 'Approved & Locked' : isReturned ? 'Action Needed' : isPending ? 'Vicar Pending' : status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {/* 🚀 OPERATIONAL WORKFLOW INTERACTION DRAWER PORTAL BUTTON */}
                          {!isApproved ? (
                            <button
                              onClick={() => setSelectedParishLog(row)}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-black text-[9px] rounded-lg tracking-wider uppercase transition-all shadow-xs"
                            >
                              Audit Record
                            </button>
                          ) : (
   
                            <span className="text-[10px] text-slate-400 font-bold italic">Verification Closed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 📋 REGIONAL COMPLIANCE CHECKLIST DESK */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-amber-700">
              <ShieldCheck className="w-4 h-4" /> Regional Compliance Checklist
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Strategic inspection targets managed by the Archdeacon</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">M&E Target Lock Status</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">
                ACTIVE MONITORING
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Archdeacons monitor sub-tier tracking entries and issue formal modification notifications directly back into the Parish review workspace queues when discrepancies appear.
            </p>
          </div>

          {/* CHECKLIST ITEMS MATRIX */}
          <div className="space-y-3 pt-1 text-xs font-bold text-slate-600">
            <label className="flex items-center gap-2.5 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 accent-purple-700" />
              <span>Audit Weekly Parish Attendance Ledgers</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 accent-purple-700" />
              <span>Verify M-Pesa Revenue Integrity Streams</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded text-purple-700 focus:ring-purple-500 accent-purple-700" />
              <span>Monitor Strategic Plan Flagship Local Budgets</span>
            </label>
          </div>
          
          <button 
            onClick={() => window.print()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] tracking-wider py-3 rounded-xl uppercase flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Compliance Briefing
          </button>
        </div>
      </div>

      {/* 🏛️ REGIONAL OVERSIGHT MODAL: EXECUTING SECTION 8 INTERVENTION OVERRIDES */}
      {selectedParishLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setSelectedParishLog(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-purple-800">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Regional Compliance Correction Request
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Target: {selectedParishLog.parish_name} ({selectedParishLog.last_submission_period})
              </p>
            </div>

            <form onSubmit={handleRequestModification} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">
                  Mandatory Audit Correction Reason Code
                </label>
                <textarea
                  required
                  rows={4}
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none resize-none pt-1"
                  placeholder="State the data discrepancies or budget variances clearly. This message triggers a status rollback in the target Parish..."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedParishLog(null)}
                  className="w-1/3 border border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wider py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 flex items-center justify-center gap-1.5"
                >
                  {submittingCorrection ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Issue Rollback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
