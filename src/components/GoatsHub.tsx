import React, { useState, useEffect } from 'react';

type GoatStage = 'KID' | 'WEANER' | 'BUCK' | 'DOE' | 'DAIRY_MILKING' | 'DRY_DOE';

interface GoatAnimal {
  id: number;
  tag_number: string;
  breed: string;
  gender: 'MALE' | 'FEMALE';
  stage: GoatStage;
  is_pregnant: boolean;
  daily_feed_kg: number;
  feed_type: string;
  vet_verified: boolean;
  total_today_litres?: number;
}

interface SectorProps {
  shopId: string | null;
  userSession: { name: string; role: string } | null;
}

export const GoatsHub: React.FC<SectorProps> = ({ shopId, userSession }) => {
  const [view, setView] = useState<'list' | 'register' | 'milk'>('list');
  const [goats, setGoats] = useState<GoatAnimal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGoat, setSelectedGoat] = useState<GoatAnimal | null>(null);

  // Form States
  const [tag, setTag] = useState('');
  const [breed, setBreed] = useState('Toggenburg');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [stage, setStage] = useState<GoatStage>('DAIRY_MILKING');
  const [pregnant, setPregnant] = useState(false);
  const [feedType, setFeedType] = useState('Goat Dairy Meal');
  const [feedKg, setFeedKg] = useState('');
  const [milkLitres, setMilkLitres] = useState('');

  const fetchGoats = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-goats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(shopId) })
      });
      const data = await response.json();
      if (Array.isArray(data)) setGoats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoats(); }, [shopId, view]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/save-goat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_goat',
          shop_id: parseInt(shopId || '81'),
          tag_number: tag,
          breed,
          gender,
          stage,
          is_pregnant: pregnant,
          daily_feed_kg: parseFloat(feedKg || '0'),
          feed_type: feedType,
          logged_by_role: userSession?.role || 'farm_hand'
        })
      });
      setView('list');
      setTag('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogMilk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat || !milkLitres) return;
    setLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/log-goat-milk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(shopId || '81'),
          goat_id: selectedGoat.id,
          litres_milked: parseFloat(milkLitres),
          logged_by_role: userSession?.role || 'farm_hand'
        })
      });
      setView('list');
      setMilkLitres('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-2xs">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Caprine / Goat Unit</h4>
          <p className="text-[10px] text-slate-400">Track dairy goats, breeding bucks, and session milk yields</p>
        </div>
        <button 
          onClick={() => { setView(view === 'list' ? 'register' : 'list'); setSelectedGoat(null); }}
          className="bg-blue-600 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl uppercase transition-all"
        >
          {view === 'list' ? '+ New Goat' : 'Cancel'}
        </button>
      </div>

      {view === 'list' && (
        <div className="space-y-3">
          {goats.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-white rounded-2xl border">No goats registered in this unit</p>
          ) : (
            goats.map(g => (
              <div key={g.id} className="p-3 bg-white rounded-2xl border border-slate-200/60 shadow-xs flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 text-sm">Tag: {g.tag_number}</span>
                      <span className="text-[8px] bg-slate-100 border px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase">{g.stage}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Breed: <span className="text-slate-700 font-bold">{g.breed}</span> • {g.feed_type} ({g.daily_feed_kg}kg/day)</p>
                  </div>
                  {g.stage === 'DAIRY_MILKING' && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-black text-[11px]">
                        {g.total_today_litres || 0}L Today
                      </div>
                      <button 
                        onClick={() => { setSelectedGoat(g); setView('milk'); }}
                        className="bg-slate-800 text-white font-bold text-[8px] px-2 py-1 rounded uppercase tracking-wide"
                      >
                        + Milk
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'register' && (
        <form onSubmit={handleRegister} className="bg-white p-5 rounded-2xl border space-y-4 shadow-sm">
          <input type="text" placeholder="Tag Number / Ear Marker" value={tag} onChange={e => setTag(e.target.value)} required className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Breed</label>
              <select value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs bg-slate-50 font-bold text-slate-700">
                <option value="Toggenburg">Toggenburg</option>
                <option value="Alpine">British Alpine</option>
                <option value="Saanen">Saanen</option>
                <option value="Galla">Galla (Meat/Arid hardy)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Goat Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value as any)} className="w-full p-2.5 border rounded-xl text-xs bg-slate-50 font-bold text-slate-700">
                <option value="KID">Kid</option>
                <option value="WEANER">Weaner</option>
                <option value="BUCK">Breeding Buck</option>
                <option value="DOE">Adult Doe</option>
                <option value="DAIRY_MILKING">Milking Doe</option>
                <option value="DRY_DOE">Dry Doe</option>
              </select>
            </div>
          </div>
          <input type="number" step="0.1" placeholder="Daily Feed Intake (KG)" value={feedKg} onChange={e => setFeedKg(e.target.value)} required className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold" />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm uppercase">{loading ? 'Saving...' : 'Save Goat Profile'}</button>
        </form>
      )}

      {view === 'milk' && selectedGoat && (
        <form onSubmit={handleLogMilk} className="bg-white p-5 rounded-2xl border space-y-4 shadow-sm">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2">Record Caprine Yield for Tag: {selectedGoat.tag_number}</h4>
          <div className="relative flex items-center">
            <input type="number" step="0.01" placeholder="Enter amount milked in Litres" value={milkLitres} onChange={e => setMilkLitres(e.target.value)} required className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold pr-14 focus:outline-none" />
            <span className="absolute right-4 text-xs font-black text-slate-400">LITRES</span>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm uppercase">{loading ? 'Logging yield...' : 'Save Production Log'}</button>
        </form>
      )}
    </div>
  );
};
