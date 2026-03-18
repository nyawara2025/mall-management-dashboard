import React, { useEffect, useState } from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';

interface Hotspot {
  city: string;
  region: string;
  total_views: number;
}

export function ConstituencyHotspots({ shopId }: { shopId: string }) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFromN8n() {
      if (!shopId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch('https://n8n.tenear.com/webhook/get-political-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: shopId,
            action: 'fetch_hotspots' 
          })
        });
      
        if (!response.ok) throw new Error('Failed to fetch from n8n');
        
        const data = await response.json();
        // Ensure we handle n8n's common return formats (array or single object)
        const results = Array.isArray(data) ? data : (data.results || []);
        setHotspots(results);
      } catch (err) {
        console.error('N8N Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFromN8n();
  }, [shopId]);

  const maxViews = hotspots.length > 0 ? Math.max(...hotspots.map(h => h.total_views)) : 1;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" /> Constituency Hotspots
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-primary-600" />
        </div>
      ) : hotspots.length > 0 ? (
        <div className="space-y-4">
          {hotspots.map((spot, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{spot.city || spot.region}</span>
                <span className="text-gray-500">{spot.total_views} views</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(spot.total_views / maxViews) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No hotspot data found yet.</p>
        </div>
      )}
    </div>
  );
}
