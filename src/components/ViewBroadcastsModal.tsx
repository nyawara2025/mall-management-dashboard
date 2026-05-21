import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export const ViewBroadcastsModal = ({ isOpen, onClose, userData }: any) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- INLINE CREATION STATES (MODELED EXACTLY FROM MEETINGS MODAL) ---
  const [isCreating, setIsCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({
    message: '',
    target_type: 'ministry' // Default target level selector parameter
  });

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
          org_id: userData?.org_id,
          ministry_id: userData?.ministry_id,
          zone_id: userData?.zone_id 
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

  // --- SUBMISSION METHOD MODELED EXACTLY FROM MEETINGS MODAL ---
  const handleCreateBroadcast = async () => {
    if (!newBroadcast.message.trim()) {
      alert("Please write a notice message before posting.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_phone: userData?.phone_number || '0700000000',
          org_id: userData?.org_id,
          shop_id: userData?.shop_id || 68,
          message: newBroadcast.message,
          target_type: newBroadcast.target_type,
          target_id: newBroadcast.target_type === 'ministry' ? userData?.ministry_id : userData?.zone_id,
          target_name: newBroadcast.target_type === 'ministry' ? userData?.ministry_name : userData?.zone_name
        }),
      });

      if (response.ok) {
        alert("Broadcast sent successfully!");
        setNewBroadcast({ message: '', target_type: 'ministry' });
        setIsCreating(false);
        fetchMessages(); // Triggers automated listing refresh re-fetch
      } else {
        throw new Error("Server integration error");
      }
    } catch (err) {
      alert("Error creating broadcast notice");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  // Enforced validation matches the role checker rules from your interface
  const isLeader = userData?.role?.toLowerCase() === 'leader';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center rounded-t-[2.5rem]">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Church Notices</h2>
            <p className="text-[10px] uppercase font-bold text-blue-100">Broadcasts & group updates</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors"><X size={24}/></button>
        </div>
        
        {/* Modal Main Form/List Container */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
          
          {/* Admin Creation Trigger (Matches your exact Meetings template layout card) */}
          {isLeader && (
            <button 
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-sm transition-all hover:bg-blue-100/50"
            >
              {isCreating ? 'Cancel' : '+ Create New Broadcast'}
            </button>
          )}

          {/* Creation Input Section Dashboard Grid Layout Drawer */}
          {isCreating && (
            <div className="space-y-4 bg-gray-50 p-5 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Category Scope Picker (Checks user metadata fields safely) */}
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Target Scope</label>
                <select
                  value={newBroadcast.target_type}
                  onChange={e => setNewBroadcast({ ...newBroadcast, target_type: e.target.value })}
                  className="w-full p-3.5 rounded-xl border-none bg-white font-medium text-sm text-gray-700 ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {userData?.ministry_name && <option value="ministry">My Ministry ({userData.ministry_name})</option>}
                  {userData?.zone_name && <option value="zone">My Zone ({userData.zone_name})</option>}
                </select>
              </div>

              {/* Broadcast Content Message Input Textarea */}
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Message Content</label>
                <textarea 
                  rows={4}
                  className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 bg-white font-medium text-sm text-gray-700 outline-none resize-none" 
                  placeholder="Write notice description or agenda broadcast notes here..." 
                  value={newBroadcast.message}
                  onChange={e => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                />
              </div>

              {/* Call-to-Action Submission Handle Trigger */}
              <button 
                type="button"
                onClick={handleCreateBroadcast} 
                disabled={sending || !newBroadcast.message.trim()}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 shadow-md shadow-blue-50"
              >
                {sending ? <Loader2 className="animate-spin" size={16} /> : null}
                {sending ? 'Posting Notice...' : 'Post Broadcast'}
              </button>
            </div>
          )}

          {/* Broadcasts Feed Stream (Visible to Everyone) */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-10 italic text-gray-400">Checking for notices...</p>
            ) : messages.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-bold uppercase text-xs">No active broadcasts</p>
            ) : (
              messages.map((msg: any, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
                      {msg.target_name || 'General Notice'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold">
                      {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">{msg.content || msg.message}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
