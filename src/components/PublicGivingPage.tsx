import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Smartphone, User, Heart, MapPin } from 'lucide-react';

export const PublicGivingPage = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [donorName, setDonorName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. DYNAMIC ASSETS: Reconstructing data from n8n URL parameters
  const shopId = searchParams.get('shop_id') || '68';
  const memberName = searchParams.get('member_name') || 'a Church Member';
  const campaignPath = searchParams.get('campaign_img'); 
  
  // FIX: Full functional path to your specific Supabase Project and Storage API
  const selectedGraphic = campaignPath 
    ? `https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/{campaignPath}`
    : "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material";

  // FIX: Dynamic M-PESA Account based on the sharing member
  const mpesaAccount = `341009#${memberName.replace(/\s/g, '').toUpperCase()}`;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: Number(shopId),
          amount: Number(amount),
          phone: phone.startsWith('0') ? '254' + phone.slice(1) : phone,
          donor_name: donorName || 'Well Wisher',
          referred_by: memberName,
          project_id: searchParams.get('project_id') || "100_day_challenge"
        })
      });

      if (response.ok) {
        alert("Praise God! Please check your phone for the M-Pesa PIN prompt.");
      }
    } catch (err) {
      alert("Payment initiation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Dynamic Campaign Header */}
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        <div className="relative aspect-[1.91/1] overflow-hidden">
          <img 
            src={selectedGraphic} 
            className="w-full h-full object-cover"
            alt="St. Barnabas Fundraiser" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/{{ $json.project_url }}";
            }}
          />
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Join {memberName} in building the Sanctuary Project
            </h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              ACK St. Barnabas 100 Day Challenge
            </p>
          </div>

          {/* Payment Instructions Card */}
          <div className="bg-white border-2 border-blue-50 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Paybill No.</p>
                <p className="text-2xl font-black text-gray-900">247247</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">A/C Number</p>
                <p className="text-2xl font-black text-blue-600 uppercase">{mpesaAccount}</p>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-4 text-gray-400" size={20} />
                <input 
                  required
                  className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none font-bold text-gray-900"
                  placeholder="Your Name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Heart className="absolute left-4 top-4 text-orange-400" size={20} />
                  <input 
                    required
                    type="number"
                    className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none font-bold text-gray-900"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-4 text-blue-400" size={20} />
                  <input 
                    required
                    className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none font-bold text-gray-900"
                    placeholder="0712..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={isProcessing}
                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Smartphone size={24} />
                    DONATE VIA M-PESA
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-[10px] text-center text-gray-400 font-bold px-8 leading-relaxed">
            All contributions go directly to the ACK St. Barnabas Development Fund. 
            Thank you for your generous support.
          </p>
        </div>
      </div>
    </div>
  );
};
