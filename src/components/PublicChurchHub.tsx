import React, { useEffect, useState } from 'react';
import { 
  MapPin, CalendarDays, BookOpen, 
  LogOut, Lock, Phone as PhoneIcon,
  User, ShieldCheck, Users, Activity,
  MessageSquare, Heart, Radio, Wallet, Book, Globe, Bell, ClipboardList,
  Image as ImageIcon, MessageCircle, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TYPES ---
interface PaymentRecord {
  amount: number;
  payment_date: string;
  transaction_id: string;
  status: string;
}

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
        const userData = Array.isArray(result) ? result[0] : result;
        onLoginSuccess(userData);
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
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeShopId = shopId || 68;

  useEffect(() => {
    const savedAuth = localStorage.getItem(`church_auth_${activeShopId}`);
    const savedUser = localStorage.getItem(`church_user_${activeShopId}`);

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(savedUser);
      setUserData(Array.isArray(parsedUser) ? parsedUser[0] : parsedUser);
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

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
  
    const userMsg = userInput;
    setUserInput(''); // Clear input immediately for UX
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/neochat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: activeShopId,
          user_id: userData?.id,
          user_name: `${userData?.first_name} ${userData?.last_name}`,
          message: chatMessage,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data && data.text) {
        setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsSending(false);
    }
  };

  // --- SUB-VIEW: Welfare Dashboard (RESTORED HISTORY DISPLAY) ---
  const WelfarePage = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => setActiveView('dashboard')} className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
        ← Back to Hub
      </button>
      
      {/* WELFARE HISTORY MODAL UI */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welfare History</h2>
          <button onClick={() => setActiveView('dashboard')} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[500px] overflow-y-auto">
          {userData?.payment_history && userData.payment_history.length > 0 ? (
            userData.payment_history.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-gray-700 mt-1">Contribution</p>
                </div>
                <p className="text-xl font-black text-blue-600">
                  KES {payment.amount}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 italic font-medium">
              No contributions found in your history.
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-50">
          <button className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:scale-[1.01] active:scale-95 transition-all">
            Make New Contribution
          </button>
        </div>
      </div>
    </div>
  );

  // --- SUB-VIEW: Order of Service ---
  const ServiceOrderView = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => setActiveView('dashboard')} className="text-blue-600 font-bold flex items-center gap-2">
        ← Back to Hub
      </button>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Order of Service</h2>
        {services.map((service) => (
          <div key={service.id} className="mb-8 last:mb-0">
            <h3 className="text-xl font-bold text-blue-600">{service.service_name}</h3>
            <p className="text-sm text-gray-400 mb-4">{service.service_date} • {service.start_time}</p>
            <div className="space-y-3">
              {service.service_activities.map((activity, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-800">{activity.activity_name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Hub...</div>;
  if (!isAuthenticated) return <ChurchHubLogin shopId={activeShopId} onLoginSuccess={(u) => {setUserData(u); setIsAuthenticated(true); localStorage.setItem(`church_auth_${activeShopId}`, 'true'); localStorage.setItem(`church_user_${activeShopId}`, JSON.stringify(u));}} />;
  if (!church) return <div className="p-10 text-center font-bold">Church Profile Not Found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
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

      <main className="max-w-7xl mx-auto p-6">
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">MEMBER</span>
                </div>
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-100">
                  {userData?.first_name.charAt(0)}{userData?.last_name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{userData?.first_name} {userData?.last_name}</h2>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><ShieldCheck size={20} /></div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ZONE</p><p className="font-bold text-gray-700">{userData?.zone_name}</p></div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Users size={20} /></div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CURRENT MINISTRY</p><p className="font-bold text-gray-700">{userData?.ministry_name}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><MessageSquare size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">OPINION</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Heart size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">PRAYER</span>
              </button>
              <button onClick={() => setActiveView('service_order')} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Book size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">ORDER OF SERVICE</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">BROADCAST</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><ClipboardList size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">MEETINGS</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Activity size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">TITHES & GIVING</span>
              </button>
              <button onClick={() => setActiveView('welfare')} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Wallet size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">WELFARE CONTRIBUTIONS</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><ImageIcon size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">PHOTO GALLERY</span>
              </button>
             
              {/* Find your Chat Grid Item and update it like this */}
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <MessageCircle className="text-gray-400 group-hover:text-blue-600" size={32} />
                </div>
                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Chat</span>
              </button>

            </div>
          </div>
        ) : activeView === 'welfare' ? (
          <WelfarePage />
        ) : (
          <ServiceOrderView />
        )}
      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[600px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-bold">Church Assistant</h3>
              <button onClick={() => setIsChatOpen(false)}><X size={20} /></button>
            </div>
      
            {/* Message History Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-800'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isSending && <div className="text-xs text-gray-400 animate-pulse">Typing...</div>}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 flex gap-2">
              <input 
                className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none text-sm"
                placeholder="Ask something..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="bg-blue-600 p-4 rounded-2xl text-white active:scale-95 transition-transform"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
