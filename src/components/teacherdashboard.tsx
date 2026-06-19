import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Megaphone, MessageSquare, CheckSquare, 
  ArrowLeft, Smartphone, Users, Award, Check, X, Send, Calendar 
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admission_no: string;
}

interface TeacherDashboardProps {
  shopId: number;
  teacherUser: {
    id: number | string;
    name: string;
    assigned_class: string;
    email: string;
  };
}

export const TeacherDashboard = ({ shopId, teacherUser }: TeacherDashboardProps) => {
  // Navigation Track State: 'menu' | 'homework' | 'announcements' | 'attendance' | 'grading' | 'chat'
  const [activeTab, setActiveTab] = useState<'menu' | 'homework' | 'announcements' | 'attendance' | 'grading' | 'chat'>('menu');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Processing Sub-States
  const [homeworkSubject, setHomeworkSubject] = useState('');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDue, setHomeworkDue] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  
  // Interactive Mobile Input Track States
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [examScores, setExamScores] = useState<Record<string, string>>({});
  const [activeSubject, setActiveSubject] = useState('Mathematics');

  // Fetch Class Roster on Load for Attendance and Grading
  useEffect(() => {
    async function fetchClassRoster() {
      setLoading(true);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-class-roster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop_id: shopId,
            class_id: teacherUser.assigned_class
          })
        });
        if (response.ok) {
          const result = await response.json();
          setStudents(Array.isArray(result) ? result : result.students || []);
        }
      } catch (err) {
        console.error("Error fetching class roster:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClassRoster();
  }, [shopId, teacherUser.assigned_class]);

  // 1. DISPATCH NEW ASSIGNMENT ENTRY (IMMEDIATE VIEW PATTERN)
  const handlePublishHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/upload-school-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          teacher_id: teacherUser.id,
          class_id: teacherUser.assigned_class,
          subject: homeworkSubject,
          title: homeworkTitle,
          date: homeworkDue
        }),
      });
      alert("Assignment published directly to Parent Hub channels.");
      setHomeworkSubject('');
      setHomeworkTitle('');
      setHomeworkDue('');
      setActiveTab('menu');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. DISPATCH GROUP NOTICE (IMMEDIATE VIEW PATTERN)
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/upload-school-bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          teacher_id: teacherUser.id,
          class_id: teacherUser.assigned_class,
          title: announcementTitle,
          content: announcementBody
        }),
      });
      alert("Announcement pinned to announcement feed index.");
      setAnnouncementTitle('');
      setAnnouncementBody('');
      setActiveTab('menu');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. PUSH ATTENDANCE RECORD SYSTEM (REAL-TIME SHARED DATA PATTERN)
  const submitDailyAttendance = async () => {
    setActionLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/upload-school-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          teacher_id: teacherUser.id,
          class_id: teacherUser.assigned_class,
          records: attendanceState
        })
      });
      alert("Attendance processed. Shared across School Admin loggers & Parents.");
      setActiveTab('menu');
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. DISPATCH MARKS FOR APPROVAL (ADMIN GUARD PATTERN)
  const submitMarksForApproval = async () => {
    setActionLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/upload-student-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          teacher_id: teacherUser.id,
          class_id: teacherUser.assigned_class,
          subject: activeSubject,
          scores: examScores
        })
      });
      alert("Exam metrics submitted to School Admin dashboard for approval.");
      setExamScores({});
      setActiveTab('menu');
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen pb-24 text-left font-sans animate-in fade-in duration-200">
      
      {/* PERSISTENT RUNTIME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white rounded-b-[2rem] shadow-xl sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase">
              Teacher Portal
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1">{teacherUser.name}</h2>
            <p className="text-slate-300 text-[10px] font-medium">{teacherUser.assigned_class} Curator</p>
          </div>
          {activeTab !== 'menu' && (
            <button 
              onClick={() => setActiveTab('menu')} 
              className="p-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-colors text-slate-200"
            >
              <ArrowLeft size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* VIEW A: HOMEPAGE MENU CARD GRID */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Classroom Operations</p>
            
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setActiveTab('homework')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left group">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><BookOpen size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Assignments & Homework</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Launches items directly onto parent tracking views.</p>
                </div>
              </button>

              <button onClick={() => setActiveTab('announcements')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left group">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all"><Megaphone size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Class Notice Announcements</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Broadcast updates directly to target parent devices.</p>
                </div>
              </button>

              <button onClick={() => setActiveTab('attendance')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left group">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all"><CheckSquare size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Daily Attendance Roll Call</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sync present/absent data to Admin & Parents.</p>
                </div>
              </button>

              <button onClick={() => setActiveTab('grading')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left group">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all"><Award size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Record Exam Scores</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Input raw data lines for Admin approval checkmarks.</p>
                </div>
              </button>

              <button onClick={() => setActiveTab('chat')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left group">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><MessageSquare size={20} /></div>
                <div>

                <h3 className="font-black text-slate-800 text-sm">Parent Guardian Chatroom</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Launch immediate real-time feedback chats.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW B: ASSIGNMENT FORMULATION */}
      {activeTab === 'homework' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-800">New Assignment Task</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Bypasses verification to populate parent feeds instantly.</p>
          </div>
          <form onSubmit={handlePublishHomework} className="space-y-4">
            <input type="text" placeholder="Course Subject (e.g., Mathematics)" value={homeworkSubject} onChange={e => setHomeworkSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="text" placeholder="Due Date Threshold (e.g., Tomorrow, 5 PM)" value={homeworkDue} onChange={e => setHomeworkDue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
            <textarea placeholder="Write out dynamic instructions parameters or question specifics..." value={homeworkTitle} onChange={e => setHomeworkTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold h-24 outline-none focus:ring-2 focus:ring-blue-500 resize-none" required />
            <button type="submit" disabled={actionLoading} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-md disabled:opacity-40">
              {actionLoading ? 'Broadcasting Archive...' : 'Broadcast Assignment'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW C: NOTICE CREATION */}
      {activeTab === 'announcements' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-800">Broadcast Notice Board Update</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Pins urgent updates directly onto target parent views.</p>
          </div>
          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <input type="text" placeholder="Notice Header Title" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" required />
            <textarea placeholder="Write full bulletin description or operational notices..." value={announcementBody} onChange={e => setAnnouncementBody(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold h-32 outline-none focus:ring-2 focus:ring-purple-500 resize-none" required />
            <button type="submit" disabled={actionLoading} className="w-full bg-purple-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-md disabled:opacity-40">
              {actionLoading ? 'Transmitting Notice...' : 'Transmit Board Notice'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW D: MOBILE-TOUCH ROLL CALL INTERFACE */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800">Class Attendance Roll</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Roster: {students.length} Learners</p>
            </div>
            <Calendar size={18} className="text-slate-400" />
          </div>

          {loading ? (
            <p className="text-center py-8 text-xs font-black text-slate-400 animate-pulse">LOADING TARGET ROSTER...</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-black text-slate-800 text-xs">{student.name}</p>
                    <p className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">ADM: {student.admission_no}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: 'present' }))} 
                      className={`p-2 rounded-lg border transition-all ${attendanceState[student.id] === 'present' ? 'bg-emerald-500 border-emerald-600 text-white shadow' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: 'absent' }))} 
                      className={`p-2 rounded-lg border transition-all ${attendanceState[student.id] === 'absent' ? 'bg-red-500 border-red-600 text-white shadow' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={submitDailyAttendance} disabled={actionLoading || Object.keys(attendanceState).length === 0} className="w-full mt-4 bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-md disabled:opacity-40">
                {actionLoading ? 'Processing Ledger...' : 'Push Attendance Logs'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW E: ACCELERATED SCORE ASSIGNATION CONTAINER */}
      {activeTab === 'grading' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Course Assessment Subject</label>
            <select value={activeSubject} onChange={e => setActiveSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none">
              <option value="Mathematics">Mathematics</option>
              <option value="English Language">English Language</option>
              <option value="Kiswahili">Kiswahili</option>
              <option value="Science & Tech">Science & Tech</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center py-8 text-xs font-black text-slate-400 animate-pulse">LOADING LEARNER INDEX...</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <span className="font-black text-slate-800 text-xs truncate max-w-[200px]">{student.name}</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      placeholder="Marks" 
                      max="100" 
                      value={examScores[student.id] || ''} 
                      onChange={e => setExamScores(prev => ({ ...prev, [student.id]: e.target.value }))} 
                      className="w-16 bg-slate-50 border border-slate-200 p-2 rounded-lg text-center text-xs font-black outline-none" 
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              ))}
              <button onClick={submitMarksForApproval} disabled={actionLoading || Object.keys(examScores).length === 0} className="w-full mt-4 bg-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40">
                <Send size={12} /> Dispatch Marks for Admin Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW F: CHATROOM STAND-IN VIEW */}
      {activeTab === 'chat' && (
        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto"><MessageSquare size={24} /></div>
          <h4 className="font-black text-slate-800 text-sm">Classroom Communication Stream</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Waiting for the structural specifications of your church communications module to deploy matching components.
          </p>
        </div>
      )}

    </div>
  </div>
);
};
