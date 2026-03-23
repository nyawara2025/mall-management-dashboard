import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, Loader2 } from 'lucide-react';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (shopId: string) => void;
}

export const VoterDiscoveryModal: React.FC<DiscoveryModalProps> = ({ isOpen, onClose, onSelectCandidate }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data options from n8n
  const [counties, setCounties] = useState<string[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  
  // Selections
  const [filters, setFilters] = useState({
    county: '',
    constituency: '',
    ward: '',
    level: ''
  });
  const [candidates, setCandidates] = useState<any[]>([]);

  // Generic helper for n8n administrative data fetching
  const fetchUnits = async (type: 'counties' | 'constituencies' | 'wards', parentValue?: string) => {
    const actionMap = {
      counties: 'fetch_county',
      constituencies: 'fetch_constituency',
      wards: 'fetch_ward'
    };

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/search-aspirants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: actionMap[type], 
          type, 
          parent: parentValue 
        })
      });
      
      const rawData = await res.json();
      console.log(`[VoterDiscovery] Raw response for ${type}:`, rawData);

      // FIX: Force data into an array if n8n returns a single object
      const data = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

      if (data.length > 0) {
        let uniqueNames: string[] = [];
        
        if (type === 'counties') {
          uniqueNames = [...new Set(data.map((item: any) => item?.county_name))].filter(Boolean) as string[];
        } else if (type === 'constituencies') {
          uniqueNames = [...new Set(data.map((item: any) => item?.constituency_name))].filter(Boolean) as string[];
        } else if (type === 'wards') {
          uniqueNames = [...new Set(data.map((item: any) => item?.ward_name))].filter(Boolean) as string[];
        }

        console.log(`[VoterDiscovery] Processed ${type}:`, uniqueNames);
        return uniqueNames.sort();
      }
      return [];
    } catch (e) {
      console.error(`[VoterDiscovery] Fetch error for ${type}:`, e);
      return [];
    }
  };

  // 1. Fetch initial Counties
  useEffect(() => {
    if (isOpen) {
      fetchUnits('counties').then(setCounties);
    }
  }, [isOpen]);

  // 2. Fetch Constituencies when County changes
  useEffect(() => {
    if (filters.county) {
      fetchUnits('constituencies', filters.county).then(setConstituencies);
      setFilters(prev => ({ ...prev, constituency: '', ward: '' }));
    }
  }, [filters.county]);

  // 3. Fetch Wards when Constituency changes
  useEffect(() => {
    if (filters.constituency) {
      fetchUnits('wards', filters.constituency).then(setWards);
      setFilters(prev => ({ ...prev, ward: '' }));
    }
  }, [filters.constituency]);

  const handleSearch = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/search-aspirants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_candidates',
          ...filters
        })
      });
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Election 2027 Discovery</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Where do you vote?</h3>
              <div className="space-y-3">
                <select 
                  className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none"
                  value={filters.county}
                  onChange={(e) => setFilters({...filters, county: e.target.value})}
                >
                  <option value="">Select County...</option>
                  {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  disabled={!filters.county}
                  className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none disabled:opacity-50"
                  value={filters.constituency}
                  onChange={(e) => setFilters({...filters, constituency: e.target.value})}
                >
                  <option value="">Select Constituency...</option>
                  {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  disabled={!filters.constituency}
                  className="w-full p-4 bg-gray-100 rounded-xl font-bold border-2 border-transparent focus:border-blue-600 outline-none disabled:opacity-50"
                  value={filters.ward}
                  onChange={(e) => setFilters({...filters, ward: e.target.value})}
                >
                  <option value="">Select Ward...</option>
                  {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <button 
                disabled={!filters.county}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg mt-4 disabled:opacity-50 active:scale-95 transition-all"
              >
                Next: Select Position
              </button>
            </div>
          )}

          {/* STEP 2: POSITION */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg mb-2">Which seat are you interested in?</h3>
              {['President', 'Governor', 'Senator', 'Women Rep', 'MP', 'MCA'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setFilters({...filters, level: pos})}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all flex justify-between items-center ${
                    filters.level === pos ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <span className="font-bold">{pos}</span>
                  {filters.level === pos && <Check size={18} />}
                </button>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-700">Back</button>
                <button 
                  onClick={handleSearch}
                  disabled={!filters.level}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg disabled:opacity-50"
                >
                  Find Candidates
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-gray-400">
                   <Loader2 className="animate-spin mb-2" />
                   <p className="font-bold">Searching Aspirants...</p>
                </div>
              ) : candidates.length > 0 ? (
                candidates.map((c) => (
                  <button
                    key={c.shop_id}
                    onClick={() => onSelectCandidate(c.shop_id)}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:shadow-md transition group text-left"
                  >
                    <img 
                      src={c.photo_url || 'https://via.placeholder.com'} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-50" 
                      alt={c.full_name}
                    />
                    <div>
                      <p className="font-black text-gray-900 group-hover:text-blue-600 transition">{c.full_name}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        {c.post_vying_for || 'Candidate'} {c.county_name ? `• ${c.county_name}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-300" />
                  </button>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="font-bold text-gray-500">No candidates found.</p>
                  <button onClick={() => setStep(1)} className="text-blue-600 font-bold mt-2 underline">Start over</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
