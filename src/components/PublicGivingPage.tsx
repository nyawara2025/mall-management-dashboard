import React, { useState } from 'react';
import { Loader2, Smartphone, Camera } from 'lucide-react';

export const PublicGivingPage = () => {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Reinstating the fetch logic for your M-Pesa STK push
      const response = await fetch('https://n8n.tenear.com/webhook/church-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: 68, // St. Barnabas shop_id
          amount: Number(amount),
          phone: phone.startsWith('0') ? '254' + phone.slice(1) : phone,
          project_id: "general_allocation", // Backend will handle the split
          project_name: "General Church Project Fund"
        })
      });

      if (response.ok) {
        alert("Praise God! Please check your phone for the M-Pesa PIN prompt to complete your donation.");
      } else {
        throw new Error("Payment initiation failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("We encountered an issue starting the payment. Please try again or use the Paybill details provided.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 bg-white min-h-screen animate-in fade-in duration-500">
      <img 
        src="https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/StBarnabasFundRaiser27apr2026.png" 
        className="w-full rounded-[2.5rem] shadow-lg" 
        alt="St. Barnabas Fundraiser" 
      />
      
      {/* Middle Section: Photo & Payment Details */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border border-gray-100">
        <label className="relative cursor-pointer group">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-blue-300 group-hover:border-blue-500 transition-all">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="text-blue-500 w-8 h-8" />
            )}
          </div>
          <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
        </label>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">PAYBILL</span>
            <span className="text-sm font-black text-gray-900">247247</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-md">A/C</span>
            <span className="text-sm font-black text-gray-900">341009#username</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount (KES)</label>
            <input 
              type="number" required placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-lg focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">M-Pesa Number</label>
            <input 
              type="tel" required placeholder="0712..." value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-lg focus:ring-2 focus:ring-green-500" 
            />
          </div>
        </div>

        <button 
          disabled={isProcessing} 
          className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-green-700 shadow-xl transition-all"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Smartphone /> DONATE VIA M-PESA</>}
        </button>
      </form>
    </div>
  );
};
