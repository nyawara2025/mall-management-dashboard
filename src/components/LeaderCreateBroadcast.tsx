import React, { useState } from 'react';
import { Radio, Bell, Loader2 } from 'lucide-react';

interface LeaderCreateBroadcastProps {
  role: string; // Accepts the string directly (e.g. 'leader')
  userId: any;
  shopId: any;
  onBroadcastCreated: () => void;
}

export const LeaderCreateBroadcast: React.FC<LeaderCreateBroadcastProps> = ({ role, userId, shopId, onBroadcastCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Form State modeled exactly from your working meetings setup
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    type: 'broadcast',
    priority: 'normal'
  });

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.message) {
      alert("Please fill in required fields");
      return;
    }
    
    setSending(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/create-church-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newNotice,
          created_by: userId,
          shop_id: shopId,
        }),
      });

      if (response.ok) {
        alert("Notice Broadcasted!");
        setNewNotice({ title: '', message: '', type: 'broadcast', priority: 'normal' });
        setIsCreating(false);
        onBroadcastCreated(); // Triggers re-fetch on parent hub list
      }
    } catch (err) {
      alert("Error creating notice");
    } finally {
      setSending(false);
    }
  };

  // Strict leadership check matching your exact meetings view requirement
  if (role !== 'leader') return null;

  return (
    <div className="w-full">
      {/* Dynamic Creation Toggle Trigger Card */}
      <button 
        type="button"
        onClick={() => setIsCreating(!isCreating)}
        className="w-full mb-6 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-sm"
      >
        {isCreating ? 'Cancel' : '+ Broadcast New Notice'}
      </button>

      {/* Creation Inputs Tray Container */}
      {isCreating && (
        <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100 text-left">
          <input 
            className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium outline-none" 
            placeholder="Notice Title" 
            value={newNotice.title}
            onChange={e => setNewNotice({...newNotice, title: e.target.value})}
          />
          
          <textarea 
            className="w-full p-4 rounded-xl ring-1 ring-gray-200 bg-white text-sm font-medium outline-none h-32 resize-none" 
            placeholder="Notice Message Content" 
            value={newNotice.message}
            onChange={e => setNewNotice({...newNotice, message: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setNewNotice({ ...newNotice, type: 'broadcast' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                newNotice.type === 'broadcast' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              Broadcast
            </button>
            <button
              type="button"
              onClick={() => setNewNotice({ ...newNotice, type: 'alert' })}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                newNotice.type === 'alert' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              Alert Node
            </button>
          </div>

          <select 
            className="w-full p-4 rounded-xl ring-1 ring-gray-200 bg-white text-sm font-medium outline-none"
            value={newNotice.priority}
            onChange={e => setNewNotice({...newNotice, priority: e.target.value})}
          >
            <option value="normal">Normal Priority (Blue Card)</option>
            <option value="high">High Importance (Red Card)</option>
          </select>

          <button 
            type="button"
            onClick={handleCreateNotice} 
            disabled={sending}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition-colors"
          >
            {sending && <Loader2 className="animate-spin" size={16} />}
            {sending ? 'Posting...' : 'Post Notice'}
          </button>
        </div>
      )}
    </div>
  );
};
