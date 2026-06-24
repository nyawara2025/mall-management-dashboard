import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, Users, LogOut, ClipboardCheck, 
  BookOpen, Clock, Award, RefreshCw, UserCheck
} from 'lucide-react';

export const PrincipalDashboard = ({ shopId, user, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'curriculum'>('overview');
  const [data, setData] = useState<any>({
    attendanceRate: '0%',
    activeClasses: 0,
    facultyCount: 0,
    lessonLogs: [],
    timetableAlerts: []
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
          timetableAlerts: resData.alerts || [
            { id: 1, text: 'Grade 6 Science hall conflict resolved.', type: 'info' }
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab} Overview</h1>
            <p className="text-xs text-slate-400 font-medium">Academic scheduling control parameters.</p>
          </div>
          <button onClick={fetchPrincipalAnalytics} disabled={loading} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all shadow-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6">
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

        {activeTab === 'faculty' && <div className="p-8 bg-white border rounded-3xl shadow-sm text-center text-xs font-medium text-slate-400">Teacher registration deployment maps loading...</div>}
        {activeTab === 'curriculum' && <div className="p-8 bg-white border rounded-3xl shadow-sm text-center text-xs font-medium text-slate-400">Academic curriculum syllabuses configuration modules loading...</div>}
      </main>
    </div>
  );
};
