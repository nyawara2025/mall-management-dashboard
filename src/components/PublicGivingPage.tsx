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
    ? `https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/${campaignPath}`
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
              (e.target as HTMLImageElement).src = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/100Challenge001.png";
            }}
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xxl font-black text-gray-700 leading-tight">
              Join {memberName} in this noble cause.
            </h2>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
              ACK St. Barnabas 100 Day Challenge
            </p>
          </div>

          {/* Payment Instructions Card */}
          <div className="bg-white border-2 border-blue-50 rounded-[2rem] p-5 shadow-sm space-y-5">
            {/* Row: Paybill and A/C Number - STACKED FOR MOBILE SAFETY */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div className="flex flex-col">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Paybill No.</p>
                <p className="text-lg font-black text-gray-600">247247</p>
              </div>

              <div className="flex flex-col text-right">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">A/C Number</p>
                <p className="text-lg font-black text-blue-500 uppercase leading-none mt-1">
                  {mpesaAccount}
                </p>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-3">
              {/* Name Input */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  required
                  className="w-full py-3 pl-12 pr-4 bg-gray-50 rounded-xl border-none font-bold text-gray-900 text-xs"
                  placeholder="Your Name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              {/* Amount & Phone Grid */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" size={16} />
                  <input 
                    required
                    type="number"
                    className="w-full py-3 pl-12 pr-4 bg-gray-50 rounded-xl border-none font-bold text-gray-900 text-xs"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                  <input 
                    required
                    className="w-full py-3 pl-12 pr-4 bg-gray-50 rounded-xl border-none font-bold text-gray-900 text-xs"
                    placeholder="MPESA Number (07...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={isProcessing}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Smartphone size={18} />
                DONATE VIA M-PESA
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
