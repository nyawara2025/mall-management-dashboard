import React from 'react';
import { Award, GraduationCap, Calendar, LogOut } from 'lucide-react';

export const PrincipalDashboard = ({ shopId, user, onLogout }: any) => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Principal Console</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Academic Operations • Shop {shopId}</p>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all">
          <LogOut size={14} /> Logout
        </button>
      </header>
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><GraduationCap className="text-indigo-600 mb-3" /> <h3 className="font-bold text-slate-800 text-sm">Faculty Assignment Matrix</h3></div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><Calendar className="text-orange-500 mb-3" /> <h3 className="font-bold text-slate-800 text-sm">Curriculum Calendars & Timetables</h3></div>
      </main>
    </div>
  );
};
