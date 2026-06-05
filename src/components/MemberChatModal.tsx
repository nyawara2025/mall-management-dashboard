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

              {/* 🟢 STEP 1: Bring the Composition Message Input Form to the very top */}
              {selectedRecipients.length > 0 && (
                <form onSubmit={dispatchPrivateMessage} className="space-y-4 animate-in fade-in duration-200 text-left bg-indigo-50/10 p-3.5 border border-indigo-100/40 rounded-2xl">

                  {/* 🟢 NEW: SUBJECT INPUT ROW FIELD */}
                  <div>
                    <label className="text-[10px] font-black text-indigo-600 block mb-1 uppercase tracking-wider">Subject / Purpose</label>
                    <input 
                      type="text"
                      value={chatSubject}
                      onChange={e => setChatSubject(e.target.value)}
                      placeholder="Enter message subject (e.g. Choir Rehearsal Notice)..."
                      className="w-full p-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-gray-700 shadow-sm transition-all"
                    />
                  </div>

                  {/* Existing Message Details textarea block follows seamlessly below */}
                  <div>
                    <label className="text-[10px] font-black text-indigo-600 block mb-1 uppercase tracking-wider">Message Details</label>
                    <textarea
                      rows={3}
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder="Write your private message here..."
                      className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-700 resize-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-indigo-600 block mb-1 uppercase tracking-wider">Message Details</label>
                    <textarea
                      rows={3}
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder="Write your private message here..."
                      className="w-full p-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-700 resize-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Attach Document / Photo (Optional)</label>
                    <div className="relative flex items-center justify-center w-full bg-white ring-1 ring-gray-200/50 rounded-xl p-3 hover:bg-gray-100/70 transition-colors shadow-sm">
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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    {transmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    Send to {selectedRecipients.length} Members
                  </button>
                </form>
              )}

              {/* Directory Contact Picker Box */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">
                  Select Recipients ({selectedRecipients.length} Chosen)
                </label>
                
                {/* --- NEW: MAILING LIST MANAGEMENT CONTEXT PANEL --- */}
                <div className="bg-white border border-gray-100 p-2.5 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-500 text-[10px] uppercase">Mailing Lists Templates</span>
                    {selectedRecipients.length > 0 && !isCreatingList && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingList(true)}
                        className="text-[10px] font-black text-indigo-600 hover:underline"
                      >
                        Save Current Selection as List
                      </button>
                    )}
                  </div>

                  {/* Form to name and save a list */}
                  {isCreatingList ? (
                    <div className="flex gap-1.5 items-center animate-in fade-in duration-100">
                      <input 
                        type="text"
                        placeholder="List name (e.g. Choir Group)..."
                        className="flex-1 p-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-medium outline-none"
                        value={newListName}
                        onChange={e => setNewListName(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={handleSaveMailingList} 
                        className="bg-indigo-600 text-white px-2 py-1.5 rounded-md font-bold text-[10px]"
                      >
                        Save
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setIsCreatingList(false); setNewListName(''); }} 
                        className="text-gray-400 px-1 font-bold text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* Display list templates selection triggers */
                    <div className="flex flex-wrap gap-1">
                      {isLoadingLists ? (
                        <span className="text-[10px] text-gray-400 italic">Syncing groups...</span>
                      ) : mailingLists.length === 0 ? (
                        <span className="text-[10px] text-gray-300 italic">No saved lists found. Select members to save a shortcut.</span>
                      ) : (
                        mailingLists.map((list) => (
                          <button
                            key={list.id}
                            type="button"
                            onClick={() => handleApplyMailingList(list)}
                            className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold transition-all"
                          >
                            👥 {list.list_name} ({list.members?.length || 0})
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

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
                  ) : (
                    filteredContacts
                      .filter(member => {
                        // 🟢 STEP 1: Evaluate if this person matches what the user typed in the search bar
                        const matchesSearch = 
                          member.first_name?.toLowerCase().includes(search.toLowerCase()) ||
                          member.last_name?.toLowerCase().includes(search.toLowerCase());

                        // 🟢 STEP 2: Evaluate if this person has been selected
                        const isChosen = selectedRecipients.some(r => Number(r.id) === Number(member.id));

                        // 🟢 STEP 3: If searching, show matching available contacts (even if not chosen yet)
                        if (search.trim() !== '') {
                          return matchesSearch;
                        }

                        // 🟢 STEP 4: If a mailing list group template is active, show only those chosen group members
                        if (activeGroupContext !== '') {
                          return isChosen;
                        }

                        // 🟢 STEP 5: Default state (no search, no group template clicked)
                        // Show already selected badges + unselected directory rows so the user can see everything
                        return true; 
                      })

                      // 🟢 ADD THIS SORT BLOCK HERE TO PUSH CHOSEN NAMES TO THE TOP
                      .sort((a, b) => {
                        const aChosen = selectedRecipients.some(r => Number(r.id) === Number(a.id));
                        const bChosen = selectedRecipients.some(r => Number(r.id) === Number(b.id));
                        
                        // If 'a' is chosen and 'b' is not, move 'a' up (returns -1)
                        // If 'b' is chosen and 'a' is not, move 'b' up (returns 1)
                        return (aChosen === bChosen) ? 0 : aChosen ? -1 : 1;
                      })
                      // 🟢 THE EXISTING MAP BLOCK SEAMLESSLY CONTINUES UNTOUCHED BELOW        

                      .map(member => {
                        const isChosen = selectedRecipients.some(r => Number(r.id) === Number(member.id));
        
                        return (
                          <div 
                            key={member.id}
                            onClick={() => handleToggleRecipient(member)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all bg-white ${
                              isChosen 
                                ? 'border-indigo-200 bg-indigo-50/20 shadow-sm' 
                                : 'border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{member.first_name} {member.last_name}</p>
                              <p className="text-[9px] text-gray-400 font-medium">{member.department || 'Congregation'}</p>
                            </div>
            
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isChosen
                                ? 'text-indigo-700 bg-indigo-100 border-indigo-200'
                                : 'text-gray-400 bg-gray-50 border-gray-100'
                            }`}>
                              {isChosen ? 'Selected ✓' : 'Add +'}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                  
                  {/* Empty fallback display notice check */}
                {!loading && filteredContacts.filter(member => {
                  return selectedRecipients.some(r => Number(r.id) === Number(member.id));
                }).length === 0 && (
                  <p className="text-center py-4 text-xs italic text-gray-400">No matching thread members found.</p>
                )}
              </div>
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
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGroupContext('');
                              setSelectedRecipients([{
                                id: msg.sender_id,
                                first_name: msg.sender_name?.split(' ')[0] || 'Sender',
                                last_name: msg.sender_name?.split(' ')[1] || ''
                              }]);
                              setActiveTab('contacts');
                            }}
                            className="text-[9px] bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 font-black text-indigo-600 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Reply
                          </button>

                          {hasMultipleRecipients && (
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const parsedRecipients = typeof msg.all_recipients_json === 'string'
                                    ? JSON.parse(msg.all_recipients_json)
                                    : msg.all_recipients_json;

                                  if (Array.isArray(parsedRecipients)) {
                                    const threadTargets = parsedRecipients.map((r: any) => ({
                                      id: r.id,
                                      first_name: r.name?.split(' ')[0] || r.first_name || '',
                                      last_name: r.name?.split(' ')[1] || r.last_name || ''
                                    }));
                                    setSelectedRecipients(threadTargets);
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
          )}
        </div>
      </div>
    </div>
  );
};
