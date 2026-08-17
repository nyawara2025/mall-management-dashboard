import React, { useState, useEffect } from 'react';
import { Landmark, RefreshCw, LogOut, DollarSign, TrendingUp } from 'lucide-react';

interface FinanceAuditorProps {
  session: { user_id: number; name: string; role: string; assigned_id: number; organization_name: string };
  onLogout: () => void;
}

interface FinancialNode {
  node_code: string;
  node_name: string;
  gross_amount: number;
  remittance_due: number;
  payment_status: string;
}

export const ArchdeaconryFinanceAuditor: React.FC<FinanceAuditorProps> = ({ session, onLogout }) => {
  const [syncing, setSyncing] = useState(false);
  const [financialLedger, setFinancialLedger] = useState<FinancialNode[]>([]);

  const fetchAuditorLedger = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archdeaconry_id: session.assigned_id, user_id: session.user_id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFinancialLedger(data.ledger || []);
      }
    } catch (err) {
      console.error("Auditor ledger pull failure:", err);
      // Pure configuration fallback - no assumptions on parish names
      setFinancialLedger([]);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { fetchAuditorLedger(); }, [session.assigned_id]);

  const totalGross = financialLedger.reduce((sum, item) => sum + item.gross_amount, 0);
  const totalRemittance = financialLedger.reduce((sum, item) => sum + item.remittance_due, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900">
      <header className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-md"><Landmark className="w-5 h-5" /></div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">{session.organization_name.toUpperCase()} AUDIT CORE</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.name.toUpperCase()} • <span className="text-emerald-700">{session.role.replace('_', ' ')} PORTAL</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAuditorLedger} disabled={syncing} className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="bg-red-50 border border-red-200 text-red-600 font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Combined Local Node Gross</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight mt-1 block font-mono">KES {totalGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <DollarSign className="w-8 h-8 text-slate-300" />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Consolidated 15% Remittance Allocation</span>
            <span className="text-2xl font-black text-emerald-600 tracking-tight mt-1 block font-mono">KES {totalRemittance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-200" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-4">Statutory Remittance Sub-Ledger</h3>
        <div className="space-y-3">
          {financialLedger.length === 0 ? (
            <div className="text-center py-6 text-xs font-semibold text-slate-400 uppercase">No active records parsed for current session.</div>
          ) : (
            financialLedger.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <span className="text-xs font-black text-slate-800 block uppercase">{item.node_name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">{item.node_code}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 font-mono block">KES {item.remittance_due.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">{item.payment_status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
