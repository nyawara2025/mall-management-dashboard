import React, { useState, useEffect } from 'react';
import { 
  Layers, RefreshCw, LogOut, Users, DollarSign, Calendar, 
  TrendingUp, ClipboardCheck, FileText, CheckCircle2, AlertTriangle, X, Upload 
} from 'lucide-react';

interface TreasurerMetrics {
  total_attendance: number;
  collection_tithe: number;
  collection_thanksgiving: number;
  collection_offertory: number;
  reporting_assemblies_count: number;
  target_variance_percentage: number;

  // From ack_church_tenants - used to map dynamic streams directly from your metrics payload object
  gross_mpesa_total: number;
  gross_bank_cash_total: number;
  tithe_mpesa_split: number;
  tithe_bank_cash_split: number;
  actual_remittance_balance: number;
}

interface ReturnPacket {
  id: number;
  tenant_id: number;
  reporting_period: string;
  church_name: string;
  attendance_children: number;
  attendance_youth: number;
  attendance_adults: number;
  worship_attendance_count: number; // Computed structural total aggregate sum
  visitors_count: number;
  sacraments_administered_count: number;
  
  // Financial Ingestion Splits (Module 6 Compliance)
  total_tithes_kes: number;
  total_thanksgiving_kes: number;
  collection_offertory: number;

  // Maker-Checker Controlled Workflow Status States (Section 6 & 8 Compliance)
  return_status: 'DRAFT' | 'SUBMITTED_TO_PARISH' | 'APPROVED_LOCKED' | 'REJECTED_FOR_CORRECTION';
  is_approved: boolean;
  vicar_feedback_notes?: string;
  evidence_attachment_url?: string;
}

interface MpesaTransaction {
  id: string;
  transaction_reference: string;
  amount_kes: number;
  fund_purpose: string;
  payment_status: string;
  created_at: string;
}

interface PortalProps {
  session: {
    user_id: number; // Matches your serial index account user keys
    name: string;
    role: string;
    assigned_id: number;
    organization_name?: string;
    reporting_period?: string;
  };
  onLogout: () => void;
}

export const ParishTreasurerPortal: React.FC<PortalProps> = ({ session, onLogout }) => {
  const [metrics, setMetrics] = useState<TreasurerMetrics | null>(null);
  const [returnHistory, setReturnHistory] = useState<ReturnPacket[]>([]);
  const [ledger, setLedger] = useState<MpesaTransaction[]>([]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mandatory High-Compliance Entry Fields
  const [period, setPeriod] = useState('2026-W31');
  const [selectedChurchName, setSelectedChurchName] = useState(session.organization_name?.toUpperCase() || '');
  const [attChildren, setAttChildren] = useState('');
  const [attYouth, setAttYouth] = useState('');
  const [attAdults, setAttAdults] = useState('');
  const [visitors, setVisitors] = useState('');
  const [sacramentsRun, setSacramentsRun] = useState('');
  const [titheAmt, setTitheAmt] = useState('');
  const [thanksAmt, setThanksAmt] = useState('');
  const [offertoryAmt, setOffertoryAmt] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [attendanceCount, setAttendanceCount] = useState('');

  // 💸 Expenditure Voucher & Budget Control States
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherDescription, setVoucherDescription] = useState('');
  const [voucherAmount, setVoucherAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('OPERATIONS');
  const [supplierName, setSupplierName] = useState('');
  
  // Annual targets vs active spending values (typically hydrated from Supabase table)
  const [allocatedBudget, setAllocatedBudget] = useState(3000000); // 3M KES Base
  const [totalSpentFunds, setTotalSpentFunds] = useState(1245000); // 1.245M KES Spent


  // Split collections metrics vectors
  const [titheMpesa, setTitheMpesa] = useState(870000);
  const [titheCash, setTitheCash] = useState(290000);

  const [grossMpesa, setGrossMpesa] = useState(1650000);
  const [grossCash, setGrossCash] = useState(589002);

  const maskSensitiveString = (inputName: string): string => {
    if (!inputName) return '';
    return inputName.split(' ').map(p => p.length <= 1 ? p : p + '*'.repeat(p.length - 1)).join(' ');
  };

  const synchronizeFinancials = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-sync-financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();

      if (data && data.metrics) {
        const incomingReturns: ReturnPacket[] = data.attendance || [];
        
        const computedAttendanceTotal = incomingReturns.reduce(
          (sum, record) => sum + (record.worship_attendance_count || 0), 0
        );

        setMetrics({
          total_attendance: computedAttendanceTotal > 0 ? computedAttendanceTotal : (data.metrics.total_attendance || 0),
          collection_tithe: data.metrics.collection_tithe || 0,
          collection_thanksgiving: data.metrics.collection_thanksgiving || 0,
          collection_offertory: data.metrics.collection_offertory || 0,
          reporting_assemblies_count: data.metrics.reporting_assemblies_count || 0,
          target_variance_percentage: data.metrics.target_variance_percentage || 0,
          
          // FIXED: Swapped hardcoded fallback figures for strict 0 baselines
          gross_mpesa_total: data.metrics.gross_mpesa_total ?? 0,
          gross_bank_cash_total: data.metrics.gross_bank_cash_total ?? 0,
          tithe_mpesa_split: data.metrics.tithe_mpesa_split ?? 0,
          tithe_bank_cash_split: data.metrics.tithe_bank_cash_split ?? 0,
          actual_remittance_balance: data.metrics.actual_remittance_balance ?? 0
        });


      setReturnHistory(incomingReturns);
        setLedger(data.ledger || []);

        // FIXED: Swapped hardcoded fallback figures for strict 0 baselines
        setGrossMpesa(data.metrics.gross_mpesa_total ?? 0);
        setGrossCash(data.metrics.gross_bank_cash_total ?? 0);
        setTitheMpesa(data.metrics.tithe_mpesa_split ?? 0);
        setTitheCash(data.metrics.tithe_bank_cash_split ?? 0);
        
        // FIXED: Swapped budget fallback figures for strict 0 baselines
        if (data.budget) {
          setAllocatedBudget(data.budget.allocated_budget_cap ?? 0);
          setTotalSpentFunds(data.budget.total_spent_funds ?? 0);
        }
      }
    } catch (err) {
      console.error("Local sync execution failure:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session.assigned_id) {
      synchronizeFinancials();
    }
  }, [session.assigned_id, period]);

  const handleReturnSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const childCount = parseInt(attChildren, 10);
    const youthCount = parseInt(attYouth, 10);
    const adultCount = parseInt(attAdults, 10);
    const titheVal = parseFloat(titheAmt);
 
    if (isNaN(childCount) || isNaN(youthCount) || isNaN(adultCount) || isNaN(titheVal) || !evidenceUrl) {
      alert("Validation Gate Error: Demographic counts, Tithe assets, and file attachments are mandatory [Page 11].");
      return;
    }


    const calculatedTotal = childCount + youthCount + adultCount;
    setSubmitting(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-finance-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id,
          reporting_period: period,
          church_name: selectedChurchName,
          attendance_children: childCount,
          attendance_youth: youthCount,
          attendance_adults: adultCount,
          worship_attendance_count: calculatedTotal,
          visitors_count: parseInt(visitors, 10) || 0,
          sacraments_administered_count: parseInt(sacramentsRun, 10) || 0,
          collection_tithe: titheVal,
          collection_thanksgiving: parseFloat(thanksAmt) || 0,
          collection_offertory: parseFloat(offertoryAmt) || 0,
          evidence_attachment_url: evidenceUrl,
          maker_id: session.user_id
        })
      });

      if (res.ok) {
        alert("Statutory Return successfully moved into the Vicar's authorization channel.");
        setLogFormOpen(false);
        setAttChildren(''); setAttYouth(''); setAttAdults(''); setTitheAmt(''); setEvidenceUrl('');
        synchronizeFinancials();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoucherIssuance = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(voucherAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0 || !voucherDescription || !supplierName) {
      alert("Validation Gate Error: Explicit amounts and purpose briefs are required.");
      return;
    }

    if (totalSpentFunds + parsedAmount > allocatedBudget) {
      alert("🔴 CRITICAL COMPLIANCE REFUSAL: This drawing exceeds your PCC Approved Budget Threshold.");
      return;
    }

    setSubmitting(true);
    try {
      const systemVoucherCode = `ACK-VOUCH-${period}-${Date.now().toString().slice(-4)}`;
      const res = await fetch('https://n8n.tenear.com/webhook/ack-parish-voucher-issuance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id,
          amount_kes: parsedAmount,
          description: voucherDescription,
          budget_category: budgetCategory,
          supplier_identity: supplierName,
          voucher_reference: systemVoucherCode,
          issued_by_id: session.user_id
        })
      });

      if (res.ok) {
        alert(`Voucher authorized. Ref: ${systemVoucherCode}`);
        setVoucherModalOpen(false);
        setVoucherDescription(''); setVoucherAmount(''); setSupplierName('');
        synchronizeFinancials();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const liveFormAttendanceSum = (parseInt(attChildren, 10) || 0) + (parseInt(attYouth, 10) || 0) + (parseInt(attAdults, 10) || 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-12 text-slate-900">
      
      {/* 👑 HEAD BAR PANEL */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between 
gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-md"><Layers className="w-5 h-5" 
/></div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">
              {session.organization_name ? `${session.organization_name} ERP` : 'Parish Consolidated ERP'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {maskSensitiveString(session.name)} • <span className="text-blue-700">{session.role.replace('_', ' ')} PORTAL</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button onClick={synchronizeFinancials} disabled={refreshing} className="p-2 border border-slate-200 rounded-xl bg-slate-50 
text-slate-600"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
          <button onClick={onLogout} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-[10px] 
tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
        </div>
      </header>

      {/* 📊 CORE METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"><Users className="w-4 h-4" 
/></div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Attendance Roll</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">{(metrics?.total_attendance || 
0).toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Tithes Collections</p>
            <h3 className="text-base font-black text-slate-900 mt-0.5">KES {(titheMpesa + titheCash).toLocaleString(undefined, 
{minimumFractionDigits: 2})}</h3>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium font-mono">
            <span>📱 M-Pesa: KES {titheMpesa.toLocaleString()}</span>
            <span>🏦 Bank/Cash: KES {titheCash.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Gross Parish Collections</p>
            <h3 className="text-base font-black text-blue-700 mt-0.5">KES {(grossMpesa + grossCash).toLocaleString(undefined, 
{minimumFractionDigits: 2})}</h3>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium font-mono">
            <span className="text-emerald-600 font-bold">📱 M-Pesa: KES {grossMpesa.toLocaleString()}</span>
            <span>🏦 Bank/Cash: KES {grossCash.toLocaleString()}</span>
          </div>
        </div>
      
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-purple-700 bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"><Calendar className="w-4 h-4" 
/></div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reporting Assemblies</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.reporting_assemblies_count || 0} {metrics?.reporting_assemblies_count === 1 ? 'Church' : 'Churches'}
          </span>
        </div>
      </div>

      {/* 🏛️ 15% DIOCESAN REMITTANCE COMPLIANCE HUD */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between 
gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-bold text-slate-700">Section 7 Statutory Code: Automated 15% Diocesan Remittance Allocation 
Balance:</span>
        </div>
        <span className="text-base font-black text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-xl font-mono">
          KES {metrics?.actual_remittance_balance ? metrics.actual_remittance_balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : 
'0.00'}
        </span>
      </div>

      {/* 🧾 BUDGET CONTROL MONITOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">PCC Approved Budget Cap</p>
          <h3 className="text-base font-black text-slate-900 mt-1">KES {allocatedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 
})}</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Active 2026 Fiscal Threshold</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total Disbursed Expenditures</p>
            <h3 className="text-base font-black text-red-600 mt-1">KES {totalSpentFunds.toLocaleString(undefined, { minimumFractionDigits: 2 
})}</h3>
            <span className="text-[10px] text-slate-500 font-bold block mt-1">
              {allocatedBudget > 0 ? ((totalSpentFunds / allocatedBudget) * 100).toFixed(1) : 0}% Bound Consumption
            </span>
          </div>
          <button onClick={() => setVoucherModalOpen(true)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black 
uppercase text-[9px] tracking-wider px-2.5 py-1.5 rounded-xl transition-colors">➕ Draw Voucher</button>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${ (allocatedBudget - totalSpentFunds) < 200000 ? 'bg-red-50/40 border-red-200' : 
'bg-green-50/30 border-green-200' }`}>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Remaining Liquidity Variance</p>
          <h3 className={`text-base font-black mt-1 ${ (allocatedBudget - totalSpentFunds) < 200000 ? 'text-red-700 animate-pulse' : 
'text-green-700' }`}>
            KES {(allocatedBudget - totalSpentFunds).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase">
            {(allocatedBudget - totalSpentFunds) < 200000 ? '⚠️ High Budget Variance Risk!' : '✓ Spending Within Safe Bounds'}
          </span>
        </div>
      </div>

      {/* 🎛️ DUAL PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL A: HISTORICAL LOGS */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-blue-700 tracking-tight uppercase flex items-center gap-1.5"><ClipboardCheck className="w-4 
h-4" /> Return Packets State History</h3>
          </div>

          {returnHistory.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">No data returns registered.</div>
          ) : (
            <div className="space-y-2.5">
              {returnHistory.map((log) => {
                const isRejected = log.return_status === 'REJECTED_FOR_CORRECTION';
                return (
                  <div key={log.id} className={`p-3 border rounded-xl space-y-3 transition-all ${isRejected ? 'border-red-200 bg-red-50/40' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">{log.church_name}</span>
                        <span className="block text-[9px] text-slate-400 font-bold font-mono">Period: {log.reporting_period}</span>
                      </div>
                      <span className={`text-[9px] border px-1.5 py-0.5 rounded font-black uppercase ${isRejected ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {log.return_status.replace('_', ' ')}
                      </span>
                    </div>

                    {isRejected && log.vicar_feedback_notes && (
                      <div className="p-2 bg-white border-l-2 border-red-600 rounded-r-md text-[10px] text-slate-700 font-medium">
                        <p className="italic text-slate-950 font-bold">"{log.vicar_feedback_notes}"</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-500 pt-1 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 py-1 rounded">👶 C: <span className="text-slate-900 font-black">{log.attendance_children}</span></div>
                      <div className="bg-slate-50 py-1 rounded">🧑 Y: <span className="text-slate-900 
font-black">{log.attendance_youth}</span></div>
                      <div className="bg-slate-50 py-1 rounded">🧓 A: <span className="text-slate-900 
font-black">{log.attendance_adults}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL B: LIVE M-PESA INCOME */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-emerald-700 tracking-tight uppercase flex items-center gap-1.5"><FileText className="w-4 h-4" 
/> Live M-Pesa Income Stream</h3>
          </div>

          {ledger.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">No transaction 
records found.</div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs font-medium">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-100 font-mono text-[11px]">
                      <td className="p-3 font-bold text-slate-700">{tx.transaction_reference}</td>
                      <td className="p-3 text-purple-700 font-bold">{tx.fund_purpose}</td>
                      <td className="p-3 font-black text-slate-900">KES {tx.amount_kes.toLocaleString()}</td>
                      <td className="p-3 text-slate-400">{tx.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🏛️ WEEKLY METRICS ENTRY MODAL */}
      {logFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setLogFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full 
text-slate-400"><X className="w-5 h-5" /></button>
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Log Weekly Attendance Metrics</h3>
            </div>

            <form onSubmit={handleReturnSubmission} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase">Assembly Unit</label>
                <input type="text" readOnly value={selectedChurchName} className="bg-transparent w-full text-xs font-bold text-slate-500 
focus:outline-none" />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase">Reporting Period</label>
                <input type="text" required className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" 
value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="col-span-3 text-[9px] font-black uppercase text-blue-800">Attendance Subsets</div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Children</label>
                  <input type="number" required className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold bg-white" 
value={attChildren} onChange={e => setAttChildren(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Youth</label>
                  <input type="number" required className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold bg-white" 
value={attYouth} onChange={e => setAttYouth(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Adults</label>
                  <input type="number" required className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold bg-white" 
value={attAdults} onChange={e => setAttAdults(e.target.value)} />
                </div>
                <div className="col-span-3 text-[10px] text-blue-900 font-bold mt-1">
                  Computed Total: <span className="font-mono font-black">{liveFormAttendanceSum} Worshipers</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase">Visitors Count</label>
                  <input type="number" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" value={visitors} 
onChange={e => setVisitors(e.target.value)} />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase">Sacraments Administered</label>
                  <input type="number" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
value={sacramentsRun} onChange={e => setSacramentsRun(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="col-span-2 text-[9px] font-black uppercase text-emerald-800">Financial Split</div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Tithes (KES)</label>
                  <input type="number" step="0.01" required className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono font-bold 
bg-white" value={titheAmt} onChange={e => setTitheAmt(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Thanksgiving (KES)</label>
                  <input type="number" step="0.01" className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono font-bold bg-white" 
value={thanksAmt} onChange={e => setThanksAmt(e.target.value)} />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase">Evidence File URL (Storage Link)</label>
                <div className="relative">
                  <input type="url" required placeholder="https://supabase-storage.ack" className="w-full p-2 pl-7 border border-slate-300 
text-xs font-mono rounded bg-white" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} />
                  <Upload className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs py-3 
rounded-xl uppercase transition-colors disabled:bg-slate-300">
                {submitting ? 'Processing...' : 'Submit to Vicar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📝 EXPENDITURE VOUCHER ISSUANCE MODAL */}
      {voucherModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setVoucherModalOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full 
text-slate-400"><X className="w-4 h-4" /></button>
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Draw Operational Fiscal Voucher</h3>
            </div>

            <form onSubmit={handleVoucherIssuance} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Line Item Classification</label>
                <select className="w-full p-2 border border-slate-200 rounded text-xs font-bold bg-slate-50" value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)}>
                  <option value="OPERATIONS">OPERATIONS & RUNNING COSTS</option>
                  <option value="WELFARE">WELFARE & PASTORAL SUPPORT</option>
                  <option value="PROJECTS">MISSION DEVELOPMENT & BUILDING</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Supplier / Payee Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2 border border-slate-200 rounded text-xs font-bold bg-white" 
                  value={supplierName} 
                  onChange={e => setSupplierName(e.target.value)} 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase">Draw Amount (KES)</label>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">Limit: KES {(allocatedBudget - 
totalSpentFunds).toLocaleString()}</span>
                </div>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  required 
                  className="w-full p-2 border border-slate-200 rounded text-xs font-mono font-bold text-red-600 bg-white" 
                  value={voucherAmount} 
                  onChange={e => setVoucherAmount(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Voucher Allocation Justification</label>
                <textarea 
                  required 
                  rows={3} 
                  className="w-full p-2 border border-slate-200 rounded text-xs font-bold resize-none bg-white" 
                  value={voucherDescription} 
                  onChange={e => setVoucherDescription(e.target.value)} 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 rounded-xl uppercase transition-colors"
              >
                {submitting ? 'Authorizing...' : 'Authorize Disbursement'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
