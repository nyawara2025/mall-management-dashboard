import React, { useEffect, useState } from 'react';
import { X, Loader2, Upload, Paperclip } from 'lucide-react';

export const ViewBroadcastsModal = ({ isOpen, onClose, userData }: any) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- EXPANDED CREATION STATES ---
  const [isCreating, setIsCreating] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    target_scope: 'general', // 'general', 'ministry', or 'zone'
    target_name: 'General Notice',
    attachment_url: '' // To hold uploaded media paths
  });

  // Dynamic attachment tracking
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Safe split helper for users belonging to multiple ministries (e.g. "KAMA, Praise & Worship")
  const textMinistries = userData?.ministry_name 
    ? userData.ministry_name.split(',').map((m: string) => m.trim()) 
    : [];

  const handleCreateBroadcast = async () => {
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) {
      alert("Please fill in both the title and message content fields.");
      return;
    }
    setSending(true);
    try {
      // 1. Package the entire request payload into a standard multipart FormData container
      const formDataPayload = new FormData();
      
      // 2. Append the text attributes cleanly
      formDataPayload.append('sender_phone', userData?.phone_number || '0700000000');
      formDataPayload.append('org_id', userData?.org_id || '');
      formDataPayload.append('shop_id', userData?.shop_id || '68');
      formDataPayload.append('title', newBroadcast.title);
      formDataPayload.append('message', newBroadcast.message);
      formDataPayload.append('target_type', newBroadcast.target_scope);
      formDataPayload.append('target_name', newBroadcast.target_name);
      
      // Generate the exact path string pattern your n8n expects
      const generatedPathName = selectedFile 
        ? `uploaded_media_${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        : '';
      formDataPayload.append('attachment_path', generatedPathName);
      formDataPayload.append('target_id', newBroadcast.target_scope === 'zone' ? userData?.zone_id : userData?.ministry_id);

      // 3. Attach the actual physical binary file stream if one is selected
      if (selectedFile) {
        // This maps the actual binary content directly to the key 'photo' that n8n expects
        formDataPayload.append('photo', selectedFile); 
      }

      // 4. Transmit the multi-part data payload out to your n8n workflow
      const response = await fetch('https://n8n.tenear.com/webhook/create-church-broadcast', {
        method: 'POST',
        // Note: Do NOT explicitly set 'Content-Type' header here. 
        // Leaving it empty allows the browser to configure the boundary separators automatically.
        body: formDataPayload,
      });

      if (response.ok) {
        alert("Notice Broadcasted successfully!");
        setNewBroadcast({ title: '', message: '', target_scope: 'general', target_name: 'General Notice', attachment_url: '' });
        setSelectedFile(null);
        setIsCreating(false);
        fetchMessages();
      } else {
        throw new Error("Payload transmission rejected");
      }
    } catch (err) {
      alert("Error creating broadcast notice");
    } finally {
      setSending(false);
    }
  }; 

  if (!isOpen) return null;

  const isLeader = userData?.role?.toLowerCase() === 'leader';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center rounded-t-[2.5rem]">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Church Notices</h2>
            <p className="text-[10px] uppercase font-bold text-blue-100">Broadcasts & group updates</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors"><X size={24}/></button>
        </div>
        
        {/* Main Content Scroll Window */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
          
          {/* Action Trigger Card Banner Toggle */}
          {isLeader && (
            <button 
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-sm transition-all hover:bg-blue-100/50"
            >
              {isCreating ? 'Cancel' : '+ Create New Broadcast'}
            </button>
          )}

          {/* Elaborate Admin Multi-Selection Creator Drawer Form */}
          {isCreating && (
            <div className="space-y-4 bg-gray-50 p-5 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Dynamic Target Selection Dropdown Menu */}
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Broadcast Destination Target</label>
                <select
                  value={`${newBroadcast.target_scope}|${newBroadcast.target_name}`}
                  onChange={e => {
                    const [scope, name] = e.target.value.split('|');
                    setNewBroadcast({ ...newBroadcast, target_scope: scope, target_name: name });
                  }}
                  className="w-full p-3.5 rounded-xl border-none bg-white font-medium text-sm text-gray-700 ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {/* 🛑 GLOBAL CONGREGATION TARGET OVERRIDES 🛑 */}
                  <option value="general|All Church Members">All Church Members (General Broadcast)</option>
                  <option value="general|General Notice">General Congregation Notice</option>
                  
                  {/* Dynamic map mapping loop extraction of multiple ministries */}
                  {textMinistries.map((ministryName: string, idx: number) => (
                    <option key={idx} value={`ministry|${ministryName}`}>
                      Ministry: {ministryName}
                    </option>
                  ))}
                  
                  {/* Map Zone if exists */}
                  {userData?.zone_name && (
                    <option value={`zone|${userData.zone_name}`}>
                      Zone Group: {userData.zone_name}
                    </option>
                  )}
                </select>
              </div>

              {/* Dynamic BroadCast Title Field */}
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Notice Heading / Title</label>
                <input 
                  type="text"
                  placeholder="e.g., Zonal Fellowships / Choir Rehearsals Update"
                  value={newBroadcast.title}
                  onChange={e => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                  className="w-full p-3.5 rounded-xl border-none bg-white font-medium text-sm text-gray-700 ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Broadcast Description Content Body Textarea Field */}
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Message Body Content</label>
                <textarea 
                  rows={4}
                  className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 bg-white font-medium text-sm text-gray-700 outline-none resize-none" 
                  placeholder="Write notice description or agenda broadcast notes here..." 
                  value={newBroadcast.message}
                  onChange={e => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                />
              </div>

              {/* Media File Attachment Utility Field */}
              <div>
                <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Attach Document / Media (Image/Video/PDF)</label>
                <div className="relative flex items-center justify-center w-full bg-white ring-1 ring-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                  <input 
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    {selectedFile ? <Paperclip size={14} className="text-blue-500" /> : <Upload size={14} />}
                    <span>{selectedFile ? selectedFile.name : 'Choose file / snap photo...'}</span>
                  </div>
                </div>
              </div>

              {/* Post Submission Trigger Handle Button */}
              <button 
                type="button"
                onClick={handleCreateBroadcast} 
                disabled={sending || !newBroadcast.title.trim() || !newBroadcast.message.trim()}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 shadow-md shadow-blue-50"
              >
                {sending ? <Loader2 className="animate-spin" size={16} /> : null}
                {sending ? 'Posting Notice...' : 'Post Dynamic Broadcast'}
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
              messages.map((msg: any, i: number) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
                      {msg.target_name || 'General Notice'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold">
                      {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  
                  {/* Notice Title Header */}
                  {msg.title && <h4 className="font-bold text-gray-900 text-sm mb-1">{msg.title}</h4>}
                  
                  {/* Notice Content Body */}
                  <p className="text-sm text-gray-700 font-medium leading-relaxed mb-2">{msg.content || msg.message}</p>
                  
                  {/* Speaker info badge if present */}
                  {msg.speaker && (
                    <p className="text-[10px] text-gray-500 font-bold mb-2">Speaker: {msg.speaker}</p>
                  )}

                  {/* 🛑 UPDATE STRINGS RIGID CHECK ENGINES HERE 🛑 */}
                  {msg.pdf_url && msg.pdf_url.trim() !== "" && msg.pdf_url !== "https://pages.dev" && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M9 11h6"/></svg>
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-black text-gray-800 leading-none">Attached Resource File</p>
                          <p className="text-[9px] text-gray-400 font-medium mt-0.5">Click to view document</p>
                        </div>
                      </div>
    
                      <a 
                        href={msg.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-white border border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm"
                      >
                        View Attachment
                      </a>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
