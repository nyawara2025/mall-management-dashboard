import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Truck, MapPin, FileText, Fuel, ShieldAlert, 
  DollarSign, UserCheck, Briefcase, ChevronRight, X, Lock, Phone, User
} from 'lucide-react';

interface Opportunity {
  id: string;
  client_company_name: string;
  origin_city: string;
  destination_city: string;
  cargo_type: string;
  offered_rate: number;
}

export const PublicLogisticsHub: React.FC = () => {
  const [searchParams] = useSearchParams();

  // 💾 State Management Layer (Mirrors PublicAgricHub logic perfectly)
  const [shopId, setShopId] = useState<string | null>(() => {
    return searchParams.get('shop_id') || localStorage.getItem('__native_shop_id') || '90';
  });
  
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>(() => {
    return localStorage.getItem('remembered_logistics_name') ? 'dashboard' : 'login';
  });

  // Auth & Session Trackers
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [category, setCategory] = useState('driver');
  const [loading, setLoading] = useState(false);

  const [userSession, setUserSession] = useState<{ name: string; role: string } | null>(() => {
    const cachedName = localStorage.getItem('remembered_logistics_name');
    const cachedRole = localStorage.getItem('remembered_logistics_role');
    return cachedName && cachedRole ? { name: cachedName, role: cachedRole } : null;
  });

  // 📊 Live Telemetry Data Layers & Modal Visibility Controllers
  const [marketIntel, setMarketIntel] = useState<Opportunity[]>([]);
  const [intelOpen, setIntelOpen] = useState(false);

  // Sync shop_id down if URL context overrides state mid-session
  useEffect(() => {
    const urlId = searchParams.get('shop_id');
    if (urlId && urlId !== shopId) {
      setShopId(urlId);
    }
  }, [searchParams]);

  // Helper utility extracting driver initials safely
  const getInitials = () => {
    if (!userSession || !userSession.name) return 'TR';
    return userSession.name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0]) // Extracts the first character of each name segment safely
      .join('')
      .toUpperCase();
  };

  // Pull real live telemetry datasets from your n8n workflows
  const fetchDashboardData = async (targetShopId?: string) => {
    // Resolve identity strictly: passed value -> state value -> localStorage value -> null
    const activeShopId = targetShopId || shopId || localStorage.getItem('remembered_logistics_shop_id');
    
    if (!activeShopId) {
      console.warn("Telemetry fetch skipped: Missing valid shop_id context identifier.");
      return;
    }

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/logistics-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.opportunities) {
        setMarketIntel(data.opportunities);
      }
    } catch (err) {
      console.error("Error pulling database telemetry logs:", err);
    }
  };

  // Trigger telemetry fetch immediately when view switches over to dashboard
  useEffect(() => {
    if (view === 'dashboard' && shopId) {
      fetchDashboardData();
    }
  }, [view, shopId]);

  

  // 🔐 Multi-Tenant Webhook POST Auth Engine
  const handleAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    if (!shopId) return alert("Select logistics workspace workspace tracking token.");
    setLoading(true);

    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`;
    const payload = type === 'register'
      ? { action: 'register', shop_id: parseInt(shopId), phone_number: phone, password, full_name: combinedFullName, user_category: category }
      : { action: 'login', shop_id: parseInt(shopId), phone_number: phone, password };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/logistics-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        const verifiedShopId = String(data.user.shop_id);
      
        localStorage.setItem('remembered_logistics_shop_id', verifiedShopId);
        localStorage.setItem('remembered_logistics_name', data.user.full_name);
        localStorage.setItem('remembered_logistics_role', data.user.user_category);
        localStorage.setItem('remembered_logistics_phone', phone);
      
        setShopId(verifiedShopId);
        setUserSession({ name: data.user.full_name, role: data.user.user_category });
        setView('dashboard');
      
        // Pass the explicit fresh ID directly to crush the state race condition loop
        fetchDashboardData(verifiedShopId);
        
       
      } else {
        alert(data.message || "Authentication verification match failure exception.");
      }
    } catch (err) {
      console.error(err);
      alert("Network gateway connection dropped.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('remembered_logistics_name');
    localStorage.removeItem('remembered_logistics_role');
    localStorage.removeItem('remembered_logistics_phone');
    setUserSession(null);
    setView('login');
  };

  const hubActions = [
    { id: 'trip_manifest', label: 'TRIP MANIFEST & NTSA LOG', icon: <FileText className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'fuel_allocation', label: 'FUEL VOUCHER & EXPENSES', icon: <Fuel className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'cargo_tracking', label: 'WAYBILL & CARGO STATUS', icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'weighbridge_clearance', label: 'WEIGHBRIDGE & PORT DOCS', icon: <UserCheck className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'payments_invoicing', label: 'M-PESA / FREIGHT PAYMENTS', icon: <DollarSign className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'market_intel', label: 'MARKET OPPORTUNITIES', icon: <Briefcase className="w-5 h-5" />, color: 'bg-emerald-600' },
    { id: 'breakdown_alert', label: 'EMERGENCY & BREAKDOWN', icon: <ShieldAlert className="w-5 h-5" />, color: 'bg-red-600' }
  ];

  // =========================================================================
  // 🔘 FRONTEND LAYOUT VIEW ROUTING SECTION
  // =========================================================================
  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto text-white mb-2 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Logistics Workspace</h2>
            <p className="text-xs text-slate-400 mt-1">Workspace Tenant Context Profile ID: #{shopId}</p>
          </div>

          <form onSubmit={(e) => handleAuth(e, view === 'login' ? 'login' : 'register')} className="space-y-3.5">
            {view === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input type="text" placeholder="First Name" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input type="text" placeholder="Last Name" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <div className="col-span-2 bg-slate-50 border rounded-xl p-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Functional Designation</label>
                  <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="driver">Commercial Driver</option>
                    <option value="manager">Fleet Manager</option>
                    <option value="owner">Business Owner</option>
                    <option value="supervisor">Route Supervisor</option>
                    <option value="mechanic">Fleet Mechanic</option>
                    <option value="clearing_agent">Port Clearing Agent</option>
                  </select>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="tel" placeholder="Phone Number" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="password" placeholder="Password" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50">
              {loading ? 'Processing System Gateway...' : view === 'login' ? 'Sign In to Fleet Panel' : 'Register Operator Credentials'}
            </button>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-slate-100">
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-xs text-blue-600 font-bold hover:underline">
              {view === 'login' ? "New platform driver? Register details" : "Already registered? Login to portal"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Sidebar Element */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm h-fit">
          <div className="flex flex-col items-center border-b border-slate-100 pb-4 mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black mb-3 shadow-inner">
              {getInitials()}
            </div>
            <span className="bg-blue-50 text-blue-700 text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-blue-100 uppercase">
              {userSession?.role}
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-2">{userSession?.name}</h2>
          </div>

          <button onClick={handleLogout} className="w-full text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/70 border border-red-100 py-1.5 rounded-lg transition-colors uppercase tracking-wide">
            Exit Workspace
          </button>
        </div>

        {/* Functional Matrix Grid Layout */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hubActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === 'market_intel') setIntelOpen(true);
                else console.log(`Triggering POST workflow API node allocation context for option: ${action.id}`);
              }}
              className="transition-all duration-150 rounded-xl p-4 text-white flex items-center gap-4 text-left shadow-xs hover:brightness-95 group font-medium"
              style={{ backgroundColor: action.id === 'breakdown_alert' ? '#DC2626' : action.id === 'market_intel' ? '#059669' : '#2563EB' }}
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:scale-105 transition-transform">
                {action.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Slide-Over Panel displaying active database entries */}
      {intelOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Regional Freight Opportunities</h3>
                <p className="text-xs text-slate-400">Live operational data queried matching system records</p>
              </div>
              <button onClick={() => setIntelOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {marketIntel.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10 italic">No available transport queries loaded in data viewport pipeline.</div>
              ) : (
                marketIntel.map((job) => (
                  <div key={job.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-800">{job.client_company_name}</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        KES {job.offered_rate.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" /> {job.origin_city} → {job.destination_city}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 pl-4">• Load Spec: {job.cargo_type}</p>
                    <button className="w-full mt-3 bg-emerald-600 text-white font-bold text-[10px] tracking-wider py-1.5 rounded-lg flex items-center justify-center gap-1 uppercase">
                      Claim Freight Contract <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
