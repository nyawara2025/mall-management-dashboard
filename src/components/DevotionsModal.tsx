import React, { useEffect, useState } from 'react';
import { X, Send, BookOpen, Loader2, History, PlusCircle } from 'lucide-react';

export const DevotionsModal = ({ isOpen, onClose, userData }: any) => {
  const [activeTab, setActiveTab] = useState<'history' | 'create'>('history');
  const [devotions, setDevotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [form, setForm] = useState({ title: '', scripture: '', content: '' });

  // Logic to identify the Canon (matches your user data check)
  const isCanon = userData?.role?.toLowerCase() === 'canon' || userData?.first_name === 'Gilbert';

  useEffect(() => {
    if (isOpen) fetchDevotions();
  }, [isOpen]);

  const fetchDevotions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-devotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          org_id: userData?.org_id, 
          shop_id: userData?.shop_id 
        }),
      });
      const data = await response.json();
      setDevotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/send-devotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          org_id: userData?.org_id,
          sender_id: userData?.id,
          shop_id: userData?.shop_id
        }),
      });

      if (response.ok) {
        setForm({ title: '', scripture: '', content: '' });
        setActiveTab('history');
        fetchDevotions();
      }
    } catch (error) {
      alert("Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-blue-700 text-white flex justify-between items-center rounded-t-[2.5rem]">
          <div className="flex items-center gap-2">
            <BookOpen size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Devotions</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-600 rounded-full"><X size={24}/></button>
        </div>

        {/* Canon Tabs */}
        {isCanon && (
          <div className="flex bg-gray-50 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
            >
              <History size={16}/> History
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
            >
              <PlusCircle size={16}/> New Post
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'create' && isCanon ? (
            <form onSubmit={handleSend} className="space-y-4">
              <input 
                placeholder="TITLE" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-0 font-bold focus:ring-2 focus:ring-blue-600"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
              />
              <input 
                placeholder="SCRIPTURE (E.G. JOHN 3:16)" 
                className="w-full p-4 bg-gray-50 rounded-2xl border-0 font-medium focus:ring-2 focus:ring-blue-600 text-sm"
                value={form.scripture} onChange={e => setForm({...form, scripture: e.target.value})}
              />
              <textarea 
                placeholder="MESSAGE..." 
                className="w-full p-4 bg-gray-50 rounded-2xl border-0 h-40 focus:ring-2 focus:ring-blue-600 text-sm leading-relaxed"
                value={form.content} onChange={e => setForm({...form, content: e.target.value})} required
              />
              <button 
                disabled={sending}
                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" /> : <Send size={20}/>}
                Broadcast Devotion
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-10 italic">Loading devotions...</p>
              ) : devotions.length === 0 ? (
                <p className="text-center py-10 text-gray-400 font-bold uppercase text-xs">No devotions yet</p>
              ) : (
                devotions.map((dev: any, i) => (
                  <div key={i} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-blue-900 uppercase text-sm italic">{dev.title}</h3>
                      <span className="text-[9px] text-gray-400 font-bold">{new Date(dev.created_at).toLocaleDateString()}</span>
                    </div>
                    {dev.scripture && <p className="text-[11px] font-bold text-blue-600 mb-2 uppercase">{dev.scripture}</p>}
                    <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-line border-t border-gray-200 pt-3">{dev.content}</p>
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
