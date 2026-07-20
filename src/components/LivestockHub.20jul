import React, { useState, useEffect } from 'react';

// 🐮 Exhaustive list of standard Kenyan cattle lifecycle segments
type CattleStage = 'CALF' | 'HEIFER' | 'BULL' | 'STEER' | 'DAIRY_LACTATING' | 'DRY_COW' | 'PREG_STEAMING';

interface CattleAnimal {
  id: number;
  tag_number: string;
  gender: 'MALE' | 'FEMALE';
  stage: CattleStage;
  is_pregnant: boolean;
  expected_calving_date?: string;
  feed_type?: string;
  amount_kg_per_day?: number;
  vet_verified?: boolean;
  vet_name?: string;
  // 🔥 Add these two lines to your interface at the top of the file:
  stage_head_count?: number;
  stage_total_mix_kg?: number;
}

// 📜 Cattle Feed Audit Trail Tracking Type Blueprint
interface CattleHistoryLogItem {
  id: number;
  tag_number: string;
  stage: string;
  feed_type_served: string;
  quantity_served_kg: number;
  authorized_by_role: string;
  was_vet_approved: boolean;
  formatted_date: string;
}

interface LivestockHubProps {
  shopId: string | null;
  farmName: string;
  userSession: { name: string; role: string } | null;
}

export const LivestockHub: React.FC<LivestockHubProps> = ({ shopId, farmName, userSession }) => {
  const [livestockView, setLivestockView] = useState<'menu' | 'registry' | 'feeding' | 'history'>('menu');
  const [animalsList, setAnimalsList] = useState<CattleAnimal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLogsList, setHistoryLogsList] = useState<CattleHistoryLogItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // New Cattle Profiling States
  const [isNewCattleModalOpen, setIsNewCattleModalOpen] = useState(false);
  const [newTagNumber, setNewTagNumber] = useState('');
  const [newCattleGender, setNewCattleGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [newCattleStage, setNewCattleStage] = useState<CattleStage>('DAIRY_LACTATING');
  const [cattlePregnancyFlag, setCattlePregnancyFlag] = useState(false);
  const [cattleGestationDate, setCattleGestationDate] = useState('');

  // Individual Prescription States
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedAnimalForFeed, setSelectedAnimalForFeed] = useState<CattleAnimal | null>(null);
  const [prescribedFeedType, setPrescribedFeedType] = useState('Dairy Meal');
  const [prescribedAmountKg, setPrescribedAmountKg] = useState('');
  const [vetSigningFlag, setVetSigningFlag] = useState(false);

  // 🔄 Automated Gestation Timeline Monitor for the "Steaming Up" Stage
  useEffect(() => {
    if (cattlePregnancyFlag && cattleGestationDate && newCattleStage !== 'PREG_STEAMING') {
      const insemination = new Date(cattleGestationDate);
      const standardGestationDays = 283; 
      const estimatedCalving = new Date(insemination.getTime() + standardGestationDays * 24 * 60 * 60 * 1000);
      const steamingThresholdDate = new Date(estimatedCalving.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      // If today falls into the critical final 60 days pre-calving, auto-suggest Steaming up phase
      if (new Date() >= steamingThresholdDate && new Date() < estimatedCalving) {
        setNewCattleStage('PREG_STEAMING');
      }
    }
  }, [cattleGestationDate, cattlePregnancyFlag, newCattleStage]);

  // 📡 Read Hook: POST to n8n Endpoint
  const fetchCattleData = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-cattle-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'fetch_animals', 
          shop_id: parseInt(shopId) // Enforces strict INT4 multi-tenancy bounds
        })
      });
      const data = await response.json();
      if (Array.isArray(data)) setAnimalsList(data);
    } catch (err) {
      console.error("Cattle registry sync failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (livestockView !== 'menu' && shopId) {
      fetchCattleData();
    }
  }, [livestockView, shopId]);

  // 📡 Write Hook 1: Save Individual Cattle Animal
  const handleRegisterCattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagNumber.trim()) return alert("Provide an animal ear-tag identifier.");
    setLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/register-cattle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_animal',
          shop_id: parseInt(shopId || '81'),
          tag_number: newTagNumber.trim(),
          gender: newCattleGender,
          stage: newCattleStage,
          is_pregnant: cattlePregnancyFlag,
          insemination_date: cattlePregnancyFlag ? cattleGestationDate : null,
          logged_by_role: userSession?.role || 'farm_hand',
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        alert(`Successfully registered animal Tag: ${newTagNumber}!`);
        setIsNewCattleModalOpen(false);
        setNewTagNumber('');
        fetchCattleData();
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleDeleteFaultyFeed = async (regimeId: number, tagNum: string) => {
  if (!window.confirm(`Are you sure you want to remove the feed line for Tag: ${tagNum}?`)) return;
  setLoading(true);
  try {
    const response = await fetch('https://n8n.tenear.com/webhook/save-feeding-presciption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_feed_line',
        shop_id: parseInt(shopId || '81'),
        regime_id: regimeId
      })
    });
    if (response.ok) {
      alert("Faulty feed entry removed successfully.");
      fetchCattleData(); // Refresh lists instantly
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const fetchCattleHistoryFromN8N = async () => {
  if (!shopId) return;
  setLoadingHistory(true);
  try {
    const response = await fetch('https://n8n.tenear.com/webhook/save-feeding-presciption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'fetch_history', 
        shop_id: parseInt(shopId) // Enforcing strict INT4 multi-tenancy rules
      })
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data)) setHistoryLogsList(data);
  } catch (err) {
    console.error("Cattle history ledger fetch failure:", err);
  } finally {
    setLoadingHistory(false);
  }
};

// Lifecycle trigger hook to auto-poll data when user transitions to the history log tab space
useEffect(() => {
  if (livestockView === 'history' && shopId) {
    fetchCattleHistoryFromN8N();
  }
}, [livestockView, shopId]);

  // 📡 Write Hook 2: Individual Allocation Allotment Prescriptions
  const handleSaveFeedingPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForFeed || !prescribedAmountKg || parseFloat(prescribedAmountKg) <= 0) {
      return alert("Enter a valid feeding volume metric.");
    }
    setLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/save-feeding-presciption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_individual_feed',
          shop_id: parseInt(shopId || '81'),
          animal_id: selectedAnimalForFeed.id,
          feed_type: prescribedFeedType,
          amount_kg_per_day: parseFloat(prescribedAmountKg),
          vet_verified: userSession?.role === 'vet' ? true : vetSigningFlag,
          logged_by_role: userSession?.role || 'farm_hand',
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        alert(`Feeding regime committed per head for Tag: ${selectedAnimalForFeed.tag_number}!`);
        setIsPrescriptionModalOpen(false);
        setPrescribedAmountKg('');
        fetchCattleData();
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      {/* 🧭 Isolated Back Ribbon Navigation */}
      {livestockView !== 'menu' && (
        <button
          onClick={() => setLivestockView('menu')}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-black tracking-wide uppercase flex items-center gap-1 transition-all mb-1"
        >
          ← Back to Livestock Sub-Menu
        </button>
      )}

      {/* VIEW A: LANDING MENU OPTIONS */}
      {livestockView === 'menu' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-xs">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Livestock Hub</h3>
              <p className="text-[10px] text-slate-400">Manage individual cattle metrics or quick aggregate small stock balances</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* 1. Deep Cattle Registry */}
            <button 
              onClick={() => setLivestockView('registry')} 
              className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
            >
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  🐮 Cattle Registry & Life Stages
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Track individual calves, heifers, breeding bulls, & streaming cows</p>
              </div>
              <span className="text-sm font-bold text-blue-600">Manage →</span>
            </button>

            {/* 2. Cattle Feeding Allotments */}
            <button 
              onClick={() => setLivestockView('feeding')} 
              className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
            >
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  🌾 Feeding Matrix Per Head
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Configure precise daily feed weights with required vet sign-offs</p>
              </div>
              <span className="text-sm font-bold text-blue-600">Manage →</span>
            </button>

            {/* 🟢 INSERTED HERE: 3. Historical Nutrition Audit Logs Menu Button */}
            <button 
              onClick={() => setLivestockView('history')} 
              className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
            >
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  📜 Nutrition Audit Logs
                </h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Scroll through comprehensive daily feeding allocations histories</p>
              </div>
              <span className="text-sm font-bold text-blue-600">History →</span>
            </button>

            {/* 4. Other Livestock (Goats, Sheep, Pigs.) */}
            <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">🐐 Small Stock Aggregate Fields</h4>
                <button 
                  onClick={() => {
                    // This links straight to the parent's aggregate update form overlay you already built!
                    // Assuming you pass setIsLiveModalOpen down as a prop if desired, or handle locally.
                    alert("Click '+ UPDATE STOCK' at the top banner to alter quick aggregate numbers for Goats & Sheep.");
                  }}
                  className="text-[9px] bg-slate-800 text-white font-bold px-2 py-1 rounded-md uppercase"
                >
                  Quick Log
                </button>
              </div>

              {/* Keeps your original visual inventory status block operating on screen */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase">Goats</span>
                    <span className="text-xs font-black text-slate-700">Tracked in Batches</span>
                  </div>
                  <span className="text-lg">🐐</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase">Sheep</span>
                    <span className="text-xs font-black text-slate-700">Tracked in Batches</span>
                  </div>
                  <span className="text-lg">🐑</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW B: INDIVIDUAL CATTLE REGISTRY LEDGER */}
      {livestockView === 'registry' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-xs">
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Active Cattle Registry</h4>
              <p className="text-[10px] text-slate-400">Granular tracking per identification marker</p>
            </div>
            <button 
              onClick={() => setIsNewCattleModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] tracking-wide py-2 px-3.5 rounded-xl transition-all shadow-xs"
            >
              + REGISTER ANIMAL
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Verified Stock Listing</h4>
              {loading && <span className="text-[9px] font-bold text-blue-600 animate-pulse uppercase">Syncing...</span>}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {animalsList.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium text-center py-4">No individual cattle registered yet</p>
              ) : (
                animalsList.map((animal) => {
                  let badgeStyles = 'text-slate-600 bg-slate-50';
                  let stageLabel = animal.stage.replace('_', ' ');

                  if (animal.stage === 'PREG_STEAMING') {
                    stageLabel = '🤰 Steaming Cow';
                    badgeStyles = 'text-amber-700 bg-amber-50 border border-amber-200';
                  } else if (animal.stage === 'CALF') {
                    stageLabel = '🍼 Calf';
                  } else if (animal.stage === 'BULL') {
                    stageLabel = '🐂 Breeding Bull';
                    badgeStyles = 'text-blue-700 bg-blue-50';
                  }

                  return (
                    <div key={animal.id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-900">Tag: {animal.tag_number}</p>
                        <p className="text-[10px] text-slate-400 font-bold capitalize mt-0.5">
                          Sex: {animal.gender.toLowerCase()} • {stageLabel}
                        </p>
                      </div>
        

                      {/* 🛠️ Action Controls Container aligned on the right matching mobile responsive rules */}
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${badgeStyles}`}>
                          {animal.stage}
                        </span>
                        
                        {/* 🛑 Inline Operational Delete Button */}
                        <button
                          onClick={() => handleDeleteFaultyFeed(animal.id, animal.tag_number)}
                          className="text-[9px] bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 px-2 py-0.5 rounded-md font-extrabold uppercase transition-all tracking-wide"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}


      {/* VIEW C: INDIVIDUAL VET FEEDING REGIMES */}
      {livestockView === 'feeding' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-black text-blue-900 uppercase">
              <span>🩺</span> Veterinary Matrix Guard
            </div>
            <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
              Kenyan veterinary rules require careful feeding per animal. Steaming cows require transition minerals to prevent milk fever or metabolic shock.
            </p>
          </div>

          {/* 🟢 INSERTED HERE: Dynamic Bulk Mixing Dashboard Insight Widget */}
          <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-xs text-left">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">Daily Cowshed Mix Directions</span>
            
            <div className="mt-2 space-y-2 divide-y divide-emerald-700/50">
              {Array.from(new Set(animalsList.map(a => a.stage))).map((uniqueStage) => {
                const target = animalsList.find(a => a.stage === uniqueStage);
                if (!target || !target.stage_total_mix_kg) return null;
                
                return (
                  <div key={uniqueStage} className="pt-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-black capitalize">{uniqueStage.toLowerCase().replace('_', ' ')} Stage</p>
                      <p className="text-[10px] opacity-75">{target.stage_head_count} Head • {target.feed_type || 'Standard Diet'}</p>
                    </div>
                    <span className="bg-emerald-950 px-2 py-1 rounded-lg font-black text-[11px]">
                      {target.stage_total_mix_kg} KG Total
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Individual Daily Feed Schedules</h4>
            <div className="space-y-2">
              {animalsList.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium text-center py-4">
                  Register records inside your herd registry to map out feed distributions
                </p>
              ) : (
                animalsList.map((animal) => (
                  <div key={animal.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">Tag: {animal.tag_number}</span>
                        <span className="text-[9px] bg-slate-200 px-1.5 py-0.2 rounded font-bold text-slate-500 uppercase">{animal.stage}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Allotment: <span className="font-bold text-slate-700">{animal.amount_kg_per_day || 0} kg/day</span> of {animal.feed_type || 'Unassigned Feed'}
                      </p>
                      {animal.vet_verified ? (
                        <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                          ✓ Vet Approved {animal.vet_name && `(${animal.vet_name})`}
                        </p>
                      ) : (
                        <p className="text-[9px] text-rose-500 font-black uppercase mt-0.5">⚠️ Unverified Matrix</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAnimalForFeed(animal);
                        setPrescribedFeedType(animal.feed_type || 'Dairy Meal');
                        setPrescribedAmountKg(animal.amount_kg_per_day ? animal.amount_kg_per_day.toString() : '');
                        setIsPrescriptionModalOpen(true);
                      }}
                      className="bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg uppercase"
                    >
                      Adjust
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW D: HISTORICAL NUTRICIAL AUDIT LEDGER TRAIL RECOVERY PANELS */}
      {livestockView === 'history' && (
        <div className="space-y-4">
          
          {/* Informative Informational Analytics Helper Ribbon */}
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-left shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-black text-slate-700 uppercase">
              <span>📊</span> Nutritional Compliance Insight
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              This log represents an automated daily snapshot captured by background workers at 06:00 PM EAT. It tracks actual ration volumes served per animal for long-term health tracking.
            </p>
          </div>

          {/* Dynamic Feed Audit Trail Container Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Historical Audit Logs</h4>
              {loadingHistory && <span className="text-[9px] font-bold text-blue-600 animate-pulse uppercase">Syncing Ledger...</span>}
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {historyLogsList.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium text-center py-6">No historical nutritional ledger entries on file</p>
              ) : (
                historyLogsList.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/80 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.was_vet_approved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className="font-black text-slate-800 text-[11px]">Tag: {log.tag_number}</span>
                        <span className="text-[9px] bg-slate-200 px-1 rounded text-slate-500 uppercase font-bold">{log.stage.toLowerCase()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Served {log.feed_type_served} • Logged by <span className="capitalize font-semibold text-slate-600">{log.authorized_by_role.replace('_', ' ')}</span>
                      </p>
                      {/* Formatted Date value returned smoothly from the SQL conversion helper view */}
                      <p className="text-[9px] text-slate-300 font-bold">{log.formatted_date}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-black text-[11px] text-slate-800 block">
                        {log.quantity_served_kg} KG
                      </span>
                      {log.was_vet_approved ? (
                        <span className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-wide">✓ Vet Sign</span>
                      ) : (
                        <span className="text-[8px] text-amber-600 font-extrabold uppercase tracking-wide">⚠️ Unsigned</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRATION OVERLAY */}
      {isNewCattleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-blue-900">Register Individual Cattle</h3>
              <button onClick={() => setIsNewCattleModalOpen(false)} className="text-slate-400 font-bold text-xs">Cancel</button>
            </div>
            <form onSubmit={handleRegisterCattle} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Tag Number / Name</label>
                <input type="text" placeholder="e.g., KE-COW-042 or Baraka" value={newTagNumber} onChange={e => setNewTagNumber(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['FEMALE', 'MALE'] as const).map((g) => (
                    <button key={g} type="button" onClick={() => { setNewCattleGender(g); if(g==='MALE') setCattlePregnancyFlag(false); }} className={`p-2.5 rounded-xl text-xs font-bold border ${newCattleGender === g ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Cattle Lifecycle Stage</label>
                <select value={newCattleStage} onChange={(e) => setNewCattleStage(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700">
                  <option value="CALF">🍼 Calf (Pre-weaning)</option>
                  <option value="HEIFER">🌾 Heifer (Growing Female)</option>
                  <option value="BULL">🐂 Breeding Bull</option>
                  <option value="STEER">🥩 Steer (Castrated Male / Beef)</option>
                  <option value="DAIRY_LACTATING">🥛 Dairy Cow (Lactating)</option>
                  <option value="DRY_COW">🍂 Dry Cow (Resting gestation)</option>
                  <option value="PREG_STEAMING">🤰 Pregnant - Steaming Stage (Transition)</option>
                </select>
              </div>
              {newCattleGender === 'FEMALE' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Is Animal Pregnant?</label>
                    <input type="checkbox" checked={cattlePregnancyFlag} onChange={(e) => { setCattlePregnancyFlag(e.target.checked); if(!e.target.checked) setCattleGestationDate(''); }} className="w-4 h-4 accent-blue-600" />
                  </div>
                  {cattlePregnancyFlag && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Insemination / Conception Date</label>
                      <input type="date" value={cattleGestationDate} onChange={e => setCattleGestationDate(e.target.value)} required={cattlePregnancyFlag} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold" />
                    </div>
                  )}
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide">{loading ? 'Saving...' : 'SAVE ANIMAL'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FEED ALLOTMENT OVERLAY */}
      {isPrescriptionModalOpen && selectedAnimalForFeed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Configure Diet Matrix</h3>
                <p className="text-[10px] text-slate-400 font-bold">Tag {selectedAnimalForFeed.tag_number} ({selectedAnimalForFeed.stage})</p>
              </div>
              <button onClick={() => setIsPrescriptionModalOpen(false)} className="text-slate-400 font-bold text-xs">Cancel</button>
            </div>
            <form onSubmit={handleSaveFeedingPrescription} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Prescribed Feed Formulation Type</label>
                <select value={prescribedFeedType} onChange={(e) => setPrescribedFeedType(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700">
                  <option value="Dairy Meal">Dairy Meal (Standard Production Rations)</option>
                  <option value="High-Yield Lactation Concentrate">High-Yield Lactation Concentrate (Lead Feed)</option>
                  <option value="Napier Grass Silage Mix">Napier Grass Silage Mix (Bulk Forage)</option>
                  <option value="Lucerne / Alfalfa Dry Hay">Lucerne / Alfalfa Dry Hay (High Protein)</option>
                  <option value="Pre-Calving Transition Minerals">Pre-Calving Transition Minerals (Steaming Phase)</option>
                  <option value="Calf Starter Crumbs Pellets">Calf Starter Crumbs Pellets (Pre-Weaning)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Daily Volume Allocation Amount (kg / Head)</label>
                <div className="relative flex items-center">
                  <input type="number" step="0.1" placeholder="e.g., 4.5" value={prescribedAmountKg} onChange={e => setPrescribedAmountKg(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold pr-10" />
                  <span className="absolute right-4 text-xs font-black text-slate-400">KG</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <input type="checkbox" id="vet_verification" checked={userSession?.role === 'vet' ? true : vetSigningFlag} disabled={userSession?.role === 'vet'} onChange={(e) => setVetSigningFlag(e.target.checked)} className="w-4 h-4 mt-0.5 accent-blue-600" />
                <label htmlFor="vet_verification" className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  <span className="font-black text-blue-900 block mb-0.5">Vet Sign-Off Verification Signature</span>
                  {userSession?.role === 'vet' ? 'Authenticated via your active Vet session profile.' : 'Confirm that this daily ration changes match directives verified with a vet.'}
                </label>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide">{loading ? 'Committing...' : 'SAVE ALLOTMENT MATRIX'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
