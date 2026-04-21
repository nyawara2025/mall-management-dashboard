import React, { useState } from 'react';
import { X, Smartphone, CreditCard } from 'lucide-react';

interface WelfareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any; // Ideally use your MemberData interface
}

export const WelfareModal = ({ isOpen, onClose, userData }: WelfareModalProps) => {
  const [selectedKitty, setSelectedKitty] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'push' | 'manual'>('push');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Determine which kitties to show based on member data
  const availableKitties = [
    { id: 'ministry', label: 'Ministry', value: userData?.ministry_name, show: !!userData?.ministry_name },
    { id: 'zone', label: 'Zone', value: userData?.zone_name, show: !!userData?.zone_name },
    { id: 'regional', label: 'Regional', value: 'Regional Fund', show: true },
    { id: 'welfare', label: 'Social Welfare', value: 'General Welfare', show: true },
    { id: 'adhoc', label: 'Ad hoc', value: 'Special Needs', show: true },
  ];

  const handlePayment = async () => {
    if (!selectedKitty || !amount) {
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
          kitty_type: selectedKitty, // e.g., 'ministry'
          kitty_name: availableKitties.find(k => k.id === selectedKitty)?.value,
          payment_type: paymentMethod,
          org_id: userData?.org_id,
          shop_id: userData?.shop_id,
          member_id: userData?.id
        }),
      });

      if (response.ok) {
        alert(paymentMethod === 'push' ? "Check your phone for the M-PESA prompt" : "Please follow the manual instructions sent to WhatsApp");
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
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welfare Fund</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Kitty Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Select Kitty</label>
            <div className="grid grid-cols-2 gap-2">
              {availableKitties.filter(k => k.show).map((kitty) => (
                <button
                  key={kitty.id}
                  onClick={() => setSelectedKitty(kitty.id)}
                  className={`p-4 rounded-2xl text-sm font-bold transition-all border ${
                    selectedKitty === kitty.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-200'
                  }`}
                >
                  {kitty.label}
                  {kitty.id === 'ministry' || kitty.id === 'zone' ? (
                    <span className="block text-[10px] opacity-70 font-medium truncate mt-0.5">{kitty.value}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
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

          {/* Payment Method Toggle */}
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
            disabled={loading || !amount || !selectedKitty}
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
          >
            {loading ? 'Processing...' : 'Contribute Now'}
          </button>
          
          <div className="text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Payment History</p>
          </div>
        </div>
      </div>
    </div>
  );
};
