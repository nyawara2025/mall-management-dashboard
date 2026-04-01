import React, { useState, useEffect } from 'react';
import { Share2, MapPin, Clock, LogOut, Lock, Phone as PhoneIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ChurchHub() {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');
  
  // Data States
  const [churchData, setChurchData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(`church_auth_${shopId}`);
    if (savedAuth) {
      setIsAuthenticated(true);
    }
    initHub();
  }, [shopId]);

  async function initHub() {
    if (!shopId) {
      setIsLoading(false);
      return; 
    }

    try {
      const response = await fetch("https://n8n.tenear.com/webhook/track-church-visits", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shop_id: shopId,
          business_category: 'church',
          action: 'get_full_hub_data' 
        })
      });

      const result = await response.json();
      const actualData = Array.isArray(result) ? result[0] : result;

      if (actualData) {
        setChurchData(actualData.church_profile);
        setServices(actualData.active_services || []);
      }
    } catch (e) {
      console.error("Church Hub Init failed", e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-user-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          password: password,
          isSignUp: false,
          shop_id: shopId 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Success: Set state and persist
      setIsAuthenticated(true);
      localStorage.setItem(`church_auth_${shopId}`, 'true');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(`church_auth_${shopId}`);
  };

  const handleAction = async (type: string, metadata?: any) => {
    try {
      await fetch("https://n8n.tenear.com/webhook/fetch-church-material", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'track_interaction',
          interaction_type: type,
          shop_id: shopId,
          business_category: 'church',
          metadata: metadata
        })
      });
    } catch (e) {
      console.warn("Interaction tracking failed", e);
    }

    if (type === 'share') {
      const text = `🙌 Join us at ${churchData?.church_name}!\n\n📍 ${churchData?.location}\n🔗 Order of Service: ${window.location.href}`;
      window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen font-sans">Loading Church Hub...</div>;

  // --- SCREEN 1: LOGIN GATE ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Member Login</h2>
            <p className="text-gray-500 text-sm mt-2">{churchData?.church_name || 'Access Church Material'}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <PhoneIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="tel"
                required
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
                required
                className="w-full border border-gray-200 p-3.5 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            
            <button 
              type="submit"
              disabled={authLoading} 
              className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : 'Login to Hub'}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-400 mt-6 italic">
            Authorized personnel and registered members only.
          </p>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: AUTHENTICATED DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-24 font-sans">
      {/* Header with Logout */}
      <div className="w-full max-w-md flex justify-end mb-2">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Church Info */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 mx-auto border-4 border-white shadow-md flex items-center justify-center">
          {churchData?.logo_url ? (
            <img src={churchData.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-blue-600 font-black text-2xl">CH</div>
          )}
        </div>
        <h1 className="text-2xl font-black text-gray-900 mt-4 leading-tight">
          {churchData?.church_name || "Church Hub"}
        </h1>
        <div className="flex items-center justify-center text-gray-500 text-sm mt-3 font-medium">
          <MapPin size={14} className="mr-1" /> {churchData?.location || "Welcome"}
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-center gap-3 mt-6">
          <button 
            onClick={() => handleAction('share')}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
          >
            <Share2 size={16} /> Share Link
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="w-full max-w-md space-y-4">
        <h3 className="text-lg font-black text-gray-900 px-1">Active Services</h3>
        {services.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center text-gray-400 border border-dashed border-gray-200">
            No services scheduled today
          </div>
        ) : (
          services.map((service, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{service.service_name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{service.service_time}</p>
                </div>
              </div>
              <button 
                onClick={() => handleAction('view_service', { service_name: service.service_name })}
                className="bg-gray-50 text-gray-900 px-4 py-2 rounded-xl text-xs font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
              >
                VIEW
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-auto pt-12 text-center opacity-30">
        <p className="text-[10px] font-black tracking-widest uppercase">Powered by TeNEAR Space</p>
      </div>
    </div>
  );
}
