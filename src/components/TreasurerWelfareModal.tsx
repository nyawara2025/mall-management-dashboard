import React, { useState, useEffect } from 'react';
import { X, Users, History, AlertTriangle, Send, Loader2, RefreshCw } from 'lucide-react';
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
}

export const TreasurerWelfareModal = ({ isOpen, onClose, userData }: TreasurerWelfareModalProps) => {
  const [activeTab, setActiveTab] = useState<'statements' | 'bereavement'>('statements');
  const [statements, setStatements] = useState<any[]>([]);
  const [loadingStatements, setLoadingStatements] = useState(false);
  
  // Bereavement Form State
  const [deceasedName, setDeceasedName] = useState('');
  const [affectedMemberId, setAffectedMemberId] = useState('');
  const [processingDeduction, setProcessingDeduction] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && userData?.shop_id) {
      fetchGlobalStatements();
    }
  }, [isOpen, activeTab, userData]);

  const fetchGlobalStatements = async () => {
    setLoadingStatements(true);
    try {
      // Direct POST payload to fetch records through your n8n middleware
      const response = await fetch('https://n8n.tenear.com/webhook/church-welafare-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: userData.shop_id
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from middleware');
      
      const result = await response.json();
      
      // 1. Ensure result is an array even if wrapped by n8n
      let rawArray: any[] = [];
      if (Array.isArray(result)) {
        rawArray = result;
      } else if (result && typeof result === 'object') {
        rawArray = result.data || result.statements || result.rows || [result];
      }

      // 2. Cleanly format properties to prevent render crashes
      const cleanArray = rawArray.map((item: any) => ({
        id: String(item.id || Math.random()),
        member_name: String(item.member_name || item.memberName || 'Unknown Member'),
        description: String(item.description || 'Welfare Record'),
        transaction_type: String(item.transaction_type || 'credit').toLowerCase() === 'debit' ? 'debit' : 'credit',
        amount: parseFloat(item.amount || 0),
        payment_date: item.payment_date || item.paymentDate || new Date().toISOString()
      }));

      setStatements(cleanArray);
    } catch (err: any) {
      console.error('Error fetching global statements:', err);
      setStatements([]); // Keeping it an array avoids rendering crashes
      setFeedback({
        type: 'error',
        text: 'Failed to synchronize account ledger logs.'
      });
    } finally {
      setLoadingStatements(false);
    }
  };

    

  const handleTriggerDeduction = async () => {
    setProcessingDeduction(true);
    setFeedback(null);
    setShowConfirm(false);

    try {
      // Fire payload directly to your self-hosted n8n webhook middleware
      const response = await fetch('https://n8n.tenear.com/webhook/welfare-bereavement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: userData.shop_id,
          deceased_name: deceasedName,
          affected_member_id: parseInt(affectedMemberId),
          logged_by_name: `${userData.first_name} ${userData.last_name}`
        })
      });

      if (!response.ok) throw new Error('Middleware failed to execute batch jobs');

      setFeedback({
        type: 'success',
        text: 'Bereavement executed! KES 300 deducted from members and WhatsApp alerts dispatched via Evolution API.'
      });
      setDeceasedName('');
      setAffectedMemberId('');
      setActiveTab('statements');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: 'Failed to process welfare event. Verify network routes and try again.'
      });
    } finally {
      setProcessingDeduction(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Main Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold">Welfare Administration Dashboard</h3>
              <p className="text-[11px] text-slate-400">Shop/Tenant Space Key: {userData.shop_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          <button
            onClick={() => { setActiveTab('statements'); setFeedback(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 -mb-px ${
              activeTab === 'statements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Global Accounts Statement
          </button>
          <button
            onClick={() => { setActiveTab('bereavement'); setFeedback(null); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition border-b-2 -mb-px ${
              activeTab === 'bereavement' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Log Bereavement Case
          </button>
        </div>

        {/* Global Feedback Banners */}
        {feedback && (
          <div className={`m-6 p-4 rounded-xl text-xs font-semibold ${
            feedback.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {feedback.text}
          </div>
        )}

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: MASTER TRANSACTIONS LIST */}
          {activeTab === 'statements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Showing historical audit records compiled for this church tenant space.</p>
                <button 
                  onClick={fetchGlobalStatements} disabled={loadingStatements}
                  className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-40 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingStatements ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingStatements ? (
                <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3">Member Name</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statements.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            No logs discovered within this ledger partition.
                          </td>
                        </tr>
                      ) : (
                        statements.map((stmt) => (
                          <tr key={stmt.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-3 font-semibold text-slate-800">{stmt.member_name}</td>
                            <td className="p-3 text-slate-600">{stmt.description}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                stmt.transaction_type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {stmt.transaction_type}
                              </span>
                            </td>
                            <td className={`p-3 font-bold ${stmt.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              KES {stmt.amount.toLocaleString()}/-
                            </td>
                            <td className="p-3 text-slate-400">
                              {new Date(stmt.payment_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRIGGER BEREAVEMENT CASE */}
          {activeTab === 'bereavement' && (
            <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
              {!showConfirm ? (
                <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Deceased Individual / Relative's Name</label>
                    <input
                      type="text" required value={deceasedName} onChange={(e) => setDeceasedName(e.target.value)}
                      placeholder="e.g. Late Elder Samson Cheruiyot"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 
transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Affected Congregation Member (Database sequence 
ID)</label>
                    <input
                      type="number" required value={affectedMemberId} onChange={(e) => setAffectedMemberId(e.target.value)}
                      placeholder="Enter unique database serial index ID"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 
transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-xs tracking-wide shadow-lg 
shadow-red-600/10"
                  >
                    Review System-Wide Deduction
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Critical Confirmation Screen</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Executing this will immediately deduct <strong>KES 300/-</strong> from all active members belonging to this tenant space. It will also 
queue individual WhatsApp messages via your Evolution API gateway.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-left text-xs space-y-1">
                    <p className="text-slate-500">Target Event Description: <span className="font-bold text-slate-800">Bereavement of {deceasedName}</span></p>
                    <p className="text-slate-500">Affected Member Serial Key: <span className="font-bold text-slate-800">#{affectedMemberId}</span></p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button" disabled={processingDeduction} onClick={() => setShowConfirm(false)}
                      className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-xs text-slate-700 transition"
                    >
                      Cancel & Go Back
                    </button>
                    <button
                      type="button" disabled={processingDeduction} onClick={handleTriggerDeduction}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition flex 
items-center justify-center gap-1.5 shadow-md"
                    >
                      {processingDeduction ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Batch Processing...
                        </>
                      ) : 'Confirm and Execute'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
