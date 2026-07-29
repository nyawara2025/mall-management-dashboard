import React, { useState, useEffect } from 'react';
import { 
  Globe, RefreshCw, LogOut, Users, DollarSign, Landmark, 
  TrendingUp, BarChart3, ShieldCheck, FileSpreadsheet, X 
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
}

interface ArchdeaconryDashboardProps {
  session: {
    name: string;
    role: string;
    assigned_id: number;
  };
  onLogout: () => void;
}

export const ArchdeaconryDashboard: React.FC<ArchdeaconryDashboardProps> = ({ session, onLogout }) => {
  // 📊 Local Operational State Management
  const [metrics, setMetrics] = useState<ArchdeaconryMetrics | null>(null);
  const [parishPerformances, setParishPerformances] = useState<ParishPerformanceRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Consolidated Archdeaconry Data Fetcher Engine
  const fetchArchdeaconryData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-archdeaconry-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
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
  }, [session.assigned_id]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-12">
      {/* 👑 REGIONAL ARCHDEACONRY TOP BAR */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-800 rounded-xl flex items-center justify-center text-white shadow-md">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Archdeaconry Regional Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {session.name} • <span className="text-purple-700">{session.role} Workspace Panel</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={fetchArchdeaconryData}
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

      {/* 📊 SUMMARY REGIONAL METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-purple-700 bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Archdeaconry Attendance</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.total_attendance?.toLocaleString() || '0'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Consolidated Capital Stream</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5 font-mono">
            KES {metrics?.total_regional_funds_kes?.toLocaleString() || '0.00'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Supervised Parishes</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.active_parishes_count || '0'} Jurisdictions
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-amber-700 bg-amber-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">M&E Verification Audit</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.regional_compliance_rate || '0'}% Compliance
          </span>
        </div>
      </div>

      {/* 🎛️ CORE SUPERVISORY PERFORMANCE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📊 CONSOLIDATED PARISH PERFORMANCE RATINGS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-purple-700">
                <BarChart3 className="w-4 h-4" /> Parish Performance Ledger Matrix
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Aggregated operational telemetry pulled directly across constituent local boards</p>
            </div>
          </div>

          {parishPerformances.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">
              No parish operational matrix updates transmitted under this regional jurisdiction checkpoint.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-3">Parish Name</th>
                    <th className="p-3 text-right">Attendance Roll</th>
                    <th className="p-3 text-right">Total Finance (KES)</th>
                    <th className="p-3 text-center">Last Submission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {parishPerformances.map((parish) => (
                    <tr key={parish.parish_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 uppercase text-[11px]">{parish.parish_name}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700">{parish.total_attendance_rollup?.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{parish.total_funds_kes?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-center font-mono text-[10px] text-slate-400">{parish.last_submission_period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🛡️ ARCHDEACONRY STRATEGIC CONTROL CHECKLIST CARD */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-amber-700">
              <ShieldCheck className="w-4 h-4" /> Regional Compliance Checklist
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Strategic inspection targets managed by the Archdeacon</p>
          </div>

          <ul className="space-y-3 text-[11px] text-slate-600 font-semibold">
            {[
              { label: 'Audit Weekly Parish Attendance Ledgers', checked: true },
              { label: 'Verify M-Pesa Revenue Pipeline Stream Integrity', checked: true },
              { label: 'Monitor Strategic Plan Flagship Local Budgets', checked: false },
              { label: 'Conduct Bi-Annual Clergy Compliance Checks', checked: false },
              { label: 'Authorize Combined Development Capital Fund Transfers', checked: false }
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 border border-slate-50 rounded-xl bg-slate-50/50">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  readOnly 
                  className="mt-0.5 rounded text-purple-700 focus:ring-purple-500 w-3.5 h-3.5 pointer-events-none" 
                />
                <span className={item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
