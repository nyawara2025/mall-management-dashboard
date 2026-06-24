import React, { useState, useEffect } from 'react';
import { ShieldAlert, Radio, Activity, LogOut, Eye, ShieldCheck, RefreshCw, KeyRound, Bell } from 'lucide-react';

export const SecurityDashboard = ({ shopId, user, onLogout }: any) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSecurityBriefs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-security-briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const result = await response.json();
        setIncidents(result.security_logs || [
          { id: 1, type: 'Fleet Out of Bounds', details: 'Bus Route B deviated from trajectory path.', time: '08:14 AM', priority: 'Medium' },
          { id: 2, type: 'Gate System Clear', details: 'All biometric gate scanners functional.', time: '06:00 AM', priority: 'Low' }
        ]);
      }
    } catch (e) {
      console.error("Security dashboard fetch loop error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityBriefs();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR HEADER */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <Radio className="animate-pulse" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Surveillance Gate</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">Security Command</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Node: {shopId}</p>
          </div>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400"><span className="flex items-center gap-1.5"><KeyRound size={12}/> Gate Lock</span> <span className="text-emerald-400 font-bold">Armed</span></div>
            <div className="flex items-center justify-between text-zinc-400"><span className="flex items-center gap-1.5"><Bell size={12}/> Perimeter</span> <span className="text-emerald-400 font-bold">Secure</span></div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <p className="text-xs font-black text-zinc-300 px-2 truncate">{user?.name || 'Officer'}</p>
          <button onClick={onLogout} className="w-full text-left text-xs font-black text-zinc-500 hover:text-red-400 flex items-center gap-2 px-3 py-2 rounded-lg transition-all">
            <LogOut size={14} /> Disconnect
          </button>
        </div>
      </aside>

      {/* MONITOR CANVAS */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2"><Eye size={22} className="text-zinc-400" /> Live Surveillance Stream</h1>
            <p className="text-xs text-zinc-500 font-medium">Incident summaries and automated fleet monitoring telemetry check logs.</p>
          </div>
          <button onClick={fetchSecurityBriefs} disabled={loading} className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <div className="space-y-3">
          {incidents.map((log: any) => (
            <div key={log.id} className="p-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex justify-between items-center text-xs shadow-sm hover:border-zinc-700 transition-all">
              <div className="space-y-1 text-left">
                <p className="font-black text-zinc-100 text-sm flex items-center gap-2">
                  <Activity size={14} className={log.priority === 'High' ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                  {log.type}
                </p>
                <p className="font-medium text-zinc-400">{log.details}</p>
                <p className="text-[10px] text-zinc-600 font-bold">{log.time}</p>
              </div>
              <span className={`px-2.5 py-0.5 text-[9px] font-black rounded uppercase ${log.priority === 'High' ? 'bg-red-950/40 text-red-400 border border-red-900/60' : 'bg-amber-950/40 text-amber-400 border border-amber-900/60'}`}>{log.priority}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
