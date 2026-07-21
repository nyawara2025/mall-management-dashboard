import React, { useState, useEffect } from 'react';

// ==========================================
// STRICT CORE TYPE DEFINITIONS
// ==========================================
type PigStage = 'piglet' | 'weaner' | 'finisher' | 'boar' | 'sow' | 'gilt';
type ActiveTab = 'roster' | 'breeding' | 'health' | 'market';

interface PigAnimal {
  id: number;
  tag_number: string;
  breed: string;
  gender: 'male' | 'female';
  stage: PigStage;
  is_pregnant: boolean;
  last_litter_size: number;
  daily_feed_kg: number;
  feed_type: string;
  vet_verified: boolean;
  pen_id?: string;
}

interface BreedingRecord {
  id: number;
  shop_id: string;
  sow_tag: string;
  boar_tag_or_ai: string;
  service_date: string;
  expected_farrowing_date: string;
  status: 'pending' | 'farrowed' | 'failed';
}

interface VetRecord {
  id: number;
  shop_id: string;
  tag_number: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  withdrawal_days: number;
}

interface SectorProps {
  shopId: string | null;
  userSession: { name: string; role: string } | null;
}

// ==========================================
// COMPONENT IMPLEMENTATION
// ==========================================
export const PigsHub: React.FC<SectorProps> = ({ shopId, userSession }) => {
  // Navigation & Application Views
  const [view, setView] = useState<'list' | 'register'>('list');
  const [activeTab, setActiveTab] = useState<ActiveTab>('roster');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Structural Domain Lists
  const [pigs, setPigs] = useState<PigAnimal[]>([]);
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([]);
  const [vetRecords, setVetRecords] = useState<VetRecord[]>([]);

  // Registration Form Local States
  const [tag, setTag] = useState('');
  const [breed, setBreed] = useState('Large White');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [stage, setStage] = useState<PigStage>('finisher');
  const [pregnant, setPregnant] = useState(false);
  const [litter, setLitter] = useState('0');
  const [feedType, setFeedType] = useState('Pig Finisher Pellets');
  const [feedKg, setFeedKg] = useState('');
  const [penId, setPenId] = useState('');

  // Local Estimation Calculations
  const [heartGirth, setHeartGirth] = useState('');
  const [bodyLength, setBodyLength] = useState('');
  const [calculatedWeight, setCalculatedWeight] = useState<number | null>(null);

  // ==========================================
  // CENTRALIZED POST HOOK WORKFLOW ENGINE
  // ==========================================
  const queryN8nMiddleware = async (action: string, payload: object = {}) => {
    // Isolated system route point handling communication logic to n8n instance
    const N8N_WEBHOOK_URL = 'https://n8n.tenear.com/webhook/fetch-pigs'; 

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop_id: shopId,
        user_session: userSession,
        action: action,
        payload: payload
      })
    });

    if (!response.ok) {
      throw new Error(`n8n webhook execution failed: ${response.status}`);
    }

    return response.json();
  };

  const fetchDashboardData = async () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);
    try {
      // Parallel routing logic extracting data scoped uniquely to this tenant shop_id
      const [pigsData, breedingData, vetData] = await Promise.all([
        queryN8nMiddleware('FETCH_PIGS_ROSTER'),
        queryN8nMiddleware('FETCH_BREEDING_LOGS'),
        queryN8nMiddleware('FETCH_VET_RECORDS')
      ]);

      if (pigsData) setPigs(pigsData);
      if (breedingData) setBreedingRecords(breedingData);
      if (vetData) setVetRecords(vetData);

    } catch (err) {
      setError('Unable to securely coordinate records over middleware mesh pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [shopId]);

  // ==========================================
  // LOGIC & STORAGE INTERACTION MUTATIONS
  // ==========================================
  const handleRegisterPig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return alert('Tag number is required');

    const newPigPayload = {
      shop_id: shopId,
      tag_number: tag,
      breed,
      gender,
      stage,
      is_pregnant: pregnant,
      last_litter_size: parseInt(litter) || 0,
      daily_feed_kg: parseFloat(feedKg) || 0,
      feed_type: feedType,
      pen_id: penId,
      vet_verified: true
    };

    try {
      await queryN8nMiddleware('SAVE_NEW_PIG_TAG', newPigPayload);
      
      setView('list');
      fetchDashboardData();
      
      // Clear form inputs
      setTag('');
      setFeedKg('');
      setPenId('');
    } catch (err) {
      alert('Network transaction failed via n8n integration gateway layer.');
    }
  };

  const calculateEstimatedWeight = () => {
    const girth = parseFloat(heartGirth);
    const length = parseFloat(bodyLength);
    if (girth > 0 && length > 0) {
      const weight = (girth * girth * length) / 11000;
      setCalculatedWeight(Math.round(weight));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 min-h-screen pb-12 font-sans text-gray-800 antialiased">
      
      {/* Dynamic Header Block mapping exact system structure properties */}
      <div className="bg-emerald-800 text-white p-4 shadow-sm flex justify-between items-center rounded-b-xl">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{userSession?.name || 'Nyawara Ranch'}</h1>
          <p className="text-xs text-emerald-100 opacity-90">Tenant Context: {shopId || 'None'}</p>
        </div>
        <div className="bg-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-600">
          Livestock Node
        </div>
      </div>

      {/* Roster / Entry Controller Row */}
      <div className="p-3 flex gap-2">
        <button
          type="button"
          onClick={() => setView('list')}
          className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all ${
            view === 'list' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-600 border'
          }`}
        >
          Management Panels
        </button>
        <button
          type="button"
          onClick={() => setView('register')}
          className={`flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all ${
            view === 'register' ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-600 border'
          }`}
        >
          + Add New Ear Tag
        </button>
      </div>

      {error && (
        <div className="mx-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg mb-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12 text-sm text-gray-500 font-medium">
          Executing tenant isolation query parameters...
        </div>
      ) : view === 'list' ? (
        <>
          {/* Sub-view Tab Layout Row */}
          <div className="flex px-3 border-b border-gray-200 overflow-x-auto gap-1 bg-white shadow-sm scrollbar-none">
            {(['roster', 'breeding', 'health', 'market'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-3">
            {/* SUB-VIEW TAB 1: PIG ROSTER LIST */}
            {activeTab === 'roster' && (
              <div className="space-y-3">
                {pigs.length === 0 ? (
                  <div className="p-6 bg-white border rounded-xl text-center text-sm text-gray-400">
                    No animals matched on this network node. Add your first pig.
                  </div>
                ) : (
                  pigs.map((p) => (
                    <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded border uppercase">
                            {p.stage}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 mt-1">Tag: {p.tag_number}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-500 block">Pen ID: {p.pen_id || 'N/A'}</span>
                          <span className="text-[11px] text-emerald-600 font-medium">{p.breed}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-50 text-gray-600">
                        <div>🌾 Feed: <span className="font-semibold">{p.feed_type}</span></div>
                        <div>⚖️ Daily Ration: <span className="font-semibold">{p.daily_feed_kg} kg/day</span></div>
                        <div>🩺 Status: <span className="font-semibold text-emerald-700">{p.vet_verified ? 'Cleared' : 'Pending'}</span></div>
                        <div>🐖 Gender: <span className="font-semibold capitalize">{p.gender}</span></div>
                      </div>
                      {p.is_pregnant && (
                        <div className="mt-2.5 p-1.5 bg-pink-50 text-pink-700 rounded text-[11px] font-bold flex justify-between">
                          <span>🤰 Gestating Pregnancy Variant</span>
                          <span>Last Litter: {p.last_litter_size}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUB-VIEW TAB 2: SMART BREEDING REGISTER */}
            {activeTab === 'breeding' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                  ⚠️ <strong>Gestation Tracking Ruleset:</strong> Webhooks monitor the standard 114-day cycle inside your system infrastructure.
                </div>
                {breedingRecords.map((b) => (
                  <div key={b.id} className="bg-white p-3 rounded-xl border text-xs shadow-sm">
                    <div className="flex justify-between font-bold text-gray-900 mb-2 border-b pb-1.5">
                      <span>Sow ID: {b.sow_tag}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        b.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>{b.status}</span>
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <p>🧬 Sire/Method: <span className="font-semibold text-gray-800">{b.boar_tag_or_ai}</span></p>
                      <p>📅 Inseminated: <span className="font-semibold text-gray-800">{b.service_date}</span></p>
                      <p>🚨 Est. Farrowing Date: <span className="font-semibold text-red-600">{b.expected_farrowing_date}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUB-VIEW TAB 3: VETERINARY AND HEALTH TIMELINES */}
            {activeTab === 'health' && (
              <div className="space-y-3">
                {vetRecords.map((v) => (
                  <div key={v.id} className="bg-white p-3 rounded-xl border text-xs shadow-sm border-l-4 border-l-red-500">
                    <div className="flex justify-between font-bold text-gray-900 mb-1">
                      <span>Tag: {v.tag_number}</span>
                      <span className="text-gray-400 font-normal">{v.visit_date}</span>
                    </div>
                    <p className="text-gray-700 font-medium mb-1.5">🩺 Diagnosis: {v.diagnosis}</p>
                    <div className="p-2 bg-gray-50 rounded text-gray-600 border border-gray-100 space-y-1">
                      <p>💊 Action: {v.treatment}</p>
                      <p className="text-red-700 font-bold text-[10px] tracking-wide uppercase">
                        🚫 Meat Withdrawal: {v.withdrawal_days} Days Safe Window
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUB-VIEW TAB 4: LOCAL INTEGRATION & ANALYTICS */}
            {activeTab === 'market' && (
              <div className="space-y-4">
                {/* Heart Girth Estimator Card */}
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 text-emerald-700">📏 Heart Girth Weight Estimator</h3>
                  <p className="text-[11px] text-gray-500 mb-3">Estimate pig biomass calculations without a physical scale using standard math profiles.</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Heart Girth (cm)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 115"
                        value={heartGirth} 
                        onChange={(e) => setHeartGirth(e.target.value)} 
                        className="w-full p-2 border rounded-lg text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Body Length (cm)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 120"
                        value={bodyLength} 
                        onChange={(e) => setBodyLength(e.target.value)} 
                        className="w-full p-2 border rounded-lg text-xs" 
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={calculateEstimatedWeight} 
                    className="w-full bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg"
                  >
                    Run Biomass Calculation Equation
                  </button>
                  {calculatedWeight && (
                    <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-center border border-emerald-100">
                      <span className="text-[11px] text-emerald-800 block">Calculated Livestock Estimation</span>
                      <strong className="text-lg text-emerald-900">{calculatedWeight} KG Live Weight</strong>
                    </div>
                  )}
                </div>

                {/* Farmer's Choice External Links */}
                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider text-emerald-700">🏢 Farmer's Choice Integrated Portal</h3>
                  <p className="text-[11px] text-gray-500">Links redirecting to external commercial agricultural assistance leaflets.</p>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <a href="https://farmerschoice.co.ke" target="_blank" rel="noreferrer" className="p-2 border rounded-lg flex justify-between items-center text-xs hover:bg-gray-50 font-medium">
                      <span>📄 Access Extension Advisory Leaflets</span>
                      <span className="text-emerald-600 font-bold">→</span>
                    </a>
                    <a href="https://farmerschoice.co.ke" target="_blank" rel="noreferrer" className="p-2 border rounded-lg flex justify-between items-center text-xs hover:bg-gray-50 font-medium">
                      <span>🐖 Request Semen Delivery Terminal (AI)</span>
                      <span className="text-emerald-600 font-bold">→</span>
                    </a>
                  </div>
                </div>

                {/* Circular Waste Engine Monitor */}
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 text-emerald-700">🌱 Circular Organic By-products</h3>
                  <p className="text-[11px] text-gray-500 mb-2">Mathematical parameters mapping metrics cross-sector over to crop storage units.</p>
                  <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between"><span>Est. Collectable Manure Volume:</span> <strong>{(pigs.length * 2.3).toFixed(1)} KG/Day</strong></div>
                    <div className="flex justify-between text-[11px] opacity-80"><span>Potential Biogas Yield:</span> <span>{(pigs.length * 0.4).toFixed(1)} m³/Day</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ==========================================
           SECURE MULTI-TENANT INPUT DATA FORM
           ========================================== */
        <form onSubmit={handleRegisterPig} className="p-4 mx-3 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 text-emerald-800">
            Ear Tag Identification Matrix
          </h2>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Ear Tag Serial Tracking ID *</label>
            <input
              type="text"
              placeholder="e.g. PIG-2006-002"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-xs bg-gray-50 focus:bg-white focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Swine Breed</label>
              <select value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs bg-gray-50">
                <option value="Large White">Large White</option>
                <option value="Landrace">Landrace</option>
                <option value="Duroc">Duroc</option>
                <option value="Camborough">Camborough</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Target Pen Code</label>
              <input
                type="text"
                placeholder="Pen A4"
                value={penId}
                onChange={(e) => setPenId(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-xs bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full p-2.5 border rounded-lg text-xs bg-gray-50">
                <option value="female">Female (Sow/Gilt)</option>
                <option value="male">Male (Boar/Castrate)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Developmental Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value as any)} className="w-full p-2.5 border rounded-lg text-xs bg-gray-50">
                <option value="piglet">Piglet (Suckling)</option>
                <option value="weaner">Weaner</option>
                <option value="finisher">Finisher</option>
                <option value="gilt">Gilt</option>
                <option value="sow">Sow</option>
                <option value="boar">Boar</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Dynamic Nutritional Configuration</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Feed Type</label>
                <select value={feedType} onChange={(e) => setFeedType(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs bg-gray-50">
                  <option value="Pig Starter Pellets">Pig Starter Pellets</option>
                  <option value="Pig Grower Pellets">Pig Grower Pellets</option>
                  <option value="Pig Finisher Pellets">Pig Finisher Pellets</option>
                  <option value="Sow & Weaner Meal">Sow & Weaner Meal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Allocated Volume (KG/Day)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={feedKg}
                  onChange={(e) => setFeedKg(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs bg-gray-50"
                />
              </div>
            </div>
          </div>

          {gender === 'female' && (
            <div className="p-3 bg-pink-50 border border-pink-100 rounded-lg flex items-center justify-between">
              <label className="text-xs font-bold text-pink-900">Mark Animal as Pregnant</label>
              <input
                type="checkbox"
                checked={pregnant}
                onChange={(e) => setPregnant(e.target.checked)}
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
            </div>
          )}

          {pregnant && (
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Prior Historical Litter Volume</label>
              <input
                type="number"
                value={litter}
                onChange={(e) => setLitter(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-xs bg-gray-50"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setView('list')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 rounded-lg text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-lg text-center shadow"
            >
              Commit Record to n8n Hook
            </button>
          </div>
        </form>
      )}
    </div>
  );
};  
