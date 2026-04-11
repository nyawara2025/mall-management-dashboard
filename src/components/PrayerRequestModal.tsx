import React, { useState } from 'react';
import { X } from 'lucide-react';

// We redefine the interface here so the component is self-contained
interface MemberData {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role: string;
  zone_name: string;
  ministry_name: string;
}

export const PrayerRequestModal = ({ 
  isOpen, 
  onClose, 
  userData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  userData: MemberData | null 
}) => {
  const [request, setRequest] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!request.trim()) return;
    setLoading(true);

    try {
      await fetch('https://n8n.tenear.com/webhook/church-prayer-requestx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: userData?.id,
          name: `${userData?.first_name} ${userData?.last_name}`,
          phone: userData?.phone_number,
          request: request,
          is_private: isPrivate,
          timestamp: new Date().toISOString()
        }),
      });
      alert("Prayer request sent to the ministry team.");
      setRequest('');
      onClose();
    } catch (error) {
      alert("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-gray-900">Send Prayer Request</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <textarea 
          className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-700"
          placeholder="How can we pray for you today?"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
        />

        <div className="flex items-center gap-2 mt-4 mb-8">
          <input 
            type="checkbox" 
            id="private" 
            checked={isPrivate} 
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="private" className="text-sm font-semibold text-gray-500 italic">Keep this private (Pastors only)</label>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading || !request}
          className="w-full bg-purple-600 text-white font-black p-5 rounded-2xl shadow-lg shadow-purple-100 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'SUBMIT REQUEST'}
        </button>
      </div>
    </div>
  );
};
