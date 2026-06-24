import React from 'react';
import { Landmark, TrendingUp, Users, LogOut } from 'lucide-react';

export const DirectorDashboard = ({ shopId, user, onLogout }: any) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Director Executive Matrix</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Multi-Tenant Tenant ID: {shopId}</p>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-slate-400 hover:text-red-400 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition-all">
          <LogOut size={14} /> Close Session
        </button>
      </header>
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800"><Landmark className="text-emerald-400 mb-3" /> <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Platform Financial Aggregates</h3> <p className="text-2xl font-black mt-2">KES --,--</p></div>
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800"><Users className="text-blue-400 mb-3" /> <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Total Interconnected Enrollment</h3> <p className="text-2xl font-black mt-2">-- Students</p></div>
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800"><TrendingUp className="text-purple-400 mb-3" /> <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400">Audit Trails & Overhead Logs</h3> <p className="text-2xl font-black mt-2">Stable</p></div>
      </main>
    </div>
  );
};
