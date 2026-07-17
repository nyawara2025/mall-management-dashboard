import React, { useState, useEffect } from 'react';
import { 
  Landmark, TrendingUp, Users, LogOut, ShieldAlert, 
  CalendarDays, BookOpen, ChevronRight, LayoutDashboard, 
  Briefcase, ShieldCheck, RefreshCw 
} from 'lucide-react';

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

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

  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeData, setFinanceData] = useState<any>({
    summary: { totalCollected: 0, netOutstanding: 0 },
    paymentMethods: [],
    termTrends: []
  });

  // --- ACADEMICS MODAL STATE ENGINE ---
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [classList, setClassList] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentList, setStudentList] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  // Analytics payload returned via n8n
  const [analytics, setAnalytics] = useState<{
    currentGrades: any[];
    historyTrend: any[];
    multiTierComparison: any[];
  }>({
    currentGrades: [],
    historyTrend: [],
    multiTierComparison: []
  });

  const fetchFinancialAnalytics = async () => {
    setFinanceLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/edu-director-academic-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, action: 'get_financial_analytics' })
      });
      if (response.ok) {
        const data = await response.json();
        setFinanceData({
          summary: data.summary || { totalCollected: 0, netOutstanding: 0 },
          paymentMethods: data.paymentMethods || [],
          termTrends: data.termTrends || []
        });
      }
    } catch (e) {
      console.error("Finance metrics parsing breakdown:", e);
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'finance') {
      fetchFinancialAnalytics();
    }
  }, [activeTab]);

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

  // --- N8N API INTELLIGENCE PIPELINE FOR ACADEMICS ---
  const callAcademicsWebhook = async (action: 'get_classes' | 'get_students' | 'get_analytics', payload: any) => {
    setAcademicLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/edu-director-academic-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, action, ...payload })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Academics API failed on action ${action}:`, e);
    } finally {
      setAcademicLoading(false);
    }
    return null;
  };

  // Open modal and fetch context list
  const handleOpenAcademics = async () => {
    setIsAcademicModalOpen(true);
    const data = await callAcademicsWebhook('get_classes', {});
    if (data && data.classes) {
      setClassList(data.classes);
    }
  };

  // Trigger when class changes
  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    setAnalytics({ currentGrades: [], historyTrend: [], multiTierComparison: [] });
    if (!classId) return;

    const data = await callAcademicsWebhook('get_students', { class_id: classId });
    if (data && data.students) {
      // Expecting array sorted alphabetically from database
      setStudentList(data.students);
    }
  };

  // Trigger when individual student is selected
  const handleStudentChange = async (studentId: string) => {
    setSelectedStudent(studentId);
    if (!studentId) return;

    const data = await callAcademicsWebhook('get_analytics', { student_id: studentId, class_id: selectedClass });
    if (data) {
      setAnalytics({
        currentGrades: data.current_grades || [],
        historyTrend: data.history_trend || [],
        multiTierComparison: data.multi_tier_comparison || []
      });
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
            <button 
              onClick={() => { setActiveTab('academics'); handleOpenAcademics(); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'academics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/60'}`}
            >
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

            {/* Imminent Board Meetings & Campus Security Briefs Mini-Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Imminent Board Meetings</h3>
                  <button onClick={() => setActiveTab('meetings')} className="text-[10px] text-blue-500 font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {metrics.meetings.length > 0 ? metrics.meetings.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-white">{m.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{m.date}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  )) : (
                    <p className="text-xs text-slate-600 font-medium py-2">No upcoming governance sessions scheduled.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Campus Security Briefs</h3>
                  <button onClick={() => setActiveTab('security')} className="text-[10px] text-yellow-500 font-bold hover:underline">Surveillance</button>
                </div>
                <div className="space-y-3">
                  {metrics.securityIncidents.length > 0 ? metrics.securityIncidents.map((s: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <ShieldAlert size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{s.event}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{s.timestamp} — Severity: {s.severity}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-600 font-medium py-2">All parameters reporting secure operational statuses.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACADEMIC AUDITS CONTENT CONTAINER */}
        {activeTab === 'academics' && isAcademicModalOpen && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Quick Context Panel Filter */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Structure / Stream</label>
                <select 
                  value={selectedClass} 
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Target Class --</option>
                  {classList.map((c: any) => (
                    <option key={c.id} value={c.class_name || c.id}>
                      Grade {c.class_name || `${c.grade}${c.stream}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Directory (Alphabetical)</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => handleStudentChange(e.target.value)}
                  disabled={!selectedClass || academicLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-40"
                >
                  <option value="">-- Choose Student Record --</option>
                  {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.last_name}, {s.first_name}</option>)}
                </select>
              </div>
            </div>

            {/* Dynamic Loading Indicator */}
            {academicLoading && (
              <div className="w-full flex items-center justify-center p-12 text-slate-500 gap-2 text-xs font-bold">
                <RefreshCw size={14} className="animate-spin text-blue-500" /> Compiling Student Matrices...
              </div>
            )}

            {/* Visual Analytics Block */}
            {!academicLoading && selectedStudent && (
              <div className="space-y-6">
                
                {/* 1. Metric Indicators: Current Grades */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Active Assessment Grades</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {analytics.currentGrades.map((g: any, i: number) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase truncate">{g.subject}</p>
                        <p className="text-xl font-black text-blue-400 mt-1">{g.score}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Visual Graphs Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Performance History Trend Over Time */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">Performance Vector History (Over Time)</h4>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.historyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="average" stroke="#60a5fa" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Multi-Tier Performance Comparison Stack (Student vs Class vs School) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">Multi-Tier Operational Audit (Subject Averages)</h4>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.multiTierComparison}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="subject" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                          <Bar dataKey="student_score" name="Student" fill="#2563eb" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="class_avg" name="Class Avg" fill="#9333ea" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="school_avg" name="School Avg" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
               </div>
             )}

             {/* VIEW 3: FINANCIAL OPERATIONS CONTROL CENTER */}
             {(activeTab as string) === 'finance' && (
               <div className="space-y-6 animate-in fade-in duration-300">
            
                 {financeLoading ? (
                   <div className="w-full flex items-center justify-center p-12 text-slate-500 gap-2 text-xs font-bold">
                     <RefreshCw size={14} className="animate-spin text-blue-500" /> Computing Ledger Statements...
                   </div>
                 ) : (
                   <>
                     {/* Metric Cards Summary */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                         <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">Gross Fee Cash Realized</span>
                         <span className="text-xl font-black text-emerald-400 block mt-1">KES {(financeData?.summary?.totalCollected || 0).toLocaleString()}</span>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                         <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">Net Outstanding Arrears Balance</span>
                         <span className="text-xl font-black text-red-400 block mt-1">KES {(financeData?.summary?.netOutstanding || 0).toLocaleString()}</span>
                       </div>
                     </div>

                     {/* Visual Charts Allocation Matrix */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                       {/* Term over Term Capital Flow Trend Line */}
                       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                         <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">Term-Over-Term Billing vs Collections Inflows</h4>
                         <div className="h-60">
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={financeData?.termTrends || []}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis dataKey="term" stroke="#64748b" fontSize={10} tickLine={false} />
                               <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                               <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                               <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                               <Bar dataKey="Invoiced" name="Billed Amount" fill="#9333ea" radius={[4, 4, 0, 0]} />
                               <Bar dataKey="Collected" name="Collected Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                             </BarChart>
                           </ResponsiveContainer>
                         </div>
                       </div>

                       {/* Revenue Breakdown Channels Column Grid */}
                       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                         <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-4">Payment Method Breakdown (Realized Revenue)</h4>
                         <div className="h-60">
                           <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={financeData?.paymentMethods || []} layout="vertical">
                               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                               <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                               <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} />
                               <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                               <Bar dataKey="value" name="Amount Realized" fill="#2563eb" radius={[0, 4, 4, 0]} />
                             </BarChart>
                           </ResponsiveContainer>
                         </div>
                       </div>

                     </div>
                   </>
                 )}
               </div>
             )}

             {activeTab === 'academics' && !selectedStudent && !academicLoading && (
              <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs font-semibold">
                Select parameters above to parse individual evaluation charts.
              </div>
            )}

          </div>
        )}  

      </main>
    </div>
  );
};
