import React, { useState } from 'react';
import { X, Heart, Landmark, Gift, HandIcon, MoreHorizontal, Phone, Hash } from 'lucide-react';

export const GivingModal = ({ 
  isOpen, 
  onClose, 
  userData 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  userData: any 
}) => {
  const [amount, setAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Payment Mode Logic
  const [paymentMode, setPaymentMode] = useState<'stk' | 'manual'>('stk');
  const [transactionId, setTransactionId] = useState('');

  const options = [
    { id: 'tithes', label: 'Tithes', icon: <Landmark size={20}/> },
    { id: 'offertory', label: 'Offertory', icon: <Heart size={20}/> },
    { id: 'givings', label: 'Givings', icon: <HandIcon size={20}/> },
    { id: 'donations', label: 'Donations', icon: <Gift size={20}/> },
    { id: 'other', label: 'Other', icon: <MoreHorizontal size={20}/> },
  ];

  const handleGiving = async () => {
    if (!amount || !selectedOption) return;
    if (paymentMode === 'manual' && !transactionId) {
      alert("Please enter the M-PESA confirmation code.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/member-giving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_name: `${userData?.first_name} ${userData?.last_name}`,
          phone_number: userData?.phone_number,
          amount: amount,
          type: selectedOption,
          org_id: userData?.org_id,
          shop_id: userData?.shop_id,
          payment_method: paymentMode, // 'stk' or 'manual'
          transaction_id: paymentMode === 'manual' ? transactionId.toUpperCase() : null
        }),
      });

      if (!response.ok) throw new Error("Server error");

      if (paymentMode === 'stk') {
        alert("Please check your phone for the M-PESA prompt to complete payment.");
      } else {
        alert("Transaction code submitted for verification. Thank you!");
      }
      
      onClose();
      // Reset local states
      setAmount('');
      setTransactionId('');
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-6 top-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X size={20}/>
        </button>

        <h2 className="text-2xl font-black mb-6">Tithes & Giving</h2>

        {/* Category Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase text-gray-400 ml-2">Select Category</label>
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  selectedOption === opt.id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt.icon}
                <span className="font-bold text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase text-gray-400 ml-2">Enter Amount</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">KES</span>
            <input
              type="number"
              className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[2rem] border-none outline-none text-xl font-black"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Payment Method Toggle */}
        <div className="space-y-3 mb-8">
          <label className="text-xs font-bold uppercase text-gray-400 ml-2">Payment Method</label>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
            <button 
              onClick={() => setPaymentMode('stk')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${paymentMode === 'stk' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <Phone size={16} /> M-PESA Prompt
            </button>
            <button 
              onClick={() => setPaymentMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${paymentMode === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <Hash size={16} /> Manual Code
            </button>
          </div>

          {paymentMode === 'manual' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl outline-none text-blue-900 font-bold uppercase placeholder:text-blue-300"
                placeholder="Enter M-PESA Code (e.g. RKT...)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-[10px] text-blue-400 mt-2 ml-2 italic">Use this if you already paid via Paybill/Till.</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleGiving}
          disabled={submitting || !amount || !selectedOption || (paymentMode === 'manual' && !transactionId)}
          className={`w-full py-5 rounded-3xl text-white font-black text-lg shadow-lg transition-all active:scale-95 ${
            submitting || !amount || !selectedOption || (paymentMode === 'manual' && !transactionId) 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {submitting ? 'PROCESSING...' : 'GIVE NOW'}
        </button>
      </div>
    </div>
  );
};
