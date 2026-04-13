import React, { useEffect, useState } from 'react';
import { X, MessageSquare, History, ChevronLeft } from 'lucide-react';

export const PrayerRequestModal = ({ 
  isOpen, 
  onClose, 
  userData 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userData: any 
}) => {
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // History States
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/church-prayer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_name: userData?.first_name,
          phone_number: userData?.phone_number,
          description: description,
          is_private: isPrivate,
          org_id: userData?.org_id
        }),
      });
      alert("Request submitted!");
      setDescription('');
      onClose();
    } catch (error) {
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setShowHistory(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-prayer-response-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            phone_number: userData?.phone_number // Send identifier to get relevant history
        }),
      });
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : (data.body || []));
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => showHistory ? setShowHistory(false) : onClose()} 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            {showHistory ? <ChevronLeft size={20}/> : <X size={20}/>}
          </button>
          
          <h2 className="text-xl font-black flex items-center gap-2">
            {showHistory ? 'Prayer History' : 'Send Prayer Request'}
          </h2>

          {!showHistory && (
            <button onClick={fetchHistory} className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <History size={20}/>
            </button>
          )}
        </div>

        {showHistory ? (
          /* --- HISTORY VIEW --- */
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {loadingHistory ? (
              <p className="text-center py-10 text-gray-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-center py-10 text-gray-400 italic">No history found.</p>
            ) : (
              history.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-gray-700 text-sm italic mb-2">"{item.description}"</p>
                  {item.response_note ? (
                    <div className="mt-2 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                      <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Response:</p>
                      <p className="text-sm text-gray-800">{item.response_note}</p>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Awaiting Response</span>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* --- SUBMISSION VIEW --- */
          <>
            <textarea
              className="w-full h-40 p-6 bg-gray-50 rounded-[2rem] border-none outline-none text-gray-700 placeholder-gray-400 resize-none mb-6"
              placeholder="How can we pray for you today?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex items-center gap-3 mb-8 px-2">
              <input 
                type="checkbox" 
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <label htmlFor="private" className="text-sm text-gray-500 italic">
                Keep this private (Pastors only)
              </label>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitting || !description.trim()}
              className={`w-full py-5 rounded-3xl text-white font-black text-lg shadow-lg transition-transform active:scale-95 ${
                submitting ? 'bg-gray-300' : 'bg-[#C796FF]'
              }`}
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
