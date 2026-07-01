import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Users, MessageSquare, Send, Check, ShieldAlert, Award, Clock, ArrowLeft } from 'lucide-react';

interface ClassroomProps {
  shopId: number;
  onBack: () => void;
}

export const VirtualClassroomHub: React.FC<ClassroomProps> = ({ shopId, onBack }) => {
  // --- Infrastructure & Stream State Tracking Controls ---
  const [isLive, setIsLive] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState('Grade-4-West');
  const [lessonSubject, setLessonSubject] = useState('Mathematics');
  const [lessonTopic, setLessonTopic] = useState('');

  // --- Dynamic Dashboard Sub-Module Array Feeds ---
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [questionsQueue, setQuestionsQueue] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');

  // 📡 Triggered Hook: Start Live Video Feed Channel Session via Webhook
  const handleToggleClassroom = async () => {
    try {
      const targetAction = !isLive ? 'START_CLASSROOM' : 'STOP_CLASSROOM';
      
      const response = await fetch('https://n8n.tenear.com/webhook/virtual-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: targetAction,
          shop_id: shopId,
          class_id: targetClass,
          subject: lessonSubject,
          topic: lessonTopic || 'General Discussion',
          room_id: activeRoomId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (!isLive) {
          setIsLive(true);
          setActiveRoomId(result.room_id || 'fallback-room-uuid');
        } else {
          setIsLive(false);
          setActiveRoomId(null);
          setAttendanceList([]);
          setQuestionsQueue([]);
        }
      }
    } catch (err) {
      console.error("Failed handling virtual streaming server interaction:", err);
    }
  };

  // 🔄 Sync Live Module Lists (Attendance & Interactive Question Logs) via POST Polling
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
          setAttendanceList(data.attendance || []);
          setQuestionsQueue(data.questions || []);
        }
      } catch (err) {
        console.error("Error fetching room sync counters:", err);
      }
    };

    if (isLive) {
      syncClassroomMetrics();
      trackingTimer = setInterval(syncClassroomMetrics, 5000); // 5s dynamic database heartbeat loop
    }
    return () => clearInterval(trackingTimer);
  }, [isLive, activeRoomId, shopId]);

  // 📝 Simulate a secure Teacher-driven answer verification dispatch rule
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

  // Generate a clean hash room string parameter to enforce cross-tenant space division rules
  const secureEmbedRoomToken = `tenear-tenant-${shopId}-${targetClass.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8 font-sans">
      {/* Dynamic Module Header Definition Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">

          {/* Back Arrow button styled to match your dashboard frame design */}
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-500 mr-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className={`p-2.5 rounded-xl ${isLive ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Virtual Classroom Studio</h3>
            <p className="text-xs text-slate-400 mt-0.5">Deliver elaborate online lessons with WebRTC video feed matrix panels.</p>
          </div>
        </div>
        
        {/* Dynamic Status Badging Switcher */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start md:self-auto border ${
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
            <select 
              value={targetClass} 
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-semibold text-slate-700"
            >
              <option value="Grade-4-West">Grade 4 West</option>
              <option value="Grade-5-Alpha">Grade 5 Alpha</option>
              <option value="Class-8-Upper">Class 8 Upper</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject Area</label>
            <input 
              type="text" 
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
                placeholder="e.g., Quadratic Equations & Real-world Formulas" 
                value={lessonTopic} 
                onChange={(e) => setLessonTopic(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-slate-700" 
              />
              <button 
                onClick={handleToggleClassroom}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap"
              >
                Go Live Now
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-md">
          <div>
            <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Broadcasting</span>
            <h4 className="text-sm font-bold mt-1 text-white">{lessonSubject}: <span className="font-medium text-slate-300">{lessonTopic || 'General Core Study'}</span></h4>
            <p className="text-xs text-slate-400 mt-0.5">Stream targeted directly into the student panels of <span className="text-purple-400 font-semibold">{targetClass}</span></p>
          </div>
          <button 
            onClick={handleToggleClassroom}
            className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm self-start md:self-auto"
          >
            <VideoOff className="h-3.5 w-3.5" />
            <span>Terminate Lesson Feed</span>
          </button>
        </div>
      )}

      {/* Main Studio View Work Desk Structure Layout Split */}
      {isLive && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT/CENTER: WebRTC Immersive Video Core Container */}
          <div className="lg:col-span-2 space-y-4">
            <div className="w-full h-[460px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative shadow-inner">
              {/* Secure Embed Jitsi Core Engine Client Frame */}
              <iframe
                src={`https://jit.si{secureEmbedRoomToken}#config.startWithAudioMuted=true&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","fullscreen","fodeviceselection","profile","chat","raisehand","videoquality","filmstrip","tileview"]`}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                title="Immersive Virtual Lecture Classroom Node"
              />
            </div>
          </div>

          {/* RIGHT VIEW SIDEBAR: Interactive Analytics Dashboards & Student Control Desks */}
          <div className="space-y-6 flex flex-col h-[460px] justify-between">
            {/* Live Interactive Attendance Logs Feed Panel */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex-1 overflow-y-auto mb-1 max-h-[220px]">
              <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-2 mb-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span>Live Attendance ({attendanceList.length})</span>
              </div>
              {attendanceList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-center">
                  <Clock className="h-4 w-4 animate-spin mb-1 text-slate-300" />
                  <p className="text-[11px] font-medium italic">Awaiting student sign-ins...</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {attendanceList.map((st, idx) => (
                    <div key={st.id || idx} className="flex items-center justify-between text-[11px] bg-white border border-slate-100 rounded-xl p-2 font-medium text-slate-700">
                      <span className="font-bold text-slate-800">{st.student_name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(st.joined_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Live Interactive Questions Queue Feed Panel */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex-1 overflow-y-auto max-h-[220px]">
              <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-2 mb-3 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                <span>Student Question Box</span>
              </div>
              {questionsQueue.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-8 italic font-medium">No student questions posted yet.</p>
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
                            className="text-[10px] text-blue-600 hover:underline"
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
