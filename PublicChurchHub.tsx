import React, { useEffect, useState } from 'react';
import { 
  Share2, 
  MapPin, 
  CalendarDays, 
  LogOut, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TYPES ---
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

// --- COMPONENT 1: Login Form ---
// Moved outside to prevent re-creation on every parent render
export const ChurchHubLogin = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    const { error } = await (supabase as any).auth.signInWithOtp({ phone });
    if (error) alert(error.message);
    else setStep('OTP');
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const { error } = await (supabase as any).auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });
  
    if (error) {
      alert("Invalid Code");
      setLoading(false);
    } else {
      console.log("Login successful!");
      // Parent's onAuthStateChange listener will detect this automatically
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Member Access</h2>
      {step === 'PHONE' ? (
        <div className="space-y-4">
          <input 
            type="tel" 
            placeholder="+254..." 
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            onClick={handleSendOtp}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Get Access Code'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">Enter the code sent to {phone}</p>
          <input 
            type="text" 
            placeholder="6-digit code" 
            className="w-full p-4 border rounded-xl text-center text-2xl tracking-widest focus:ring-2 focus:ring-green-500 outline-none"
            onChange={(e) => setOtp(e.target.value)}
          />
          <button 
            onClick={handleVerifyOtp}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Login to Church Hub'}
          </button>
          <button onClick={() => setStep('PHONE')} className="w-full text-sm text-gray-400 hover:text-gray-600">
            Change phone number
          </button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT 2: Main Dashboard ---
export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [church, setChurch] = useState<any>(null);
  const [services, setServices] = useState<ChurchService[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  
  const activeShopId = shopId || 68;

  // 1. Auth Listener: Sync session state globally
  useEffect(() => {
    // Check current session on mount
    (supabase as any).auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    // Listen for sign-in/sign-out events
    const { data: { subscription } } = (supabase as any).auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Data Fetching
  useEffect(() => {
    async function fetchHubData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('churches')
          .select('*')
          .eq('shop_id', activeShopId)
          .limit(1);

        if (error) throw error;
        if (data?.[0]) setChurch(data[0]);

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
        console.error('Error fetching hub data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHubData();
  }, [activeShopId]);

  const handleLogout = async () => {
    await (supabase as any).auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!church) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm">
          <h2 className="text-red-500 font-bold text-xl mb-2">Church Not Found</h2>
          <p className="text-gray-500 text-sm">Profile ID: {activeShopId}. Please check the link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black uppercase">
            {church.church_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="font-bold text-md leading-tight line-clamp-1">{church.church_name}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={12} /> {church.address || "Location unavailable"}
            </p>
          </div>
        </div>
        {session && (
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
            <LogOut size={20} />
          </button>
        )}
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6">
        {/* CONDITIONAL UI: Show Login if no session, otherwise show member dashboard */}
        {!session ? (
          <div className="py-8">
            <ChurchHubLogin />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
              <h2 className="text-xl font-bold">Welcome, {session.user?.phone}!</h2>
              <p className="text-blue-100 text-sm mt-1">You are logged into the Member Hub.</p>
            </div>
            
            {/* Quick Action Grid */}
            <section className="grid grid-cols-2 gap-4">
              <button className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <span className="font-bold text-sm">Bible</span>
              </button>
              {/* Add more buttons as needed */}
            </section>

            {/* Services List */}
            {services.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-bold text-lg px-2">Upcoming Services</h3>
                {services.map((service) => (
                  <div key={service.id} className="bg-white p-5 rounded-2xl border shadow-sm">
                    <h4 className="font-bold text-blue-600">{service.service_name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{service.service_date} @ {service.start_time}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
