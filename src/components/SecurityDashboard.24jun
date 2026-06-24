import React from 'react';
import { ShieldAlert, Radio, Activity, LogOut } from 'lucide-react';

export const SecurityDashboard = ({ shopId, user, onLogout }: any) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-black tracking-tight text-red-500 flex items-center gap-2"><Radio className="animate-pulse" size={18} /> Central Security Command</h1>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">Tenant Node Security Access: {shopId}</p>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-zinc-400 hover:text-red-400 flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 transition-all">
          <LogOut size={14} /> Disconnect
        </button>
      </header>
      <main className="max-w-6xl mx-auto grid grid-cols-1 gap-6">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-800 p-3 rounded-xl text-amber-500"><ShieldAlert /></div>
            <div>
              <h4 className="font-bold text-sm">Transit Fleet Telemetry Radar</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Monitoring live vehicle GPS sensor streams...</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900 text-[10px] font-bold rounded-md uppercase tracking-wider">Operational</span>
        </div>
      </main>
    </div>
  );
};
