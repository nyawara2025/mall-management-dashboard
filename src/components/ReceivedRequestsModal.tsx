import React, { useEffect, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

interface PrayerRequest {
  id: string | number;
  member_name: string;
  description: string; 
  request_text: string;
  created_at: string;
  org_id: number;
  phone_number?: string;
  is_anonymous?: boolean;
}

export const ReceivedRequestsModal = ({ 
  isOpen, 
  onClose, 
  userData 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userData: any 
}) => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (isOpen && userData?.org_id) {
      fetchRequests();
    }
  }, [isOpen, userData?.org_id]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-prayer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: userData?.org_id }),
      });
      const data = await response.json();
      const cleanData = Array.isArray(data) ? data : (data.body || []);
      setRequests(cleanData); 
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- MOVE handleReply HERE (Above the return) ---
  const handleReply = async (requestId: number | string) => {
    if (!replyText.trim()) return;
    setSendingReply(true);

    try {
      await fetch('https://n8n.tenear.com/webhook/respond-to-prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          response_note: replyText,
          responded_by: userData?.first_name,
          timestamp: new Date().toISOString()
        }),
      });
      alert("Reply sent!");
      setReplyText('');
      setReplyingTo(null);
      fetchRequests(); 
    } catch (error) {
      alert("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
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
          {loading ? (
            <p className="text-center py-10 text-gray-400">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-center py-10 text-gray-400 italic">No requests found.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="font-bold text-blue-600 text-xs mb-1">{req.member_name || 'Anonymous'}</p>
                <p className="text-gray-700 text-sm italic">"{req.description}"</p>
                <p className="text-[9px] text-gray-400 mt-2 uppercase">
                  {new Date(req.created_at).toLocaleDateString()}
                </p>
                {/* You might want to add a "Reply" button here to trigger handleReply! */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ); // Properly close the return here
};
