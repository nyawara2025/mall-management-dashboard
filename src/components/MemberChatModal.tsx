import React, { useState, useEffect } from 'react';
import { X, Search, Send, Loader2, MessageSquare, History, MessageCircle, Upload, Paperclip, Reply, Users } from 'lucide-react';

interface MemberChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const MemberChatModal: React.FC<MemberChatModalProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'contacts'>('history');
  
  // 2. Thread History Inspection State
  // When a member clicks a message, we'll store it here to open the thread depth view
  const [selectedThreadMsg, setSelectedThreadMsg] = useState<any | null>(null);

  const [membersList, setMembersList] = useState<any[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showToastAlert, setShowToastAlert] = useState<{show: boolean; message: string} | null>(null);
  
  // --- CHANGED TO ARRAY FOR MULTI-SELECT ---
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);

  const [chatSubject, setChatSubject] = useState('');
  
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

  // 🟢 INSERT THE STEP 2 UNREAD TRACKER AND ALERT NOTIFIER HERE
  useEffect(() => {
    if (Array.isArray(receivedMessages) && receivedMessages.length > 0) {
      // 1. Calculate unread count using an explicit property boolean flag check
      const currentUnread = receivedMessages.filter((msg: any) => msg.is_read === false || msg.is_read === 0).length;
      
      // 2. Alert engine check: Trigger toast if a new unread payload enters state memory
      if (currentUnread > unreadCount) {
        const newestMsg = receivedMessages[0]; // Fetches newest incoming message entry details
        
        setShowToastAlert({
          show: true,
          message: `New message from ${newestMsg?.sender_name || 'Church Member'}`
        });

        // Dismiss the notification box banner automatically after 4 seconds
        setTimeout(() => {
          setShowToastAlert(null);
        }, 4000);
      }

      setUnreadCount(currentUnread);
    } else if (receivedMessages.length === 0) {
      setUnreadCount(0);
    }
  }, [receivedMessages]);

  // --- MAILING LIST FUNCTIONALITY STATE MATRIX ---
  const [mailingLists, setMailingLists] = useState<any[]>([]);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // Load saved mailing lists from the backend when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMailingLists();
    }
  }, [isOpen]);

  const fetchMailingLists = async () => {
    setIsLoadingLists(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-fetch-maillist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shop_id: userData?.shop_id || 68,
          created_by: userData?.id 
        }),
      });
      const data = await response.json();
      setMailingLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load mailing lists:", err);
    } finally {
      setIsLoadingLists(false);
    }
  };


  const handleSaveMailingList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return alert("Please enter a name for your mailing list.");
    if (selectedRecipients.length === 0) return alert("Please select at least one member to create a list.");

    try {
      const payload = {
        shop_id: userData?.shop_id || 68,
        list_name: newListName.trim(),
        created_by: userData?.id,
        // CRUCIAL CORRECTION: Map strictly over selectedRecipients, NOT membersList
        members: selectedRecipients.map(r => ({
          id: Number(r.id),
          name: `${r.first_name} ${r.last_name}`.trim(),
          phone: r.phone_number || r.phone || ''
        }))
      };

      const response = await fetch('https://n8n.tenear.com/webhook/church-save-maillist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`Mailing list "${newListName}" saved successfully!`);
        setNewListName('');
        setIsCreatingList(false);
        if (typeof fetchMailingLists === 'function') fetchMailingLists();
      }
    } catch (err) {
      alert("Failed to save mailing list configuration.");
    }
  };



  const handleApplyMailingList = (list: any) => {
    if (!list) return;

    // 1. Log the raw object directly to the inspect panel console for quick diagnosis
    console.log("CRITICAL CONTEXT - Raw mailing list object clicked:", list);

    // 2. Resolve the members payload across string, object, or alternative key names
    let rawMembersMaterial = list.members || list.members_list || list.all_recipients || list.payload || list;

    // If the database row stringified the JSONB data, parse it back into a JavaScript array
    if (typeof rawMembersMaterial === 'string') {
      try {
        rawMembersMaterial = JSON.parse(rawMembersMaterial);
      } catch (e) {
        console.error("Failed to parse stringified members field:", e);
      }
    }

    // 3. Fallback: If it's not a direct list array, check if it's nested inside the row data object properties
    const finalMembersArray = Array.isArray(rawMembersMaterial) 
      ? rawMembersMaterial 
      : (Array.isArray(list) ? list : []);

    if (finalMembersArray.length === 0) {
      console.error("Data Extraction Mapping Error: No usable participant array located inside payload structure.", list);
      alert("Could not extract member list arrays. Check console logs for response format details.");
      return;
    }

    // 4. Map the identified array content safely to your recipient tokens badges
    const mappedRecipients = finalMembersArray.map((m: any) => {
      const rawFullName = m.name || m.recipient_name || m.sender_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Member';
      const cleanFullName = String(rawFullName).trim();
      const parts = cleanFullName.split(/\s+/);
      
      return {
        id: m.id || m.recipient_id || m.member_id,
        first_name: parts[0] || cleanFullName,
        last_name: parts.slice(1).join(' ') || '',
        phone_number: m.phone || m.recipient_phone || m.sender_phone || m.phone_number || ''
      };
    });

    console.log("Successfully compiled recipients matrix passed to badges:", mappedRecipients);
    setSelectedRecipients(mappedRecipients);
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

  const handleReplyAll = (msg: any) => {
    const combinedRecipients: any[] = [];
    
    const currentUserId = userData?.id ? Number(userData.id) : null;
    const originalSenderId = msg.sender_id ? Number(msg.sender_id) : null;

    // 1. Map the Original Sender
    if (originalSenderId && originalSenderId !== currentUserId) {
      const cleanSenderName = (msg.sender_name || 'Member').trim();
      const senderParts = cleanSenderName.split(/\s+/);

      combinedRecipients.push({
        id: originalSenderId,
        first_name: senderParts[0] || cleanSenderName,
        last_name: senderParts.slice(1).join(' ') || '',
        phone_number: msg.sender_phone || ''
      });
    }

    // 2. Map the Co-Recipients from the JSON field
    if (msg.all_recipients_json) {
      try {
        const parsedRecipients = typeof msg.all_recipients_json === 'string'
          ? JSON.parse(msg.all_recipients_json)
          : msg.all_recipients_json;

        if (Array.isArray(parsedRecipients)) {
          parsedRecipients.forEach((rec: any) => {
            const recId = rec.id ? Number(rec.id) : null;
            
            // Factual rule matching: Skip current user and duplicate sender
            if (recId && recId !== currentUserId && recId !== originalSenderId) {
              const cleanRecName = (rec.name || rec.recipient_name || '').trim();
              
              if (cleanRecName) {
                const recParts = cleanRecName.split(/\s+/);
                
                combinedRecipients.push({
                  id: recId,
                  first_name: recParts[0] || cleanRecName,
                  last_name: recParts.slice(1).join(' ') || '',
                  phone_number: rec.phone || rec.phone_number || ''
                });
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to extract co-recipients inside handleReplyAll:", err);
      }
    }

    console.log("SUCCESS: Final processed array being passed to UI badges:", combinedRecipients);
    setSelectedRecipients(combinedRecipients);
    
    const countOthers = combinedRecipients.length - 1;
    setActiveGroupContext(
      countOthers > 0 
        ? `Group Reply to: ${(msg.sender_name || '').trim()} and ${countOthers} others`
        : `Reply to: ${(msg.sender_name || '').trim()}`
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
      formPayload.append('sender_name', `${userData?.first_name || 'Member'} ${userData?.last_name || ''}`.trim());
      formPayload.append('sender_phone', userData?.phone_number || '');
      formPayload.append('message', chatMessage);
      formPayload.append('subject', chatSubject);
      formPayload.append('shop_id', userData?.shop_id || '68');

      // 1. Structural legacy comma lists
      const recipientIds = selectedRecipients.map(r => r.id).join(',');
      const recipientNames = selectedRecipients.map(r => `${r.first_name} ${r.last_name}`.trim()).join(',');
      const recipientPhones = selectedRecipients.map(r => r.phone_number || r.phone || '').join(',');

      formPayload.append('recipient_ids', recipientIds);
      formPayload.append('recipient_names', recipientNames);
      formPayload.append('recipient_phones', recipientPhones);

      // 2. FORCE COMPLETE RECIPIENT LOG MATRIX FOR EVERY METHOD SELECTION
      const fullRecipientsArray = selectedRecipients.map(r => ({
        id: Number(r.id),
        name: `${r.first_name} ${r.last_name}`.trim(),
        phone: r.phone_number || r.phone || ''
      }));
      
      // Ensure it is stringified cleanly into a text row block field property
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
        alert(`Message broadcast successfully to ${selectedRecipients.length} recipients!`);
        setChatMessage('');
        setSelectedFile(null);
        setSelectedRecipients([]);
        setActiveGroupContext('');
        setChatSubject('');
        setActiveTab('history'); 
        if (activeTab === 'history') fetchReceivedChatHistory(); // Force dynamic reload refresh
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
            onClick={() => {
              setActiveTab('history');
              setSelectedThreadMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History size={14} /> Inbox Mailbox
          </button>

          <button 
            type="button" 
            onClick={() => {
              setActiveTab('contacts');
              setSelectedThreadMsg(null);
            }} 
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'contacts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >

            <MessageCircle size={14} /> Send New
          </button>
        </div>

        {activeTab === 'history' ? (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {loading ? (
              <p className="text-center py-10 text-xs font-bold uppercase animate-pulse text-gray-400">Opening mailbox...</p>
            ) : receivedMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <History size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider">Your Inbox is Empty</p>
                <p className="text-[11px] text-gray-400 mt-1">Messages sent to you will appear here.</p>
              </div>
            ) : (
              // 🟢 ITEM 3: Sort array dynamically to ensure newest message dates appear on top
              [...receivedMessages]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((msg: any) => {
                  let coRecipients: string[] = [];
                  let hasMultipleRecipients = false;
                  
                  try {
                    if (msg.all_recipients_json) {
                      const parsed = typeof msg.all_recipients_json === 'string' ? JSON.parse(msg.all_recipients_json) : msg.all_recipients_json;
                      if (Array.isArray(parsed)) {
                        coRecipients = parsed
                          .filter((r: any) => r.id !== userData?.id)
                          .map((r: any) => r.name || `${r.first_name} ${r.last_name}`.trim());
                      }
                    } else if (msg.recipient_names && msg.recipient_ids?.includes(',')) {
                      const names = msg.recipient_names.split(',');
                      const ids = msg.recipient_ids.split(',');
                      const userIdx = ids.indexOf(userData?.id?.toString());
                      coRecipients = names.filter((_: any, idx: number) => idx !== userIdx);
                    }
                    hasMultipleRecipients = coRecipients.length > 0;
                  } catch (e) {
                    console.error("Error evaluating recipient metadata:", e);
                  }

                  // Check for unread status flag properties
                  const isUnread = msg.is_read === false || msg.status === 'unread';

                  return (
                    <div 
                      key={msg.id} 
                      onClick={() => setSelectedThreadMsg(msg)} // Clicking opens depth history thread view
                      className={`p-4 rounded-2xl border text-left animate-in fade-in duration-100 cursor-pointer transition-all hover:border-indigo-200 ${
                        isUnread ? 'bg-indigo-50/30 border-indigo-100 shadow-sm' : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      {/* Meta Envelope Strip */}
                      <div className="flex justify-between items-start text-[10px] font-black text-indigo-600 uppercase">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>From: {msg.sender_name || 'Anonymous Member'}</span>
                            
                            {/* 🟢 ITEM 6: Dynamic Visual Unread Indicators Badge */}
                            {isUnread && (
                              <span className="bg-indigo-600 text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase animate-pulse">
                                New
                              </span>
                            )}
                          </div>
                          
                          {/* Item 4 Context: Displaying other recipients on the mailing list to the member */}
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

                      {/* Subject Context Block */}
                      {msg.subject && msg.subject.trim() !== "" && (
                        <div className="bg-white border border-gray-100 px-2.5 py-1.5 rounded-xl mt-1.5">
                          <p className="text-[10px] uppercase font-black tracking-wider text-indigo-500 block mb-0.5">Subject / Purpose</p>
                          <p className="text-xs font-bold text-gray-800 leading-snug">{msg.subject}</p>
                        </div>
                      )}

                      {/* Snippet message body */}
                      <p className="text-sm text-gray-700 font-medium leading-relaxed break-words py-1 line-clamp-2 mt-1">
                        {msg.message}
                      </p>

                      {/* Action Row Footer Controls */}
                      <div className="pt-2 border-t border-gray-200/40 flex items-center justify-between mt-1 gap-2" onClick={e => e.stopPropagation()}>
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
                          {/* 1-on-1 Direct Reply */}
                          <button 
                            type="button" 
                            onClick={() => {
                              setActiveGroupContext('');
                              setSelectedRecipients([{ 
                                id: msg.sender_id, 
                                first_name: msg.sender_name?.split(' ')[0] || 'Sender', 
                                last_name: msg.sender_name?.split(' ')[1] || '' 
                              }]);
                              setChatSubject(msg.subject ? `Re: ${msg.subject.replace(/^Re:\s*/i, '')}` : 'Re: Private Message');
                              setActiveTab('contacts');
                            }} 
                            className="text-[9px] bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 font-black text-indigo-600 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Reply
                          </button>

                          {/* 👥 Group Reply All */}
                          {hasMultipleRecipients && (
                            <button 
                              type="button" 
                              onClick={() => {
                                try {
                                  const parsedRecipients = typeof msg.all_recipients_json === 'string' ? JSON.parse(msg.all_recipients_json) : msg.all_recipients_json;
                                  if (Array.isArray(parsedRecipients)) {
                                    const threadTargets = parsedRecipients.map((r: any) => ({ 
                                      id: r.id, 
                                      first_name: r.name?.split(' ')[0] || r.first_name || '', 
                                      last_name: r.name?.split(' ')[1] || r.last_name || '' 
                                    }));
                                    setSelectedRecipients(threadTargets);
                                    setChatSubject(msg.subject ? `Re: ${msg.subject.replace(/^Re:\s*/i, '')}` : 'Re: Private Message');
                                    setActiveGroupContext('reply_all_context');
                                    setActiveTab('contacts');
                                  }
                                } catch (err) {
                                  console.error("Failed to parse reply all thread recipient targets:", err);
                                }
                              }} 
                              className="text-[9px] bg-indigo-600 hover:bg-indigo-700 font-black text-white px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              Reply All
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
            )}
          </div>
        ) : (

          /* TAB 2: SEND NEW / CONTACTS COMPOSITION COMPONENT VIEW */
          <div className="space-y-4 w-full">
            
            {/* 1. RECIPIENT SELECTION CONTROLS CARDS PLACED AT THE VERY TOP */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3 flex-shrink-0">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">
                  Select Recipients ({selectedRecipients.length} Chosen)
                </label>
                {selectedRecipients.length > 0 && !isCreatingList && !chatSubject.trim() && !chatMessage.trim() && (
                  <button type="button" onClick={() => setIsCreatingList(true)} className="text-[10px] font-black text-indigo-600 hover:underline">
                    Save As List Template
                  </button>
                )}
              </div>

              {/* Hide mailing lists template boxes once member starts typing message detail columns */}
              {!chatSubject.trim() && !chatMessage.trim() && (
                <div className="bg-white border border-gray-100 p-2.5 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                  <span className="font-bold text-gray-500 text-[10px] uppercase block">Mailing Lists Templates</span>
                  {isCreatingList ? (
                    <div className="flex gap-1.5 items-center">
                      <input type="text" placeholder="List name (e.g. Choir Group)..." className="flex-1 p-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-medium outline-none text-slate-800" value={newListName} onChange={e => setNewListName(e.target.value)} />
                      <button type="button" onClick={handleSaveMailingList} className="bg-indigo-600 text-white px-2 py-1.5 rounded-md font-bold text-[10px]">Save</button>
                      <button type="button" onClick={() => { setIsCreatingList(false); setNewListName(''); }} className="text-gray-400 px-1 font-bold text-[10px]">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {isLoadingLists ? (
                        <span className="text-[10px] text-gray-400 italic">Syncing groups...</span>
                      ) : mailingLists.length === 0 ? (
                        <span className="text-[10px] text-gray-300 italic">No saved lists found. Select members to save a shortcut.</span>
                      ) : (
                        mailingLists
                          .filter((list: any) => {
                            if (!list.members) return false;
                            const roster = typeof list.members === 'string' ? JSON.parse(list.members) : list.members;
                            return Array.isArray(roster) && roster.some((m: any) => Number(m.id || m.member_id) === Number(userData?.id));
                          })
                          .map((list: any) => (
                            <button key={list.id} type="button" onClick={() => handleApplyMailingList(list)} className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold transition-all">
                              👥 {list.list_name} ({list.members?.length || 0})
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hide Live Filter Search row field block completely while member types text parameters */}
              {!chatSubject.trim() && !chatMessage.trim() && (
                <div className="relative animate-in fade-in duration-200">
                  <Search className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5" />
                  <input type="text" placeholder="Search member by name..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 p-2 bg-white border border-gray-200 rounded-lg font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" />
                </div>
              )}

              {/* Selected Badges Array Strip Grid */}
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-100 rounded-xl max-h-[10vh] overflow-y-auto">
                  {selectedRecipients.map(recipient => (
                    <span key={recipient.id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                      {recipient.first_name} {recipient.last_name}
                      {!chatSubject.trim() && !chatMessage.trim() && (
                        <button type="button" onClick={() => handleToggleRecipient(recipient)} className="hover:bg-indigo-200/60 ml-0.5 px-1 rounded text-indigo-500 hover:text-indigo-700 font-black text-xs">&times;</button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Selection checklist view loop row items grid area */}
              <div className="h-[22vh] max-h-[160px] overflow-y-auto space-y-1.5 pr-1 text-slate-800 bg-white rounded-xl p-1">
                {loading ? (
                  <p className="text-center py-4 text-xs font-bold uppercase animate-pulse text-gray-400">Loading records...</p>
                ) : chatSubject.trim() || chatMessage.trim() ? (
                  <p className="text-left py-1 text-[11px] font-semibold text-slate-400 italic animate-in fade-in">
                    Directory selector collapsed. Clear text fields below to modify recipient list selection.
                  </p>
                ) : filteredContacts.length === 0 ? (
                  <p className="text-center py-4 text-xs italic text-gray-400">No matching members found.</p>
                ) : (
                  filteredContacts
                    .filter(member => {
                      const matchesSearch = member.first_name?.toLowerCase().includes(search.toLowerCase()) || member.last_name?.toLowerCase().includes(search.toLowerCase());
                      const isChosen = selectedRecipients.some(r => Number(r.id) === Number(member.id));
                      if (search.trim() !== '') return matchesSearch;
                      if (activeGroupContext !== '') return isChosen;
                      return true;
                    })
                    .sort((a, b) => {
                      const aChosen = selectedRecipients.some(r => Number(r.id) === Number(a.id));
                      const bChosen = selectedRecipients.some(r => Number(r.id) === Number(b.id));
                      return (aChosen === bChosen) ? 0 : aChosen ? -1 : 1;
                    })
                    .map(member => {
                      const isChosen = selectedRecipients.some(r => Number(r.id) === Number(member.id));
                      return (
                        <div key={member.id} onClick={() => handleToggleRecipient(member)} className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all bg-white ${isChosen ? 'border-indigo-200 bg-indigo-50/20 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <div>
                            <p className="font-bold text-gray-900 text-xs">{member.first_name} {member.last_name}</p>
                            <p className="text-[9px] text-gray-400 font-medium">{member.department || 'Congregation'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isChosen ? 'text-indigo-700 bg-indigo-100 border-indigo-200' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>
                            {isChosen ? 'Selected ✓' : 'Add +'}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* 2. MESSAGE COMPOSITION INPUT TEXT FORM FIELDS MOVED SECURELY BELOW */}
            {selectedRecipients.length > 0 && (
              <form onSubmit={dispatchPrivateMessage} className="space-y-4 animate-in fade-in duration-200 text-left bg-indigo-50/10 p-3.5 border border-indigo-100/40 rounded-2xl pb-4">
                <div>
                  <label className="text-[10px] font-black text-indigo-600 block mb-1 uppercase tracking-wider">Subject / Purpose</label>
                  <input type="text" value={chatSubject} onChange={e => setChatSubject(e.target.value)} placeholder="Enter message subject..." className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-gray-700 shadow-sm transition-all text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-indigo-600 block mb-1 uppercase tracking-wider">Message Details</label>
                  <textarea rows={3} value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Write your private message here..." className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-700 resize-none shadow-sm text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Attach Document / Photo (Optional)</label>
                  <div className="relative flex items-center justify-center w-full bg-white ring-1 ring-gray-200/50 rounded-xl p-3 hover:bg-gray-100/70 transition-colors shadow-sm">
                  <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={e => { if (e.target.files && e.target.files[0]) { setSelectedFile(e.target.files[0]); } }} 
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all" 
                >
                  {transmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} 
                  Send to {selectedRecipients.length} Members
                </button>
              </form>
            )}

          </div>
            
        )}
      </div>

      {/* 🟢 ITEM 7: THREAD EMAIL CONVERSATION HISTORY INSPECTION OVERLAY */} 
      {selectedThreadMsg && ( 
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-200 text-slate-800"> 
          
          {/* Thread Subject Header */} 
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0"> 
            <div> 
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-600 rounded text-white"> 
                Conversation Thread 
              </span> 
              <h3 className="text-base font-black uppercase tracking-tight mt-1 truncate max-w-[280px]"> 
                {selectedThreadMsg.subject || 'Private Message'} 
              </h3> 
            </div> 
            <button onClick={() => setSelectedThreadMsg(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"> 
              <X size={18}/> 
            </button> 
          </div> 

          {/* Chronological Chat Flow Container */} 
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50"> 
            {[...receivedMessages] 
              .filter((m: any) => m.sender_id === selectedThreadMsg.sender_id || m.subject === selectedThreadMsg.subject) 
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) 
              .map((historicalMsg: any) => { 
                const isOriginator = historicalMsg.sender_id !== userData?.id; 
                return ( 
                  <div key={historicalMsg.id} className={`p-3.5 rounded-2xl max-w-[85%] border shadow-sm flex flex-col text-left transition-all ${isOriginator ? 'bg-white border-slate-100 mr-auto' : 'bg-indigo-600 text-white border-indigo-500 ml-auto'}`} > 
                    <div className="flex justify-between items-center gap-4 text-[9px] font-black uppercase opacity-60 mb-1"> 
                      <span>{isOriginator ? historicalMsg.sender_name : 'You'}</span> 
                      <span>{new Date(historicalMsg.created_at).toLocaleDateString()}</span> 
                    </div> 
                    <p className="text-xs font-medium leading-relaxed break-words">{historicalMsg.message}</p> 
                    {historicalMsg.pdf_url && historicalMsg.pdf_url.trim() !== "" && ( 
                      <a href={historicalMsg.pdf_url} target="_blank" rel="noopener noreferrer" className={`text-[9px] font-black px-2 py-1 rounded mt-2 text-center border self-start transition-colors ${isOriginator ? 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-slate-100' : 'bg-indigo-700 border-indigo-500 text-white hover:bg-indigo-800'}`} > 
                        View Attachment 
                      </a> 
                    )} 
                  </div> 
                ); 
              })} 
          </div> 

          {/* Thread Drawer Footer Controls */} 
          <div className="p-4 bg-slate-100 border-t flex justify-between items-center flex-shrink-0"> 
            <button 
              type="button"
              onClick={() => { 
                const targetMsg = selectedThreadMsg; 
                setSelectedThreadMsg(null); 
                setActiveGroupContext(''); 
                setSelectedRecipients([{ 
                  id: targetMsg.sender_id, 
                  first_name: targetMsg.sender_name?.split(' ')[0] || 'Sender', 
                  last_name: targetMsg.sender_name?.split(' ')[1] || '' 
                }]); 
                setChatSubject(targetMsg.subject ? `Re: ${targetMsg.subject.replace(/^Re:\s*/i, '')}` : 'Re: Private Message'); 
                setActiveTab('contacts'); 
              }} 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm" 
            > 
              Quick Reply 
            </button> 
            <button 
              type="button"
              onClick={() => setSelectedThreadMsg(null)} 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
            > 
              Close Thread 
            </button> 
          </div> 

        </div> 
      )} 

    </div>  
  ); 
};
