import React, { useEffect, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

// Define the shape of a request so TypeScript is happy
interface PrayerRequest {
  id: string | number;
  member_name: string;
  request_text: string;
  created_at: string;
}

// 1. Added userData to the props definition
export const ReceivedRequestsModal = ({ 
  isOpen, 
  onClose, 
  userData 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userData: any // Or use your MemberData interface
}) => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userData?.shop_id) {
      fetchRequests();
    }
  }, [isOpen, userData?.shop_id]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-prayer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: userData?.shop_id // Now userData exists!
        }),
      });
      
      const data = await response.json();
      // 2. Set the actual data into state (assuming the API returns an array)
      setRequests(Array.isArray(data) ? data : []); 
      
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
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
                <p className="text-gray-700 text-sm italic">"{req.request_text}"</p>
                <p className="text-[9px] text-gray-400 mt-2 uppercase">
                  {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
