import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Smartphone, User, Heart } from 'lucide-react';

export const PublicGivingPage = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [donorName, setDonorName] = useState(''); 
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. DYNAMIC ASSETS: Read from URL params sent by the member
  const shopId = searchParams.get('shop_id') || '68';
  const memberName = searchParams.get('member_name') || 'a Church Member';
  const projectName = searchParams.get('project_name') || 'the Sanctuary Project'
  const campaignPath = searchParams.get('campaign_img');

  const customPortrait = searchParams.get('custom_photo');

  // Construct the full URL if a campaign_img exists, otherwise use the master poster
  const selectedGraphic = campaignPath 
    ? `https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/{campaignPath}`
    : "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material";


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const formattedName = donorName.startsWith('#') ? donorName : `#${donorName}`;
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: Number(shopId),
          amount: Number(amount),
          phone: phone.startsWith('0') ? '254' + phone.slice(1) : phone,
          donor_name: formattedName, 
          // Capture who shared the link for the leaderboard/attribution
          referred_by: memberName, 
          project_id: searchParams.get('project_id') || "general_allocation"
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
      
      {/* 2. DYNAMIC CAMPAIGN HEADER */}
      <div className="relative">
        <img 
          src={selectedGraphic} 
          className="w-full rounded-[2.5rem] shadow-lg mb-4" 
          alt="Church Fundraiser" 
        />
        
        {/* Personalized "Family Portrait" Overlay */}
        {customPortrait && (
          <div className="absolute -bottom-4 right-4 flex items-center gap-3 bg-white p-2 rounded-3xl shadow-xl border border-blue-50">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-inner">
              <img src={customPortrait} className="w-full h-full object-cover" alt="Member" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Support with</p>
              <p className="text-xs font-black text-gray-900">{memberName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
        <h2 className="text-xl font-black text-gray-900 leading-tight">
          Join {memberName} in building {projectName}
        </h2>
      </div>

      {/* 3. DYNAMIC HASHTAG INPUT */}
      <div className="grid grid-cols-1 gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Paybill No.</span>
            <span className="text-xl font-black text-gray-900">247247</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">A/C Number</span>
            <span className="text-sm font-black text-gray-900 block">341009#{donorName || 'username'}</span>
          </div>
        </div>

        <div className="relative group">
          <User className="absolute left-4 top-4 text-gray-400" size={18} />
          <input 
            type="text" required placeholder="Enter Name (e.g. The Nyawaras)" 
            value={donorName} 
            onChange={(e) => setDonorName(e.target.value.replace('#', ''))} 
            className="w-full pl-12 p-4 bg-white rounded-2xl border border-gray-100 font-bold text-sm outline-none" 
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
          className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-green-700 shadow-xl transition-all"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Smartphone /> DONATE VIA M-PESA</>}
        </button>
      </form>
    </div>
  );
};
