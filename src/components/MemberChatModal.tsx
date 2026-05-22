import React, { useState, useEffect } from 'react';
import { X, Search, Send, Loader2, MessageSquare, History, MessageCircle, Upload, Paperclip, Reply } from 'lucide-react';

interface MemberChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const MemberChatModal: React.FC<MemberChatModalProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'history'>('contacts');
  
  const [membersList, setMembersList] = useState<any[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [transmitting, setTransmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'contacts') fetchContacts();
      if (activeTab === 'history') fetchReceivedChatHistory();
    }
  }, [isOpen, activeTab]);

  const fetchContacts = () => {
    setLoading(true);
    fetch('https://n8n.tenear.com/webhook/church-comms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: userData?.shop_id || 68 })
    })
    .then(res => res.json())
    .then(data => setMembersList(Array.isArray(data) ? data.filter(m => m.id !== userData?.id) : []))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  const fetchReceivedChatHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipient_id: userData?.id,
          shop_id: userData?.shop_id || 68 
        }),
      });
      const data = await response.json();
      setReceivedMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load chat records:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DYNAMIC REPLY INITIATION HANDLER ---
  const handleInitiateReply = (msg: any) => {
    // Construct target object from message sender variables
    const recipientObj = {
      id: msg.sender_id,
      first_name: msg.sender_name.split(' ')[0] || 'Member',
      last_name: msg.sender_name.split(' ').slice(1).join(' ') || '',
      phone_number: msg.sender_phone || ''
    };
    setSelectedRecipient(recipientObj);
    setActiveTab('contacts'); // Redirects straight to composition form
  };

  const dispatchPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedRecipient) return;
    
    setTransmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('sender_id', userData?.id || '');
      formPayload.append('sender_name', `${userData?.first_name || 'Member'} ${userData?.last_name || ''}`);
      formPayload.append('sender_phone', userData?.phone_number || '');
      formPayload.append('recipient_id', selectedRecipient.id);
      formPayload.append('recipient_name', `${selectedRecipient.first_name} ${selectedRecipient.last_name}`);
      formPayload.append('recipient_phone', selectedRecipient.phone_number || '');
      formPayload.append('message', chatMessage);
      formPayload.append('shop_id', userData?.shop_id || '68');

      const generatedPathName = selectedFile 
        ? `chat_media_${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        : '';
      formPayload.append('attachment_path', generatedPathName);

      if (selectedFile) {
        formPayload.append('photo', selectedFile);
      }

      const response = await fetch('https://n8n.tenear.com/webhook/church-chat-direct', {
        method: 'POST',
        body: formPayload
      });

      if (response.ok) {
        alert(`Message sent successfully to ${selectedRecipient.first_name}!`);
        setChatMessage('');
        setSelectedFile(null);
        setSelectedRecipient(null);
        setActiveTab('history'); 
      }
    } catch (err) {
      alert("Failed to deliver your message.");
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
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <MessageSquare size={20} /> Member Connect
            </h3>
            <p className="text-xs text-indigo-100 uppercase font-medium mt-0.5">Secure internal messaging system</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50">
          <button
            onClick={() => { setActiveTab('contacts'); setSelectedRecipient(null); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'contacts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MessageCircle size={14} /> Send New
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History size={14} /> Inbox Mailbox
          </button>
        </div>

        {/* Layout Panels Area */}
        <div className="p-6 flex flex-col flex-1 overflow-y-auto min-h-[40vh] max-h-[55vh]">
          {activeTab === 'contacts' ? (
            !selectedRecipient ? (
              <>
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
                <div className="overflow-y-auto space-y-2 flex-1 max-h-[40vh]">
                  {loading ? (
                    <p className="text-center py-10 text-xs font-bold uppercase animate-pulse text-gray-400">Loading congregation records...</p>
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
              </>
            ) : (
              /* PANEL B: MESSAGE COMPOSER (INCLUDES THE ATTACHMENT UPLOADER UI) */
              <form onSubmit={dispatchPrivateMessage} className="space-y-4 animate-in fade-in zoom-in-95 duration-100 text-left">
                <div className="p-3.5 bg-indigo-50 rounded-xl flex justify-between items-center">
                  <p className="text-xs font-bold text-indigo-800">To: <span className="font-black text-indigo-950">{selectedRecipient.first_name} {selectedRecipient.last_name}</span></p>
                  <button type="button" onClick={() => setSelectedRecipient(null)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Change</button>
                </div>
                
                <textarea
                  rows={4}
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder={`Write your private text message to ${selectedRecipient.first_name}...`}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-700 resize-none"
                />

                {/* 📎 THE ATTACHMENT FILE UPLOADER COMPONENT 📎 */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Attach Document / Photo (Optional)</label>
                  <div className="relative flex items-center justify-center w-full bg-gray-50 ring-1 ring-gray-200/50 rounded-xl p-3 hover:bg-gray-100/70 transition-colors">
                    <input 
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      {selectedFile ? <Paperclip size={14} className="text-indigo-600" /> : <Upload size={14} />}
                      <span>{selectedFile ? selectedFile.name : 'Choose attachment...'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={transmitting || !chatMessage.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  {transmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  Send Private Message
                </button>
              </form>
            )
          ) : (
            /* PANEL C: INBOX MAILBOX RECEIVED CHAT LIST WITH REPLY HANDLER */
            <div className="overflow-y-auto space-y-3 flex-1 max-h-[50vh]">
              {loading ? (
                <p className="text-center py-10 text-xs font-bold uppercase animate-pulse text-gray-400">Opening mailbox...</p>
              ) : receivedMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-wider">Your Inbox is Empty</p>
                  <p className="text-[11px] text-gray-400 mt-1">Messages sent to you will appear here.</p>
                </div>
              ) : (
                receivedMessages.map((msg: any) => (
                  <div key={msg.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 animate-in slide-in-from-bottom-2 duration-150 text-left">
                    <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase">
                      <span>From: {msg.sender_name || 'Anonymous Member'}</span>
                      <span className="text-gray-400 font-bold">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{msg.message}</p>
                    
                    {/* Inbox Bottom Section: Handles file views and reply routing */}
                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between mt-1">
                      {msg.pdf_url && msg.pdf_url.trim() !== "" ? (
                        <a 
                          href={msg.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[9px] bg-white border border-gray-200 font-black text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-300">No Attachment</span>
                      )}

                      {/* 🔄 THE REPLY INTERACTIVE CTA TRIGGER LINK 🔄 */}
                      <button
                        type="button"
                        onClick={() => handleInitiateReply(msg)}
                        className="text-[9px] bg-indigo-50 border border-indigo-100 font-black text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center gap-1"
                      >
                        <Reply size={10} /> Reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

