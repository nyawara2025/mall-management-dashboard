import React, { useEffect, useState } from 'react';
import { Activity, Info } from 'lucide-react';

interface HeatmapData {
  time: string;
  love: number;
  amen: number;
  shoutout: number;
  like: number;
}

export const EngagementHeatmap = ({ shopId }: { shopId: number }) => {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-engagement-heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, action: 'GET_HEATMAP' })
      });
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Heatmap fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [shopId]);

  // Helper to determine color intensity based on count
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-50';
    if (count < 5) return 'bg-orange-100';
    if (count < 15) return 'bg-orange-300';
    if (count < 30) return 'bg-orange-500';
    return 'bg-orange-700'; // Highest intensity
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" /> Spiritual Intensity Heatmap
        </h3>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-300 cursor-help" />
          <div className="absolute right-0 top-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg w-40 z-10">
            Intensity shows reaction density in 15-min intervals.
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div className="inline-grid grid-cols-[auto_repeat(12,1fr)] gap-2 min-w-full">
          {/* Header Row: Times */}
          <div /> {/* Empty top-left corner */}
          {data.map((d, i) => (
            <div key={i} className="text-[9px] font-black text-gray-400 text-center uppercase tracking-tighter">
              {d.time}
            </div>
          ))}

          {/* Data Rows */}
          {['love', 'amen', 'shoutout'].map((type) => (
            <React.Fragment key={type}>
              <div className="text-[9px] font-black text-gray-400 uppercase flex items-center pr-2">
                {type}s
              </div>
              {data.map((d: any, i) => (
                <div 
                  key={i} 
                  className={`h-8 rounded-lg transition-all duration-500 ${getIntensityClass(d[type])}`}
                  title={`${d[type]} ${type}s at ${d.time}`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-[9px] font-black text-gray-400 uppercase">
        <span>Low</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-orange-100 rounded-sm" />
          <div className="w-3 h-3 bg-orange-300 rounded-sm" />
          <div className="w-3 h-3 bg-orange-500 rounded-sm" />
          <div className="w-3 h-3 bg-orange-700 rounded-sm" />
        </div>
        <span>High Intensity</span>
      </div>
    </div>
  );
};
