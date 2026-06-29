import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, Users, LogOut, ClipboardCheck, 
  BookOpen, Clock, Award, RefreshCw, UserCheck, ShieldCheck, ScrollText
} from 'lucide-react';

export const PrincipalDashboard = ({ shopId, user, onLogout }: any) => {
  // 1. EXTENDED TAB STATES: Added 'reports' view tracker
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'curriculum' | 'reports'>('overview');
  const [data, setData] = useState<any>({
    attendanceRate: '0%',
    activeClasses: 0,
    facultyCount: 0,
    lessonLogs: [],
    timetableAlerts: [],
    // Dynamic Storage Buckets for activated modules
    facultyList: [],
    curriculumList: [],
    performanceReports: []
  });
  const [loading, setLoading] = useState(false);

  const fetchPrincipalAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-principal-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const resData = await response.json();
        setData({
          attendanceRate: resData.attendance_rate || '94.2%',
          activeClasses: resData.classes_count || 12,
          facultyCount: resData.faculty_count || 18,
          lessonLogs: resData.lessons || [
            { id: 1, teacher: 'Mrs. Caroline', subject: 'Mathematics', class: 'Grade 4 East', status: 'Completed' },
            { id: 2, teacher: 'Mr. Omondi', subject: 'Science', class: 'Grade 5 West', status: 'In Progress' }
          ],
          timetableAlerts: resData.alerts || [],
          
          // Fallback Hydration for activated layout streams
          facultyList: resData.faculty || [
            { id: 101, name: 'Mr. John Omondi', role: 'Head of Science', status: 'Active', load: '24 Periods/Wk' },
            { id: 102, name: 'Mrs. Caroline Mutua', role: 'Mathematics Lead', status: 'Active', load: '22 Periods/Wk' },
            { id: 103, name: 'Ms. Jane Aden', role: 'Languages Instructor', status: 'On Leave', load: '0 Periods/Wk' }
          ],
          curriculumList: resData.curriculums || [
            { id: 201, grade: 'Grade 4 CBC', track: 'Primary School', status: 'Approved', compliance: '100%' },
            { id: 202, grade: 'Grade 5 CBC', track: 'Primary School', status: 'Pending Review', compliance: '85%' },
            { id: 203, grade: 'Grade 6 CBC', track: 'Junior Secondary', status: 'Approved', compliance: '95%' }
          ],
          performanceReports: resData.reports || [
            { id: 301, teacher: 'Mr. John Omondi', target_class: 'Grade 5 West', criteria: 'Term 1 Review', score: 'A-', date: '2026-06-25' },
            { id: 302, teacher: 'Mrs. Caroline Mutua', target_class: 'Grade 4 East', criteria: 'Academic Peer Evaluation', score: 'A+', date: '2026-06-28' }
          ]
        });
      }
    } catch (e) {
      console.error("Principal panel fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrincipalAnalytics();
  }, [shopId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col justify-between shadow-sm">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <GraduationCap size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Academic Admin</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900">Principal Portal</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Shop ID: {shopId}</p>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <ClipboardCheck size={16} /> Operations
            </button>
            <button onClick={() => setActiveTab('faculty')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Users size={16} /> Faculty Matrix
            </button>
            <button onClick={() => setActiveTab('curriculum')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <BookOpen size={16} /> Curriculums
            </button>
            {/* NEW NAVIGATION ITEM INJECTED FOR EVALUATION FORMS */}
            <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <ScrollText size={16} /> Performance Reports
            </button>
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 space-y-3">
          <p className="text-xs font-black text-slate-700 px-2 truncate">{user?.name || 'Principal'}</p>
          <button onClick={onLogout} className="w-full text-left text-xs font-black text-slate-400 hover:text-red-500 flex items-center gap-2 px-3 py-2 rounded-lg transition-all">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* WORKSPACE AREA */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab === 'reports' ? 'Performance Evaluation' : `${activeTab} Overview`}
            </h1>
            <p className="text-xs text-slate-400 font-medium">Academic scheduling control parameters.</p>
          </div>
          <button onClick={fetchPrincipalAnalytics} disabled={loading} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* TAB SUB-VIEW A: OPERATIONS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Attendance Rate</span>
                <span className="text-xl font-black text-indigo-600 block mt-1">{data.attendanceRate}</span>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Active Streams</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{data.activeClasses} Classrooms</span>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Assigned Faculty Staff</span>
                <span className="text-xl font-black text-slate-800 block mt-1">{data.facultyCount} Lecturers</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-3 flex items-center gap-2"><Clock size={14}/> Live Lesson Activity Tracker</h3>
              <div className="space-y-2">
                {data.lessonLogs.map((log: any) => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{log.subject} — {log.class}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.teacher}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB SUB-VIEW B: FACULTY MATRIX DEPLOYMENTS ACTIVATION */}
        {activeTab === 'faculty' && (
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4 text-left animate-in fade-in duration-150">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-3 flex items-center gap-2"><Users size={14}/> Staff Assignment Deployments</h3>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {data.facultyList.map((teacher: any) => (
                <div key={teacher.id} className="p-4 bg-white hover:bg-slate-50/50 flex justify-between items-center text-xs transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-800">{teacher.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{teacher.role}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{teacher.load}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${teacher.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                      {teacher.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB SUB-VIEW C: CURRICULUMS TRACKER SYLLABUSES ACTIVATION */}
        {activeTab === 'curriculum' && (
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4 text-left animate-in fade-in duration-150">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b pb-3 flex items-center gap-2"><BookOpen size={14}/> Academic Syllabus Matrix Alignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.curriculumList.map((cur: any) => (
                <div key={cur.id} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">{cur.track}</span>
                    <h4 className="font-black text-slate-800 text-sm mt-2">{cur.grade}</h4>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold border-t border-slate-200/60 pt-2.5">
                    <span className="text-slate-400 uppercase text-[9px]">Syllabus Coverage:</span>
                    <span className="text-indigo-600 font-black">{cur.compliance}</span>
                  </div>
                  <span className={`w-full block text-center py-1 rounded-lg text-[9px] font-black uppercase border ${cur.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {cur.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB SUB-VIEW D: NEW PERFORMANCE REPORTS PORTAL REVIEW CARD */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4 text-left animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><ScrollText size={14}/> Teacher Performance Assessment Forms</h3>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
                Pending Approval Records ({data.performanceReports.length})
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {data.performanceReports.map((report: any) => (
                <div key={report.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs hover:border-indigo-200 transition-colors">
                  <div className="space-y-1">
                    <p className="font-black text-slate-800 text-sm">{report.teacher}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Stream: <b className="text-slate-600">{report.target_class}</b></span>
                      <span>•</span>
                      <span>Target Scope: <b className="text-slate-600">{report.criteria}</b></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dated Review</p>
                      <p className="text-xs font-bold text-slate-600 mt-0.5">{report.date}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic text-sm shadow-md shadow-indigo-100">
                        {report.score}
                      </div>
                      <button 
                        type="button"
                        onClick={() => alert(`Opening complete file logs for ${report.teacher}`)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs"
                      >
                        Review Form
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
