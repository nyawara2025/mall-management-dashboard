import React, { useState, useEffect } from 'react';
import { X, Users, History, AlertTriangle, Loader2, RefreshCw, ShieldAlert, FileSpreadsheet, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TreasurerWelfareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: number;
    shop_id: number;
    first_name: string;
    last_name: string;
  };
  onSwitchToPersonalContributions: () => void;
}

type TabType = 'statements' | 'defaulters' | 'bereavement';

export const TreasurerWelfareModal = ({ isOpen, onClose, userData, onSwitchToPersonalContributions }: TreasurerWelfareModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('statements');
  const [statements, setStatements] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Bereavement Submission Form States
  const [affectedMemberId, setAffectedMemberId] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [customDeceasedName, setCustomDeceasedName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [processingDeduction, setProcessingDeduction] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isOpen && userData?.shop_id) {
      fetchMasterWelfareData();
    }
  }, [isOpen, userData]);

  const fetchMasterWelfareData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // 1. Fetch Global Ledger Statement Records
      const stmtRes = await fetch('https://n8n.tenear.com/webhook/church-welfare-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: userData.shop_id })
      });
      if (stmtRes.ok) {
        const stmtData = await stmtRes.json();
        setStatements(Array.isArray(stmtData) ? stmtData : []);
      }

      // 2. Fetch Deep Member Analytics Listing (Active balances and standing categorization classes)
      const memRes = await fetch('https://n8n.tenear.com/webhook/church-get-congregation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: userData.shop_id })
      });
      if (memRes.ok) {
        const memData = await memRes.json();
        setMembersList(memData && memData.members ? memData.members : []);
      }
    } catch (err) {
      console.error('Error synchronizing multi-tenant treasury folder partitions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDeduction = async () => {
    setProcessingDeduction(true);
    setFeedback(null);
    setShowConfirm(false);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/welfare-bereavement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: userData.shop_id,
          affected_member_id: parseInt(affectedMemberId),
          member_name: deceasedName,
          deceased_relative_name: customDeceasedName.trim(),
          relationship_type: relationship,
          description_log: `Bereavement support for ${deceasedName} following the loss of their ${relationship} (${customDeceasedName.trim()})`,
          logged_by_name: `${userData.first_name} ${userData.last_name}`
        })
      });

      if (!response.ok) throw new Error('Transaction execution failure');

      setFeedback({ type: 'success', text: 'Universal welfare deduction processed. WhatsApp notification alerts queued via Evolution API.' });
      setCustomDeceasedName('');
      setRelationship('');
      setAffectedMemberId('');
      setActiveTab('statements');
      fetchMasterWelfareData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Deduction routine aborted. Verify infrastructure connection configurations.' });
    } finally {
      setProcessingDeduction(false);
    }
  };

  // Dynamic Metrics Aggregators
  const totalDeductedEvents = statements.filter(s => s.transaction_type === 'debit').length;
  const standardActiveCount = membersList.filter(m => m.status !== 'default_category').length;
  const defaultedCategoryCount = membersList.filter(m => m.dynamic_balance <= -2000 || m.status === 'default_category').length;
  const sortedDefaultersList = membersList.filter(m => m.dynamic_balance <= -2000 || m.status === 'default_category');

  // Simple Clean CSV File String Exporter Logic
  const handleExportCSVReport = (reportType: 'ledger' | 'defaulters') => {
    let headers = '';
    let rows = [];
    if (reportType === 'ledger') {
      headers = 'ID,Member context reference,Type,Amount,Date Summary\n';
      rows = statements.map(s => `"${s.id}","${s.member_name} - ${s.description}","${s.transaction_type.toUpperCase()}",${s.amount},"${s.payment_date}"`);
    } else {
      headers = 'Member Sequence Identifier,Congregation Full Name,Phone String,Wallet Running Balance,Current Standing Flag\n';
      rows = sortedDefaultersList.map(m => `${m.id},"${m.full_name}","${m.phone_number}",${m.dynamic_balance},"${m.status || 'default_category'}"`);
    }
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `welfare_${reportType}_shop_${userData.shop_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
        
        {/* Header Ribbon Layout */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-black tracking-wide">Welfare Central Operations</h3>
              <p className="text-[11px] text-slate-400">Multi-tenant Managed Church Environment Workspace Key: #{userData.shop_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button" onClick={onSwitchToPersonalContributions}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 font-extrabold text-[11px] rounded-lg transition tracking-wider uppercase text-white"
            >
              Personal Contributions View 💳
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Status Analytics Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
            <div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Members Active OK</span>
            <span className="text-base font-black text-green-600">{standardActiveCount} users</span></div>
            <Layers className="w-5 h-5 text-green-500 bg-green-50 p-1 rounded-lg" />
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
            <div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Welfare Defaulters</span>
            <span className="text-base font-black text-red-600">{defaultedCategoryCount} accounts</span></div>
            <ShieldAlert className="w-5 h-5 text-red-500 bg-red-50 p-1 rounded-lg" />
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
            <div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Bereavement Events Logged</span>
            <span className="text-base font-black text-slate-800">{totalDeductedEvents} cases</span></div>
            <History className="w-5 h-5 text-slate-500 bg-slate-100 p-1 rounded-lg" />
          </div>
        </div>

        {/* Tab Switching Navigation Track */}
        <div className="flex justify-between items-center bg-slate-100 border-b border-slate-200 px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('statements')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'statements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              📜 Account Ledger Statements
            </button>
            <button
              onClick={() => setActiveTab('defaulters')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'defaulters' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              ⚠️ Defaulters Tracking Checklist ({defaultedCategoryCount})
            </button>
            <button
              onClick={() => setActiveTab('bereavement')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'bereavement' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              📢 Execute Bereavement Support
            </button>
          </div>

          {/* ACTION BUTTONS: Now fully optimized for layout scaling constraints */}
          <div className="flex items-center gap-2 pb-1 sm:pb-0 sm:pr-2 self-end sm:self-auto">
            {activeTab === 'statements' && (
              <div className="flex item-center gap-2">
                {/* AUTOMATED BANK RECONCILIATION FILE SELECTOR SCRIPT INGESTION BRIDGE */}
                <label className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition shadow-sm cursor-pointer ${uploadingFile ? 'opacity-40 pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    disabled={uploadingFile}
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      setUploadingFile(true);
                      setFeedback(null);

                      const formData = new FormData();
                      formData.append('statement', file);
                      formData.append('shop_id', userData.shop_id.toString());

                      try {
                        const response = await fetch('https://n8n.tenear.com/webhook/welfare-spreadsheet', {
                          method: 'POST',
                          body: formData
                        });

                        if (!response.ok) throw new Error('Reconciliation server failed');
                        setFeedback({ type: 'success', text: 'Spreadsheet processed! Contributions uploaded and cross-referenced with your ledger.' });
                        fetchMasterWelfareData();
                      } catch (err) {
                        setFeedback({ type: 'error', text: 'Failed to process statement. Confirm file headers and retry.' });
                      } finally {
                        setUploadingFile(false);
                      }
                    }}
                  />
                  <span>{uploadingFile ? '⚙️ Reconciling File...' : '📊 Upload Bank Statement'}</span>
                </label>


                {statements.length > 0 && (
                  <button 
                    onClick={() => handleExportCSVReport('ledger')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Ledger Log
                  </button>
                )}
              </div>
            )}
            {activeTab === 'defaulters' && sortedDefaultersList.length > 0 && (            
              <button 
                onClick={() => handleExportCSVReport('defaulters')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Defaulters Roll
              </button>
            )}
            <button onClick={fetchMasterWelfareData} disabled={loading} className="p-1 text-slate-500 hover:text-blue-600 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Action System Feedback Alerts */}
        {feedback && (
          <div className={`mx-6 mt-4 p-3.5 rounded-xl text-xs font-bold border ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {feedback.text}
          </div>
        )}

        {/* Primary Content Render Display Node Canvas Window */}
        <div className="p-6 max-h-[50vh] overflow-y-auto bg-white">
          {loading ? (
            <div className="flex justify-center items-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
          ) : (
            <>
              {/* STATUS ACTION BLOCK 1: LEDGER */}
              {activeTab === 'statements' && (
                <div className="w-full overflow-hidden">
                  {/* Mobile Card Grid Layout (Visible on Small Screens Only) */}
                  <div className="block sm:hidden space-y-3">
                    {statements.length === 0 ? (
                      <p className="p-6 text-center text-xs text-slate-400">No account ledger records found.</p>
                    ) : (
                      statements.map((stmt) => (
                        <div key={stmt.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-black text-slate-800 break-words max-w-[70%]">{stmt.member_name}</span>
                            {stmt.transaction_type === 'credit' ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-green-100 text-green-700 tracking-wider">CREDIT</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-700 tracking-wider">DEBIT</span>
                            )}
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed break-words">{stmt.description}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 font-semibold text-[11px]">
                            <span className="text-slate-400">{new Date(stmt.payment_date).toLocaleDateString()}</span>
                            <span className={stmt.transaction_type === 'credit' ? "text-green-600 font-black" : "text-red-600 font-black"}>
                              KES {parseFloat(stmt.amount || '0').toLocaleString()}/-
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Classic Responsive Window (Visible on Tablets & Desktops Only) */}
                  <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse text-xs whitespace-normal">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                            <th className="p-3 w-1/5">Audit Target Entity</th>
                            <th className="p-3 w-1/3">Incident Log/Description Ledger Case Context</th>
                            <th className="p-3">Receipt Ref</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Amount Charged</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Bank Status</th>
                          </tr> 
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {statements.map((stmt) => (
                            <tr key={stmt.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-3 font-bold text-slate-800 tracking-wide break-words max-w-[140px]">{stmt.member_name}</td>
                              <td className="p-3 text-slate-600 leading-relaxed font-medium break-words max-w-[220px]">{stmt.description}</td>
                              <td className="p-3 font-mono text-slate-500 text-[11px]">{stmt.mpesa_receipt_no || '---'}</td>
                              <td className="p-3">
                                {stmt.transaction_type === 'credit' ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700">CREDIT</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700">DEBIT</span>
                                )}
                              </td>
                              <td className={stmt.transaction_type === 'credit' ? "p-3 font-extrabold text-sm text-green-600" : "p-3 font-extrabold text-sm text-red-600"}>
                                KES {parseFloat(stmt.amount || '0').toLocaleString()}/-
                              </td>
                              <td className="p-3 text-slate-400 font-medium">{new Date(stmt.payment_date).toLocaleDateString()}</td>
                              <td className="p-3">
                                {stmt.is_reconciled ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-wide">🏦 Reconciled OK</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 uppercase tracking-wide animate-pulse">⏳ Unreconciled</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS ACTION BLOCK 2: DEFAULTERS CONTROL */}
              {activeTab === 'defaulters' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium italic">
                    * Showing congregation member accounts whose wallet standing has dropped down to or below the mandatory <strong>KES -2,000/-</strong> line floor limit boundary.
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Sequence ID</th>
                          <th className="p-3">Congregation Member Name</th>
                          <th className="p-3">Contact Phone Number</th>
                          <th className="p-3 text-right">Deficit Wallet Balance</th>
                          <th className="p-3 text-center">Status Flag Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedDefaultersList.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-green-600 font-bold bg-green-50/40">Clean Slate! No profile balance defaults discovered within this tenant space registry 
partition bounds.</td></tr>
                        ) : (
                          sortedDefaultersList.map((m) => (
                            <tr key={m.id} className="hover:bg-red-50/20 transition animate-in fade-in duration-100">
                              <td className="p-3 font-bold text-slate-400">#{m.id}</td>
                              <td className="p-3 font-bold text-slate-800">{m.full_name}</td>
                              <td className="p-3 text-slate-600 font-semibold tracking-wider">📞 {m.phone_number}</td>
                              <td className="p-3 text-right font-black text-red-600 text-sm">KES {parseFloat(m.dynamic_balance || 0).toLocaleString()}/-</td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-100 text-red-700 tracking-wider">
                                  Default Category Locked
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STATUS ACTION BLOCK 3: LOG CASE SUBMISSION */}
              {activeTab === 'bereavement' && (
                <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                  {!showConfirm ? (
                    <form onSubmit={(e) => { e.preventDefault(); if(affectedMemberId && relationship && customDeceasedName.trim()) setShowConfirm(true); }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">1. Select Active Church Member Affected</label>
                        <div className="relative">
                          <select required value={affectedMemberId} onChange={(e) => { const id = e.target.value; setAffectedMemberId(id); const m = membersList.find(x => String(x.id) === id); 
setDeceasedName(m ? m.full_name : ''); }} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-800 
appearance-none shadow-sm">
                            <option value="">-- Choose Church Member From Register --</option>
                            {membersList.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.phone_number})</option>)}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">▼</div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">2. Name of Deceased Relative</label>
                        <input type="text" required value={customDeceasedName} onChange={(e) => setCustomDeceasedName(e.target.value)} placeholder="e.g. Late Mary Wanjiku Nyawara" className="w-full 
bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-800 shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">3. Relationship to Selected Member</label>
                        <div className="relative">
                          <select required value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3.5 text-sm 
focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-800 appearance-none shadow-sm">
                            <option value="">-- Choose Approved Relation Category --</option>
                            <option value="Mother/Father">Mother / Father</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Son/Daughter">Son / Daughter</option>
                            <option value="Grandmother/Grandfather">Grandmother / Grandfather</option>
                            <option value="Mother-in-Law/Father-in-law">Mother-in-Law / Father-in-law</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">▼</div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">System Audit Generated Description Log</label>
                        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 leading-relaxed select-none">
                          {deceasedName && customDeceasedName && relationship ? `Bereavement support for ${deceasedName} following the loss of their ${relationship} (${customDeceasedName.trim()})` : 
"Awaiting parameter definition values..."}
                        </div>
                      </div>
                      <button type="submit" disabled={!affectedMemberId || !relationship || !customDeceasedName.trim()} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs tracking-wide shadow-lg shadow-red-600/10 transition disabled:opacity-50">Review System-Wide Deduction</button>
                    </form>    
                  ) : (
                    <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600"><AlertTriangle className="w-6 h-6" /></div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">Critical Confirmation Screen</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">Executing this will immediately deduct KES 300/- from all active members belonging to this tenant space. 
It will also queue individual WhatsApp messages via your Evolution API gateway.</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl text-left text-xs space-y-1.5 shadow-sm">
                        <p className="text-slate-600">Affected Member: <span className="font-bold text-slate-900">{deceasedName}</span></p>
                        <p className="text-slate-600">Deceased Person: <span className="font-bold text-slate-900">{customDeceasedName}</span></p>
                        <p className="text-slate-600">Relation Bracket: <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded border border-blue-200 
uppercase">{relationship}</span></p>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" disabled={processingDeduction} onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-xs 
text-slate-700 transition">Cancel & Go Back</button>
                        <button type="button" disabled={processingDeduction} onClick={handleTriggerDeduction} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs 
transition flex items-center justify-center gap-1.5 shadow-md">{processingDeduction ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Batch Processing...</> : 'Confirm and Execute'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
