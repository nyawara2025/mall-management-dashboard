import React, { useEffect, useState } from 'react';
import { 
  Share2, MapPin, CalendarDays, BookOpen, 
  Heart, LogOut, Lock, Phone as PhoneIcon 
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

// --- COMPONENT 1: Login (n8n Webhook Based) ---
export const ChurchHubLogin = ({ shopId, onLoginSuccess }: { shopId: number, onLoginSuccess: () => void }) => {
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

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }

      if (isSignUp) {
        alert(result.message || "Signup request sent successfully!");
        setIsSignUp(false);
      } else {
        onLoginSuccess();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {isSignUp ? 'Member Signup' : 'Member Login'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">Access your church community hub</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <PhoneIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              className="w-full border border-gray-200 p-3.5 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Phone (e.g. 254...)" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input 
              type="password"
              className="w-full border border-gray-200 p-3.5 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            onClick={handleAuth} 
            disabled={loading} 
            className={`w-full text-white p-4 rounded-2xl font-bold transition-all active:scale-95 shadow-md ${
              isSignUp ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Verifying...' : (isSignUp ? 'Create Account' : 'Login to Hub')}
          </button>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-gray-500 hover:underline text-center font-medium mt-2"
          >
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
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
  
  const activeShopId = shopId || 68;

  useEffect(() => {
    const savedAuth = localStorage.getItem(`church_auth_${activeShopId}`);
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    async function fetchHubData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('churches')
          .select('*')
          .eq('shop_id', activeShopId);

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

  const handleLoginSuccess = () => {
    localStorage.setItem(`church_auth_${activeShopId}`, 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(`church_auth_${activeShopId}`);
    setIsAuthenticated(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Hub...</div>;
  if (!church) return <div className="p-10 text-center">Church Profile Not Found</div>;
  if (!isAuthenticated) return <ChurchHubLogin shopId={activeShopId} onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black uppercase shadow-sm">
            {church.church_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="font-bold text-md leading-tight">{church.church_name}</h1>
            <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
              <MapPin size={10} /> {church.address || "Location unavailable"}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="text-blue-600" size={24} />
            <h2 className="text-xl font-black text-gray-900">Upcoming Services</h2>
        </div>

        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900">{service.service_name}</h3>
                <p className="text-gray-500 font-medium">{service.service_date} @ {service.start_time}</p>
              </div>

              {/* SERVICE ACTIVITIES (Hymns, Prayers, etc) */}
              <div className="space-y-6">
                {service.service_activities?.sort((a,b) => a.sort_order - b.sort_order).map((activity, idx) => (
                  <div key={idx} className="border-l-4 border-blue-100 pl-4 py-1">
                    <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">
                      {activity.activity_name}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No active service order found.</p>
          </div>
        )}
      </main>
    </div>
  );
};
