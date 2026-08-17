import React, { useState } from 'react';
import { Terminal, RefreshCw, LogOut, Cpu, Wifi, Activity } from 'lucide-react';

interface IctAdminProps {
  session: { user_id: number; name: string; role: string; assigned_id: number; organization_name: string };
  onLogout: () => void;
}

export const ArchdeaconryIctDashboard: React.FC<IctAdminProps> = ({ session, onLogout }) => {
  const [pinging, setPinging] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 font-mono selection:bg-blue-500">
      {/* 👑 ICT TERMINAL HEADER PANEL */}
      <header className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md"><Terminal className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xs font-black text-blue-400 uppercase tracking-widest">{session.organization_name.toUpperCase()} INFRASTRUCTURE</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{session.name.toUpperCase()} • {session.role.replace('_', ' ')} CORE NODE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPinging(!pinging)} className="p-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-400 hover:text-blue-400"><RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} /></button>
          <button onClick={onLogout} className="bg-red-950/40 border border-red-900/40 text-red-400 font-black text-[9px] tracking-widest px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Kill Session</button>
        </div>
      </header>

      {/* SYSTEM TELEMETRY BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Regional Cluster Status</span>
            <span className="text-xs font-black text-emerald-400 mt-1 block uppercase">ONLINE // SECURE</span>
          </div>
          <Wifi className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Database Health Score</span>
            <span className="text-xs font-black text-blue-400 mt-1 block font-mono">99.98% UPTIME</span>
          </div>
          <Cpu className="w-5 h-5 text-blue-500" />
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Staged Batch Logs</span>
            <span className="text-xs font-black text-slate-300 mt-1 block font-mono">0 QUEUED BATCHES</span>
          </div>
          <Activity className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {/* REAL-TIME SIMULATED CONSOLE LOG STREAM */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-inner min-h-[160px] text-[10px] text-slate-400 space-y-1">
        <p className="text-slate-600">// ACK DIOCESAN SYSTEM AUDIT CORE ENGINE VERSION 1.0.0</p>
        <p className="text-emerald-500">[OK] Established clean serverless hand-shake with n8n instance at ://tenear.com</p>
        <p className="text-blue-500">[INFO] Synced cluster profile metadata claims for Tier 3 entity node token: {session.assigned_id}</p>
        <p className="text-slate-500">[SYS] Awaiting live transaction callbacks from constituent parishes...</p>
      </div>
    </div>
  );
};
