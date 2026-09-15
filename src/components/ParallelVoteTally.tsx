import React, { useEffect, useState } from 'react';
import { BarChart3, Loader2, PieChart } from 'lucide-react';

interface Competitor {
  candidate_id: string;
  candidate_name: string;
  party_affiliation: string;
  vote_count: number;
  is_main_rival: boolean;
}

interface ParallelVoteTallyProps {
  shopId: string;
}

export const ParallelVoteTally: React.FC<ParallelVoteTallyProps> = ({ shopId }) => {
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState({ name: 'Hon. Candidate', votes: 0 });
  const [opponents, setOpponents] = useState<Competitor[]>([]);

  useEffect(() => {
    const streamTallyResults = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://n8n.tenear.com/webhook/stream-tallying-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId })
        });
        const data = await response.json();
        
        setCandidateData({
          name: data.candidate_name || "Hon. Aspirant",
          votes: Number(data.candidate_votes || 0)
        });
        setOpponents(data.opponents || []);
      } catch (err) {
        console.error("Parallel vote stream failure:", err);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) streamTallyResults();
  }, [shopId]);

  const aggregateVoterPool = candidateData.votes + opponents.reduce((acc, curr) => acc + Number(curr.vote_count || 0), 
0);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center 
justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-xs text-gray-500 italic">Streaming live parallel constituency returns...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <PieChart className="w-5 h-5 text-blue-600" /> Parallel Vote Standings
        </h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          Total Cast: {aggregateVoterPool.toLocaleString()}
        </span>
      </div>

      {/* Main Candidate Card Progress Bar */}
      <div className="bg-blue-50/70 border border-blue-100/60 rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-extrabold text-blue-900">{candidateData.name} <span className="font-normal text-xs 
text-blue-600">(Our Candidate)</span></span>
          <span className="font-black text-blue-700">
            {candidateData.votes.toLocaleString()} ({aggregateVoterPool > 0 ? ((candidateData.votes / 
aggregateVoterPool) * 100).toFixed(1) : 0}%)
          </span>
        </div>
        <div className="w-full bg-blue-200/60 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
            style={{ width: `${aggregateVoterPool > 0 ? (candidateData.votes / aggregateVoterPool) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Complete Dynamic Scroll-List Iterating Over Every Opponent */}
      <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
        {opponents.length > 0 ? (
          opponents.map((opp) => {
            const oppPct = aggregateVoterPool > 0 ? (Number(opp.vote_count || 0) / aggregateVoterPool) * 100 : 0;
            return (
              <div key={opp.candidate_id} className={`border rounded-xl p-3 space-y-1.5 ${opp.is_main_rival ? 
'bg-amber-50/40 border-amber-100' : 'bg-gray-50/40 border-gray-100'}`}>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-800">{opp.candidate_name}</span>
                    <span className="ml-2 font-semibold text-[9px] text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded 
uppercase tracking-wider">{opp.party_affiliation}</span>
                    {opp.is_main_rival && <span className="ml-1.5 text-[9px] text-amber-700 font-bold bg-amber-100 
px-1 rounded">Closest Rival</span>}
                  </div>
                  <span className="font-bold text-gray-600">
                    {Number(opp.vote_count || 0).toLocaleString()} ({oppPct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${opp.is_main_rival ? 'bg-amber-500' 
: 'bg-gray-400'}`}
                    style={{ width: `${oppPct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-400 flex flex-col items-center justify-center border 
border-dashed rounded-xl border-gray-200">
            <BarChart3 className="w-8 h-8 opacity-20 mb-1" />
            <p className="text-xs italic">No opponents tracked inside this region pool.</p>
          </div>
        )}
      </div>
    </div>
  );
};
