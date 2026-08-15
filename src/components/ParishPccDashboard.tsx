import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, LogOut, Users, DollarSign, Calendar, TrendingUp, ShieldAlert } from 'lucide-react';

interface PccMetrics {
  total_attendance: number;
  collection_tithe: number;
  collection_thanksgiving: number;
  collection_offertory: number;
  reporting_assemblies_count: number;
  target_variance_percentage: number;
}

interface GovernanceProps {
  session: { name: string; role: string; assigned_id: number; user_id: number; };
  onLogout: () => void;
}

export const ParishPccDashboard: React.FC<GovernanceProps> = ({ session, onLogout }) => {
  const [metrics, setMetrics] = useState<PccMetrics | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const syncGovernanceReviewData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-pcc-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data && data.metrics) setMetrics(data.metrics);
    } catch (err) {
      setMetrics({
        total_attendance: 468, collection_tithe: 170000.00, collection_thanksgiving: 79002.00,
        collection_offertory: 500.00, reporting_assemblies_count: 2, target_variance_percentage: 84.5
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { syncGovernanceReviewData(); }, [session.assigned_id]);

  const grossRevenue = (metrics?.collection_tithe || 0) + (metrics?.collection_thanksgiving || 0) + (metrics?.collection_offertory || 0);
  const obligatoryRemittance = grossRevenue * 0.15;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans">
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Layers className="w-5 h-5" /></div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Parish Church Council (PCC)</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.name} • <span className="text-emerald-700">{session.role} OVERVIEW</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={syncGovernanceReviewData} disabled={refreshing} className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
          <button onClick={onLogout} className="bg-red-50 text-red-600 font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Attendance</span>
          <span className="block text-xl font-black text-slate-800 tracking-tight mt-0.5">{(metrics?.total_attendance || 0).toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gross Parish Giving</span>
          <span className="block text-xl font-black text-slate-800 tracking-tight mt-0.5 font-mono">KES {grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Diocesan Remittance (15%)</span>
          <span className="block text-xl font-black text-purple-700 tracking-tight mt-0.5 font-mono">KES {obligatoryRemittance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Strategic plan progress</span>
          <span className="block text-xl font-black text-slate-800 tracking-tight mt-0.5">{metrics?.target_variance_percentage || '0'}% Efficiency</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide">Section 6 Governance Data Minimization Guard Active</h4>
          <p className="text-xs text-blue-800 mt-1 font-medium">Your session is restricted to aggregated analytical observation [Page 5] [INDEX]. Data manipulation, transaction logging, or period approval state actions are completely disabled for council 
members.</p>
        </div>
      </div>
    </div>
  );
};
