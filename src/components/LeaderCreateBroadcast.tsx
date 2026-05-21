import React, { useState } from 'react';
import { Megaphone, X, Radio, Bell } from 'lucide-react';

interface LeaderCreateBroadcastProps {
  userData: any;
  onBroadcastCreated: () => void;
}

export const LeaderCreateBroadcast: React.FC<LeaderCreateBroadcastProps> = ({ userData, onBroadcastCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'broadcast', // default to match your icons
    priority: 'normal' // normal or high
  });

  // Verify authorization roles safely
  const isAuthorizedLeader = 
    userData?.role?.toLowerCase().includes('head') || 
    userData?.role?.toLowerCase().includes('chair') || 
    userData?.role?.toLowerCase().includes('admin') ||
    userData?.role?.toLowerCase().includes('leader');

  if (!isAuthorizedLeader) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return alert("Please fill in all required fields");

    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/create-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by_id: userData.id,
          org_id: userData.org_id,
          shop_id: userData.shop_id || userData.shopId
        }),
      });

      if (response.ok) {
        alert("Notice broadcasted successfully!");
        setFormData({ title: '', message: '', type: 'broadcast', priority: 'normal' });
        setIsOpen(false);
        onBroadcastCreated(); // Triggers re-fetch on parent hub
      } else {
        throw new Error('Failed to publish notification');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to publish your notice. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Leader Trigger Button matching your theme */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-2xl shadow-lg transition-all mb-4"
      >
        <Megaphone size={18} /> Create Church Notice
      </button>

      {/* Input Overlay Modal Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header Layout */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl text-white">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">New Church Broadcast</h2>
                  <p className="text-xs text-gray-500">Publish announcements to congregation</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Input Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Type Switcher Selector Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'broadcast' })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${
                    formData.type === 'broadcast' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-500'
                  }`}
                >
                  <Radio size={16} /> Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'alert' })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${
                    formData.type === 'alert' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-500'
                  }`}
                >
                  <Bell size={16} /> Alert / Warning
                </button>
              </div>

              {/* Priority Flag Toggle Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none font-medium text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal Priority (Blue styling)</option>
                  <option value="high">High Importance (Red highlighted row)</option>
                </select>
              </div>

              {/* Notice Title Input */}
              <input
                type="text"
                placeholder="Notice Title (e.g. Youth Prayer Night)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              />

              {/* Notice Message Details Body Textarea */}
              <textarea
                placeholder="Write your broadcast notice payload detail instructions here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium resize-none"
              />

              {/* Actions Submissions Bar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-sm mt-2"
              >
                {loading ? 'Transmitting Notice...' : 'Broadcast to Church'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
