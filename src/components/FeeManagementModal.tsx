import React, { useState, useEffect } from 'react';
import { X, Smartphone, CreditCard, Receipt, FileText, CheckCircle } from 'lucide-react';

interface FeeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any; // Contains shop_id, student/parent details, class, etc.
}

export const FeeManagementModal = ({ isOpen, onClose, userData }: FeeManagementModalProps) => {
  // 1. STATE MANAGEMENT
  const [view, setView] = useState<'pay' | 'statement'>('pay');
  const [feeCategory, setFeeCategory] = useState<string>('Tuition');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'push' | 'manual'>('push');
  const [manualRefCode, setManualRefCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // 2. CORE EDUCATION ATTRIBUTES
  const studentName = userData?.student_name || `${userData?.first_name || 'Student'} ${userData?.last_name || ''}`;
  const studentClass = userData?.class_name || userData?.grade || 'Grade 1';
  const termName = "Term 2 - 2026"; // Current system calendar context

  const feeCategories = [
    { id: 'tuit', name: 'Tuition Fees' },
    { id: 'bus', name: 'Transport / Bus' },
    { id: 'feed', name: 'Feeding / Lunch' },
    { id: 'exam', name: 'Exam & Activity' },
    { id: 'uniform', name: 'Uniform & Items' }
  ];

  // 3. API WORKERS
  const fetchFeeStatement = async () => {
    setView('statement');
    if (!userData?.id) return;

    setHistoryLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-fees-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: userData.id, // Parent/Student internal identity reference
          shop_id: userData.shop_id || '68',
          business_category: 'education'
        }),
      });

      if (response.ok) {
        const textData = await response.text();
        if (!textData || textData.trim() === "") {
          setHistory([]);
          return;
        }
        const data = JSON.parse(textData);
        setHistory(Array.isArray(data) ? data : (data.history || []));
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Statement Ledger Fetch Failure:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFeePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid contribution amount.");
      return;
    }
    if (paymentMethod === 'manual' && !manualRefCode.trim()) {
      alert("Please provide the transaction reference code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-fee-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          phone: userData?.phone_number,
          fee_category: feeCategory,
          term: termName,
          student_name: studentName,
          class_name: studentClass,
          payment_type: paymentMethod,
          reference_code: paymentMethod === 'manual' ? manualRefCode.trim().toUpperCase() : null,
          shop_id: userData?.shop_id || '68',
          business_category: 'education',
          member_id: userData?.id
        }),
      });

      if (response.ok) {
        alert(paymentMethod === 'push' 
          ? "STK Push initialized! Check your mobile phone handset for the M-PESA PIN prompt." 
          : "Manual payment reference received. Acknowledgment receipt will issue shortly."
        );
        setAmount('');
        setManualRefCode('');
        onClose();
      } else {
        alert("Payment request processing failed. Please verify configurations.");
      }
    } catch (error) {
      console.error("Fee Payment Processing Exception:", error);
      alert("Network transmission error occurred. Please attempt transaction again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* HEADER BRAND & TAB SWITCHER LAYER */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center mb-5">
            <div className="flex gap-6">
              <button 
                onClick={() => setView('pay')}
                className={`text-xl font-black transition-all pb-1 ${view === 'pay' ? 'text-gray-900 border-b-4 border-indigo-600' : 'text-gray-400'}`}
              >
                Pay Fees
              </button>
              <button 
                onClick={fetchFeeStatement}
                className={`text-xl font-black transition-all pb-1 ${view === 'statement' ? 'text-gray-900 border-b-4 border-indigo-600' : 'text-gray-400'}`}
              >
                Statement
              </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X size={22} className="text-gray-400" />
            </button>
          </div>
          
          {/* Student Information Details Card */}
          <div className="bg-white p-3 rounded-2xl border border-gray-100/80 text-left shadow-sm">
            <p className="text-xs font-black text-indigo-600 truncate">{studentName.toUpperCase()}</p>
            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-0.5">
              <span>Class: {studentClass}</span>
              <span>Active Cycle: {termName}</span>
            </div>
          </div>
        </div>

        {/* CONTAINER SWITCHER AREA */}
        <div className="p-8">
          {view === 'pay' ? (
            /* --- SUB PANEL A: PAYMENT DEPLOYMENT FORM --- */
            <form onSubmit={handleFeePayment} className="space-y-5 text-left animate-in fade-in duration-150">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Select Fee Item</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {feeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeeCategory(cat.name)}
                      className={`p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                        feeCategory === cat.name 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-indigo-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Inputs Field Wrapper */}
              <div className="relative">
                <span className="absolute left-5 top-5 text-gray-400 font-black text-sm">KES</span>
                <input
                  type="number"
                  placeholder="Fee Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-5 pl-16 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                />
              </div>

              {/* M-PESA Multi-Option Routing Framework Switcher */}
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('push')}
                  className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black tracking-wide transition-all ${paymentMethod === 'push' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
                >
                  <Smartphone size={14} /> M-PESA STK PUSH
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('manual')}
                  className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black tracking-wide transition-all ${paymentMethod === 'manual' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
                >
                  <CreditCard size={14} /> MANUAL RECEIPT
                </button>
              </div>

              {/* Conditional Manual Reference Entry Input Block */}
              {paymentMethod === 'manual' && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    placeholder="Enter M-PESA Code (e.g., TDR456YHJ)"
                    value={manualRefCode}
                    onChange={(e) => setManualRefCode(e.target.value)}
                    className="w-full bg-gray-50 border border-indigo-100 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono font-bold tracking-widest uppercase"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-base hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-40"
              >
                {loading ? 'Processing Transaction...' : `Remit ${feeCategory}`}
              </button>
            </form>
          ) : (
            /* --- SUB PANEL B: FINANCIAL HISTORICAL LEDGER STATEMENT --- */
            <div className="space-y-4 animate-in fade-in duration-150 min-h-[260px]">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 animate-pulse">Reconstructing ledger rows...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                  {history.map((receipt: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-left">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tight">{receipt.fee_category || 'School Fees'}</p>
                        <p className="text-xs font-black text-gray-800 leading-tight mb-0.5">{receipt.reference_code || 'M-PESA Push'}</p>
                        <p className="text-[9px] text-gray-400 font-bold">
                          {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('en-GB') : 'Processing'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">KES {receipt.amount}</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <CheckCircle size={10} className="text-green-600" />
                          <span className="text-[8px] font-black text-green-600 uppercase">Settled</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 opacity-40">
                  <Receipt size={32} className="text-gray-400 mb-1" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">No Financial History Rows Found</p>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[180px] text-center mt-0.5">Payments cleared via the system portal update your statement ledger instantly.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
