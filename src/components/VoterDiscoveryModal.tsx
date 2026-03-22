import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Check } from 'lucide-react';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate: (shopId: string) => void;
}

export const VoterDiscoveryModal: React.FC<DiscoveryModalProps> = ({ isOpen, onClose, onSelectCandidate }) => {
  const [step, setStep] = useState(1); // 1: Location, 2: Position, 3: Candidates
  const [filters, setFilters] = useState({
    county: '',
    constituency: '',
    ward: '',
    level: ''
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/search-aspirants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-900">Election 2027 Discovery</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: LOCATION SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Where do you vote?</h3>
              <select 
                className="w-full p-4 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                onChange={(e) => setFilters({...filters, county: e.target.value})}
              >
                <option value="">Select County...</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Nairobi">Nairobi</option>
              </select>
              
              {filters.county && (
                <select 
                  className="w-full p-4 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold animate-in fade-in slide-in-from-top-2"
                  onChange={(e) => setFilters({...filters, constituency: e.target.value})}
                >
                  <option value="">Select Constituency...</option>
                  <option value="Kisumu Central">Kisumu Central</option>
                </select>
              )}

              <button 
                disabled={!filters.constituency}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 mt-4"
              >
                Next: Select Position
              </button>
            </div>
          )}

          {/* STEP 2: POSITION SELECTION */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg mb-2">Which seat are you interested in?</h3>
              {['Presidential', 'Governor', 'Senator', 'MP', 'MCA'].map((pos) => (
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
                <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500">Back</button>
                <button 
                  onClick={handleSearch}
                  disabled={!filters.level}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg"
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
                <div className="py-20 text-center font-bold text-gray-400">Searching Aspirants...</div>
              ) : candidates.length > 0 ? (
                candidates.map((c: any) => (
                  <button
                    key={c.shop_id}
                    onClick={() => onSelectCandidate(c.shop_id)}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:shadow-md transition group"
                  >
                    <img src={c.photo_url} className="w-14 h-14 rounded-full object-cover border-2 border-gray-50" />
                    <div className="text-left">
                      <p className="font-black text-gray-900 group-hover:text-blue-600 transition">{c.full_name}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase">{c.post_vying_for}</p>
                    </div>
                    <ChevronRight className="ml-auto text-gray-300" />
                  </button>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="font-bold text-gray-400">No candidates found for this area yet.</p>
                  <button onClick={() => setStep(1)} className="text-blue-600 font-bold mt-2">Try different location</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
