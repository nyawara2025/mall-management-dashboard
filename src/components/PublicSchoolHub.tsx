import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, GraduationCap } from 'lucide-react';

export const PublicSchoolHub = ({ shopId }: { shopId: number }) => {
  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getHomework() {
      try {
        // REPLACE with your actual n8n "Fetch Homework" Webhook URL
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-homework', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId }),
        });
        const data = await response.json();
        setHomework(data.homework || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    getHomework();
  }, [shopId]);

  if (loading) return <div className="p-20 text-center">Loading School Hub...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <header className="text-center py-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-black">Student Portal</h1>
          <p className="text-gray-500 text-sm italic">TeNEAR Education Space</p>
        </header>

        <h2 className="font-bold text-lg flex items-center gap-2 px-2">
          <BookOpen className="text-blue-600" /> Latest Assignments
        </h2>

        {homework.length > 0 ? homework.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                {item.subject}
              </span>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <CalendarDays size={14} /> Due: {item.due_date}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 leading-tight">{item.title}</h3>
            <p className="text-gray-600 text-sm mt-2 line-clamp-3">{item.description}</p>
          </div>
        )) : (
          <p className="text-center text-gray-400 py-10">No homework posted yet.</p>
        )}
      </div>
    </div>
  );
};
