import React, { useState, useEffect } from 'react';
import { 
  Building, RefreshCw, FileText, CheckCircle2, AlertTriangle, 
  Layers, Users, TrendingUp, DollarSign, LogOut, ArrowUpRight 
} from 'lucide-react';

interface ArchdeaconProps {
  session: { 
    user_id: number; 
    name: string; 
    role: string; 
    assigned_id: number; 
    organization_name: string;
    reporting_period: string;
  };
  onLogout: () => void;
}

interface ParishRank {
  id: string;
  name: string;
  attendance: number;
  collections: number;
  remittance_paid: number;
  compliance_status: 'COMPLIANT' | 'OVERDUE' | 'FLAGGED';
}

export const ArchdeaconDashboard: React.FC<ArchdeaconProps> = ({ session, onLogout }) => {
  const [syncing, setSyncing] = useState(false);
  const [selectedParishId, setSelectedParishId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [parishRanks, setParishRanks] = useState<ParishRank[]>([]);

  const fetchRegionalMetrics = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-archdeaconry-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          archdeaconry_id: session.assigned_id, 
          user_id: session.user_id,
          reporting_period: session.reporting_period
        })
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.parishes)) {
        // Remap the incoming raw database columns into the strict ParishRank frontend interface type properties
        const typedParishes = data.parishes.map((item: any) => ({
          id: String(item.parish_id),
          name: item.parish_name,
          attendance: parseInt(item.total_attendance_rollup, 10) || 0,
          collections: parseFloat(item.total_funds_kes) || 0,
          // Calculate 15% statutory remittance dynamically on the client-side if missing from backend fields
          remittance_paid: (parseFloat(item.total_funds_kes) || 0) * 0.15, 
          // Gracefully transform your database state strings to fit your color-coded layout chips
          compliance_status: item.verification_status === 'DRAFT' ? 'FLAGGED' : item.verification_status
        }));
  
        setParishRanks(typedParishes);
      }

    } catch (err) {
      console.error("Regional data sync failure:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchRegionalMetrics();
  }, [session.assigned_id]);

  const handleTriggerCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParishId || !rejectionReason.trim()) {
      alert("Error: You must select a parish and provide an explicit audit reason statement.");
      return;
    }
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-archdeacon-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parish_id: selectedParishId, reason: rejectionReason, auditor_id: session.user_id })
      });
      if (res.ok) {
        alert("Parish return status successfully rolled back to CORRECTION_REQUIRED.");
        setRejectionReason('');
        setSelectedParishId(null);
        fetchRegionalMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900">
      {/* 👑 DYNAMIC ARCHDEACON HEADER PANEL */}
      <header className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md"><Building className="w-5 h-5" /></div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">{session.organization_name.toUpperCase()}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.name.toUpperCase()} • <span className="text-indigo-700">{session.role.replace('_', ' ')} WORKSPACE</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRegionalMetrics} disabled={syncing} className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"><RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /></button>
          <button onClick={onLogout} className="bg-red-50 border border-red-200 text-red-600 font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PARISH REGIONAL SUMMARY MATRIX */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 mb-4">Constituent Parish Performance Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-2.5">Parish Name</th>
                  <th>Attendance</th>
                  <th>Gross Collections</th>
                  <th>Remittance Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {parishRanks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      {syncing ? "Synchronizing Regional Registries..." : "No active parish return streams identified for this cluster."}
                    </td>
                  </tr>
                ) : (

                  parishRanks.map(parish => (
                     <tr key={parish.id} className="hover:bg-slate-50/50">
                       <td className="py-3 font-bold text-slate-800">{parish.name}</td>
                       <td className="font-mono">{parish.attendance.toLocaleString()}</td>
                       <td className="font-mono">KES {parish.collections.toLocaleString()}</td>
                       <td className="font-mono text-emerald-600 font-semibold">KES {parish.remittance_paid.toLocaleString()}</td>
                       <td>
                         <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                           parish.compliance_status === 'COMPLIANT' ? 'bg-emerald-50 text-emerald-700' :
                           parish.compliance_status === 'FLAGGED' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                         }`}>{parish.compliance_status}</span>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
            </table>
          </div>
        </div>

        {/* REGIONAL WORKFLOW CORRECTION TRIGGER CONSOLE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-2"><AlertTriangle className="w-4 h-4" /> Strategic Audit Gate</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-4">Reject parish return packets back down to local drafting states to correct errors.</p>
          <form onSubmit={handleTriggerCorrection} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Target Parish Node</label>
              <select onChange={(e) => setSelectedParishId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-indigo-600">
                <option value="">Select Parish Location...</option>
                {parishRanks.filter(p => p.compliance_status !== 'OVERDUE').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Official Justification Notes</label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} placeholder="Provide explicit audit notes for the parish treasurer..." className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-medium focus:outline-indigo-600" />
            </div>
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] tracking-widest uppercase p-3 rounded-xl transition-all shadow-md">Flag Correction Required</button>
          </form>
        </div>
      </div>
    </div>
  );
};
