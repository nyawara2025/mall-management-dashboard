import React, { useState, useEffect } from 'react';
import { Loader2, Heart, Smartphone, ShieldCheck } from 'lucide-react';

export const PublicGivingPage = () => {
  // 1. Get Params from URL (?shop_id=68)
  const params = new URLSearchParams(window.location.search);
  const shopId = params.get('shop_id') || '68'; 
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch Projects for this Shop
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/church-projects-for-public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: Number(shopId), type: 'fundraising' })
        });
        const data = await response.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0) setSelectedProject(data.projects[0]);
      } catch (err) { console.error("Load failed", err); }
      finally { setIsLoading(false); }
    };
    loadProjects();
  }, [shopId]);

  // 3. Initiate MPESA STK Push
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
          project_id: selectedProject?.project_id,
          project_name: selectedProject?.project_name
        })
      });
      if (response.ok) alert("Please check your phone for the MPESA PIN prompt.");
    } catch (err) { alert("Payment initiation failed."); }
    finally { setIsProcessing(false); }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 bg-white min-h-screen">
      <img 
        src="https://supabase.co" 
        className="w-full rounded-3xl shadow-lg" 
        alt="Fundraiser" 
      />
      
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">Select Project</label>
          <select 
            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold"
            onChange={(e) => setSelectedProject(projects.find((p: any) => p.project_id === e.target.value))}
          >
            {projects.map((p: any) => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Amount (KES)</label>
            <input type="number" required placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-xl" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">MPESA Number</label>
            <input type="tel" required placeholder="0712..." value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-xl" />
          </div>
        </div>

        <button disabled={isProcessing} className="w-full py-5 bg-green-600 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-all">
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Smartphone /> DONATE VIA MPESA</>}
        </button>
      </form>
    </div>
  );
};
