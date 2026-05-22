import React, { useState, useEffect } from 'react';
import { X, Search, Send, Loader2, MessageSquare } from 'lucide-react';

interface MemberChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const MemberChatModal: React.FC<MemberChatModalProps> = ({ isOpen, onClose, userData }) => {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [transmitting, setTransmitting] = useState(false);

  // Load directory contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('https://n8n.tenear.com/webhook/church-comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: userData?.shop_id || 68 })
      })
      .then(res => res.json())
      .then(data => {
        // Filter out the logged-in user so they don't message themselves
        setMembersList(Array.isArray(data) ? data.filter(m => m.id !== userData?.id) : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [isOpen, userData]);

  const dispatchPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedRecipient) return;
    
    setTransmitting(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: userData?.id,
          sender_name: `${userData?.first_name || 'Member'} ${userData?.last_name || ''}`,
          sender_phone: userData?.phone_number,
          recipient_id: selectedRecipient.id,
          recipient_name: `${selectedRecipient.first_name} ${selectedRecipient.last_name}`,
          recipient_phone: selectedRecipient.phone_number,
          message: chatMessage
        })
      });
      if (response.ok) {
        alert(`Message sent successfully to ${selectedRecipient.first_name}!`);
        setChatMessage('');
        setSelectedRecipient(null);
        onClose();
      } else {
        throw new Error("Message rejected by server");
      }
    } catch (err) {
      alert("Failed to deliver your message. Please check your connection.");
    } finally {
      setTransmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredContacts = membersList.filter(m => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col text-left">
        
        {/* Header Block */}
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <MessageSquare size={20} /> Member Connect
            </h3>
            <p className="text-xs text-indigo-100 uppercase font-medium mt-0.5">Chat directly with congregation members</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Dynamic Navigation Views */}
        {!selectedRecipient ? (
          /* VIEW 1: CONTACTS DIRECTORY SEARCH LIST */
          <div className="p-6 flex flex-col flex-1 overflow-hidden">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search member by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 max-h-[45vh]">
              {loading ? (
                <p className="text-center py-10 text-xs font-bold uppercase animate-pulse text-gray-400">Loading directory...</p>
              ) : filteredContacts.length === 0 ? (
                <p className="text-center py-10 text-xs italic text-gray-400">No matching members found.</p>
              ) : (
                filteredContacts.map(member => (
                  <div 
                    key={member.id}
                    onClick={() => setSelectedRecipient(member)}
                    className="p-3.5 bg-gray-50/60 border border-gray-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-indigo-50/40 hover:border-indigo-100 transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{member.first_name} {member.last_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mt-0.5">{member.department || 'General Congregation'}</p>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1.5 rounded-xl">Chat</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* VIEW 2: COMPOSE PRIVATE MESSAGE CONTAINER */
          <form onSubmit={dispatchPrivateMessage} className="p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 bg-indigo-50 rounded-xl flex justify-between items-center">
              <p className="text-xs font-bold text-indigo-800">Messaging: <span className="font-black text-indigo-950">{selectedRecipient.first_name} {selectedRecipient.last_name}</span></p>
              <button type="button" onClick={() => setSelectedRecipient(null)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline font-['Century_Gothic']">Change</button>
            </div>

            <textarea
              rows={4}
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder={`Write a private message to ${selectedRecipient.first_name}...`}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-700 resize-none"
            />

            <button
              type="submit"
              disabled={transmitting || !chatMessage.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all shadow-indigo-50"
            >
              {transmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {transmitting ? 'Delivering message...' : 'Send Direct Message'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
