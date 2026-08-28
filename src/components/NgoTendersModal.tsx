import React, { useState, useEffect } from 'react';
import { X, MapPin, Briefcase, ShieldAlert, FileText, ChevronRight, Filter } from 'lucide-react';

interface NgoTendersModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | null;
  ngoId?: string; // Optional baseline fallback
}

interface Tender {
  id: string;
  tender_id: string;
  title: string;
  category: string;
  region: string;
  source_url: string;
  closing_date: string;
  ngo_id: string;
}

export const NgoTendersModal: React.FC<NgoTendersModalProps> = ({ 
  isOpen, 
  onClose, 
  shopId
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // 🎯 Local State to handle dropdown filtering internally without touching Parent
  const [selectedNgo, setSelectedNgo] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen && shopId) {
      fetchTenders();
    }
  }, [isOpen, shopId, selectedNgo]); // Refetches automatically whenever the dropdown selection changes

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shop_id: parseInt(shopId!, 10),
          ngo_id: selectedNgo // Sends 'ALL', 'IFRC', etc. cleanly to your n8n middleware node
        })
      });
      const data = await res.json();
      if (data) setTenders(data);
    } catch (err) {
      console.error("Error pulling database NGO tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b pb-4 mb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight text-emerald-600 flex items-center gap-1.5">
              <Briefcase className="w-5 h-5" /> Other INGO Tenders
            </h3>
            <p className="text-xs text-slate-400 font-medium">Scraped multi-agency procurement logistics network</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📊 INLINE DROPDOWN SELECTOR: Managed completely inside this child element */}
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="w-full">
            <label className="text-[9px] text-slate-400 font-black block uppercase tracking-wide mb-0.5">Filter by Agency / NGO Source</label>
            <select 
              className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer" 
              value={selectedNgo} 
              onChange={e => setSelectedNgo(e.target.value)}
            >
              <option value="ALL">🌐 View All Available INGOs</option>
              <option value="IFRC">🔴 International Red Cross (IFRC)</option>
              <option value="WFP">🌾 World Food Programme (WFP)</option>
              <option value="UNICEF">🍼 UNICEF Logistics</option>
              <option value="SAVE_THE_CHILDREN">🇬🇧 Save the Children</option>
            </select>
          </div>
        </div>
        
        {/* Content Listings Container Block */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {loading ? (
            <div className="text-center text-xs text-slate-400 py-10 italic font-medium animate-pulse">
              Querying {selectedNgo === 'ALL' ? 'all tenders' : selectedNgo} matrix from database...
            </div>
          ) : tenders.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-10 italic border border-dashed rounded-xl bg-slate-50/50">
              No active {selectedNgo === 'ALL' ? 'INGO' : selectedNgo} logistics tenders found for your workspace criteria.
            </div>
          ) : (
            tenders.map((tender) => (
              <div key={tender.id || tender.tender_id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/45 hover:border-emerald-200 
transition-all shadow-xs">
                <div className="flex flex-col mb-2">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[9px] text-slate-400 font-mono tracking-tight">ID: {tender.tender_id}</span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 font-black px-1.5 py-0.5 rounded border border-blue-100 uppercase 
tracking-wider">{tender.ngo_id}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 leading-tight uppercase">{tender.title}</h4>
                </div>
                
                <div className="space-y-1 mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600 font-semibold">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Region: <span className="text-slate-800 
font-bold">{tender.region}</span></p>
                  <p className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Category: <span className="text-blue-600 
font-bold">{tender.category}</span></p>
                  <p className="flex items-center gap-1.5 text-red-600"><ShieldAlert className="w-3.5 h-3.5" /> Checked On: <span 
className="font-bold">{tender.closing_date}</span></p>
                </div>

                <div className="mt-3.5 pt-1">
                  <a 
                    href={tender.source_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] tracking-wider py-2 rounded-xl flex items-center 
justify-center gap-1.5 uppercase transition-all shadow-xs text-center"
                  >
                    <FileText className="w-3.5 h-3.5 inline" /> Download Bid Documents <ChevronRight className="w-3 h-3 inline" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
