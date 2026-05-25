import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  CalendarDays, 
  GraduationCap, 
  Megaphone, 
  FileText, 
  ExternalLink,
  Loader2,
  Lock,
  LogOut
} from 'lucide-react';

interface SchoolData {
  school_name: string;
  homework: any[];
  bulletin: any[];
}

export const PublicSchoolHub = ({ shopId }: { shopId: number }) => {
  const [data, setData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('parent_token'));
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/authenticate-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, shop_id: shopId }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        localStorage.setItem('parent_token', result.token);
        setIsAuthenticated(true);
      } else {
        setAuthError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setAuthError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parent_token');
    setIsAuthenticated(false);
    setData(null);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('parent_token');
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-data', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ shop_id: shopId }),
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const result = await response.json();
        const finalData = Array.isArray(result) ? result[0] : result;
        setData(finalData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [shopId, isAuthenticated]);

  // LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 mb-2">Parent Portal</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Please sign in to access school records.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOADING VIEW
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
        <header className="text-center mb-12 relative">
          <button 
            onClick={handleLogout}
            className="absolute right-0 top-0 p-3 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <LogOut size={18} /> Logout
          </button>
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
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.pages}</p>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.description}</p>
                    
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
                      {notice.description}
                    </p>

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
