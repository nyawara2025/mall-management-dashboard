import React, { useState, Dispatch, SetStateAction } from 'react';
import { BookOpen, Send, Users, Milestone, Heart, UserPlus } from 'lucide-react';

// Update the interface to accept both props
interface DashboardProps {
  shopId: number;
  onViewChange?: Dispatch<SetStateAction<string>>; // Added this line
}

export const EducationalDashboard = ({ shopId }: { shopId: number }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subject: '', title: '', description: '', due_date: '' });

  const handlePostHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // REPLACE with your actual n8n "Save Homework" Webhook URL
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, shop_id: shopId }),
      });

      if (response.ok) {
        alert("Homework posted & WhatsApp notifications triggered!");
        setFormData({ subject: '', title: '', description: '', due_date: '' });
      }
    } catch (error) {
      console.error("Failed to post homework:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Existing Stats Grid... */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Post Daily Homework
          </h3>
          <form onSubmit={handlePostHomework} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 border rounded-xl" placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
              <input type="date" className="p-3 border rounded-xl" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required />
            </div>
            <input className="w-full p-3 border rounded-xl" placeholder="Topic Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <textarea className="w-full p-3 border rounded-xl" placeholder="Homework instructions..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
              <Send size={18} /> {loading ? 'Processing...' : 'Post & Notify Parents'}
            </button>
          </form>
        </div>
        {/* Placeholder for Schedule/Registrations... */}
      </div>
    </div>
  );
};
