import React, { useState, useEffect } from 'react';

export function CandidateDiscovery() {
  const [filters, setFilters] = useState({ county: '', constituency: '', ward: '', level: 'Presidential' });
  const [results, setResults] = useState([]);

  // Fetch candidates based on the changing filters
  useEffect(() => {
    async function searchCandidates() {
      const response = await fetch('https://n8n.tenear.com/webhook/political-candidate', {
        method: 'POST',
        body: JSON.stringify(filters)
      });
      const data = await response.json();
      setResults(data);
    }
    searchCandidates();
  }, [filters]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black mb-6">Find Your Candidates</h1>
      
      {/* Selection UI */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <select 
          className="p-4 rounded-xl border shadow-sm"
          onChange={(e) => setFilters({...filters, county: e.target.value})}
        >
          <option>Select County (e.g., Kisumu, Nairobi...)</option>
          {/* Map your counties here */}
        </select>

        <select 
          className="p-4 rounded-xl border shadow-sm"
          onChange={(e) => setFilters({...filters, level: e.target.value})}
        >
          <option value="Presidential">Presidential</option>
          <option value="Governor">Governor</option>
          <option value="MP">Member of Parliament</option>
          <option value="MCA">MCA</option>
        </select>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        {results.map((candidate: any) => (
          <div 
            key={candidate.shop_id}
            onClick={() => window.location.href = `/hub?shop_id=${candidate.shop_id}`}
            className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100"
          >
            <img src={candidate.photo_url} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-lg">{candidate.full_name}</h3>
              <p className="text-xs text-blue-600 font-bold uppercase">{candidate.post_vying_for}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
