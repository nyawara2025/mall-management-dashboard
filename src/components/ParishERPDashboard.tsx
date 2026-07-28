import React from 'react';
import { Layers, LogOut } from 'lucide-react';

export const ParishERPDashboard: React.FC<any> = ({ session, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-blue-700" />
          <h2 className="text-sm font-black uppercase tracking-tight">Parish Consolidated ERP: {session.name}</h2>
        </div>
        <button onClick={onLogout} className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>
      <main className="mt-6 text-center text-xs text-slate-400 font-medium py-12 border border-dashed rounded-xl bg-white">
        Parish Data Aggregation & Finance Ledgers Loading...
      </main>
    </div>
  );
};
