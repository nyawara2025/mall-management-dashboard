import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Calendar, Heart, Loader2, Quote } from 'lucide-react';

interface Appreciation {
  id: string;
  canon_name: string;
  message: string;
  contribution_type: string;
  original_amount: number;
  created_at: string;
}

interface CanonFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  memberPhone: string | undefined;
  orgId: number | undefined;
}

export const CanonFeedback: React.FC<CanonFeedbackProps> = ({ isOpen, onClose, memberPhone, orgId }) => {
  const [messages, setMessages] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && memberPhone) {
      fetchMessages();
    }
  }, [isOpen, memberPhone]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/canon-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_phone: memberPhone, org_id: orgId }),
      });
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border-4 border-white">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-yellow-400 to-orange-400 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/30 p-3 rounded-2xl text-blue-900 backdrop-blur-md">
              <Heart size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-900 tracking-tight">Pastoral Appreciation</h2>
              <p className="text-blue-900/60 text-[10px] font-black uppercase tracking-widest">Personal Notes from the Canon</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={28} className="text-blue-900" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-yellow-500" size={40} />
              <p className="text-blue-900 font-bold text-xs uppercase tracking-widest">Opening Letters...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="relative bg-white rounded-[2rem] p-6 shadow-sm border border-blue-50 group hover:shadow-md transition-all">
                  {/* Decorative Quote Icon */}
                  <Quote className="absolute top-4 right-6 text-blue-50 opacity-20" size={60} />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-yellow-600 uppercase tracking-tighter">
                        Regarding your {msg.contribution_type}
                      </span>
                      <span className="text-lg font-black text-blue-900">
                        KES {Number(msg.original_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                      <Calendar size={12} />
                      {new Date(msg.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-600 font-medium leading-relaxed italic text-sm mb-4 relative z-10">
                    "{msg.message}"
                  </p>

                  <div className="flex items-center gap-3 border-t pt-4">
                    <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {msg.canon_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">
                      {msg.canon_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <MessageCircle size={40} />
              </div>
              <h3 className="text-gray-400 font-black uppercase text-sm tracking-widest">No messages yet</h3>
              <p className="text-gray-400 text-[10px] mt-2 font-medium">Your pastoral feedback will appear here.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Grace and Peace be with you</p>
        </div>
      </div>
    </div>
  );
};
