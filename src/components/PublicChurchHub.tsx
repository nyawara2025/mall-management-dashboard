import React, { useEffect, useState } from 'react';
import { 
  Share2, MapPin, CalendarDays, BookOpen, 
  Heart
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

// --- COMPONENT 1: Login (Phone + Password Based) ---
export const ChurchHubLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    try {
      if (isSignUp) {
        const { error } = await (supabase as any).auth.signUp({
          phone: formattedPhone,
          password: password,
        });
        if (error) throw error;
        alert("Signup successful! You can now log in.");
        setIsSignUp(false);
      } else {
        const { error } = await (supabase as any).auth.signInWithPassword({
          phone: formattedPhone,
          password: password,
        });
        if (error) throw error;
        alert("Logged in successfully!");
      }
    } catch (error: any) {
      alert(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">
        {isSignUp ? 'Create Member Account' : 'Member Login'}
      </h2>
      <div className="space-y-4">
        <input 
          className="w-full border p-3 rounded-xl" 
          placeholder="Phone Number (e.g. +254...)" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        <input 
          type="password"
          className="w-full border p-3 rounded-xl" 
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        
        <button 
          onClick={handleAuth} 
          disabled={loading} 
          className={`w-full text-white p-3 rounded-xl font-bold transition-colors ${
            isSignUp ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
        </button>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-gray-500 hover:underline"
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT 2: Main Hub ---
export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [church, setChurch] = useState<any>(null);
  const [services, setServices] = useState<ChurchService[]>([]);
  const [loading, setLoading] = useState(true);
  
  const activeShopId = shopId || 68;

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
        console.error('Error fetching hub data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHubData();
  }, [activeShopId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!church) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm">
          <h2 className="text-red-500 font-bold text-xl mb-2">Church Not Found</h2>
          <p className="text-gray-500 text-sm">We couldn't find a church profile for ID: {activeShopId}.</p>
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
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6">
        <section className="grid grid-cols-2 gap-4">
          <button className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-sm">Bible</span>
          </button>
          <button className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center gap-2 group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <Heart size={24} />
            </div>
            <span className="font-bold text-sm">Give</span>
          </button>
        </section>

        <div className="space-y-6">
          <h2 className="text-xl font-black flex items-center gap-2 px-2">
            <CalendarDays className="text-blue-600" /> Upcoming Services
          </h2>
          
          {services.length === 0 && (
            <div className="bg-white p-8 rounded-3xl border border-dashed text-center text-gray-400 font-medium">
              No services scheduled yet.
            </div>
          )}

          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-gray-50/50">
                <h3 className="text-lg font-black text-gray-900">{service.service_name}</h3>
                <p className="text-sm text-gray-500 font-medium">{service.service_date} • {service.start_time}</p>
              </div>
              
              <div className="p-6">
                <ol className="relative border-l-2 border-blue-100 ml-2 space-y-8">
                  {service.service_activities
                    ?.sort((a, b) => a.sort_order - b.sort_order)
                    .map((activity, index) => (
                    <li key={index} className="pl-6 relative">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-600 shadow-sm"></div>
                      <div className="font-bold text-gray-800 leading-tight">{activity.activity_name}</div>
                      <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-4 bg-green-50 flex items-center justify-between border-t border-green-100">
                 <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Invite a Friend</span>
                 <button className="bg-green-500 text-white p-2 rounded-xl shadow-sm hover:bg-green-600 active:scale-95 transition-all">
                    <Share2 size={18} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8">
          <ChurchHubLogin />
        </div>
      </main>
    </div>
  );
};
