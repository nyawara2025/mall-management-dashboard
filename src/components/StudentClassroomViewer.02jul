import React, { useState, useEffect } from 'react';
import { Video, MessageSquare, Send, Check, Loader2, Award, Clock } from 'lucide-react';

interface StudentViewerProps {
  shopId: number;
  studentId: string;
  studentName: string;
  assignedClass: string; // e.g., 'Grade-4-West'
}

export const StudentClassroomViewer: React.FC<StudentViewerProps> = ({ shopId, studentId, studentName, assignedClass }) => {
  const [activeClassroom, setActiveClassroom] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // 1. Poll for an active classroom instance matching the student's assigned class group
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const findLiveClassSession = async () => {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/find-live-class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CHECK_LIVE_STATUS',
            shop_id: shopId,
            class_id: assignedClass,
            student_id: studentId,
            student_name: studentName // Logs presence automatically if room is live
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.is_live) {
            setActiveClassroom(result.room);
            setQuestions(result.questions || []);
          } else {
            setActiveClassroom(null);
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error("Error fetching live student viewport criteria:", err);
      } finally {
        setIsLoading(false);
      }
    };

    findLiveClassSession();
    checkInterval = setInterval(findLiveClassSession, 7000); // 7s heartbeat loop

    return () => clearInterval(checkInterval);
  }, [shopId, assignedClass, studentId, studentName]);

  // 2. Dispatch a message directly to the teacher's interactive question queue dashboard panel
  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedQuestion.trim() || !activeClassroom) return;

    setIsSubmittingQuestion(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/interactive-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'POST_STUDENT_QUESTION',
          shop_id: shopId,
          room_id: activeClassroom.id,
          student_name: studentName,
          question_text: typedQuestion
        })
      });

      if (response.ok) {
        setTypedQuestion('');
        // Append question optimistically to user feedback interface
        setQuestions(prev => [...prev, { id: Math.random().toString(), student_name: studentName, question_text: typedQuestion, is_answered: false }]);
      }
    } catch (err) {
      console.error("Failed submitting question trace element:", err);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const secureEmbedRoomToken = `tenear-tenant-${shopId}-${assignedClass.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-purple-600 mb-2" />
        <p className="text-xs font-bold text-slate-400">Syncing with school video hubs...</p>
      </div>
    );
  }

  // Render a clean offline state layout if no live session is broadcasted by the teacher
  if (!activeClassroom) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Virtual Classroom Lounge</h3>
            <p className="text-xs text-slate-400 mt-0.5">No live broadcasts are currently running for your class group.</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center space-x-3 text-xs text-slate-500 font-medium">
          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>When your teacher launches a lesson, the video player and interactive question modules will automatically populate here in real-time.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-4 md:p-6 shadow-sm mb-8 text-left">
      {/* Session Title Banner */}
      <div className="border-b border-slate-50 pb-4 mb-4">
        <span className="text-[9px] font-black tracking-widest text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md uppercase">
          Live Broadcast Session
        </span>
        <h3 className="font-black text-slate-800 text-base mt-1.5">{activeClassroom.subject}</h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Topic: <span className="text-slate-700 font-semibold">{activeClassroom.topic}</span></p>
      </div>

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Core Jitsi Embed Player Screen Container */}
        <div className="lg:col-span-2">
          <div className="w-full h-[280px] sm:h-[380px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner">
            <iframe
              src={`https://jit.si{secureEmbedRoomToken}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","raisehand"]`}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Student Virtual Classroom Matrix Receiver"
            />
          </div>
        </div>

        {/* Dynamic Sidebar Question Box Sub-Module Panel */}
        <div className="flex flex-col h-[280px] sm:h-[380px] justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
          <div className="flex items-center space-x-1.5 border-b border-slate-200/60 pb-2 mb-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
            <span>Ask the Teacher</span>
          </div>

          {/* List queue displaying questions from the current student session context */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1 max-h-[220px]">
            {questions.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-12 italic font-medium">Have a question? Type it below to query the instructor securely.</p>
            ) : (
              questions.map((q) => (
                <div key={q.id} className={`p-2 rounded-xl text-xs border ${q.is_answered ? 'bg-emerald-50 border-emerald-100 text-slate-500' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex items-center justify-between font-bold text-[9px] mb-0.5">
                    <span className={q.is_answered ? 'text-emerald-700' : 'text-purple-600'}>
                      {q.student_name === studentName ? 'You' : q.student_name}
                    </span>
                    {q.is_answered && <span className="text-emerald-600 font-extrabold flex items-center gap-0.5"><Check className="h-2.5 w-2.5" /> Answered</span>}
                  </div>
                  <p className={`text-[10px] font-medium leading-normal ${q.is_answered ? 'line-through opacity-60' : 'text-slate-700'}`}>{q.question_text}</p>
                </div>
              ))
            )}
          </div>

          {/* Inline Message Input Dispatch Field Box */}
          <form onSubmit={handlePostQuestion} className="flex gap-1.5 border-t border-slate-200/60 pt-2">
            <input
              type="text"
              placeholder="Type your question..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-slate-700"
              value={typedQuestion}
              onChange={(e) => setTypedQuestion(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSubmittingQuestion || !typedQuestion.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition-all shadow-sm disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
