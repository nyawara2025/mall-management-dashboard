import React, { useState, useEffect } from 'react';
import { Users, Heart, Megaphone, BarChart3, RefreshCw, Layers, Lock, Phone } from 'lucide-react';

// 🎯 FIX: Explicitly import all map rendering components from 'react-leaflet'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

// Keep your standard leaflet styling sheet imported below it
import 'leaflet/dist/leaflet.css';

export function ElectionCandidateModal() {
  // --- INLINE ISOLATED LOCAL AUTH STATE MATRIX ---
  const [authSession, setAuthSession] = useState<{ shopId: string | number; name: string } | null>(() => {
    const cached = localStorage.getItem('__candidate_agent_session');
    return cached ? JSON.parse(cached) : null;
  });

  const [authFields, setAuthFields] = useState({ phone: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // --- 🌐 NEW METADATA TRACKING STATE MATRIX ---
  const [candidateProfile, setCandidateProfile] = useState({
    name: 'Hon. Candidate',
    photoUrl: '',
    motto: 'Real-time Mobilization 2027'
  });

  // --- 🗺️ MULTI-TENANT DYNAMIC HEATMAP DATA BOUNDS MATRIX ---
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(11);

  // --- LEOPARD TELEMETRY STATE PIPELINE ---
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    voterReach: '0',
    endorsements: '0',
    activeAds: '0',
    engagement: '0%'
  });

  // --- 🗺️ LIGHTWEIGHT MULTI-TENANT MAP LOADER ---
  const resolveConstituencyMap = async () => {
    try {
      const res = await fetch('/data/kenya_constituencies.json');
      if (!res.ok) return;
      const data = await res.json();
      
      if (data && data.type === "FeatureCollection") {
        setGeoJsonData(data); // Stores full collection exactly like your working code
      }
    } catch (err) {
      console.error("Map Loader Error:", err);
    }
  };
         

  // --- 📡 FETCH CANDIDATE METADATA PIPELINE ---
  const fetchCandidateMetadata = async () => {
    if (!authSession?.shopId) return;
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-agents-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'fetch_metadata', 
          shop_id: Number(authSession.shopId) 
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Handle array wrapping structure from n8n cleanly
        const data = Array.isArray(result) ? result[0] : result;
        if (data) {
          setCandidateProfile({
            name: data.full_name || authSession.name,
            photoUrl: data.photo_url || '',
            motto: data.campaign_motto || 'Real-time Mobilization 2027'
          });
         
          // 🎯 DISPATCH
          resolveConstituencyMap();
        }
      }
    } catch (e) {
      console.error("Metadata extraction failure:", e);
    }
  };

  // Handle Authentication Pipeline Request
  const handleAgentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/political-agent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'candidate_login',      // 🔒 Isolated backend route flag
          role: 'candidate', 
          agent_phone: authFields.phone,
          password: authFields.password
        })
      });

      if (response.ok) {
        const rawData = await response.json();
        
        console.log("🔒 Raw Network Content Received:", rawData);
        
        // FIX: Extract the first object index safely if n8n passes a wrapped list
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        
        // Check for either the root database property OR your webhook template key string fallbacks
        const isAuthorized = (data?.passwordMatches === true || data?.authenticated === true);
        const accessRole = data?.role || (data?.agent?.role);
        
        if (isAuthorized && accessRole === 'candidate') {
          const session = { 
            shopId: data?.shop_id || data?.agent?.shop_id || 66, 
            name: data?.agent_first_name && data?.agent_last_name 
              ? `Hon. ${data.agent_first_name} ${data.agent_last_name}` 
              : 'Hon. Candidate'
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
      console.error("Auth network error:", err);
      setAuthError('Network communication timeout.');
    } finally {
      setAuthLoading(false);
    }
  };  

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
        const data = Array.isArray(rawData) ? rawData : rawData;
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

  // Synchronize triggers instantly upon session activation
  useEffect(() => {
    if (authSession) {
      fetchCandidateMetadata();
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
            
            {/* 📷 FIX 1: Render the image dynamically using your fetched photoUrl state */}
            {candidateProfile?.photoUrl ? (
              <img 
                src={candidateProfile.photoUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow-sm shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs uppercase shrink-0">
                CAND
              </div>
            )}
            
            <div className="truncate max-w-[180px]">
              {/* 🏛️ FIX 2: Swap out hardcoded references for dynamic state variables */}
              <h2 className="text-sm font-black text-white truncate">{candidateProfile?.name || authSession.name}</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{candidateProfile?.motto || 'Real-time Mobilization 2027'}</p>
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
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 mb-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={12} className="text-blue-500" /> Constituency Hotspots Telemetry
            </h3>
            <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
              Live Link Connected
            </span>
          </div>
          
          <div className="h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative z-10">
            {geoJsonData ? (
              <MapContainer 
                center={[0.0236, 37.9062]} // 🎯 Fixed broad baseline anchor exactly like desktop
                zoom={5.5}                  // Tailored mobile zoom view matrix
                scrollWheelZoom={false}
                zoomControl={false}
                className="w-full h-full"
              >
                <TileLayer
                  url="https://{s}://{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                
                <GeoJSON 
                  data={geoJsonData}
                  style={(feature: any) => {
                    // Read feature properties from your geojson rows
                    const featConst = feature.properties?.CONSTITUEN || "";
                    
                    // Cross-examine with the logged in Candidate's authenticated profile row from n8n
                    // If this shape is their active constituency, illuminate it brightly!
                    const isTargetJurisdiction = featConst.toUpperCase() === candidateProfile.name.toUpperCase();

                    return {
                      fillColor: isTargetJurisdiction ? '#10b981' : '#3b82f6', 
                      fillOpacity: isTargetJurisdiction ? 0.4 : 0.05,
                      color: isTargetJurisdiction ? '#059669' : '#1e293b',
                      weight: isTargetJurisdiction ? 2 : 1,
                      opacity: 0.7
                    };
                  }}
                />
              </MapContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2 text-xs font-bold animate-pulse">
                <RefreshCw size={14} className="animate-spin text-blue-500" /> Connecting Map Data Nodes...
              </div>
            )}
          

          </div>
        </div>

      </div>
    </div>
  );
}
