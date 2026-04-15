import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, History, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Opinion {
  id: string;
  subject: string;
  content: string;
  created_at: string;
  status: string;
}

interface OpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const OpinionModal = ({ isOpen, onClose, userData }: OpinionModalProps) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'new' | 'history' | 'admin'>('new');

  const isAdmin = userData?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, tab]);

  const fetchHistory = async () => {
    const query = supabase.from('opinions').select('*').order('created_at', { ascending: false });
    
    // If not admin, filter by phone
    if (tab !== 'admin') {
        query.eq('member_phone', userData.phone_number);
    }

    const { data } = await query;
    if (data) setHistory(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        member_phone: userData.phone_number,
        org_id: userData.org_id,
        member_name: `${userData.first_name} ${userData.last_name}`,
        subject,
        content
      };

      const response = await fetch('YOUR_N8N_OPINION_WEBHOOK_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Opinion submitted successfully!");
        setSubject('');
        setContent('');
        setTab('history');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> Church Opinions
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button onClick={() => setTab('new')} className={`flex-1 p-4 font-medium ${tab === 'new' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>New Opinion</button>
          <button onClick={() => setTab('history')} className={`flex-1 p-4 font-medium ${tab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : ''}`}>My History</button>
          {isAdmin && (
            <button onClick={() => setTab('admin')} className={`flex-1 p-4 font-medium flex items-center justify-center gap-2 ${tab === 'admin' ? 'border-b-2 border-red-600 text-red-600' : ''}`}>
              <Shield size={16} /> Admin View
            </button>
          )}
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {tab === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Subject (e.g. Youth Ministry, Facility)" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                required
              />
              <textarea 
                className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32" 
                placeholder="Share your thoughts..." 
                value={content} 
                onChange={e => setContent(e.target.value)}
                required
              />
              <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                {loading ? "Sending..." : <><Send size={18} /> Submit Opinion</>}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {history.length === 0 ? <p className="text-center text-gray-500 py-10">No opinions found.</p> : 
                history.map(item => (
                  <div key={item.id} className="p-4 border rounded-2xl bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-blue-900">{item.subject}</h4>
                      <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">{item.status}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.content}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
