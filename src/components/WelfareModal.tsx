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

  const [subRegionTab, setSubRegionTab] = useState<'Main' | 'LembDholuo' | 'Other'>('Main');
  
  // 2. ADD THESE REMAINING STATES FOR THE EXCLUSIVE WORKSPACE
  const [subModalActiveTab, setSubModalActiveTab] = useState<'contribute' | 'statement'>('contribute');
  const [subModalHistory, setSubModalHistory] = useState<any[]>([]);
  const [subModalLoadingHistory, setSubModalLoadingHistory] = useState(false);

  const [filter, setFilter] = useState<'All' | 'Ministry' | 'Zone' | 'Regional' | 'Welfare' | 'Ad hoc'>('All');

  // 2. DATA WORKERS & PARSERS
  const parseList = (str: string) => str ? str.split(',').map(item => item.trim()).filter(Boolean) : [];

  const ministries = parseList(userData?.ministry_name);
  const zones = parseList(userData?.zone_name);

  const availableKitties = [
    ...ministries.map(m => ({ id: `min_${m}`, type: 'Ministry', name: m })),
    ...zones.map(z => ({ id: `zone_${z}`, type: 'Zone', name: z })),
    { id: 'reg', type: 'Regional', name: 'Regional Fund' },
    { id: 'wel', type: 'Welfare', name: 'Social Welfare' },
    { id: 'adhoc', type: 'Ad hoc', name: 'Special Needs' }
  ];

  

  const filteredHistory = filter === 'All' 
    ? history 
    : history.filter(item => item.kitty_type === filter);

  // 3. ADD THE DATA FETCHING FUNCTION FOR THE EXCLUSIVE WORKSPACE
  const handleFetchLembDholuoHistory = async () => {
    setSubModalActiveTab('statement');
    if (!userData?.id) return;

    setSubModalLoadingHistory(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-lembdholuo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          member_id: userData.id,
          shop_id: userData.shop_id || 68
        }),
      });
    
      if (response.ok) {
        const data = await response.json();
        const fullHistory = Array.isArray(data) ? data : (data.history || []);
        // Isolates transactions belonging to the Regional kitty framework
        setSubModalHistory(fullHistory.filter((item: any) => item.kitty_type === 'Regional'));
      }
    } catch (err) {
      console.error("Regional Account History Fetch Error:", err);
    } finally {
      setSubModalLoadingHistory(false);
    }
  };


  if (!isOpen) return null;


  const handleFetchHistory = async () => {
    setView('history'); // Switch the tab first
  
    if (!userData?.id) return;
  
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-welfare-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          member_id: userData.id,
          shop_id: userData.shop_id || 68
        }),
      });
    
      if (response.ok) {
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : (data.history || []));
      }
    } catch (err) {
      console.error("Manual Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };


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

  // 4. CRITICAL PLACE: MOVED THE VISIBILITY ESCAPE PORTAL HERE BELOW HOOKS
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        {/* HEADER SECTION with TAB SWITCHER */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-6">

              <button 
                onClick={() => { setSubRegionTab('Main'); setView('pay'); onClose(); }} 
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>

              <button 
                onClick={() => setView('pay')}
                className={`text-xl font-black transition-all pb-1 ${view === 'pay' ? 'text-gray-900 border-b-4 border-blue-600' : 'text-gray-400'}`}
              >
                Contribute
              </button>
              <button 
                onClick={handleFetchHistory}
                className={`text-xl font-black transition-all pb-1 ${view === 'history' ? 'text-gray-900 border-b-4 border-blue-600' : 'text-gray-400'}`}
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
            /* --- TAB 1: DYNAMIC CONTRIBUTION FORMS PANEL --- */
            <div className="animate-in fade-in duration-300">
              
              {/* VIEW A: STANDARD MAIN WELFARE GRID VIEW */}
              {subRegionTab === 'Main' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Select Kitty</label>
                    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                      {/* ... Insert your availableKitties.map loop code precisely as shown in Step 3 ... */}
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

                  {/* Payment Method Selector & Submit Button */}
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <button onClick={() => setPaymentMethod('push')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'push' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Smartphone size={16} /> M-PESA PUSH</button>
                    <button onClick={() => setPaymentMethod('manual')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'manual' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><CreditCard size={16} /> MANUAL CODE</button>
                  </div>
                  <button onClick={handlePayment} disabled={loading || !amount || !selectedKittyId} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50">{loading ? 'Processing...' : 'Contribute Now'}</button>
                </div>
              )}

              {/* VIEW B: ISOLATED LEMB DHOLUO WORKSPACE (Only visible to verified members) */}
              {subRegionTab === 'LembDholuo' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-3 rounded-xl">
                    <span className="text-xs font-black text-blue-700">📍 Tab: Lemb Dholuo</span>
                    <button 
                      onClick={() => { setSubRegionTab('Main'); setSelectedKittyId(''); }}
                      className="text-xs font-bold text-gray-400 hover:text-blue-600 underline"
                    >
                      Back to Menu
                    </button>
                  </div>

                  {/* Sub-Modal Horizontal Tabs */}
                  <div className="flex border-b border-gray-100 bg-gray-50 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSubModalActiveTab('contribute')}
                      className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${subModalActiveTab === 'contribute' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                    >
                      CONTRIBUTE
                    </button>
                    <button
                      type="button"
                      onClick={handleFetchLembDholuoHistory}
                      className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${subModalActiveTab === 'statement' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                    >
                      STATEMENT
                    </button>
                  </div>

                  {subModalActiveTab === 'contribute' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-5 top-5 text-gray-400 font-bold">KES</span>
                        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-5 pl-16 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold" />
                      </div>
                      <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button onClick={() => setPaymentMethod('push')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'push' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Smartphone size={16} /> M-PESA PUSH</button>
                        <button onClick={() => setPaymentMethod('manual')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'manual' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><CreditCard size={16} /> MANUAL CODE</button>
                      </div>
                      <button onClick={handlePayment} disabled={loading || !amount} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 shadow-xl">{loading ? 'Processing...' : 'Contribute to Lemb Dholuo'}</button>
                    </div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {subModalLoadingHistory ? (
                        <p className="text-center text-xs font-bold py-10 animate-pulse text-gray-400">Loading statement history...</p>
                      ) : subModalHistory.length > 0 ? (
                        subModalHistory.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div><p className="text-sm font-black text-gray-800 leading-none mb-1">{item.kitty_name}</p><p className="text-[10px] text-gray-400 font-bold">{new Date(item.created_at).toLocaleDateString('en-GB')}</p></div>
                            <div className="text-right"><p className="text-sm font-black text-gray-900">KES {item.amount}</p><p className="text-[9px] font-black text-green-600 uppercase">Settled</p></div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs py-10 italic text-gray-400">No regional transactions recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW C: ISOLATED OTHER REGIONS VIEW */}
              {subRegionTab === 'Other' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded-xl">
                    <span className="text-xs font-black text-gray-700">📍 Tab: Other Regions</span>
                    <button 
                      onClick={() => { setSubRegionTab('Main'); setSelectedKittyId(''); }}
                      className="text-xs font-bold text-gray-400 hover:text-gray-900 underline"
                    >
                      Back to Menu
                    </button>
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
                    <button onClick={() => setPaymentMethod('push')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'push' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><Smartphone size={16} /> M-PESA PUSH</button>
                    <button onClick={() => setPaymentMethod('manual')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${paymentMethod === 'manual' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}><CreditCard size={16} /> MANUAL CODE</button>
                  </div>

                  <button onClick={handlePayment} disabled={loading || !amount} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100">{loading ? 'Processing...' : 'Contribute Now'}</button>
                </div>
              )}

            </div>
          ) : (


            /* --- TAB 2: PAYMENT HISTORY --- */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 min-h-[300px]">
  
              {/* NEW: Filter Bar */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Ministry', 'Zone', 'Regional', 'Welfare', 'Ad hoc'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black whitespace-nowrap transition-all border ${
                      filter === cat 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredHistory.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredHistory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">{item.kitty_type}</p>
                        <p className="text-sm font-black text-gray-800 leading-none mb-1">{item.kitty_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-gray-900">KES {item.amount}</p>
                        <p className="text-[9px] font-black text-green-600 uppercase">Paid</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                   <p className="text-sm font-black text-gray-400">No {filter !== 'All' ? filter : ''} records found.</p>
                </div>
              )}
            </div>


          )}
        </div>
      </div>
    </div>
  );
};
