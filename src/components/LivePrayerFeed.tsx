import React, { useEffect, useState } from 'react';
import { Heart, Activity } from 'lucide-react';

export const LivePrayerFeed = ({ shopId }: { shopId: number }) => {
  const [prayers, setPrayers] = useState<any[]>([]);

  const fetchPrayers = async () => {
    try {
      // Strictly fetching via n8n as per your requirement
      const response = await fetch('https://n8n.tenear.com/webhook/church-fetch-prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, action: 'GET_RECENT' })
      });
      const data = await response.json();
      setPrayers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("n8n fetch error", e);
    }
  };

  useEffect(() => {
    fetchPrayers(); // Initial fetch
    const interval = setInterval(fetchPrayers, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [shopId]);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
       <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-green-500" /> Live Engagement
      </h3>
      <div className="space-y-3">
        {prayers.map((p, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <div className="text-sm font-bold text-gray-800">{p.user_name} is praying</div>
          </div>
        ))}
      </div>
    </div>
  );
};
