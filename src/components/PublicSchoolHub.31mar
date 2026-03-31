import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, GraduationCap } from 'lucide-react';

export const PublicSchoolHub = ({ shopId }: { shopId: number }) => {
  const [data, setData] = useState<any>({ homework: [], school_name: "" }); // Store full object
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
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    getHomework();
  }, [shopId]);


  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="text-center py-6">
        <h1 className="text-2xl font-black">{data.school_name}</h1>
        <p className="text-gray-500 text-sm italic">Student Dashboard</p>
      </header>

      {data.homework.map((item: any, idx: number) => (
        <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">
            {item.subject}
          </span>
          <h3 className="font-bold text-gray-900 mt-2">{item.title}</h3>
          
          {/* Detailed Activities List */}
          <div className="mt-3 space-y-2 border-t pt-3">
            {item.activities.map((act: any, i: number) => (
              <div key={i}>
                <p className="text-sm font-bold text-gray-800">{act.name}</p>
                <p className="text-xs text-gray-500">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
  
