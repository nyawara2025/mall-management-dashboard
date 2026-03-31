import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, GraduationCap, Megaphone } from 'lucide-react';

export const PublicSchoolHub = ({ shopId }: { shopId: number }) => {
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getHomework() {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId }),
        });
        const data = await response.json();
        // Since n8n sends back an array of 1 item, we grab the first index
        setSchoolData(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    getHomework();
  }, [shopId]);

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading School Hub...</div>;
  if (!schoolData) return <div className="p-20 text-center text-gray-500">No school data available.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">{schoolData.school_name}</h1>
          <p className="text-blue-600 font-bold tracking-widest uppercase text-[10px] mt-1">TeNEAR Education Space</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* ASSIGNMENTS COLUMN */}
          <section className="space-y-4">
            <h2 className="font-bold text-xl flex items-center gap-2 px-2 text-slate-800">
              <BookOpen className="text-blue-600" size={24} /> Latest Assignments
            </h2>
            
            <div className="space-y-4">
              {schoolData.homework?.map((item: any) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">
                      {item.subject}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                      <CalendarDays size={14} /> {item.date}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                  <div className="pt-3 border-t border-slate-50">
                    <p className="font-bold text-blue-600 text-sm">{item.detail}</p>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BULLETIN COLUMN */}
          <section className="space-y-4">
            <h2 className="font-bold text-xl flex items-center gap-2 px-2 text-slate-800">
              <Megaphone className="text-orange-500" size={24} /> School Bulletin
            </h2>
            
            <div className="space-y-4">
              {schoolData.bulletin && schoolData.bulletin.length > 0 ? (
                schoolData.bulletin.map((notice: any) => (
                  <div key={notice.id} className="bg-white p-6 rounded-3xl border-l-4 border-orange-400 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter bg-orange-50 px-2 py-0.5 rounded-full">
                        {notice.subject}
                      </span>
                      <span className="text-slate-400 text-[10px] font-bold">
                        {notice.date}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 mb-2 uppercase text-sm">{notice.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{notice.content}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-sm">
                  No new announcements today.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
