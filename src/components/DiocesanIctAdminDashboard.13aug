import React, { useState, useEffect } from 'react';
import { Shield, Layers, PlusCircle, RefreshCw, Server, CheckCircle, Database } from 'lucide-react';

interface DiocesanIctAdminProps {
  session: { assigned_id: number; name: string; role: string };
}

export const DiocesanIctAdminDashboard: React.FC<DiocesanIctAdminProps> = ({ session }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'ARCHDEACONRY' | 'PARISH'>('NONE');
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ totalArchdeaconries: 0, totalParishes: 0 });

  // Form State
  const [archdeaconryName, setArchdeaconryName] = useState('');
  const [parishName, setParishName] = useState('');
  const [parentArchdeaconryId, setParentArchdeaconryId] = useState('');
  const [archdeaconriesList, setArchdeaconriesList] = useState<{id: number, name: string}[]>([]);

  const fetchHierarchyStats = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-ict-hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data) {
        setStats({ totalArchdeaconries: data.archdeaconriesCount || 0, totalParishes: data.parishesCount || 0 });
        setArchdeaconriesList(data.archdeaconries || []);
      }
    } catch (err) {
      console.error("Infrastructure sync failure:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchHierarchyStats(); }, []);

  const handleCreateStructure = async (e: React.FormEvent, type: 'ARCHDEACONRY' | 'PARISH') => {
    e.preventDefault();
    const payload = type === 'ARCHDEACONRY' 
      ? { type, name: archdeaconryName, diocese_id: session.assigned_id }
      : { type, name: parishName, parent_tenant_id: parseInt(parentArchdeaconryId, 10), diocese_id: session.assigned_id };

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/diocese-ict-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(`${type} created and registered into the Diocesan Registry successfully.`);
        setActiveModal('NONE');
        setArchdeaconryName(''); setParishName(''); setParentArchdeaconryId('');
        fetchHierarchyStats();
      }
    } catch (err) {
      console.error("Error provisioning structure element:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 border border-slate-700 p-4 rounded-xl mb-6 
shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-inner"><Shield className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-blue-400">ACK Central Registry Hub</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Tier 2 System Master Admin Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveModal('ARCHDEACONRY')} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase 
tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all">
            <PlusCircle className="w-3.5 h-3.5" /> + Archdeaconry
          </button>
          <button onClick={() => setActiveModal('PARISH')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase 
tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all">
            <Layers className="w-3.5 h-3.5" /> + Parish Node
          </button>
          <button onClick={fetchHierarchyStats} disabled={syncing} className="p-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 
hover:bg-slate-600">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Archdeaconries</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">{stats.totalArchdeaconries}</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registered Parishes</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">{stats.totalParishes}</span>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Edge Infrastructure</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Core Sync 
Active</span>
          </div>
          <Server className="w-8 h-8 text-slate-600" />
        </div>
      </div>

      {/* MODALS */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Provision New Structure ({activeModal})
            </h3>
            
            <form onSubmit={(e) => handleCreateStructure(e, activeModal)} className="space-y-4">
              {activeModal === 'ARCHDEACONRY' ? (
                <input type="text" placeholder="Archdeaconry Name (e.g., Cathedral Archdeaconry)" required className="w-full bg-slate-900 border 
border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={archdeaconryName} onChange={e => setArchdeaconryName(e.target.value)} />
              ) : (
                <>
                  <input type="text" placeholder="Parish Name (e.g., St. Stephen's Parish)" required className="w-full bg-slate-900 border border-slate-700 
rounded-lg p-2.5 text-xs text-white focus:outline-none" value={parishName} onChange={e => setParishName(e.target.value)} />
                  <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
value={parentArchdeaconryId} onChange={e => setParentArchdeaconryId(e.target.value)}>
                    <option value="">-- Assign Parent Archdeaconry --</option>
                    {archdeaconriesList.map(arch => <option key={arch.id} value={arch.id}>{arch.name}</option>)}
                  </select>
                </>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 border border-slate-600 rounded-lg text-slate-400 text-xs 
font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-black uppercase 
tracking-wider">Commit Structure</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
