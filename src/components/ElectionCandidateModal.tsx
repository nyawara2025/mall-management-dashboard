import React, { useState, useEffect } from 'react';
import { Users, Heart, Megaphone, BarChart3, RefreshCw, Layers, Lock, Phone } from 'lucide-react';

export function ElectionCandidateModal() {
  // --- INLINE ISOLATED LOCAL AUTH STATE MATRIX ---
  const [authSession, setAuthSession] = useState<{ shopId: string | number; name: string } | null>(() => {
    const cached = localStorage.getItem('__candidate_agent_session');
    return cached ? JSON.parse(cached) : null;
  });

  const [authFields, setAuthFields] = useState({ phone: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // --- LEOPARD TELEMETRY STATE PIPELINE ---
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    voterReach: '0',
    endorsements: '0',
    activeAds: '0',
    engagement: '0%'
  });

  // Handle Authentication Pipeline Request
  const handleAgentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      // 🌐 MULTI-TENANT CONTEXT: Safely extract the tenant context from the active URL path parameters
      const currentUrl = new URL(window.location.href);
      const dynamicShopId = currentUrl.searchParams.get('shop_id');
      
      if (!dynamicShopId) {
        setAuthError('Security Breakdown: Missing Multi-Tenant context parameter (?shop_id=) in URL path.');
        setAuthLoading(false);
        return;
      }

      const response = await fetch('https://n8n.tenear.com/webhook/political-agent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'candidate_login',      // 🔒 Isolated backend route flag
          role: 'candidate',              // 🔒 Enforces explicit tier classification parameter
          shop_id: Number(dynamicShopId), // 🔒 No more hardcoding—binds the dynamic context casted safely
          agent_phone: authFields.phone,
          password: authFields.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Strict runtime validation matches your exact backend query layout expectations
        if (data?.authenticated && data?.role === 'candidate') {
          const session = { 
            shopId: data.shop_id, 
            name: data.name || 'Hon. Candidate' 
          };
          localStorage.setItem('__candidate_agent_session', JSON.stringify(session));
          setAuthSession(session);
        } else {
          setAuthError('Unauthorized Access: Candidate clearance level required.');
        }
      } else {
        setAuthError('Invalid credentials. Check profile records.');
      }
    } catch (err) {
      setAuthError('Network communication timeout.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch Telemetry Data Panel Parameters
  const fetchMobileCampaignIntel = async () => {
    if (!authSession?.shopId) return;
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-candidate-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shop_id: Number(authSession.shopId), 
          action: 'fetch_candidate_mobile' 
        })
      });

      if (response.ok) {
        const rawData = await response.json();
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data) {
          setMetrics({
            voterReach: data.voter_reach || '45.2k',
            endorsements: data.endorsements || '12,840',
            activeAds: data.active_ads || '24',
            engagement: data.engagement || '18.5%'
          });
        }
      }
    } catch (e) {
      console.error("Mobile operational extraction breakdown:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authSession) {
      fetchMobileCampaignIntel();
    }
  }, [authSession]);

  // --- RENDER SCREEN A: AGENT CREDENTIAL ENTRY GATES ---
  if (!authSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex items-center justify-center animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Lock size={20} />
            </div>
            <h2 className="text-base font-black uppercase tracking-widest text-white">Aspirant Workspace</h2>
            <p className="text-xs text-slate-500 font-medium">Verify your political agent credentials to access telemetry dashboards.</p>
          </div>

          <form onSubmit={handleAgentLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Registered Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-500"><Phone size={14} /></span>
                <input 
                  type="tel"
                  required
                  placeholder="+254 700 000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-11 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 transition-colors"
                  value={authFields.phone}
                  onChange={(e) => setAuthFields({ ...authFields, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Access Passcode / Hash</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 transition-colors tracking-widest"
                value={authFields.password}
                onChange={(e) => setAuthFields({ ...authFields, password: e.target.value })}
              />
            </div>

            {authError && (
              <p className="text-red-400 text-[11px] font-bold text-center border border-red-950/60 bg-red-500/5 py-2 rounded-xl">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {authLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Authenticate Agent Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER SCREEN B: CANDIDATE TELEMETRY CORE CONTROL PANELS ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 flex justify-center pb-12 animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-5">
        
        {/* Profile Card Identity Strips */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs uppercase">CAND</div>
            <div>
              <h2 className="text-sm font-black text-white">{authSession.name}</h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Real-time Mobilization 2027</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={fetchMobileCampaignIntel} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 active:scale-95 transition-transform">
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-500' : ''} />
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('__candidate_agent_session');
                setAuthSession(null);
              }}
              className="p-2.5 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-xs font-black uppercase tracking-wider active:scale-95"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Dynamic Metric Display Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded tracking-wide float-right">+12%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Voter Reach</span>
            <span className="text-xl font-black text-white block">{metrics.voterReach}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded tracking-wide float-right">+5.4%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Endorsements</span>
            <span className="text-xl font-black text-white block">{metrics.endorsements}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded tracking-wide float-right">Steady</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Ads</span>
            <span className="text-xl font-black text-white block">{metrics.activeAds}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded tracking-wide float-right">+2.1%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Engagement</span>
            <span className="text-xl font-black text-white block">{metrics.engagement}</span>
          </div>
        </div>

        {/* Heatmap Visual Shell */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-2 mb-3 flex items-center gap-2">
            <Layers size={12} className="text-blue-500" /> Constituency Support Intensity
          </h3>
          <div className="h-48 rounded-xl bg-slate-950 border border-slate-800 border-dashed flex items-center justify-center text-xs font-semibold text-slate-600">
            [ Heatmap Vector Active Layer - Tenant {authSession.shopId} ]
          </div>
        </div>

      </div>
    </div>
  );
}
