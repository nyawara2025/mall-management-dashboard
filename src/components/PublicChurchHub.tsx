import React, { useEffect, useState } from 'react';
import { 
  MapPin, CalendarDays, BookOpen, 
  LogOut, Lock, Phone as PhoneIcon,
  User, ShieldCheck, Users, Activity,
  MessageSquare, Heart, Radio, Wallet, Book, Globe, Bell, ClipboardList
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
  payment_history: PaymentRecord[] | null;
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

interface PaymentRecord {
  amount: number;
  payment_date: string;
  transaction_id: string;
  status: string;
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

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) throw new Error(result.message || `Error: ${response.status}`);

      if (isSignUp) {
        alert(result.message || "Signup request sent successfully!");
        setIsSignUp(false);
      } else {
        onLoginSuccess(Array.isArray(result) ? result[0] : result);
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isSignUp ? 'Join Us' : 'Welcome Back'}</h2>
          <p className="text-gray-500 text-sm mt-2">Access the St. Barnabas Member Hub</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <PhoneIcon className="absolute left-4 top-4 text-gray-400" size={20} />
            <input className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone (254...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="password" className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button onClick={handleAuth} disabled={loading} className={`w-full text-white p-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${isSignUp ? 'bg-green-600' : 'bg-blue-600'} ${loading ? 'opacity-50' : ''}`}>
            {loading ? 'Processing...' : (isSignUp ? 'Request Membership' : 'Sign In')}
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-sm text-gray-400 hover:text-blue-600 transition-colors text-center font-semibold mt-2">
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
  const [activeView, setActiveView] = useState<'dashboard' | 'service_order' | 'welfare'>('dashboard');
  
  const activeShopId = shopId || 68;

  useEffect(() => {
    const savedAuth = localStorage.getItem(`church_auth_${activeShopId}`);
    const savedUser = localStorage.getItem(`church_user_${activeShopId}`);

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(savedUser);
      const userObject = Array.isArray(parsedUser) ? parsedUser[0] : parsedUser;
      setUserData(userObject);
    }

    async function fetchHubData() {
      if (!isAuthenticated && !savedAuth) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await supabase.from('churches').select('*').eq('shop_id', activeShopId);
        if (data && data.length > 0) setChurch(data[0]);

        const response = await fetch('https://n8n.tenear.com/webhook/fetch-public-service-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: activeShopId }),
        });

        if (response.ok) {
          const n8nData = await response.json();
          const rawServices = Array.isArray(n8nData) ? n8nData[0]?.services : n8nData?.services;
          if (rawServices) setServices(rawServices);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHubData();
  }, [activeShopId, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem(`church_auth_${activeShopId}`);
    localStorage.removeItem(`church_user_${activeShopId}`);
    setIsAuthenticated(false);
    setUserData(null);
    setActiveView('dashboard');
  };

  // --- SUB-COMPONENT: Welfare Page ---
  const WelfarePage = () => (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => setActiveView('dashboard')} 
        className="flex items-center gap-2 text-blue-600 font-bold hover:underline mb-4"
      >
        ← Back to Dashboard
      </button>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Welfare Contributions</h2>
            <p className="text-gray-500 text-sm">Manage your support and community funds</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Total Contributed</h3>
            <p className="text-3xl font-black text-blue-600">KES 0.00</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Active Pledges</h3>
            <p className="text-3xl font-black text-gray-400">None</p>
          </div>
        </div>

        <button className="w-full mt-8 bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform">
          Make a Contribution
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Hub...</div>;
  
  if (!isAuthenticated) {
    return (
      <ChurchHubLogin 
        shopId={activeShopId} 
        onLoginSuccess={(u) => {
          setUserData(u); 
          setIsAuthenticated(true); 
          localStorage.setItem(`church_auth_${activeShopId}`, 'true'); 
          localStorage.setItem(`church_user_${activeShopId}`, JSON.stringify(u));
        }} 
      />
    );
  }

  if (!church) return <div className="p-10 text-center font-bold">Church Profile Not Found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
            {church.church_name?.charAt(0) || 'S'}
          </div>
          <h1 className="font-bold text-gray-800 text-sm md:text-base truncate max-w-[200px]">
            {church.church_name}
          </h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6">
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar / Profile Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {userData?.role || 'Member'}
                  </span>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-100">
                  {userData ? `${userData.first_name[0]}${userData.last_name[0]}` : 'AN'}
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  {userData?.first_name} {userData?.last_name}
                </h2>
                
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</p>
                      <p className="font-bold text-gray-700">{userData?.zone_name || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Ministry</p>
                      <p className="font-bold text-gray-700">{userData?.ministry_name || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Feature Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature Cards */}
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <MessageSquare size={28} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Opinion</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Heart size={28} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Prayer</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Radio size={28} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Broadcast</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ClipboardList size={28} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Meetings</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Activity size={28} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Tithes & Giving</span>
              </button>

              {/* WELFARE CONTRIBUTIONS BUTTON */}
              <button 
                onClick={() => setActiveView('welfare')}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Wallet size={28} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Welfare Contributions</span>
              </button>
            </div>
          </div>
        ) : activeView === 'welfare' ? (
          <WelfarePage />
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">This section is coming soon.</p>
             <button onClick={() => setActiveView('dashboard')} className="mt-4 text-blue-600 font-bold">Return Home</button>
          </div>
        )}
      </main>
    </div>
  );
};
