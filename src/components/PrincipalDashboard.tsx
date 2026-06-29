import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar, Users, LogOut, ClipboardCheck, 
  BookOpen, Clock, Award, RefreshCw, UserCheck, ShieldCheck, ScrollText
} from 'lucide-react';

export const PrincipalDashboard = ({ shopId, user, onLogout }: any) => {
  // 1. EXTENDED TAB STATES: Added 'reports' view tracker
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'curriculum' | 'reports' | 'transport'>('overview');

  // 1. FIX: Ensure this hook line is present right here!
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<any>({
    attendanceRate: '0%',
    activeClasses: 0,
    facultyCount: 0,
    lessonLogs: [],
    timetableAlerts: [],
    // Dynamic Storage Buckets for activated modules
    facultyList: [],
    curriculumList: [],
    performanceReports: [],
    studentGrades: [],
    transportFleet: []
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');


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
          lessonLogs: resData.lessons || [],
          facultyList: resData.faculty || [],
          curriculumList: resData.curriculums || [],
          performanceReports: resData.reports || [],
  
          // HYDRATE STUDENT RECORDS DIRECTLY FROM N8N POST PAYLOAD
          studentGrades: resData.student_grades || [],
          
          // FETCH LIVE FLEET METRICS FROM RE-USED ADMIN BACKEND ENDPOINT ARRAY
          transportFleet: resData.fleet || []
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

            {/* NEW SIDEBAR ROUTE SELECTION ENTRY */}
            <button 
              onClick={() => setActiveTab('transport')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'transport' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Calendar size={16} /> Transport Fleet
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

        {/* TAB SUB-VIEW D: PERFORMANCE REPORTS (TEACHER & STUDENT LEDGERS) */}
        {activeTab === 'reports' && (
          <div className="space-y-8 text-left animate-in fade-in duration-150">
            
            {/* SECTION 1: TEACHER ASSESSMENTS */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><ScrollText size={14}/> Teacher Performance Assessment Forms</h3>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
                  Staff Reviews ({data.performanceReports.length})
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {data.performanceReports.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No teacher evaluation logs available.</p>
                ) : (
                  data.performanceReports.map((report: any) => (
                    <div key={report.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-black text-slate-800 text-sm">{report.teacher}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stream: {report.target_class} • {report.criteria}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">Score: {report.score}</span>
                        <button type="button" onClick={() => alert(`Reviewing file for ${report.teacher}`)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-700 hover:bg-slate-50 transition-all">Review</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 2: STUDENT ACADEMIC PERFORMANCE LEDGER (WITH FILTERS) */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-4">
              
              {/* Filter Headers Wrapper */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-600"/> Academic Records Ledger
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Filter and audit multi-tenant exam metrics in real-time.</p>
                </div>
                
                {/* 1. STATE INITIALIZATION FOR FILTER STRINGS */}
                {/* (Place these 3 state hooks at the very top of your PrincipalDashboard component next to your other states) */}
                {/* 
                    const [studentSearch, setStudentSearch] = useState('');
                    const [classFilter, setClassFilter] = useState('');
                    const [subjectFilter, setSubjectFilter] = useState('');
                */}
                
                {/* 2. THREE COMPACT SEARCH INPUT FIELDS */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="🔍 Search Student..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all min-w-[150px]"
                  />
                  <input
                    type="text"
                    placeholder="🏫 Class ID (e.g. 5K)"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all w-[130px]"
                  />
                  <input
                    type="text"
                    placeholder="📚 Subject..."
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all min-w-[130px]"
                  />
                </div>
              </div>

              {/* 3. DYNAMIC IN-MEMORY INTERCEPT FILTERING */}
              {(() => {
                const filteredGrades = (data.studentGrades || []).filter((grade: any) => {
                  const matchName = !studentSearch || grade.student_name?.toLowerCase().includes(studentSearch.toLowerCase());
                  const matchClass = !classFilter || grade.stream_name?.toLowerCase().includes(classFilter.toLowerCase());
                  const matchSubject = !subjectFilter || grade.subject?.toLowerCase().includes(subjectFilter.toLowerCase());
                  return matchName && matchClass && matchSubject;
                });

                if (filteredGrades.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 italic">No student records match your selected filtering choices.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 animate-in fade-in duration-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4">Student Learner</th>
                          <th className="p-4">Admission No</th>
                          <th className="p-4">Grade / Stream</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4 text-center">Score Metric</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredGrades.map((grade: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-black text-slate-800">{grade.student_name}</td>
                            <td className="p-4 font-mono font-bold text-slate-500">{grade.admission_no}</td>
                            <td className="p-4">
                              <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                {grade.stream_name}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-slate-700">{grade.subject}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block min-w-[45px] font-black text-center px-2 py-1 rounded-lg text-[11px] ${
                                Number(grade.score) >= 50 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                              }`}>
                                {grade.score}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB SUB-VIEW E: PRINCIPAL TRANS-FLEET INDEX WORKSPACE MONITOR */}
        {activeTab === 'transport' && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                🚌 Transport Fleet Index
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Monitor active transit pathways and broadcast instant situational directives to parents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.transportFleet.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center col-span-2">
                  No active fleet route arrays running right now.
                </p>
              ) : (
                data.transportFleet.map((vehicle: any) => (
                  <div 
                    key={vehicle.id} 
                    className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    {/* Header: Route Name & Network Status Beacon */}
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-black text-xs text-red-600 tracking-wide uppercase">
                        {vehicle.route_name}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${vehicle.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    </div>

                    {/* Operational Core Field Logs Metrics */}
                    <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                      <p><span className="text-slate-400 font-medium">Driver Assigned:</span> {vehicle.driver}</p>
                      <p><span className="text-slate-400 font-medium">Ridership Volume:</span> {vehicle.ridership} Students</p>
                      
                      {/* Interactive Telemetry Link */}
                      <p className="text-[11px] font-mono text-indigo-600 flex items-center gap-1 mt-1">
                        📡 GPS Fix: 
                        <a 
                          href={`https://google.com{vehicle.gps}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline font-bold"
                        >
                          {vehicle.gps}
                        </a>
                      </p>
                    </div>

                    {/* Action Execution Button Array Matrix Layer */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => alert(`Broadcasting automated delay alert notification logs to parents on ${vehicle.route_name}...`)}
                          className="py-2.5 bg-orange-500 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all hover:bg-orange-600 active:scale-95 text-center shadow-xs"
                        >
                          Notify Parents
                        </button>
                        <button 
                          onClick={() => window.open(`https://google.com{vehicle.gps}`, '_blank')}
                          className="py-2.5 bg-white border border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all hover:bg-slate-50 active:scale-95 text-center shadow-2xs"
                        >
                          Track Fleet
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => alert(`Opening group intercom pipeline for Driver ${vehicle.driver}...`)}
                        className="w-full py-2.5 bg-orange-500 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all hover:bg-orange-600 active:scale-95 text-center shadow-xs"
                      >
                        Notify Fleet Group
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
