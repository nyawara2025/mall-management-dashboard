import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Target, LogOut, Loader2 } from 'lucide-react';

interface MeDashboardProps {
  session: { user_id: number; name: string; role: string; assigned_id: number; organization_name: string };
  onLogout: () => void;
}

interface PillarKPI {
  id: number;
  pillar_name: string;
  kpi_description: string;
  baseline: number;
  target_2026: number;
  current_actual: number;
  reporting_nodes_count: number;
}

export const ArchdeaconryMeDashboard: React.FC<MeDashboardProps> = ({ session, onLogout }) => {
  const [syncing, setSyncing] = useState(false);
  const [kpiMatrix, setKpiMatrix] = useState<PillarKPI[]>([]);

  const fetchStrategicMetrics = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archdeaconry_id: session.assigned_id, user_id: session.user_id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKpiMatrix(data.kpis || []);
      }
    } catch (err) {
      console.error("M&E metric engine synchronization exception:", err);
      // Fallback state matches generic hierarchy arrays, NO hardcoded parish names
      setKpiMatrix([
        { id: 101, pillar_name: "STRATEGIC PILLAR 01", kpi_description: "QUANTITATIVE KPI METRIC TRACKER A", baseline: 0, target_2026: 100, current_actual: 0, reporting_nodes_count: 0 },
        { id: 102, pillar_name: "STRATEGIC PILLAR 02", kpi_description: "QUANTITATIVE KPI METRIC TRACKER B", baseline: 0, target_2026: 100, current_actual: 0, reporting_nodes_count: 0 }
      ]);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchStrategicMetrics(); }, [session.assigned_id]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900">
      <header className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center text-white shadow-md"><BarChart3 className="w-5 h-5" /></div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">{session.organization_name.toUpperCase()}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.name.toUpperCase()} • <span className="text-blue-800">{session.role.replace('_', ' ')} PORTAL</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStrategicMetrics} disabled={syncing} className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="bg-red-50 border border-red-200 text-red-600 font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
        </div>
      </header>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-800">Strategic Result Monitoring Framework</h3>
            <p className="text-[10px] text-slate-400 font-medium">Evaluation across assigned constituent nodes.</p>
          </div>
          <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1"><Target className="w-3 h-3" /> M&E Active</span>
        </div>

        <div className="space-y-4">
          {kpiMatrix.length === 0 ? (
            <div className="text-center py-8 text-xs font-medium text-slate-400">Awaiting data initialization stream...</div>
          ) : (
            kpiMatrix.map((kpi) => {
              const progressPct = kpi.target_2026 > 0 ? Math.min(100, Math.round((kpi.current_actual / kpi.target_2026) * 100)) : 0;
              return (
                <div key={kpi.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div>
                      <span className="bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide">{kpi.pillar_name}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 leading-tight">{kpi.kpi_description}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-right text-[11px] font-bold text-slate-500">
                      <div><span className="block text-[8px] text-slate-400 font-black uppercase">Baseline</span><span className="font-mono">{kpi.baseline}</span></div>
                      <div><span className="block text-[8px] text-slate-400 font-black uppercase">Target</span><span className="font-mono text-blue-600">{kpi.target_2026}</span></div>
                      <div><span className="block text-[8px] text-slate-400 font-black uppercase">Actual</span><span className="font-mono text-emerald-600">{kpi.current_actual}</span></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-blue-600 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Node Target Progress</span>
                      <span className="text-blue-700 font-black">{progressPct}% Met ({kpi.reporting_nodes_count} Nodes)</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
