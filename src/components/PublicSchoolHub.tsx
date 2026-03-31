import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, GraduationCap, Megaphone, FileText } from 'lucide-react';

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
        // n8n usually returns an array [ { ... } ]
        setSchoolData(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    getHomework();
  }, [shopId]);

  if (loading) return <div className="p-20 text-center animate-pulse">Loading School Hub...</div>;
  if (!schoolData) return <div className="p-20 text-center text-gray-500">No school data available.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">{schoolData.school_name}</h1>
          <p className="text-blue-600 font-medium tracking-wide uppercase text-xs mt-1">TeNEAR Education Space</p>
        </header>

        {/* MAIN GRID: 1 col on mobile, 2 cols on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: HOMEWORK SECTION */}
          <section className="space-y-4">
            <h2 className="font-bold text-xl flex items-center gap-2 px-2 text-slate-800">
              <BookOpen className="text-blue-600" size={24} /> Latest Assignments
            </h2>
            
            <div className="space-y-4">
              {schoolData.homework?.map((item: any) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      {item.subject}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <CalendarDays size={14} /> {item.date_info}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                  <div className="pt-3 border-t border-slate-50">
                    <p className="font-bold text-blue-600 text-sm">{item.sub_detail}</p>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{item.body_text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMN 2: SCHOOL BULLETIN SECTION */}
          <section className="space-y-4">
            <h2 className="font-bold text-xl flex items-center gap-2 px-2 text-slate-800">
              <Megaphone className="text-orange-500" size={24} /> School Bulletin
            </h2>
            
            <div className="space-y-4">
              {schoolData.bulletin?.length > 0 ? (
                schoolData.bulletin.map((notice: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border-l-4 border-l-orange-400 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">{notice.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{notice.content}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Posted: {notice.date || 'Recently'}</span>
                      {notice.attachment && (
                        <a href={notice.attachment} className="flex items-center gap-1 text-orange-600 hover:underline">
                          <FileText size={12} /> View File
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 text-sm">
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
