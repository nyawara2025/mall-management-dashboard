import React, { useState } from 'react';
import { X, Send, Bell, MessageSquare, Loader2 } from 'lucide-react';

interface LeaderMessageProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const LeaderMessageModal: React.FC<LeaderMessageProps> = ({ isOpen, onClose, userData }) => {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'ministry' | 'zone'>(userData.is_ministry_leader ? 'ministry' : 'zone');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!message) return;
    setSending(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/leader-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_phone: userData.phone_number,
          org_id: userData.org_id,
          message: message,
          target_type: target,
          target_id: target === 'ministry' ? userData.ministry_id : userData.zone_id,
          target_name: target === 'ministry' ? userData.ministry_name : userData.zone_name
        }),
      });
      alert("Broadcast sent successfully!");
      setMessage('');
      onClose();
    } catch (error) {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Leader Broadcast</h2>
            <p className="text-amber-100 text-[10px] font-bold uppercase">Send to your group</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-amber-400 rounded-full"><X size={24}/></button>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-6">
            {userData.is_ministry_leader && (
              <button onClick={() => setTarget('ministry')} className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${target === 'ministry' ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                My Ministry
              </button>
            )}
            {userData.is_zone_leader && (
              <button onClick={() => setTarget('zone')} className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${target === 'zone' ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                My Zone
              </button>
            )}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write a message to ${target === 'ministry' ? userData.ministry_name : userData.zone_name}...`}
            className="w-full h-40 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none mb-6 font-medium text-gray-700 resize-none"
          />

          <button
            onClick={handleBroadcast}
            disabled={!message || sending}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 hover:bg-amber-600 disabled:bg-gray-200 transition-all"
          >
            {sending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
            {sending ? 'SENDING...' : 'BROADCAST NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};
