import React, { useEffect, useState } from 'react';
import { 
  MapPin, CalendarDays, BookOpen, LogOut, Lock, Phone as PhoneIcon, 
  ShieldCheck, Users, Activity, MessageSquare, Radio, Heart, 
  Wallet, Mic2, Image as ImageIcon, ChevronLeft, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TYPES ---
interface MemberData {
  id: number;
  first_name: string;
  last_name: string;
  zone_name: string;
  ministry_name: string;
  role: string;
}

// --- MAIN COMPONENT ---
export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [view, setView] = useState<'menu' | 'service'>('menu');
  const [church, setChurch] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [userData, setUserData] = useState<MemberData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const activeShopId = shopId || 68;

  useEffect(() => {
    const savedUser = localStorage.getItem(`church_user_${activeShopId}`);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserData(Array.isArray(parsed) ? parsed[0] : parsed);
      setIsAuthenticated(true);
    }

    async function fetchInitialData() {
      setLoading(true);
      try {
        const { data } = await supabase.from('churches').select('*').eq('shop_id', activeShopId);
        if (data && data.length > 0) setChurch(data[0]);

        const response = await fetch('https://n8n.tenear.com/webhook/church-user-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: activeShopId }),
        });
        if (response.ok) {
          const n8nData = await response.json();
          if (n8nData?.services) setServices(n8nData.services);
        }
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [activeShopId]);

  const handleLoginSuccess = (result: any) => {
    // FIX: Grab the first object from the n8n array
    const member = Array.isArray(result) ? result[0] : result;
    localStorage.setItem(`church_user_${activeShopId}`, JSON.stringify(member));
    setUserData(member);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(`church_user_${activeShopId}`);
    setIsAuthenticated(false);
    setUserData(null);
    setView('menu');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse">Initializing...</div>;
  if (!isAuthenticated) return <ChurchHubLogin shopId={activeShopId} onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-900">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'menu' && (
            <button onClick={() => setView('menu')} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} className="text-blue-600" />
            </button>
          )}
          <div>
            <h1 className="font-bold text-sm leading-tight">{view === 'menu' ? church?.church_name : 'Service Order'}</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} /> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {view === 'menu' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-black text-gray-800">Shalom, {userData?.first_name}!</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100">{userData?.zone_name}</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded-full border border-purple-100">{userData?.ministry_name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <MenuButton icon={<CalendarDays />} label="Order of Service" color="bg-blue-600" onClick={() => setView('service')} />
              <MenuButton icon={<Users />} label="Meetings" color="bg-purple-600" isPlaceholder />
              <MenuButton icon={<MessageSquare />} label="Opinion" color="bg-emerald-600" isPlaceholder />
              <MenuButton icon={<Radio />} label="Broadcasts" color="bg-rose-500" isPlaceholder />
              <MenuButton icon={<Heart />} label="Prayer Request" color="bg-pink-500" isPlaceholder />
              <MenuButton icon={<Wallet />} label="Welfare Account" color="bg-amber-500" isPlaceholder />
              <MenuButton icon={<Users />} label="Ministries" color="bg-indigo-600" isPlaceholder />
              <MenuButton icon={<Mic2 />} label="Sermons" color="bg-slate-700" isPlaceholder />
              <MenuButton icon={<Wallet />} label="Tithes" color="bg-green-600" isPlaceholder />
              <MenuButton icon={<ImageIcon />} label="Photo Gallery" color="bg-cyan-500" isPlaceholder />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-white to-gray-50">
                  <h3 className="text-3xl font-black text-gray-900">{service.service_name}</h3>
                  <p className="text-blue-600 font-bold mt-1">{service.service_date} @ {service.start_time}</p>
                </div>
                <div className="p-8 space-y-10">
                  {service.service_activities?.sort((a:any, b:any) => a.sort_order - b.sort_order).map((act:any, idx:number) => (
                    <div key={idx} className="relative pl-10 border-l-2 border-blue-100 last:border-0 pb-2">
                      <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white rounded-full border-4 border-blue-600 shadow-sm" />
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14} /> {act.activity_name}</h4>
                      <div className="text-gray-800 font-bold leading-relaxed whitespace-pre-line bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">{act.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// --- HELPER BUTTON ---
const MenuButton = ({ icon, label, color, onClick, isPlaceholder }: any) => (
  <button onClick={onClick} className={`p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 transition-all hover:shadow-xl hover:scale-[1.03] ${isPlaceholder ? 'opacity-60 grayscale-[0.5]' : ''}`}>
    <div className={`p-5 ${color} rounded-[1.5rem] text-white shadow-lg`}>{React.cloneElement(icon, { size: 28 })}</div>
    <span className="font-black text-[10px] text-gray-700 uppercase tracking-widest text-center">{label}</span>
  </button>
);

// --- LOGIN COMPONENT ---
export const ChurchHubLogin = ({ shopId, onLoginSuccess }: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-public-service-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, shop_id: shopId }),
      });
      const result = await response.json();
      if (response.ok) onLoginSuccess(result);
      else alert(result.message || "Auth Failed");
    } catch (e) { alert("Network Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Member Portal</h2>
        <div className="space-y-4 mt-8">
          <input className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-600 transition-all" placeholder="Phone (254...)" value={phone} onChange={e => setPhone(e.target.value)} />
          <input type="password" className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-600 transition-all" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
