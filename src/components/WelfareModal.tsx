import React, { useState, useEffect } from 'react';
import { X, Smartphone, CreditCard } from 'lucide-react';

interface WelfareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any; 
}

export const WelfareModal = ({ isOpen, onClose, userData }: WelfareModalProps) => {
  const [selectedKittyId, setSelectedKittyId] = useState<string>('');
  const [targetName, setTargetName] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'push' | 'manual'>('push');
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<'pay' | 'history'>('pay');
  const [history, setHistory] = useState<any[]>([]); // To store fetched payments

  if (!isOpen) return null;

  // 1. Helper to split strings (e.g. "Youth, Gen ZION") into individual items
  const parseList = (str: string) => str ? str.split(',').map(item => item.trim()).filter(Boolean) : [];

  const ministries = parseList(userData?.ministry_name);
  const zones = parseList(userData?.zone_name);

  // 2. Build the dynamic list of available kitties
  const availableKitties = [
    ...ministries.map(m => ({ id: `min_${m}`, type: 'Ministry', name: m })),
    ...zones.map(z => ({ id: `zone_${z}`, type: 'Zone', name: z })),
    { id: 'reg', type: 'Regional', name: 'Regional Fund' },
    { id: 'wel', type: 'Welfare', name: 'Social Welfare' },
    { id: 'adhoc', type: 'Ad hoc', name: 'Special Needs' }
  ];

  useEffect(() => {
    if (view === 'history' && isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://n8n.tenear.com/webhook/church-welfare-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              member_id: userData?.id,
              shop_id: userData?.shop_id 
            }),
          });
          const data = await response.json();
          setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("History fetch failed");
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [view, isOpen, userData?.id]);

  const handlePayment = async () => {
    if (!selectedKittyId || !amount) {
      alert("Please select a kitty and enter an amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/post-to-church-welfare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          phone: userData?.phone_number,
          kitty_type: targetType,   // e.g. 'Ministry'
          kitty_name: targetName,   // e.g. 'Youth'
          payment_type: paymentMethod,
          org_id: userData?.org_id,
          shop_id: userData?.shop_id,
          member_id: userData?.id
        }),
      });

      if (response.ok) {
        alert(paymentMethod === 'push' ? "Check your phone for the M-PESA prompt" : "Manual payment request submitted.");
        onClose();
      }
    } catch (error) {
      alert("Payment request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        {/* HEADER SECTION with TAB SWITCHER */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-6">
              <button 
                onClick={() => setView('pay')}
                className={`text-xl font-black transition-all pb-1 ${view === 'pay' ? 'text-gray-900 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Contribute
              </button>
              <button 
                onClick={() => setView('history')}
                className={`text-xl font-black transition-all pb-1 ${view === 'history' ? 'text-gray-900 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                History
              </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          
          <div className="px-1">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Welfare Fund</h2>
          </div>
        </div>

        <div className="p-8">
          {view === 'pay' ? (
            /* --- TAB 1: CONTRIBUTION FORM --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Select Kitty</label>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                  {availableKitties.map((kitty) => (
                    <button
                      key={kitty.id}
                      onClick={() => {
                        setSelectedKittyId(kitty.id);
                        setTargetName(kitty.name);
                        setTargetType(kitty.type);
                      }}
                      className={`p-4 rounded-2xl text-left transition-all border ${
                        selectedKittyId === kitty.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      <span className={`block text-[9px] uppercase font-bold mb-1 ${selectedKittyId === kitty.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {kitty.type}
                      </span>
                      <span className="block text-sm font-black leading-tight truncate">
                        {kitty.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-5 top-5 text-gray-400 font-bold">KES</span>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-5 pl-16 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
                />
              </div>

              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button
                  onClick={() => setPaymentMethod('push')}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'push' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}
                >
                  <Smartphone size={16} /> M-PESA PUSH
                </button>
                <button
                  onClick={() => setPaymentMethod('manual')}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'manual' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}
                >
                  <CreditCard size={16} /> MANUAL CODE
                </button>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !amount || !selectedKittyId}
                className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Contribute Now'}
              </button>
            </div>
          ) : (
            /* --- TAB 2: PAYMENT HISTORY --- */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching Records...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                      <div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">{item.kitty_type}</p>
                        <p className="text-sm font-black text-gray-800 leading-none mb-1">{item.kitty_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-gray-900">KES {item.amount}</p>
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <p className="text-[9px] font-black text-green-600 uppercase">Paid</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                   <p className="text-sm font-black text-gray-400">No contributions found yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
