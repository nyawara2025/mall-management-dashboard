import React, { useEffect, useState } from 'react';
import { Heart, Activity, Church } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize the client locally for this component
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PrayerEvent {
  user_name: string;
  service_name: string;
  timestamp: string;
}

export const LivePrayerFeed = ({ shopId }: { shopId: number }) => {
  const [prayers, setPrayers] = useState<PrayerEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channelName = `church_engagement_${shopId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on('broadcast', { event: 'PRAYER_ALERT' }, (payload: { payload: PrayerEvent }) => {
        setPrayers((prev) => [payload.payload, ...prev.slice(0, 4)]);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setIsConnected(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-xl h-full flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-gray-300'}`} />
          Live Engagement
        </h3>
        {prayers.length > 0 && (
          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg animate-pulse">
            LIVE
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-hidden">
        {prayers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-50 rounded-[2rem]">
            <Church className="w-10 h-10 text-gray-200 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
              Waiting for engagement...
            </p>
          </div>
        ) : (
          prayers.map((prayer, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 animate-in slide-in-from-right-8 duration-500"
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                <Heart className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate">{prayer.user_name}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase truncate">{prayer.service_name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
