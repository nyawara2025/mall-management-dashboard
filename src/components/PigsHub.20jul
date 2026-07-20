import React, { useState, useEffect } from 'react';

type PigStage = 'PIGLET' | 'WEANER' | 'FINISHER' | 'BOAR' | 'SOW' | 'GILT';

interface PigAnimal {
  id: number;
  tag_number: string;
  breed: string;
  gender: 'MALE' | 'FEMALE';
  stage: PigStage;
  is_pregnant: boolean;
  last_litter_size: number;
  daily_feed_kg: number;
  feed_type: string;
  vet_verified: boolean;
}

interface SectorProps {
  shopId: string | null;
  userSession: { name: string; role: string } | null;
}

export const PigsHub: React.FC<SectorProps> = ({ shopId, userSession }) => {
  const [view, setView] = useState<'list' | 'register'>('list');
  const [pigs, setPigs] = useState<PigAnimal[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [tag, setTag] = useState('');
  const [breed, setBreed] = useState('Large White');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [stage, setStage] = useState<PigStage>('FINISHER');
  const [pregnant, setPregnant] = useState(false);
  const [litter, setLitter] = useState('0');
  const [feedType, setFeedType] = useState('Pig Finisher Pellets');
  const [feedKg, setFeedKg] = useState('');

  const fetchPigs = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-pigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(shopId) })
      });
      const data = await response.json();
      if (Array.isArray(data)) setPigs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPigs(); }, [shopId, view]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/save-pig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(shopId || '81'),
          tag_number: tag,
          breed,
          gender,
          stage,
          is_pregnant: pregnant,
          last_litter_size: parseInt(litter),
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

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Porcine / Pig Unit</h3>
          <p className="text-[10px] text-slate-400">Track finishers, sows, gilts, and farrowing litters</p>
        </div>
        <button 
          onClick={() => setView(view === 'list' ? 'register' : 'list')}
          className="bg-blue-600 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl uppercase"
        >
          {view === 'list' ? '+ New Pig' : 'Cancel'}
        </button>
      </div>

      {view === 'list' ? (
        <div className="space-y-3">
          {pigs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-white rounded-2xl border">No pigs registered inside this unit</p>
          ) : (
            pigs.map(p => (
              <div key={p.id} className="p-3 bg-white rounded-2xl border border-slate-200/60 shadow-xs flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 text-sm">Tag: {p.tag_number}</span>
                      <span className="text-[8px] bg-slate-100 border px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase">{p.stage}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Breed: <span className="text-slate-700 font-bold">{p.breed}</span> • {p.feed_type} ({p.daily_feed_kg}kg/day)</p>
                  </div>
                  {p.stage === 'SOW' && (
                    <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-xl text-center">
                      <span className="text-[8px] font-black uppercase block opacity-70">Last Litter</span>
                      <span className="font-black text-xs">{p.last_litter_size} Piglets</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={handleRegister} className="bg-white p-5 rounded-2xl border space-y-4">
          <input type="text" placeholder="Tag Number / Ear Marker" value={tag} onChange={e => setTag(e.target.value)} required className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold focus:outline-none" />
          
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Breed Selection</label>
            <select value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold text-slate-700">
              <option value="Large White">Large White (Standard porker)</option>
              <option value="Landrace">Landrace (High maternal traits)</option>
              <option value="Camborough">Camborough (Commercial favorite)</option>
              <option value="Duroc">Duroc (Fast growth rates)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Pig Feed Type</label>
            <select value={feedType} onChange={e => setFeedType(e.target.value)} className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold text-slate-700">
              <option value="Pig Creep Pellets">Pig Creep Pellets (Suckling piglets)</option>
              <option value="Pig Starter Feed">Pig Starter Feed (Weaners)</option>
              <option value="Pig Growers Meal">Pig Growers Meal (Growing stock)</option>
              <option value="Pig Finisher Pellets">Pig Finisher Pellets (Fattening block)</option>
              <option value="Sow & Boar Meal">Sow & Boar Meal (Breeding herd)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.1" placeholder="Daily Feed (KG)" value={feedKg} onChange={e => setFeedKg(e.target.value)} required className="p-3 border rounded-xl text-sm bg-slate-50 font-bold" />
            <input type="number" placeholder="Litter Size" value={litter} onChange={e => setLitter(e.target.value)} className="p-3 border rounded-xl text-sm bg-slate-50 font-bold" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm uppercase">
            {loading ? 'Saving Porcine Parameters...' : 'Save Pig Profile'}
          </button>
        </form>
      )}
    </div>
  );
};
