import React, { useState, useEffect } from 'react';
import { ShieldAlert, BarChart3, AlertCircle, CheckCircle, Loader2, Send, Lock as LockIcon, User as UserIcon } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

interface CustomAgentSession {
  id: string;
  shop_id: string;
  agent_phone: string;
  agent_first_name: string;
  agent_last_name: string;
  role: string;
}

interface PoliticianMetadata {
  full_name: string;
  photo_url: string | null;
  campaign_motto: string | null;
}
 
export function AgentDashboard() {
  // Sourced and managed via high-speed component persistence matching your URL parameters
  const [agentUser, setAgentUser] = useState<CustomAgentSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [activeTab, setActiveTab] = useState<'menu' | 'incident' | 'tally' | 'other'>('menu');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Authentication Interface Local States
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [candidateMeta, setCandidateMeta] = useState<PoliticianMetadata | null>(null);

  // Dynamic Form States
  const [incidentType, setIncidentType] = useState('KIEMS Malfunction');
  const [stationName, setStationName] = useState('');
  const [description, setDescription] = useState('');
  
  // Tally Form States
  const [candidateVotes, setCandidateVotes] = useState('');
  const [competitorVotes, setCompetitorVotes] = useState('');


  // Extract the active campaign identifier straight from the active window's location query footprint
  const currentParams = new URLSearchParams(window.location.search);
  const activeShopId = currentParams.get('shop_id') || '65';

  // Read the token profile context locally from storage on mount
  useEffect(() => {
    const cachedAgent = localStorage.getItem(`__agent_session_${activeShopId}`);
    if (cachedAgent) {
      try {
        setAgentUser(JSON.parse(cachedAgent));
      } catch (e) {
        localStorage.removeItem(`__agent_session_${activeShopId}`);
      }
    }
    setCheckingSession(false);
  }, [activeShopId]);

  // Asynchronous Candidate Metadata Fetch Hook via n8n
  useEffect(() => {
    const fetchCandidateMetadata = async () => {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-agents-candidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_candidate_profile',
            shop_id: activeShopId
          })
        });

        const data = await response.json();
        if (response.ok && data) {
          // 🛠️ FIX: Resolve array wrappers if n8n emits data as an item array [item]
          const profile = Array.isArray(data) ? data[0] : data;
          
          setCandidateMeta({
            full_name: profile.full_name || "Agent Command Portal",
            photo_url: profile.photo_url || null,
            campaign_motto: profile.campaign_motto || null
          });
        }
      } catch (err) {
        console.error("Failed loading candidate profile context via n8n:", err);
      }
    };

    if (agentUser) {
      fetchCandidateMetadata();
    }
  }, [agentUser, activeShopId]);

  // Authentication Action Middleware Controller
  const handleCustomWebhookAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/political-agent-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'agent_login',
          shop_id: activeShopId,
          agent_phone: phoneInput.trim(),
          password: passwordInput
        })
      });

      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        throw new Error(data.message || "Invalid operational credential combination.");
      }

      const sessionPayload: CustomAgentSession = {
        id: data.agent.id,
        shop_id: data.agent.shop_id,
        agent_phone: data.agent.agent_phone,
        agent_first_name: data.agent.agent_first_name,
        agent_last_name: data.agent.agent_last_name,
        role: data.agent.role
      };

      localStorage.setItem(`__agent_session_${activeShopId}`, JSON.stringify(sessionPayload));
      setAgentUser(sessionPayload);
    } catch (err: any) {
      setAuthError(err.message || "Connection failure to election middleware server.");
    } finally {
      setLoading(false);
    }
  };


  // Universal dynamic submission engine that auto-injects precise GPS telemetry
  const handleAgentSubmission = (actionType: 'incident' | 'tally' | 'other', formData: Record<string, any>) => {
    if (!agentUser) return;
    
    setLoading(true);
    setSuccess(false);

    const basePayload = {
      action: actionType,
      shop_id: agentUser.shop_id, 
      voter_phone: agentUser.agent_phone,
      business_category: "political",
      timestamp: new Date().toISOString(),
      ...formData
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const completePayload = {
            ...basePayload,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          await transmitToN8n(completePayload);
        },
        async () => {
          console.warn("GPS timeout or denied. Submitting forms with baseline values.");
          await transmitToN8n(basePayload);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      transmitToN8n(basePayload);
    }
  };

  const transmitToN8n = async (finalData: any) => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/parallel-vote-tally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      
      if (response.ok) {
        setSuccess(true);
        setDescription('');
        setStationName('');
        setCandidateVotes('');
        setCompetitorVotes('');
        setTimeout(() => { setSuccess(false); setActiveTab('menu'); }, 2000);
      }
    } catch (err) {
      console.error("Transmission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 🛡️ SECURITY LAYER REGISTRATION INTERCEPTORS
  // =========================================================================
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <p className="text-xs font-bold text-gray-400 animate-pulse">Initializing Security Protocol...</p>
      </div>
    );
  }

  if (!agentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-gray-900">Agent Portal Verification</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Terminal ID Context: {activeShopId}</p>
          </div>

          <form onSubmit={handleCustomWebhookAuth} className="space-y-4">
            {authError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center">{authError}</div>}
            
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Registered Agent Phone</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" required placeholder="e.g. 0716300197" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-1">Operational Access Pin</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="password" required placeholder="••••••••" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-black transition-all flex items-center justify-center"
            >
              {loading ? "Verifying Operational Pin..." : "Authenticate Session"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Add this logout handler logic block right inside your component body above the return statement
  const handleAgentLogout = () => {
    localStorage.removeItem(`__agent_session_${activeShopId}`);
    setAgentUser(null);
    window.location.reload(); // Instantly resets app context layout back to login terminal
  };

  // =========================================================================
  // 🗳️ MAIN PROTECTED APPLICATION VIEW RENDERING LAYOUT
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto border-x border-gray-100 shadow-xl font-sans">
      {/* Mobile Top App Bar */}
      <div className="bg-gray-900 text-white p-6 rounded-b-[2rem] shadow-md flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-[10px] bg-blue-600 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Candidate Agent Portal
          </span>
          <h2 className="text-xl font-black mt-2 text-white">
            {candidateMeta ? candidateMeta.full_name : "Agent Command Portal"}
          </h2>
          {candidateMeta?.campaign_motto && (
            <p className="text-[11px] text-gray-400 italic font-medium mt-0.5">
              "{candidateMeta.campaign_motto}"
            </p>
          )}

          {/* Secured Session Actions Row */}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-blue-400 font-bold">
              Agent: {agentUser.agent_phone}
            </p>
            <span className="text-gray-600 text-xs">•</span>
            <button 
              onClick={handleAgentLogout}
              className="text-[11px] text-red-400 font-black uppercase hover:text-red-300 transition-colors tracking-wide underline underline-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Candidate Visual Anchor Circular Component */}
        <div className="w-16 h-16 rounded-full border-2 border-blue-500 bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg">
          {candidateMeta?.photo_url ? (
            <img 
              src={candidateMeta.photo_url} 
              alt="Candidate Profile" 
              className="w-full h-full object-cover"
              crossOrigin="anonymous" // Avoids native Android WebView canvas security taint blocks
              onError={(e) => {
                // Hides bad resource links gracefully from layout canvas tree
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <UserIcon className="w-8 h-8 text-gray-500" />
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl mb-6 text-center font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle size={18} className="text-emerald-600" /> Report Logged and Transmitted!
          </div>
        )}

        {/* MENU DASHBOARD VIEW GRID */}
        {activeTab === 'menu' && (
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Select Reporting Action</h3>
            
            <button 
              onClick={() => setActiveTab('incident')}
              className="w-full p-6 bg-white border border-gray-100 rounded-3xl flex items-center gap-4 hover:shadow-md active:scale-95 transition-all text-left group"
            >
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-100 transition-colors"><ShieldAlert size={24} /></div>
              <div>
                <h4 className="font-black text-gray-900 text-lg">Report Field Incident</h4>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Log KIEMS failures, queue delays or anomalies</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('tally')}
              className="w-full p-6 bg-white border border-gray-100 rounded-3xl flex items-center gap-4 hover:shadow-md active:scale-95 transition-all text-left group"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-100 transition-colors"><BarChart3 size={24} /></div>
              <div>
                <h4 className="font-black text-gray-900 text-lg">Parallel Vote Tallying</h4>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Submit streaming stream ballot metrics</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('other')}
              className="w-full p-6 bg-white border border-gray-100 rounded-3xl flex items-center gap-4 hover:shadow-md active:scale-95 transition-all text-left group"
            >
              <div className="p-4 bg-gray-50 text-gray-600 rounded-2xl group-hover:bg-gray-100 transition-colors"><AlertCircle size={24} /></div>
              <div>
                <h4 className="font-black text-gray-900 text-lg">General / Other Logs</h4>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Push unstructured observations directly</p>
              </div>
            </button>
          </div>
        )}

        {/* FORM MODULE: FIELD INCIDENTS */}
        {activeTab === 'incident' && (
          <div className="space-y-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom duration-200">
            <h3 className="font-black text-lg text-gray-900">🚨 Log Field Observation</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Anomaly Categorization</label>
              <select 
                className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
              >
                <option value="KIEMS Malfunction">KIEMS Kit Malfunction</option>
                <option value="Voter Delays">Voter Queue Delays</option>
                <option value="Security Issue">Security / Bribery Incident</option>
                <option value="General Technical">Other Technical Issue</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Polling Center / Stream Name</label>
              <input 
                type="text" 
                placeholder="e.g. Olympic Pri School Stream 3"
                className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Field Description Details</label>
              <textarea 
                rows={3}
                placeholder="Describe exactly what is happening on the ground..."
                className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button disabled={loading} onClick={() => setActiveTab('menu')} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50">Cancel</button>
              <button 
                disabled={loading || !stationName || !description}
                onClick={() => handleAgentSubmission('incident', { incident_type: incidentType, polling_station_name: stationName, content: description })}
                className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /><span>Transmit Log</span></>}
              </button>
            </div>
          </div>
        )}

        {/* FORM MODULE: PARALLEL VOTE TALLYING */}
        {activeTab === 'tally' && (
          <div className="space-y-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom duration-200">
            <h3 className="font-black text-lg text-gray-900">🗳️ Submit Ballot Tally Stream</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Polling Stream Name</label>
              <input 
                type="text" 
                placeholder="e.g. Old Court Room Stream 1"
                className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-blue-600 uppercase">Your Candidate</label>
                <input 
                  type="number" 
                  placeholder="Votes"
                  className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 focus:border-blue-600 text-blue-900 rounded-xl font-black text-center text-xl outline-none"
                  value={candidateVotes}
                  onChange={(e) => setCandidateVotes(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase">Runner-Up</label>
                <input 
                  type="number" 
                  placeholder="Votes"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-gray-400 rounded-xl font-black text-center text-xl text-gray-800 outline-none"
                  value={competitorVotes}
                  onChange={(e) => setCompetitorVotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button disabled={loading} onClick={() => setActiveTab('menu')} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50">Cancel</button>
              <button 
                disabled={loading || !stationName || !candidateVotes || !competitorVotes}
                onClick={() => handleAgentSubmission('tally', { 
                  polling_station_name: stationName, 
                  candidate_votes: parseInt(candidateVotes, 10), 
                  competitor_votes: parseInt(competitorVotes, 10) 
                })}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /><span>Transmit Tally</span></>}
              </button>
            </div>
          </div>
        )}

        {/* FORM MODULE: OTHER LOGS */}
        {activeTab === 'other' && (
          <div className="space-y-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-bottom duration-200">
            <h3 className="font-black text-lg text-gray-900">✍️ Unstructured Field Log</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase">Observation / Report Details</label>
              <textarea 
                rows={4}
                placeholder="Type any general notes or observations here..."
                className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button disabled={loading} onClick={() => setActiveTab('menu')} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50">Cancel</button>
              <button 
                disabled={loading || !description}
                onClick={() => handleAgentSubmission('other', { content: description, target_type: 'General-Alert' })}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /><span>Transmit Notes</span></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
