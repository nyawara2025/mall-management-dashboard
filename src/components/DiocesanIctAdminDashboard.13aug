import React, { useState, useEffect } from 'react';
import { Shield, Layers, PlusCircle, RefreshCw, Server, CheckCircle, Database, UserPlus, Key, X } from 'lucide-react';

interface DiocesanIctAdminProps {
  session: { assigned_id: number; name: string; role: string };
  onLogout: () => void;
}

export const DiocesanIctAdminDashboard: React.FC<DiocesanIctAdminProps> = ({ session, onLogout }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'ARCHDEACONRY' | 'PARISH' | 'USER'>('NONE');
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ totalArchdeaconries: 0, totalParishes: 0 });

  // Core Registry Lists State
  const [archdeaconriesList, setArchdeaconriesList] = useState<{id: number, name: string}[]>([]);
  const [allTenantsList, setAllTenantsList] = useState<{id: number, name: string, tier_level: string}[]>([]);

  // Structure Form Fields State
  const [archdeaconryName, setArchdeaconryName] = useState('');
  const [parishName, setParishName] = useState('');
  const [parentArchdeaconryId, setParentArchdeaconryId] = useState('');

  // User Provisioning Form Fields State
  const [userFullName, setUserFullName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userRole, setUserRole] = useState('');
  const [assignedTenantId, setAssignedTenantId] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState<{ name: string; phone: string; pass: string } | null>(null);

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
        setAllTenantsList(data.allTenants || []); // Dynamic combined select list for assigning users
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
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneratedCredentials(null);

    // Normalize phone number to string format parameters before dispatching
    const cleanPhone = userPhoneNumber.trim().replace(/\s+/g, '');

    const payload = {
      tenant_id: parseInt(assignedTenantId, 10),
      phone_number: cleanPhone,
      full_name: userFullName.trim(),
      user_role: userRole
    };

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Capture the auto-generated password returned from the n8n middleware core layer
        setGeneratedCredentials({
          name: userFullName,
          phone: cleanPhone,
          pass: data.temporary_password
        });
        // Clear old inputs parameters
        setUserFullName(''); setUserPhoneNumber(''); setUserRole(''); setAssignedTenantId('');
        fetchHierarchyStats();
      } else {
        alert(data.message || "Failed provisioning user account.");
      }
    } catch (err) {
      console.error("Error processing account generation sequence:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* MASTER ACTION NAVIGATION HEADER BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 border border-slate-700 p-4 rounded-xl mb-6 shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-inner"><Shield className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-blue-400">ACK Central Registry Hub</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Tier 2 System Master Admin Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setGeneratedCredentials(null); setActiveModal('USER'); }} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 
transition-all">
            <UserPlus className="w-3.5 h-3.5" /> + Provision Official
          </button>
          <button onClick={() => setActiveModal('ARCHDEACONRY')} className="bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all border 
border-slate-600">
            <PlusCircle className="w-3.5 h-3.5" /> + Archdeaconry
          </button>
          <button onClick={() => setActiveModal('PARISH')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all">
            <Layers className="w-3.5 h-3.5" /> + Parish Node
          </button>
          <button onClick={fetchHierarchyStats} disabled={syncing} className="p-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>

          {/* 🔒 SECURITY HANDOVER COMPLIANCE: Centralized Session Wipe Utility */}
          <button 
            onClick={onLogout}
            className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 font-black text-[10px] tracking-wider px-3 py-2 rounded-lg uppercase flex items-center gap-1.5 transition-colors 
shadow-xs"
          >
            Sign Out
          </button>

        </div>
      </header>

      {/* SYSTEM METRICS SUMMARY OVERVIEWS */}
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
            <span className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Core Sync Active</span>
          </div>
          <Server className="w-8 h-8 text-slate-600" />
        </div>
      </div>

      {/* =========================================================================
          MODALS ENTRY FORM WINDOW DISPLAY TIERS
         ========================================================================= */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setActiveModal('NONE')} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Provisioning Element Wizard ({activeModal})
            </h3>
            
            {/* 👥 CASE A: RENDER ACCOUNT CREATION LAYOUT FORM MODULE */}
            {activeModal === 'USER' ? (
              !generatedCredentials ? (
                <form onSubmit={handleProvisionUser} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Full Identity Name</label>
                    <input type="text" placeholder="e.g., Rev. Canon John Doe" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userFullName} onChange={e => 
setUserFullName(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Handset String Phone (E.164 Preferred)</label>
                    <input type="text" placeholder="e.g., 0712345678" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userPhoneNumber} onChange={e => 
setUserPhoneNumber(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Assigned Security Access Role</label>
                      <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={userRole} onChange={e => setUserRole(e.target.value)}>
                        <option value="">-- Select Role --</option>
                        <option value="BISHOP">BISHOP (Tier 1)</option>
                        <option value="DIOCESAN_OFFICIAL">DIOCESAN_OFFICIAL (Tier 2)</option>
                        <option value="ARCHDEACON">ARCHDEACON (Tier 3)</option>
                        <option value="VICAR">VICAR (Tier 4 Overlord)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Assign Workplace Scope</label>
                      <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={assignedTenantId} onChange={e => setAssignedTenantId(e.target.value)}>
                        <option value="">-- Select Scope Location --</option>
                        {allTenantsList?.map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            [{tenant.tier_level}] {tenant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 border border-slate-600 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-700">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-black uppercase tracking-wider disabled:bg-slate-700">
                      {submitting ? 'Generating Account...' : 'Generate System Profile'}
                    </button>
                  </div>
                </form>
              ) : (
                /* 🔑 INTERACTIVE POPUP BLOCK REVEALING CLEAR TEXT TEMPORARY CREDENTIAL VALUE */
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-tight">
                    <Key className="w-4 h-4" /> Credentials Provisioned & Locked via MFA
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The account was generated successfully and flagged for compulsory Multi-Factor registration setup on next login. Copy the credentials below before closing:
                  </p>
                  <div className="text-xs space-y-1.5 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono">
                    <div className="flex justify-between"><span className="text-slate-500">Official:</span> <span className="text-white font-bold">{generatedCredentials.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="text-white font-bold">{generatedCredentials.phone}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Temp Pass:</span> <span className="text-emerald-400 font-black tracking-wider bg-emerald-950 px-2 py-0.5 rounded border 
border-emerald-900">{generatedCredentials.pass}</span></div>
                  </div>
                  <button type="button" onClick={() => { setGeneratedCredentials(null); setActiveModal('NONE'); }} className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase text-slate-200">
                    Acknowledged & Saved
                  </button>
                </div>
              )
            ) : (
              /* 🏗️ CASE B: RENDER STRUCTURE INGESTION FORMS (ARCHDEACONRY / PARISH) */
              <form onSubmit={(e) => handleCreateStructure(e, activeModal as any)} className="space-y-4">
                {activeModal === 'ARCHDEACONRY' ? (
                  <input type="text" placeholder="Archdeaconry Name (e.g., Cathedral Archdeaconry)" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
value={archdeaconryName} onChange={e => setArchdeaconryName(e.target.value)} />
                ) : (
                  <>
                    <input type="text" placeholder="Parish Name (e.g., St. Stephen's Parish)" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={parishName} 
onChange={e => setParishName(e.target.value)} />
                    <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none" value={parentArchdeaconryId} onChange={e => setParentArchdeaconryId(e.target.value)}>
                      <option value="">-- Assign Parent Archdeaconry --</option>
                      {archdeaconriesList?.map(arch => <option key={arch.id} value={arch.id}>{arch.name}</option>)}
                    </select>
                  </>
                )}
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setActiveModal('NONE')} className="px-4 py-2 border border-slate-600 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-700">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-black uppercase tracking-wider">
                    {submitting ? 'Processing...' : 'Commit Structure'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
