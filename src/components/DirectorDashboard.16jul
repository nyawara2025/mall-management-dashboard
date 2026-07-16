import React, { useState, useEffect } from 'react';
import { 
  Landmark, TrendingUp, Users, LogOut, ShieldAlert, 
  CalendarDays, BookOpen, ChevronRight, LayoutDashboard, 
  Briefcase, ShieldCheck, RefreshCw 
} from 'lucide-react';

export const DirectorDashboard = ({ shopId, user, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'academics' | 'meetings' | 'security'>('overview');
  const [metrics, setMetrics] = useState<any>({
    totalCollections: 0,
    outstandingFees: 0,
    studentCount: 0,
    activeStaff: 0,
    meetings: [],
    securityIncidents: []
  });
  const [loading, setLoading] = useState(false);

  const fetchDirectorInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-director-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics({
          totalCollections: Number(data.total_collections),
          outstandingFees: Number(data.outstanding_fees),
          studentCount: Number(data.student_count),
          activeStaff: Number(data.staff_count),
          meetings: data.meetings || [],
          securityIncidents: data.security_logs || []
        });
      }
   

    } catch (e) {
      console.error("Director data retrieval error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectorInsights();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* 🧭 SIDEBAR NAVIGATION MODULE */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Briefcase size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">TeNEAR Boardroom</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">Executive Suite</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Tenant Shop ID: {shopId}</p>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <LayoutDashboard size={16} /> Matrix Overview
            </button>
            <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <Landmark size={16} /> Financial Operations
            </button>
            <button onClick={() => setActiveTab('academics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'academics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <BookOpen size={16} /> Academic Audits
            </button>
            <button onClick={() => setActiveTab('meetings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'meetings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <CalendarDays size={16} /> Governance Meetings
            </button>
            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <ShieldAlert size={16} /> Security Briefs
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">Dir</div>
            <div className="text-left">
              <p className="text-xs font-black text-white truncate max-w-[140px]">{user?.name || 'School Director'}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Board Member</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-left text-xs font-black text-slate-400 hover:text-red-400 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-950/20 transition-all">
            <LogOut size={14} /> End Admin Session
          </button>
        </div>
      </aside>

      {/* 📊 CANVAS MAIN EXECUTIVE AREA */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight capitalize">
              {activeTab === 'overview' ? 'Director Workspace Matrix' : `${activeTab} Control Center`}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Real-time centralized parameters across the institution environment.</p>
          </div>
          <button onClick={fetchDirectorInsights} disabled={loading} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* VIEW 1: MATRIX OVERVIEW LAYOUT */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Quick Summary Aggregates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider">Gross Fee Revenue Remitted</span>
                <span className="text-xl font-black text-emerald-400 block mt-1">KES {metrics.totalCollections.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider">Outstanding Accounts Deficit</span>
                <span className="text-xl font-black text-red-400 block mt-1">KES {metrics.outstandingFees.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider">Unified Enrollment</span>
                <span className="text-xl font-black text-blue-400 block mt-1">{metrics.studentCount} Active Students</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
                <span className="text-[9px] font-black text-slate-500 block uppercase tracking-wider">Faculty & Payroll Staff</span>
                <span className="text-xl font-black text-purple-400 block mt-1">{metrics.activeStaff} Assigned Users</span>
              </div>
            </div>

            {/* Section Breakdown Mini Matrix Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box A: Board Meetings */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarDays className="text-blue-500" size={16} /> Imminent Board Meetings
                  </h4>
                  <button type="button" onClick={() => setActiveTab('meetings')} className="text-[10px] text-blue-400 font-bold hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {metrics.meetings.slice(0, 2).map((m: any) => (
                    <div key={m.id} className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{m.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{m.date} • {m.time}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Box B: Security Surviellance Logs */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="text-amber-500" size={16} /> Campus Security Briefs
                  </h4>
                  <button type="button" onClick={() => setActiveTab('security')} className="text-[10px] text-amber-400 font-bold hover:underline">
                    Surveillance
                  </button>
                </div>
                <div className="space-y-2">
                  {metrics.securityIncidents.slice(0, 2).map((s: any) => (
                    <div key={s.id} className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{s.type}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{s.details}</p>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${s.priority === 'High' ? 'bg-red-950 border border-red-800 text-red-400' : 'bg-amber-950 border border-amber-800 text-amber-400'}`}>
                        {s.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: FINANCIAL OPERATIONS TAB */}
        {activeTab === 'finance' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-black text-white text-base">Ledger Accounting Accounts Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated multi-tenant ledger positions.</p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Landmark size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Liquidity Capital Assets Allocation</span>
                <span className="text-2xl font-black text-white">KES {metrics.totalCollections.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">Financial updates sync with active term fee transaction lines automatically.</p>
          </div>
        )}

        {/* VIEW 3: ACADEMIC AUDITS TAB */}
        {activeTab === 'academics' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="font-black text-white text-base">Academic Audit Metrics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Faculty workflows, term performance matrices, and classroom tracking records.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-xl text-left">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Student Base Count</span>
                <p className="text-lg font-black mt-1 text-slate-200">{metrics.studentCount} Profiles</p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-xl text-left">
                <span className="text-[10px] font-black text-slate-500 block uppercase">Faculty Load Capacity</span>
                <p className="text-lg font-black mt-1 text-slate-200">{metrics.activeStaff} Assigned Lecturers</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: GOVERNANCE MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="font-black text-white text-base">Governance Meeting Planner</h3>
              <p className="text-xs text-slate-500 mt-0.5">Scheduled Board of Management and stakeholder consultation assemblies.</p>
            </div>
            <div className="space-y-3">
              {metrics.meetings.map((m: any) => (
                <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-black text-white text-sm">{m.title}</p>
                    <p className="font-medium text-slate-400">{m.date} at {m.time}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-black rounded uppercase bg-blue-950 text-blue-400 border border-blue-900">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: SECURITY BRIEFS TAB */}
        {activeTab === 'security' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base">Security Command Logs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time automated incident summaries, fleet telemetry checks, and gate status logs.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-[10px] font-black uppercase rounded flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin" /> Secure
              </div>
            </div>
            <div className="space-y-2">
              {metrics.securityIncidents.map((s: any) => (
                <div key={s.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-black text-slate-200">{s.type}</p>
                    <p className="font-medium text-slate-400">{s.details}</p>
                    <p className="text-[9px] text-slate-500 font-bold">{s.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${s.priority === 'High' ? 'bg-red-950/50 text-red-400 border border-red-900' : 'bg-amber-950/50 text-amber-400 border border-amber-900'}`}>
                    {s.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
