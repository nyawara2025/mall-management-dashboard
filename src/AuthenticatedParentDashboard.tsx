import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, BookOpen, Clock, Smartphone, CheckCircle } from 'lucide-react';

export const AuthenticatedParentDashboard = ({ shopId, userData }: { shopId: number, userData: any }) => {
  const [amount, setAmount] = useState('');
  const [feeCategory, setFeeCategory] = useState('Tuition Fees');
  const [paymentMethod, setPaymentMethod] = useState<'push' | 'manual'>('push');
  const [manualRefCode, setManualRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [statement, setStatement] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Automatically fetch the logged-in parent's child statement on mount
  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const response = await fetch('https://tenear.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: userData.id, shop_id: shopId, business_category: 'education' }),
        });
        if (response.ok) {
          const data = await response.json();
          setStatement(Array.isArray(data) ? data : (data.history || []));
        }
      } catch (err) { console.error(err); } finally { setHistoryLoading(false); }
    };
    fetchStatement();
  }, [userData.id, shopId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      const response = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          phone: userData.phone_number, // Uses verified parent login phone string
          fee_category: feeCategory,
          student_id: userData.student_id,
          student_name: `${userData.first_name} ${userData.last_name}`,
          shop_id: shopId,
          business_category: 'education',
          payment_type: paymentMethod,
          reference_code: paymentMethod === 'manual' ? manualRefCode.trim().toUpperCase() : null,
        }),
      });
      if (response.ok) {
        alert("Payment initiated successfully!");
        setAmount('');
        setManualRefCode('');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-in fade-in duration-200">
      {/* COLUMN 1 & 2: Fee Payment and Invoicing */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-2">Remit School Fees</h3>
          <p className="text-sm text-gray-500 mb-6">Select your fee item category and process payment safely via M-PESA.</p>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-5 top-5 text-gray-400 font-black text-sm">KES</span>
              <input type="number" placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-50 border p-5 pl-16 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>

            <div className="flex bg-gray-50 p-1 rounded-xl border">
              <button type="button" onClick={() => setPaymentMethod('push')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${paymentMethod === 'push' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}><Smartphone size={14} className="inline mr-1" /> STK PUSH</button>
              <button type="button" onClick={() => setPaymentMethod('manual')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${paymentMethod === 'manual' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}><CreditCard size={14} className="inline mr-1" /> MANUAL RECEIPT</button>
            </div>

            {paymentMethod === 'manual' && (
              <input type="text" placeholder="M-PESA TRANSACTION CODE" value={manualRefCode} onChange={e => setManualRefCode(e.target.value)} className="w-full bg-gray-50 p-4 border rounded-xl font-mono font-bold uppercase text-center tracking-widest text-xs" required />
            )}

            <button disabled={loading} className="w-full bg-indigo-600 text-white font-black p-4 rounded-xl shadow-md hover:bg-indigo-700 text-sm">
              {loading ? 'Processing...' : 'Authorize Fee Remittance'}
            </button>
          </form>
        </div>
      </div>

      {/* COLUMN 3: Real-Time Child Statement Ledger */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-lg font-black text-gray-800 mb-4">Statement Ledger</h3>
        {historyLoading ? (
          <p className="text-xs text-gray-400 py-6 animate-pulse">Fetching transactions...</p>
        ) : statement.length > 0 ? (
          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {statement.map((row: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-black text-gray-800">{row.fee_category}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(row.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">KES {row.amount}</p>
                  <span className="text-[8px] text-green-600 font-bold uppercase bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Settled</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-gray-400 text-center py-6">No payment rows found for this term.</p>
        )}
      </div>
    </div>
  );
};
