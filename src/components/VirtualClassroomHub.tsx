import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Users, MessageSquare, Check, Clock, ArrowLeft, Loader2 } from 'lucide-react';

interface ClassroomProps {
  shopId: number;
  onBack: () => void;
  teacherUser: {
    id: number | string;
    name: string;
    assigned_class: string;
    email: string;
  };
}

export const VirtualClassroomHub: React.FC<ClassroomProps> = ({ shopId, onBack, teacherUser }) => {
  // --- Infrastructure & Stream State Tracking Controls ---
  const [isLive, setIsLive] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  
  // 🌟 Dynamic Dropdown Roster States (No hardcoding)
  const [classList, setClassList] = useState<string[]>([]);
  const [isClassesLoading, setIsClassesLoading] = useState(true);
  const [targetClass, setTargetClass] = useState('');
  
  const [lessonSubject, setLessonSubject] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Dynamic Live Metrics Array Feeds ---
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [questionsQueue, setQuestionsQueue] = useState<any[]>([]);

  // 📡 1. Fetch real-time available classes directly from the student database table on mount
  useEffect(() => {
    const fetchLiveClassesFromDatabase = async () => {
      try {
        setIsClassesLoading(true);
        const response = await fetch('https://n8n.tenear.com/webhook/virtual-class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'FETCH_STUDENT_CLASSES',
            shop_id: shopId
          })
        });

        if (response.ok) {
          const result = await response.json();
          const classes = Array.isArray(result.classes) ? result.classes : [];
          setClassList(classes);
          
          // Default initial selection state safely to the first available database row match
          if (classes.length > 0) {
            setTargetClass(classes[0]);
          }
        }
      } catch (err) {
        console.error("Failed fetching live tenant class parameters:", err);
      } finally {
        setIsClassesLoading(false);
      }
    };

    if (shopId) fetchLiveClassesFromDatabase();
  }, [shopId]);

  // 📡 2. Start/Stop Live Classroom session handler
  const handleToggleClassroom = async () => {
    // 1. Validation Check before firing network actions
    if (!isLive && (!lessonSubject.trim() || !targetClass)) {
      alert("Please ensure both Subject and Class selection fields are populated.");
      return;
    }

    // 2. State Guard: If attempting to terminate a session but the active identifier tracking string is missing
    if (isLive && !activeRoomId) {
      setIsLive(false);
      setAttendanceList([]);
      setQuestionsQueue([]);
      return;
    }

    try {
      setIsProcessing(true);
      const targetAction = !isLive ? 'START_CLASSROOM' : 'STOP_CLASSROOM';
      
      const response = await fetch('https://n8n.tenear.com/webhook/start-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: targetAction,
          shop_id: shopId,
          class_id: targetClass,
          subject: lessonSubject,
          topic: lessonTopic || 'General Study Session',
          teacher_id: teacherUser.id,
          room_id: activeRoomId
        })
      });

      if (!response.ok) throw new Error("Server rejected operation");
      const result = await response.json();

      if (!isLive) {
        // FIX: Extract id safely whether backend returns a raw array or an object wrapper
        const dataRecord = Array.isArray(result) ? result[0] : result;
        const confirmedRoomId = dataRecord?.id || dataRecord?.room_id;

        if (confirmedRoomId) {
          setActiveRoomId(confirmedRoomId);
          setIsLive(true);
        } else {
          throw new Error("No room ID found in backend response array.");
        }
      } else {
        setIsLive(false);
        setActiveRoomId(null);
        setAttendanceList([]);
        setQuestionsQueue([]);
        setLessonTopic('');
        setLessonSubject('');
      }
    } catch (err) {
      console.error("Classroom toggle transaction tracking error:", err);
      alert("Failed to initialize live stream. Verify that n8n returned a valid room ID record.");
    } finally {
      setIsProcessing(false);
    }
  };



  // 🔄 3. Metrics heart-beat polling loop (Attendance and Questions)
  useEffect(() => {
    let trackingTimer: NodeJS.Timeout;
    
    const syncClassroomMetrics = async () => {
      if (!isLive || !activeRoomId) return;
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/interactive-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'GET_LIVE_METRICS',
            shop_id: shopId,
            room_id: activeRoomId
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAttendanceList(Array.isArray(data.attendance) ? data.attendance : []);
          setQuestionsQueue(Array.isArray(data.questions) ? data.questions : []);
        }
      } catch (err) {
        console.error("Error fetching live logs:", err);
      }
    };

    if (isLive && activeRoomId) {
      syncClassroomMetrics();
      trackingTimer = setInterval(syncClassroomMetrics, 5000);
    }
    return () => clearInterval(trackingTimer);
  }, [isLive, activeRoomId, shopId]);

  const handleMarkQuestionAnswered = async (questionId: string) => {
    try {
      setQuestionsQueue(prev => prev.map(q => q.id === questionId ? { ...q, is_answered: true } : q));
      await fetch('https://n8n.tenear.com/webhook/mark-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ANSWER_QUESTION', shop_id: shopId, question_id: questionId })
      });
    } catch (err) { console.error(err); }
  };

  const secureEmbedRoomToken = `tenear-tenant-${shopId}-${targetClass.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8 font-sans">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            disabled={isLive}
            className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-500 mr-1 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className={`p-2.5 rounded-xl ${isLive ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Virtual Classroom Studio</h3>
            <p className="text-xs text-slate-400 mt-0.5">Deliver real-time online lessons synchronized directly via live edge servers.</p>
          </div>
        </div>
        
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          isLive ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-200/60'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
          {isLive ? 'Session Active Live' : 'Studio Offline'}
        </span>
      </div>

      {/* Control Setup Matrix Block Form */}
      {!isLive ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/40 p-4 rounded-2xl border border-slate-100 mb-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Class Stream</label>
            {isClassesLoading ? (
              <div className="text-xs text-slate-400 italic py-2 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-purple-600" /> Loading database rows...
              </div>
            ) : (
              <select 
                value={targetClass} 
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-slate-700 cursor-pointer"
              >
                {classList.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject Area</label>
            <input 
              type="text" 
              placeholder="e.g., Science, English"
              value={lessonSubject} 
              onChange={(e) => setLessonSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-slate-700" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lesson Topic Outline</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g., Introduction to Plant Photosynthesis" 
                value={lessonTopic} 
                onChange={(e) => setLessonTopic(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-slate-700" 
              />
              <button 
                onClick={handleToggleClassroom}
                disabled={isProcessing || isClassesLoading || !targetClass}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap flex items-center justify-center min-w-[100px]"
              >
                {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Go Live Now'}
              </button>
            </div>
          </div>
        </div>
      ) : (
     
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-md">
          <div>
            <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Broadcasting</span>
            <h4 className="text-sm font-bold mt-1 text-white">{lessonSubject}: <span className="font-medium text-slate-300">{lessonTopic}</span></h4>
            <p className="text-xs text-slate-400 mt-0.5">Stream targeted directly into the student panels of <span className="text-purple-400 font-semibold">{targetClass}</span></p>
          </div>
          <button 
            onClick={handleToggleClassroom}
            disabled={isProcessing}
            className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm self-start md:self-auto"
          >
            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <VideoOff className="h-3.5 w-3.5" />}
            <span>Terminate Lesson Feed</span>
          </button>
        </div>
      )}

      {/* Main Video Call Desk Workspace */}
      {isLive && activeRoomId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-2">
            <div className="w-full h-[460px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative shadow-inner">
              <iframe
                src={`https://jit.si{secureEmbedRoomToken}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","desktop","fullscreen","chat","raisehand","tileview"]`}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                title="Virtual Lecture Room Node"
              />
            </div>
          </div>

          <div className="space-y-6 flex flex-col h-[460px] justify-between">
            {/* Live Attendance */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex-1 overflow-y-auto mb-1 max-h-[220px]">
              <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-2 mb-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span>Live Attendance ({attendanceList.length})</span>
              </div>
              {attendanceList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-center">
                  <Clock className="h-4 w-4 animate-spin text-slate-300 mb-1" />
                  <p className="text-[11px] font-medium italic">Awaiting student connections...</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {attendanceList.map((st) => (
                    <div key={st.id} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 rounded-xl p-2 font-medium text-slate-700 shadow-sm">
                      <span className="font-bold text-slate-800">{st.student_name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(st.joined_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Questions */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex-1 overflow-y-auto max-h-[220px]">
              <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-2 mb-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                <span>Student Question Box</span>
              </div>
              {questionsQueue.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-8 italic font-medium">No student questions in queue.</p>
              ) : (
                <div className="space-y-2">
                  {questionsQueue.map((q) => (
                    <div key={q.id} className={`p-2.5 rounded-xl border transition-all text-xs ${
                      q.is_answered ? 'bg-emerald-50/40 border-emerald-100 text-slate-500' : 'bg-white border-slate-100 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                        <span className={q.is_answered ? 'text-emerald-700' : 'text-purple-600'}>{q.student_name}</span>
                        {q.is_answered ? (
                          <span className="text-emerald-600 inline-flex items-center gap-0.5"><Check className="h-3 w-3" /> Addressed</span>
                        ) : (
                          <button 
                            onClick={() => handleMarkQuestionAnswered(q.id)}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Mark Answered
                          </button>
                        )}
                      </div>
                      <p className={`text-[11px] leading-relaxed font-medium ${q.is_answered ? 'line-through opacity-60' : 'text-slate-700'}`}>{q.question_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
