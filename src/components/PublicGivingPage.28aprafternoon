import React, { useState } from 'react';
import { Loader2, Smartphone, Camera, User } from 'lucide-react';

export const PublicGivingPage = () => {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [donorName, setDonorName] = useState(''); // New state for username
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
    
    // Ensure the name is sent with a hashtag for the database/logs
    const formattedName = donorName.startsWith('#') ? donorName : `#${donorName}`;

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: 68,
          amount: Number(amount),
          phone: phone.startsWith('0') ? '254' + phone.slice(1) : phone,
          donor_name: formattedName, // Capturing the user-inputted name
          project_id: "general_allocation",
          project_name: "General Church Project Fund",
          photo_base64: preview // Sending the photo to n8n for storage
        })
      });

      if (response.ok) alert("Praise God! Please check your phone for the M-Pesa PIN prompt.");
    } catch (err) {
      alert("Payment initiation failed. Please try again.");
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
      
      {/* 1. Enlarged Photo Upload Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Your Portrait (Family/Couple)</label>
        <label className="relative cursor-pointer group block">
          <div className="w-full h-48 rounded-[2rem] bg-blue-50 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-blue-200 group-hover:border-blue-400 transition-all">
            {preview ? (
              <img src={preview} alt="Donor Portrait" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2">
                <Camera className="text-blue-500 w-10 h-10 mx-auto" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Tap to add photo</span>
              </div>
            )}
          </div>
          <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
        </label>
      </div>

      {/* 2. Manual Username Input & Paybill Details */}
      <div className="grid grid-cols-1 gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Paybill No.</span>
            <span className="text-xl font-black text-gray-900">247247</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">A/C Number</span>
            <span className="text-sm font-black text-gray-900 block truncate max-w-[150px]">
              341009#{donorName || 'username'}
            </span>
          </div>
        </div>

        <div className="relative group">
          <User className="absolute left-4 top-4 text-gray-400" size={18} />
          <input 
            type="text" required placeholder="Enter Your Name (e.g. The Nyawaras)" 
            value={donorName} onChange={(e) => setDonorName(e.target.value)}
            className="w-full pl-12 p-4 bg-white rounded-2xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (KES)</label>
            <input 
              type="number" required placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-lg focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">M-Pesa Number</label>
            <input 
              type="tel" required placeholder="0712..." value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-lg focus:ring-2 focus:ring-green-500" 
            />
          </div>
        </div>

        <button 
          disabled={isProcessing} 
          className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-[0.98]"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Smartphone /> DONATE VIA M-PESA</>}
        </button>
      </form>
    </div>
  );
};
