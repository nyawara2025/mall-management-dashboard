import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  CalendarDays, 
  GraduationCap, 
  Megaphone, 
  FileText, 
  ExternalLink,
  Loader2
} from 'lucide-react';

interface SchoolData {
  school_name: string;
  homework: any[];
  bulletin: any[];
}

export const PublicSchoolHub = ({ shopId }: { shopId: number }) => {
  const [data, setData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch_school_data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId }),
        });
        const result = await response.json();
        
        // n8n returns an array [item], so we take index 0
        const finalData = Array.isArray(result) ? result[0] : result;
        setData(finalData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Loading Student Portal...</p>
      </div>
    );
  }

  if (!data) return <div className="p-20 text-center text-slate-500">No data found for this school.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HERO HEADER */}
        <header className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {data.school_name}
          </h1>
          <div className="inline-block mt-2 px-4 py-1 bg-white rounded-full border border-slate-200">
            <p className="text-blue-600 font-bold tracking-widest uppercase text-[10px]">
              TeNEAR Education Space
            </p>
          </div>
        </header>

        {/* RESPONSIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* COLUMN 1: HOMEWORK */}
          <section className="space-y-6">
            <h2 className="font-extrabold text-2xl flex items-center gap-3 px-2 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg"><BookOpen className="text-blue-600" size={20} /></div>
              Latest Assignments
            </h2>
            
            <div className="space-y-4">
              {data.homework?.map((item: any) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {item.subject}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <CalendarDays size={14} /> {item.date}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl text-slate-900 mb-2 leading-snug">{item.title}</h3>
                  
                  <div className="pt-4 border-t border-slate-50 mt-4">
                    <p className="font-bold text-blue-600 text-sm mb-1">{item.detail}</p>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.description}</p>
                    
                    {/* Attachment Link */}
                    {item.document_url && (
                      <a 
                        href={item.document_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <FileText size={14} /> View Document
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMN 2: BULLETIN */}
          <section className="space-y-6">
            <h2 className="font-extrabold text-2xl flex items-center gap-3 px-2 text-slate-800">
              <div className="p-2 bg-orange-100 rounded-lg"><Megaphone className="text-orange-500" size={20} /></div>
              School Bulletin
            </h2>
            
            <div className="space-y-4">
              {data.bulletin?.length > 0 ? (
                data.bulletin.map((notice: any) => (
                  <div key={notice.id} className="bg-white p-6 rounded-[2rem] border-l-[6px] border-orange-400 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter bg-orange-50 px-2 py-1 rounded-md">
                        {notice.subject}
                      </span>
                      <span className="text-slate-400 text-[10px] font-bold">{notice.date}</span>
                    </div>
                    
                    <h3 className="font-black text-slate-900 uppercase text-md mb-3 tracking-tight">
                      {notice.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {notice.content}
                    </p>

                    {/* Bulletin Image / Attachment */}
                    {notice.document_url && (
                      <a 
                        href={notice.document_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink size={14} /> View Bulletin Attachment
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
                  <p className="text-slate-400 text-sm font-medium">No new announcements today.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
