import React, { useState, useEffect } from 'react';
import { BarChart3, Layers, CheckCircle2 } from 'lucide-react';

interface Tally {
  constituency_name: string;
  forms_received: number;
  total_stations: number;
  candidate_votes: number;
  competitor_votes: number;
}

export const ParallelVoteTally = ({ shopId }: { shopId: string }) => {
  const [tallies, setTallies] = useState<Tally[]>([]);

  useEffect(() => {
    if (shopId) {
      fetch('https://n8n.tenear.com/webhook/parallel-vote-tally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch_pvt_summary',
          shop_id: shopId
        })
      })
      .then(res => res.json())
      .then(data => setTallies(Array.isArray(data) ? data : []))
      .catch(err => console.error("PVT fetch error:", err));
    }
  }, [shopId]);

  const aggregateCandidate = tallies.reduce((acc, curr) => acc + curr.candidate_votes, 0);
  const aggregateCompetitor = tallies.reduce((acc, curr) => acc + curr.competitor_votes, 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart3 size={20} /></div>
        <div>
          <h3 className="text-lg font-black text-gray-900">Parallel Vote Tallying (PVT)</h3>
          <p className="text-xs text-gray-400 font-bold uppercase">Form 34A Independent Verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Your Total Count</span>
          <h2 className="text-2xl font-black text-blue-900 mt-1">{aggregateCandidate.toLocaleString()}</h2>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Closest Competitor</span>
          <h2 className="text-2xl font-black text-gray-800 mt-1">{aggregateCompetitor.toLocaleString()}</h2>
        </div>
      </div>

      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b font-black text-gray-400 uppercase tracking-wider">
              <th className="py-2">Constituency</th>
              <th className="py-2">Form Stream Progress</th>
              <th className="py-2 text-right">Your Count</th>
              <th className="py-2 text-right">Competitor</th>
            </tr>
          </thead>
          <tbody className="divide-y font-bold text-gray-700">
            {tallies.map((row, idx) => {
              const pct = row.total_stations > 0 ? Math.round((row.forms_received / row.total_stations) * 100) : 0;
              return (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-3 font-black text-gray-900 uppercase">{row.constituency_name}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2 max-w-[130px]">
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-black whitespace-nowrap">{row.forms_received}/{row.total_stations}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-blue-600 font-black">{row.candidate_votes.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-500">{row.competitor_votes.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
