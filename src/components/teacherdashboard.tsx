import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Megaphone, MessageSquare, CheckSquare, 
  ArrowLeft, Smartphone, Users, Award, Check, X, Send, Calendar, Video 
} from 'lucide-react';

import { VirtualClassroomHub } from './VirtualClassroomHub';

interface Student {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  admission_no?: string;
}

interface TeacherDashboardProps {
  shopId: number;
  onBack: () => void;
  schoolName: string;
  teacherUser: {
    id: number | string;
    name: string;
    assigned_class: string;
    email: string;
  };
}

export const TeacherDashboard = ({ shopId, teacherUser, onBack, schoolName }: TeacherDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'homework' | 'announcements' | 'attendance' | 'grading' | 'chat' | 'classroom'>('menu');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [homeworkSubject, setHomeworkSubject] = useState('');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDue, setHomeworkDue] = useState('');
  const [homeworkTextBook, setHomeworkTextBook] = useState('');
const [homeworkPages, setHomeworkPages] = useState('');

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  
  const [numFrom, setNumFrom] = useState('');
  const [numTo, setNumTo] = useState('');

  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent'>>({});
  const [examScores, setExamScores] = useState<Record<string, string>>({});
  const [activeSubject, setActiveSubject] = useState('Mathematics');

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
          date: new Date().toLocaleDateString('en-KE'),
          subject: homeworkSubject,
          textbook_name: homeworkTextBook,
          pages_target: homeworkPages,
          topic: homeworkTitle,
          number_range: `Nos. ${numFrom} to ${numTo}`
        }),
      });
      alert("Assignment published directly to Parent Hub channels.");
      setHomeworkSubject('');
      setHomeworkTitle('');
      setHomeworkTextBook(''); // Clear textbook text
      setHomeworkPages('');    // Clear pages text
      setNumFrom('');
      setNumTo('');
      setActiveTab('menu');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

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
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white rounded-b-[2rem] shadow-xl sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full uppercase">
              {schoolName || 'Teacher Portal'}
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1">{teacherUser.name}</h2>
            <p className="text-slate-300 text-[10px] font-medium">{teacherUser.assigned_class} Curator</p>
          </div>
          {activeTab !== 'menu' ? (
            <button onClick={() => setActiveTab('menu')} className="p-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-colors text-slate-200">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button onClick={onBack} className="p-2.5 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 rounded-xl transition-colors text-red-400 flex items-center gap-1.5 text-xs font-bold">
              <X size={16} /> Logout
            </button>  
          )}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'menu' && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Modules</h3>
              <p className="text-xs text-slate-500">Manage classroom operations directly. Changes sync across to parents and administrative backends via n8n.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('homework')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-500 transition-all text-left flex flex-col justify-between h-28">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl w-fit"><BookOpen size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Assignments</h4>
                  <p className="text-[10px] text-slate-400">Publish class metrics</p>
                </div>
              </button>
              <button onClick={() => setActiveTab('announcements')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-amber-500 transition-all text-left flex flex-col justify-between h-28">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl w-fit"><Megaphone size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Bulletins</h4>
                  <p className="text-[10px] text-slate-400">Notice board updates</p>
                </div>
              </button>
              <button onClick={() => setActiveTab('attendance')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-500 transition-all text-left flex flex-col justify-between h-28">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit"><CheckSquare size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Attendance</h4>
                  <p className="text-[10px] text-slate-400">Track student status</p>
                </div>
              </button>
              <button onClick={() => setActiveTab('grading')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 transition-all text-left flex flex-col justify-between h-28">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit"><Award size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Grading</h4>
                  <p className="text-[10px] text-slate-400">Submit marks for admin review</p>
                </div>
              </button>

              {/* NEW VIRTUAL CLASSROOM HUB ACTION MACRO CARD BUTTON */}
              <button onClick={() => setActiveTab('classroom')} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-purple-500 transition-all text-left flex flex-col justify-between h-28">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl w-fit"><Video size={20} /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Live Class</h4>
                  <p className="text-[10px] text-slate-400">Launch studio WebRTC rooms</p>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* VIEW B: ASSIGNMENT FORMULATION */}
        {activeTab === 'homework' && (
          <form onSubmit={handlePublishHomework} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 text-left animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">New Assignment Task</h3>
              <p className="text-xs text-slate-400">Due automatically on the next school day.</p>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 px-1">Subject</label>
              <input
                type="text" placeholder="e.g., Mathematics, Kiswahili, Science"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                value={homeworkSubject} onChange={(e) => setHomeworkSubject(e.target.value)} required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 px-1">Topic</label>
              <input
                type="text" placeholder="e.g., Fractions, Insha, Plants"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                value={homeworkTitle} onChange={(e) => setHomeworkTitle(e.target.value)} required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 px-1">Reference Textbook</label>
                <input
                  type="text" placeholder="e.g., Primary Geography, Malkiat Singh"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  value={homeworkTextBook} onChange={(e) => setHomeworkTextBook(e.target.value)} required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 px-1">Target Page(s)</label>
                <input
                  type="text" placeholder="e.g., Page 58, Pg. 32-35"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  value={homeworkPages} onChange={(e) => setHomeworkPages(e.target.value)} required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 px-1">Question Numbers</label>
              <div className="grid grid-cols-2 gap-4 items-center">
                <input
                  type="number" placeholder="From (e.g., 1)"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  value={numFrom} onChange={(e) => setNumFrom(e.target.value)} required
                />
                <input
                  type="number" placeholder="To (e.g., 12)"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  value={numTo} onChange={(e) => setNumTo(e.target.value)} required
                />
              </div>
            </div>
            <button
              type="submit" disabled={actionLoading}
              className="w-full py-4 mt-2 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center uppercase tracking-wide text-xs"
            >
              {actionLoading ? 'Publishing to Parent Hub...' : 'Broadcast Assignment'}
            </button>
          </form>
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
                {students.map((student) => {
                  const currentStatus = attendanceState[student.id] || 'present';
                  const fullName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Learner';

                  return (
                    <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-black text-slate-800 text-xs truncate max-w-[200px]">{fullName}</p>
                        <p className="text-[9px] text-slate-400">{student.admission_no || 'No Adm'}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: 'present' }))}
                          className={`p-1.5 rounded-lg border transition-colors ${currentStatus === 'present' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: 'absent' }))}
                          className={`p-1.5 rounded-lg border transition-colors ${currentStatus === 'absent' ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button onClick={submitDailyAttendance} disabled={actionLoading} className="w-full mt-4 bg-slate-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-md disabled:opacity-40">
                  {actionLoading ? 'Processing Ledger...' : 'Push Attendance Logs'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW E: ACCELERATED SCORE ASSIGNATION CONTAINER */}
        {activeTab === 'grading' && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Evaluating Subject</label>
                <select 
                  value={activeSubject} onChange={(e) => setActiveSubject(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-700"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Kiswahili">Kiswahili</option>
                  <option value="Science">Science & Technology</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="text-center py-8 text-xs font-black text-slate-400 animate-pulse">LOADING TARGET ROSTER...</p>
            ) : (
              <div className="space-y-2">
                {students.map((student) => {
                  const fullName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Learner';

                  return (
                    <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-800 text-xs truncate max-w-[200px]">{fullName}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{student.admission_no || 'No Adm'}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Marks"
                          max="100"
                          min="0"
                          value={examScores[student.id] || ''}
                          onChange={(e) => setExamScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                          className="w-16 bg-slate-50 border border-slate-200 p-2 rounded-lg text-center text-xs font-black outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  );
                })}

                <button 
                  onClick={submitMarksForApproval} 
                  disabled={actionLoading || loading} 
                  className="w-full mt-4 bg-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-md transition-all hover:bg-blue-700 disabled:opacity-40"
                >
                  {actionLoading ? 'Submitting Review...' : 'Submit to Admin for Approval'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW F: INDEPENDENT IMMERSIVE VIRTUAL CLASSROOM HUB MODULE */}
        {activeTab === 'classroom' && (
          <div className="animate-in fade-in duration-200">
            <VirtualClassroomHub 
              shopId={shopId} 
              onBack={() => setActiveTab('menu')} 
            />
          </div>
        )}

      </div>
    </div>
  );
};
