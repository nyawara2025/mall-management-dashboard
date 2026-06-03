import React, { useState, useEffect } from 'react';
import { X, Search, Send, Loader2, MessageSquare, History, MessageCircle, Upload, Paperclip, Reply, Users } from 'lucide-react';

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
  
  // --- CHANGED TO ARRAY FOR MULTI-SELECT ---
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  
  const [chatMessage, setChatMessage] = useState('');
  const [transmitting, setTransmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeGroupContext, setActiveGroupContext] = useState<string>('');

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

  // Toggles selection state of a member in the recipients array
  const handleToggleRecipient = (member: any) => {
    const isAlreadySelected = selectedRecipients.some(r => r.id === member.id);
    if (isAlreadySelected) {
      setSelectedRecipients(selectedRecipients.filter(r => r.id !== member.id));
    } else {
      setSelectedRecipients([...selectedRecipients, member]);
    }
  };

  const handleInitiateReply = (msg: any) => {
    const recipientObj = {
      id: msg.sender_id,
      first_name: msg.sender_name.split(' ')[0] || 'Member',
      last_name: msg.sender_name.split(' ').slice(1).join(' ') || '',
      phone_number: msg.sender_phone || ''
    };
    setSelectedRecipients([recipientObj]); // Wraps in array for compliance
    setActiveGroupContext(''); // Reset group context for single threads
    setActiveTab('contacts'); 
  };

  // NEW: Reply to All original participants in the thread
  const handleReplyAll = (msg: any) => {
    const combinedRecipients: any[] = [];

    // 1. Add the original sender to the reply array if it's not the current user
    if (msg.sender_id && msg.sender_id !== userData?.id) {

      const senderFullName = (msg.sender_name || 'Member').trim();
      const nameParts = senderFullName.split(' ');

      combinedRecipients.push({
        id: msg.sender_id,
        first_name: msg.sender_name?.split(' ')[0] || 'Member',
        last_name: msg.sender_name?.split(' ').slice(1).join(' ') || '',
        phone_number: msg.sender_phone || ''
      });
    }

    // 2. Add all other original recipients (excluding the current user)
    if (msg.all_recipients_json) {
      try {
        const parsedRecipients = typeof msg.all_recipients_json === 'string'
          ? JSON.parse(msg.all_recipients_json)
          : msg.all_recipients_json;

        if (Array.isArray(msg.all_recipients)) {
          parsedRecipients.forEach((rec: any) => {
            if (rec.id !== userData?.id && rec.id !== msg.sender_id) {
              const recFullName = (rec.name || '').trim();
              const recNameParts = recFullName.split(' ');

              combinedRecipients.push({
                id: rec.id,
                first_name: recNameParts[0] || 'Member',
                last_name: recNameParts.slice(1).join(' ') || '',
                phone_number: rec.phone || rec.phone_number || ''
              });
            }
          });
        }

      } catch (err) {
        console.error("Failed to extract co-recipients for active composition layout:", err);
      }
    }

    setSelectedRecipients(combinedRecipients);
    const countOthers = combinedRecipients.length - 1;
    setActiveGroupContext(
      countOthers > 0 
        ? `Group Reply to: ${msg.sender_name?.trim()} and ${countOthers} other${countOthers > 1 ? 's' : ''}`
        : `Reply to: ${msg.sender_name?.trim()}`
    );

    setActiveTab('contacts');
  };

  const dispatchPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || selectedRecipients.length === 0) return;
    
    setTransmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('sender_id', userData?.id || '');
      formPayload.append('sender_name', `${userData?.first_name || 'Member'} ${userData?.last_name || ''}`);
      formPayload.append('sender_phone', userData?.phone_number || '');
      formPayload.append('message', chatMessage);
      formPayload.append('shop_id', userData?.shop_id || '68');

      // 🛑 EXTRACTION CHANGE: Passes array lists of targets details to n8n 🛑
      const recipientIds = selectedRecipients.map(r => r.id).join(',');
      const recipientNames = selectedRecipients.map(r => `${r.first_name} ${r.last_name}`).join(',');
      const recipientPhones = selectedRecipients.map(r => r.phone_number || '').join(',');

      formPayload.append('recipient_ids', recipientIds);
      formPayload.append('recipient_names', recipientNames);
      formPayload.append('recipient_phones', recipientPhones);

      // 2. NEW CRITICAL ADDITION: Structured object array mapped to pass group context
      const fullRecipientsArray = selectedRecipients.map(r => ({
        id: r.id,
        name: `${r.first_name} ${r.last_name}`.trim(),
        phone: r.phone_number || ''
      }));
      
      // Serialize array to a JSON string string so FormData can carry it across HTTP safely
      formPayload.append('all_recipients_json', JSON.stringify(fullRecipientsArray));

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
        alert(`Message sent successfully to ${selectedRecipients.length} recipients!`);
        setChatMessage('');
        setSelectedFile(null);
        setSelectedRecipients([]);
        setActiveGroupContext(''); // Reset the group context tracking state upon delivery
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
          <button type="button" onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50">
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'contacts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MessageCircle size={14} /> Send New
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History size={14} /> Inbox Mailbox
          </button>
        </div>

        {/* Layout Panels Content Area */}
        <div className="p-6 flex flex-col flex-1 overflow-y-auto min-h-[40vh] max-h-[55vh]">
          {activeTab === 'contacts' ? (
            <div className="space-y-4">
              {/* Directory Contact Picker Box */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">
                  Select Recipients ({selectedRecipients.length} Chosen)
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5" />
                  <input 
                    type="text"
                    placeholder="Search member by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 p-2 bg-white border border-gray-200 rounded-lg font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* NEW: Dedicated display layout block for Selected Recipients Badges */}
                {selectedRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-100 rounded-xl max-h-[10vh] overflow-y-auto animate-in fade-in duration-150">
                    {selectedRecipients.map(recipient => (
                      <span 
                        key={recipient.id} 
                        className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-indigo-100"
                      >
                        {recipient.first_name} {recipient.last_name}
                        <button
                          type="button"
                          onClick={() => handleToggleRecipient(recipient)}
                          className="hover:bg-indigo-200/60 ml-0.5 px-1 rounded text-indigo-500 hover:text-indigo-700 font-black text-xs"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Vertical checklist view layout grid tracking */}
                <div className="max-h-[16vh] overflow-y-auto space-y-1.5 pr-1">
                  {loading ? (
                    <p className="text-center py-4 text-xs font-bold uppercase animate-pulse text-gray-400">Loading congregation records...</p>
                  ) : filteredContacts.filter(member => !selectedRecipients.some(r => r.id === member.id)).length === 0 ? (
                    <p className="text-center py-4 text-xs italic text-gray-400">No unselected members found.</p>
                  ) : (
                    filteredContacts
                      // CRITICAL FIX: Actively subtracts selected contacts out of the unselected list stack
                      .filter(member => !selectedRecipients.some(r => r.id === member.id))
                      .map(member => {
                        return (
                          <div 
                            key={member.id}
                            onClick={() => handleToggleRecipient(member)}
                            className="p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all bg-white border-gray-100 hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{member.first_name} {member.last_name}</p>
                              <p className="text-[9px] text-gray-400 font-medium">{member.department || 'Congregation'}</p>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-bold px-2 py-0.5 bg-indigo-50/40 rounded-md border border-indigo-100/30">
                              Add +
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>


              {/* Composition inputs field */}
              {selectedRecipients.length > 0 && (
                <form onSubmit={dispatchPrivateMessage} className="space-y-4 animate-in fade-in duration-200 text-left">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Message Details</label>
                    <textarea
                      rows={3}
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder="Write your private message here..."
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-700 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Attach Document / Photo (Optional)</label>
                    <div className="relative flex items-center justify-center w-full bg-gray-50 ring-1 ring-gray-200/50 rounded-xl p-3 hover:bg-gray-100/70 transition-colors">
                      <input 
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={e => {
                          if (e.target.files && e.target.files) {
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
                    Send to {selectedRecipients.length} Members
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Inbox Received Messaging Logs view */
            <div className="overflow-y-auto space-y-3 pr-1">
              {loading ? (
                <p className="text-center py-10 text-xs font-bold uppercase animate-pulse text-gray-400">Opening mailbox...</p>
              ) : receivedMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-wider">Your Inbox is Empty</p>
                  <p className="text-[11px] text-gray-400 mt-1">Messages sent to you will appear here.</p>
                </div>
              ) : (
                receivedMessages.map((msg: any) => {
                  // 1. Process multi-recipient arrays cleanly across JSON parameters or fallback string splits
                  let coRecipients: string[] = [];
                  let hasMultipleRecipients = false;

                  try {
                    if (msg.all_recipients_json) {
                      const parsed = typeof msg.all_recipients_json === 'string' 
                        ? JSON.parse(msg.all_recipients_json) 
                        : msg.all_recipients_json;
                      if (Array.isArray(parsed)) {
                        coRecipients = parsed
                          .filter((r: any) => r.id !== userData?.id)
                          .map((r: any) => r.name || `${r.first_name} ${r.last_name}`.trim());
                      }
                    } else if (msg.recipient_names && msg.recipient_ids?.includes(',')) {
                      // Fallback: Safe parsing using legacy comma-separated lists if json column isn't populated
                      const names = msg.recipient_names.split(',');
                      const ids = msg.recipient_ids.split(',');
                      const userIdx = ids.indexOf(userData?.id?.toString());
                      
                      coRecipients = names.filter((_: any, idx: number) => idx !== userIdx);
                    }
                    hasMultipleRecipients = coRecipients.length > 0;
                  } catch (e) {
                    console.error("Error evaluating recipient metadata:", e);
                  }

                  return (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-left animate-in fade-in duration-100">
                      <div className="flex justify-between items-start text-[10px] font-black text-indigo-600 uppercase">
                        <div>
                          <span>From: {msg.sender_name || 'Anonymous Member'}</span>
                          
                          {/* 2. VISIBILITY: Show other group recipients directly in the inbox row context */}
                          {hasMultipleRecipients && (
                            <span className="text-[9px] text-gray-400 font-medium block mt-0.5 normal-case max-w-[260px] truncate">
                              <span className="font-bold text-gray-500">To:</span> You, {coRecipients.join(', ')}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 font-bold whitespace-nowrap ml-2">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 font-medium leading-relaxed break-words">{msg.message}</p>
                      
                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between mt-1 gap-2">
                        {/* Preserve exact legacy Attachment Media view state checks */}
                        {msg.pdf_url && msg.pdf_url.trim() !== "" ? (
                          <a 
                            href={msg.pdf_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[9px] bg-white border border-gray-200 font-black text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-300">No Attachment</span>
                        )}

                        <div className="flex gap-1.5">
                          {/* Standard single reply to sender button */}
                          <button
                            type="button"
                            onClick={() => handleInitiateReply(msg)}
                            className="text-[9px] bg-indigo-50 border border-indigo-100 font-black text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center gap-1"
                          >
                            <Reply size={10} /> Reply
                          </button>

                          {/* 3. NEW ACTION: Render "Reply All" button only if it is a multi-user group thread */}
                          {hasMultipleRecipients && (
                            <button
                              type="button"
                              onClick={() => handleReplyAll(msg)}
                              className="text-[9px] bg-blue-50 border border-blue-100 font-black text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Users size={10} /> Reply All
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
