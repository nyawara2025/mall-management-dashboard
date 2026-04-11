import React, { useEffect, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ReceivedRequestsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchRequests();
  }, [isOpen]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setRequests(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> Prayer Inbox
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {loading ? <p className="text-center py-10">Loading requests...</p> : 
            requests.map((req) => (
              <div key={req.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-bold text-blue-600 text-xs mb-1">{req.member_name || 'Anonymous'}</p>
                <p className="text-gray-700 text-sm italic">"{req.request_text}"</p>
                <p className="text-[9px] text-gray-400 mt-2 uppercase">{new Date(req.created_at).toLocaleDateString()}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};
