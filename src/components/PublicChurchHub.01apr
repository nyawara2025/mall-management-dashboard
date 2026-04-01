import React, { useEffect, useState } from 'react';
import { 
  MapPin, CalendarDays, BookOpen, 
  LogOut, Lock, Phone as PhoneIcon,
  User, ShieldCheck, Users, Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TYPES ---
interface MemberData {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role: string;
  zone_name: string;
  ministry_name: string;
  registration_date: string;
}

interface ServiceActivity {
  activity_name: string;
  description: string;
  sort_order: number;
}

interface ChurchService {
  id: string;
  service_name: string;
  service_date: string;
  start_time: string;
  service_activities: ServiceActivity[];
}

// --- COMPONENT 1: Login ---
export const ChurchHubLogin = ({ shopId, onLoginSuccess }: { shopId: number, onLoginSuccess: (data: MemberData) => void }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-user-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          password: password,
          isSignUp: isSignUp,
          shop_id: shopId 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }

      if (isSignUp) {
        alert(result.message || "Signup request sent successfully!");
        setIsSignUp(false);
      } else {
        const member = Array.isArray(result) ? result[0] : result;
        onLoginSuccess(member);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock size={36} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isSignUp ? 'Join Us' : 'Welcome Back'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">Access the St. Barnabas Member Hub</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <PhoneIcon className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
              placeholder="Phone (254...)" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              type="password"
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            onClick={handleAuth} 
            disabled={loading} 
            className={`w-full text-white p-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
              isSignUp ? 'bg-green-600 shadow-green-100' : 'bg-blue-600 shadow-blue-100'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Request Membership' : 'Sign In')}
          </button>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-gray-400 hover:text-blue-600 transition-colors text-center font-semibold mt-2"
          >
            {isSignUp ? 'Already a member? Sign In' : 'New here? Request Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT 2: Main Hub ---
export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [church, setChurch] = useState<any>(null);
  const [services, setServices] = useState<ChurchService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<MemberData | null>(null);
  
  const activeShopId = shopId || 68;

  useEffect(() => {
    const savedAuth = localStorage.getItem(`church_auth_${activeShopId}`);
    const savedUser = localStorage.getItem(`church_user_${activeShopId}`);

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      try {
        setUserData(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user", e);
      }
    }

    async function fetchHubData() {
      setLoading(true);
      try {
        // FIX: Added safety check for data existence
        const { data, error } = await supabase.from('churches').select('*').eq('shop_id', activeShopId);
        if (data && data.length > 0) {
          setChurch(data[0]);
        }

        const response = await fetch('https://n8n.tenear.com/webhook/fetch-public-service-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: activeShopId }),
        });

        if (response.ok) {
          const n8nData = await response.json();
          if (n8nData?.services) setServices(n8nData.services);
        }
      } catch (error) {
        console.error('Data Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHubData();
  }, [activeShopId]);

  const handleLoginSuccess = (member: MemberData) => {
    localStorage.setItem(`church_auth_${activeShopId}`, 'true');
    localStorage.setItem(`church_user_${activeShopId}`, JSON.stringify(member));
    setUserData(member);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(`church_auth_${activeShopId}`);
    localStorage.removeItem(`church_user_${activeShopId}`);
    setIsAuthenticated(false);
    setUserData(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Hub...</div>;
  
  // Login Guard
  if (!isAuthenticated) return <ChurchHubLogin shopId={activeShopId} onLoginSuccess={handleLoginSuccess} />;

  // Profile Guard (In case supabase query failed)
  if (!church) return <div className="p-10 text-center font-bold">Church Profile Not Found. Please check shop_id {activeShopId}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-sm">
            {church.church_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">{church.church_name}</h1>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold">
              <MapPin size={10} className="text-blue-500" /> {church.address || "Location unavailable"}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
          <LogOut size={18} />
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: MEMBER PROFILE CARD */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center border-b border-gray-50 pb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-blue-500 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-blue-100">
                  {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-gray-800 leading-tight">
                  {userData?.first_name} {userData?.last_name}
                </h2>
                <div className="mt-2 px-4 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full tracking-widest border border-blue-100">
                  {userData?.role || 'Member'}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm"><ShieldCheck size={20}/></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Zone Affiliation</p>
                    <p className="text-md font-bold text-gray-700">{userData?.zone_name || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm"><Users size={20}/></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Ministry</p>
                    <p className="text-md font-bold text-gray-700">{userData?.ministry_name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: SERVICE ORDERS */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-100"><CalendarDays size={20} /></div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order of Service</h2>
                </div>
            </div>

            {services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-white to-gray-50/50">
                    <h3 className="text-3xl font-black text-gray-900">{service.service_name}</h3>
                    <p className="text-blue-600 font-bold mt-1">{service.service_date} • {service.start_time}</p>
                  </div>

                  <div className="p-8 space-y-10">
                    {service.service_activities?.sort((a,b) => a.sort_order - b.sort_order).map((act, idx) => (
                      <div key={idx} className="relative pl-10 border-l-2 border-blue-50 last:border-0 pb-2">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white rounded-full border-4 border-blue-600 shadow-sm" />
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Activity size={14} /> {act.activity_name}
                        </h4>
                        <div className="text-gray-800 font-bold leading-relaxed whitespace-pre-line bg-gray-50/50 p-5 rounded-[1.5rem] border border-gray-100 group-hover:bg-white transition-colors">
                          {act.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-200">
                <BookOpen size={32} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">No Services Found</h3>
                <p className="text-gray-400 text-sm mt-1">The church admin hasn't published the service order for this week yet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
