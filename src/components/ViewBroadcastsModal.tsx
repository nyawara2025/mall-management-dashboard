import React, { useEffect, useState } from 'react';
import { X, Bell, Calendar } from 'lucide-react';

export const ViewBroadcastsModal = ({ isOpen, onClose, userData }: any) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchMessages();
  }, [isOpen]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          org_id: userData.org_id,
          ministry_id: userData.ministry_id,
          zone_id: userData.zone_id 
        }),
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center rounded-t-[2.5rem]">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Church Notices</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full"><X size={24}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <p className="text-center py-10 italic">Checking for notices...</p>
          ) : messages.length === 0 ? (
            <p className="text-center py-10 text-gray-400 font-bold uppercase text-xs">No active broadcasts</p>
          ) : (
            messages.map((msg: any, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
                    {msg.target_name}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
