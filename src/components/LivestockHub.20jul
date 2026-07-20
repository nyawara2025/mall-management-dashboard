import React, { useState, useEffect } from 'react';
import { PigsHub } from './PigsHub';

// 🐮 Exhaustive list of standard Kenyan cattle lifecycle segments
type CattleStage = 'CALF' | 'HEIFER' | 'BULL' | 'STEER' | 'DAIRY_LACTATING' | 'DRY_COW' | 'PREG_STEAMING';

interface CattleAnimal {
  animal_id: number;
  regime_id?: number;
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
  total_today_litres?: number;
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

  const [currentSector, setCurrentSector] = useState<'cattle' | 'goats' | 'sheep' | 'pigs'>('cattle');

  const [isMilkModalOpen, setIsMilkModalOpen] = useState(false);
  const [selectedAnimalForMilk, setSelectedAnimalForMilk] = useState<CattleAnimal | null>(null);
  const [milkVolumeLitres, setMilkVolumeLitres] = useState('');
  const [milkingSession, setMilkingSession] = useState<'MORNING' | 'MIDDAY' | 'EVENING'>('MORNING');

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
    if (!regimeId) return alert("This animal has no active feed row to delete.");
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

  const handleLogMilkYield = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalForMilk || !milkVolumeLitres || parseFloat(milkVolumeLitres) < 0) {
      return alert("Please enter valid milk yield measurements.");
    }
    setLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/save-feeding-presciption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_milk_yield',
          shop_id: parseInt(shopId || '81'),
          animal_id: selectedAnimalForMilk.animal_id,
          litres_milked: parseFloat(milkVolumeLitres),
          milking_session: milkingSession,
          logged_by_role: userSession?.role || 'farm_hand'
        })
      });
      if (response.ok) {
        alert(`Logged ${milkVolumeLitres} Litres for Tag: ${selectedAnimalForMilk.tag_number}!`);
        setIsMilkModalOpen(false);
        setMilkVolumeLitres('');
        fetchCattleData(); // Hot reload UI values
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
          animal_id: selectedAnimalForFeed.animal_id,
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
      
      {/* 🚀 Spacious Mobile-First Multi-Livestock Sector Switcher Ribbon Header */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl no-print">
        {(['cattle', 'goats', 'sheep', 'pigs'] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => { 
              setCurrentSector(sec); 
              setLivestockView('menu'); // Automatically resets view back to parent menu when switching species
            }}
            className={`py-2 text-[10px] font-black uppercase rounded-lg transition-all text-center ${
              currentSector === sec ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            {sec === 'cattle' ? '🐄' : sec === 'goats' ? '🐐' : sec === 'sheep' ? '🐑' : '🐖'}
            <span className="block mt-0.5 text-[8px]">{sec}</span>
          </button>
        ))}
      </div>

      {/* 🧭 Isolated Back Ribbon Navigation */}
      {livestockView !== 'menu' && (
        <button
          onClick={() => setLivestockView('menu')}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-black tracking-wide uppercase flex items-center gap-1 transition-all mb-1"
        >
          ← Back to {currentSector} Sub-Menu
        </button>
      )}

      {/* ========================================================
          🐄 SECTOR 1: CATTLE MODULE ENVIRONMENT
         ======================================================== */}
      {currentSector === 'cattle' && (
        <>

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
                        <div key={animal.animal_id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
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
                              onClick={() => handleDeleteFaultyFeed(animal.regime_id!, animal.tag_number)}
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
                    animalsList.map((animal) => {
                      // 📊 Calculate Feed Conversion Efficiency dynamically on the fly
                      const dailyFeedKg = animal.amount_kg_per_day || 0;
                      const todayLitres = animal.total_today_litres || 0;
                  
                      let efficiencyRatio = 0;
                      let efficiencyBadgeColor = "text-slate-500 bg-slate-50";
                      let efficiencyText = "No Intake/Yield Data";

                      if (dailyFeedKg > 0 && todayLitres > 0) {
                        efficiencyRatio = parseFloat((todayLitres / dailyFeedKg).toFixed(2));
                    
                        if (efficiencyRatio >= 1.3) {
                          efficiencyBadgeColor = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                          efficiencyText = `🎯 Optimal Efficiency: ${efficiencyRatio} L/KG`;
                        } else if (efficiencyRatio >= 1.0) {
                          efficiencyBadgeColor = "text-amber-700 bg-amber-50 border border-amber-100";
                          efficiencyText = `⚠️ Moderate Yield: ${efficiencyRatio} L/KG`;
                        } else {
                          efficiencyBadgeColor = "text-rose-700 bg-rose-50 border border-rose-100";
                          efficiencyText = `📉 Low Conversion: ${efficiencyRatio} L/KG`;
                        }
                      } else if (dailyFeedKg > 0 && todayLitres === 0 && animal.stage === 'DAIRY_LACTATING') {
                        efficiencyText = "⏳ Pending Today's Milking Logs";
                        efficiencyBadgeColor = "text-blue-600 bg-blue-50/50";
                      }

                      return (
                        <div key={animal.animal_id} className="p-3 bg-white rounded-2xl border border-slate-200/60 shadow-xs flex flex-col space-y-3 text-xs text-left mb-3">
                      
                          {/* Top Section: Tag, Stage, and Yield display parameters */}
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-slate-900 text-sm">Tag: {animal.tag_number}</span>
                                <span className="text-[8px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase">
                                  {animal.stage.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">
                                Ration: <span className="font-bold text-slate-600">{dailyFeedKg} kg/day</span> of {animal.feed_type || 'Unassigned Feed'}
                              </p>
                            </div>

                            {/* Yield Metric Display Container Badge */}
                            {animal.stage === 'DAIRY_LACTATING' && (
                              <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-center shadow-2xs border border-blue-100">
                                <span className="text-[8px] font-black uppercase tracking-wider block opacity-70">Today</span>
                                <span className="font-black text-xs">{todayLitres}L</span>
                              </div>
                            )}
                          </div>

                          {/* 📊 NEW INSIGHT STRIP: Real-Time Feed Conversion Ratio Indicator */}
                          {animal.stage === 'DAIRY_LACTATING' && (
                            <div className={`p-2 rounded-xl text-[10px] font-black flex items-center justify-between ${efficiencyBadgeColor}`}>
                              <span>{efficiencyText}</span>
                              {efficiencyRatio > 0 && (
                                <span className="opacity-60 text-[8px] font-medium">Litres per 1KG feed</span>
                              )}
                            </div>
                          )}

                          {/* Middle Section: Accountability Guard Lines */}
                          <div className="border-t border-dashed border-slate-100 pt-2 flex justify-between items-center">
                            {animal.vet_verified ? (
                              <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                ✓ Vet Approved {animal.vet_name && `(${animal.vet_name})`}
                              </p>
                            ) : (
                              <p className="text-[9px] text-rose-500 font-black uppercase tracking-wide">⚠️ Unverified Matrix</p>
                            )}
                          </div>

                          {/* Bottom Action Ribbon Layout: Grid Built for Fat Thumbs */}
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <button
                              onClick={() => {
                                setSelectedAnimalForFeed(animal);
                                setPrescribedFeedType(animal.feed_type || 'Dairy Meal');
                                setPrescribedAmountKg(dailyFeedKg ? dailyFeedKg.toString() : '');
                                setIsPrescriptionModalOpen(true);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-2.5 rounded-xl text-center uppercase transition-all border border-slate-200/50"
                            >
                              ⚙️ Diet
                            </button>

                            {animal.stage === 'DAIRY_LACTATING' ? (
                              <button
                                onClick={() => {
                                  setSelectedAnimalForMilk(animal);
                                  setIsMilkModalOpen(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] py-2.5 rounded-xl text-center uppercase tracking-wide transition-all shadow-xs"
                              >
                                🥛 + Milk
                              </button>
                            ) : (
                              <div className="bg-slate-50 text-slate-300 font-bold text-[9px] py-2.5 rounded-xl text-center uppercase flex items-center justify-center select-none border border-slate-100">
                                Dry Stage
                              </div>
                            )}

                            <button
                              onClick={() => handleDeleteFaultyFeed(animal.regime_id!, animal.tag_number)}
                              className="bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 py-2.5 rounded-xl text-center font-extrabold text-[10px] uppercase transition-all"
                            >
                              🗑️ Delete
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

              {/* Dynamic Feed Audit Trail Container Box (Enriched with printable classes) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left printable-audit-ledger">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Nutrition Audit Report</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Workspace ID: {shopId} • {farmName}</p>
                  </div>
              
                  {/* 📄 Mobile-Responsive Excel / CSV Data Generation Action */}
                  <button
                    onClick={() => {
                      if (historyLogsList.length === 0) return alert("No ledger logs available to export.");
    
                      // 1. Establish clear tabular header values
                      const headers = ["Date/Time", "Animal Tag", "Lifecycle Stage", "Feed Type Served", "Volume (KG)", "Logged By Role", "Vet Verified"];
    
                      // 2. Map row records, removing line breaks or commas that could break CSV structure
                      const rows = historyLogsList.map(log => [
                        `"${log.formatted_date}"`,
                        `"${log.tag_number}"`,
                        `"${log.stage}"`,
                        `"${log.feed_type_served}"`,
                        log.quantity_served_kg,
                        `"${log.authorized_by_role}"`,
                        log.was_vet_approved ? "YES" : "NO"
                      ]);

                      // 3. Compile the structural rows matrix array layout string
                      const csvString = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
                      // 4. 🔥 FIX: Convert raw text string into a formal binary file memory block (Blob object)
                      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    
                      // 5. Generate an explicit virtual file reference URL that mobile browsers can naturally resolve
                      const blobUrl = window.URL.createObjectURL(blob);
    
                      // 6. Programmatically trigger a standard document download anchor action space bounds
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.setAttribute("download", `Nutrition_Audit_Report_Shop_${shopId || '81'}.csv`);
                      document.body.appendChild(link);
    
                      link.click(); // Fires the binary document download stream natively on Android/iOS
    
                      // 7. Free up mobile browser RAM memory space cleanly after transmission
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(blobUrl);
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[10px] tracking-wide py-1.5 px-3 rounded-xl transition-all shadow-xs uppercase"
                  >
                    📊 Export Spreadsheet
                  </button>

                </div>

                {/* Scroll tracking lists container viewport */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {historyLogsList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium text-center py-6">No historical nutritional ledger entries on file</p>
                  ) : (
                    historyLogsList.map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/80 text-xs break-inside-avoid">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 no-print"></span>
                            <span className="font-black text-slate-800 text-[11px]">Tag: {log.tag_number}</span>
                            <span className="text-[9px] bg-slate-200 px-1 rounded text-slate-500 uppercase font-bold">{log.stage.toLowerCase()}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Served {log.feed_type_served} • Logged by <span className="capitalize font-semibold text-slate-600">{log.authorized_by_role.replace('_', ' ')}</span>
                          </p>
                          <p className="text-[9px] text-slate-300 font-bold print:text-slate-500">{log.formatted_date}</p>
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
        </>
      )}

      
      {/* ========================================================
          🐐 SECTOR 2: GOATS MODULE ENVIRONMENT
         ======================================================== */}
      {currentSector === 'goats' && (
        <div className="text-center text-xs text-slate-400 py-8 bg-white border rounded-2xl shadow-2xs">
          🐐 Caprine Goat Unit individual tracking layer is securely bound to workspace context.
        </div>
      )}

      {/* ========================================================
          🐑 SECTOR 3: SHEEP MODULE ENVIRONMENT
         ======================================================== */}
      {currentSector === 'sheep' && (
        <div className="text-center text-xs text-slate-400 py-8 bg-white border rounded-2xl shadow-2xs">
          🐑 Ovine Sheep Unit individual body condition monitoring tracking loop connected.
        </div>
      )}

      {/* ========================================================
          🐖 SECTOR 4: PIGS MODULE ENVIRONMENT
         ======================================================== */}
      {currentSector === 'pigs' && (
        <PigsHub shopId={shopId} userSession={userSession} />
      )}

      {/* ========================================================
          📱 GLOBAL WORKSPACE OVERLAY MODALS 
          (Must sit inside the parent return wrapper layout container)
         ======================================================== */}

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

              {/* 🛠️ RESTORED HERE: 2. Interactive Biological Gender Toggle Ribbon Element */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['FEMALE', 'MALE'] as const).map((g) => (
                    <button 
                      key={g} 
                      type="button" 
                      onClick={() => { 
                        setNewCattleGender(g); 
                        // Automatically safe-adjust stages when swapping to prevent illegal type state compiler loops
                        if (g === 'MALE') {
                          setCattlePregnancyFlag(false); 
                          setNewCattleStage('BULL'); 
                        } else {
                          setNewCattleStage('DAIRY_LACTATING');
                        }
                      }} 
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        newCattleGender === g ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Filtered Lifecycle Stage Selector Dropdown */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Cattle Lifecycle Stage</label>
                <select 
                  value={newCattleStage} 
                  onChange={(e) => setNewCattleStage(e.target.value as CattleStage)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  {/* Generic gender-neutral stage option */}
                  <option value="CALF">🍼 Calf (Pre-weaning rearing)</option>

                  {/* Strictly reveal male options if gender is set to MALE */}
                  {newCattleGender === 'MALE' && (
                    <>
                      <option value="BULL">🐂 Breeding Bull (Condition tracking)</option>
                      <option value="STEER">🥩 Steer (Castrated Male / Beef yield)</option>
                    </>
                  )}

                  {/* Strictly reveal female production options if gender is set to FEMALE */}
                  {newCattleGender === 'FEMALE' && (
                    <>
                      <option value="HEIFER">🌾 Heifer (Young growing female)</option>
                      <option value="DAIRY_LACTATING">🥛 Dairy Cow (Active lactating milk track)</option>
                      <option value="DRY_COW">🍂 Dry Cow (Resting gestation block)</option>
                      <option value="PREG_STEAMING">🤰 Pregnant - Steaming Stage (Transition)</option>
                    </>
                  )}
                </select>
              </div>
              

              {/* 4. Gestation Parameters restricted cleanly to Female animals */}
              {newCattleGender === 'FEMALE' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Is Animal Pregnant?</label>
                    <input 
                      type="checkbox" 
                      checked={cattlePregnancyFlag} 
                      onChange={(e) => { 
                        setCattlePregnancyFlag(e.target.checked); 
                        if(!e.target.checked) setCattleGestationDate(''); 
                      }} 
                      className="w-4 h-4 accent-blue-600" 
                    />
                  </div>
                  {cattlePregnancyFlag && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Insemination / Conception Date</label>
                      <input 
                        type="date" 
                        value={cattleGestationDate} 
                        onChange={e => setCattleGestationDate(e.target.value)} 
                        required={cattlePregnancyFlag} 
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white font-bold focus:outline-none" 
                      />
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide transition-all"
              >
                {loading ? 'Saving...' : 'SAVE ANIMAL'}
              </button>
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

      {/* 🥛 MODAL 3: MOBILE-RESPONSIVE MILK RECORDING INPUT FORM OVERLAY */}
      {isMilkModalOpen && selectedAnimalForMilk && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-black text-blue-900">Record Daily Milk Yield</h3>
                <p className="text-[10px] text-slate-400 font-bold">Tag Reference: {selectedAnimalForMilk.tag_number}</p>
              </div>
              <button onClick={() => setIsMilkModalOpen(false)} className="text-slate-400 font-bold text-xs">Cancel</button>
            </div>
            
            <form onSubmit={handleLogMilkYield} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Milking Session</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MORNING', 'MIDDAY', 'EVENING'] as const).map((session) => (
                    <button
                      key={session}
                      type="button"
                      onClick={() => setMilkingSession(session)}
                      className={`p-2.5 rounded-xl text-[10px] font-black border uppercase transition-all ${
                        milkingSession === session ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {session.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Litres Milked</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 14.5" 
                    value={milkVolumeLitres} 
                    onChange={e => setMilkVolumeLitres(e.target.value)} 
                    required 
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold pr-14" 
                  />
                  <span className="absolute right-4 text-xs font-black text-slate-400">LITRES</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide">
                {loading ? 'Logging production metrics...' : 'SAVE PRODUCTION RECORD'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
