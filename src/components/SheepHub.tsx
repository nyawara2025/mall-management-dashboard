import React, { useState, useEffect } from 'react';

type SheepStage = 'LAMB' | 'HOGGET' | 'RAM' | 'EWE' | 'DRY_EWE';

interface SheepAnimal {
  id: number;
  tag_number: string;
  breed: string;
  gender: 'MALE' | 'FEMALE';
  stage: SheepStage;
  is_pregnant: boolean;
  daily_feed_kg: number;
  feed_type: string;
  body_condition_score: number;
  vet_verified: boolean;
}

interface SectorProps {
  shopId: string | null;
  userSession: { name: string; role: string } | null;
}

export const SheepHub: React.FC<SectorProps> = ({ shopId, userSession }) => {
  const [view, setView] = useState<'list' | 'register'>('list');
  const [sheep, setSheep] = useState<SheepAnimal[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [tag, setTag] = useState('');
  const [breed, setBreed] = useState('Dorper');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [stage, setStage] = useState<SheepStage>('EWE');
  const [pregnant, setPregnant] = useState(false);
  const [feedType, setFeedType] = useState('Boma Rhodes Hay');
  const [feedKg, setFeedKg] = useState('');
  const [bcs, setBcs] = useState('3.0');

  const fetchSheep = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-sheep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(shopId) })
      });
      const data = await response.json();
      if (Array.isArray(data)) setSheep(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSheep(); }, [shopId, view]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/save-sheep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(shopId || '81'),
          tag_number: tag,
          breed,
          gender,
          stage,
          is_pregnant: pregnant,
          daily_feed_kg: parseFloat(feedKg || '0'),
          feed_type: feedType,
          body_condition_score: parseFloat(bcs),
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
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-2xs">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Ovine / Sheep Unit</h4>
          <p className="text-[10px] text-slate-400">Track meat rams, ewes, lambs, and body score values</p>
        </div>
        <button 
          onClick={() => setView(view === 'list' ? 'register' : 'list')}
          className="bg-blue-600 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl uppercase transition-all"
        >
          {view === 'list' ? '+ New Sheep' : 'Cancel'}
        </button>
      </div>

      {view === 'list' ? (
        <div className="space-y-3">
          {sheep.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-white rounded-2xl border">No sheep registered in this unit</p>
          ) : (
            sheep.map(s => {
              let scoreColor = "bg-amber-100 text-amber-800";
              if (s.body_condition_score >= 3.0 && s.body_condition_score <= 4.0) scoreColor = "bg-emerald-100 text-emerald-800";
              if (s.body_condition_score < 2.0) scoreColor = "bg-rose-100 text-rose-800";

              return (
                <div key={s.id} className="p-3 bg-white rounded-2xl border border-slate-200/60 shadow-xs flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">Tag: {s.tag_number}</span>
                        <span className="text-[8px] bg-slate-100 border px-1.5 py-0.5 rounded font-bold text-slate-500 uppercase">{s.stage}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Breed: <span className="text-slate-700 font-bold">{s.breed}</span> • {s.feed_type} ({s.daily_feed_kg}kg/day)</p>
                    </div>
                    <div className={`px-2 py-1 rounded-xl text-center font-black text-xs ${scoreColor}`}>
                      <span className="text-[7px] block font-bold uppercase opacity-75">BCS Score</span>
                      {s.body_condition_score} / 5.0
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <form onSubmit={handleRegister} className="bg-white p-5 rounded-2xl border space-y-4 shadow-sm">
          <input type="text" placeholder="Tag Number / Ear Marker" value={tag} onChange={e => setTag(e.target.value)} required className="w-full p-3 border rounded-xl text-sm bg-slate-50 font-bold focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Breed Class</label>
              <select value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs bg-slate-50 font-bold text-slate-700">
                <option value="Dorper">Dorper (Premium mutton)</option>
                <option value="Red Maasai">Red Maasai (Resistant strain)</option>
                <option value="Merino">Merino (High-wool yield)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Body Score (BCS)</label>
              <select value={bcs} onChange={e => setBcs(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs bg-slate-50 font-bold text-slate-700">
                <option value="1.0">1.0 (Emaciated / Poor)</option>
                <option value="2.0">2.0 (Thin condition)</option>
                <option value="3.0">3.0 (Optimal Market Weight)</option>
                <option value="4.0">4.0 (Fat condition)</option>
                <option value="5.0">5.0 (Obese / Overweight)</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm uppercase">{loading ? 'Saving...' : 'Save Sheep Profile'}</button>
        </form>
      )}
    </div>
  );
};
