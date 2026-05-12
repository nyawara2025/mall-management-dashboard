import React, { useEffect, useState, useMemo } from 'react';
import { Heart, Smile, Hand, Play, MessageCircle, Clock, Hash, Activity } from 'lucide-react';

interface EngagementEvent {
  id: string;
  user_name: string;
  action_type: 'like' | 'love' | 'amen' | 'shoutout' | 'PRAYER_ENGAGEMENT';
  platform: 'hub' | 'youtube';
  timestamp: string;
}

export const LivePrayerFeed = ({ shopId }: { shopId: number }) => {
  const [events, setEvents] = useState<EngagementEvent[]>([]);

  // Tallying: Calculate totals for the current session
  const tallies = useMemo(() => {
    return events.reduce((acc, curr) => {
      // Map PRAYER_ENGAGEMENT to the 'love' tally category
      const typeKey = curr.action_type === 'PRAYER_ENGAGEMENT' ? 'love' : curr.action_type;
      acc[typeKey] = (acc[typeKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-fetch-prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, action: 'GET_LIVE' })
      });
      const data = await response.json();
      
      // Filter out events older than 2 minutes (120000 ms)
      const nowUtc = new Date().getTime();
      const rawData = Array.isArray(data) ? data : [];

      const activePrompts = rawData.filter(e => {
        const eventTimeUtc = new Date(e.created_at).getTime();
        const diffMinutes = (nowUtc - eventTimeUtc) / 60000;
        return diffMinutes >= 0 && diffMinutes <= 2; 
      });

      setEvents(activePrompts);
    } catch (e) {
      console.error("n8n fetch error", e);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 8000); // Poll every 8s for freshness
    return () => clearInterval(interval);
  }, [shopId]);

  const getActionIcon = (type: string, platform: string) => {
    const color = platform === 'youtube' ? "text-red-500" : "text-blue-600";
    switch (type) {
      case 'PRAYER_ENGAGEMENT': // Match your n8n output exactly
      case 'love': 
        return <Heart className={`w-4 h-4 fill-current ${color}`} />;
      case 'amen': 
        return <Hand className={`w-4 h-4 ${color}`} />;
      case 'shoutout': 
        return <MessageCircle className={`w-4 h-4 ${color}`} />;
      default: 
        return <Smile className={`w-4 h-4 ${color}`} />;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Tally Header */}
      <div className="flex justify-around mb-6 pb-4 border-b border-gray-50">
        {['love', 'amen', 'shoutout'].map(type => (
          <div key={type} className="flex flex-col items-center">
            <span className="text-lg font-black text-gray-900">{tallies[type] || 0}</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">{type}s</span>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
        {events.length === 0 ? (
          <p className="text-center text-gray-300 py-10 text-xs font-bold uppercase tracking-widest">Waiting for reactions...</p>
        ) : (
          events.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-right-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {getActionIcon(e.action_type, e.platform)}
                  {e.platform === 'youtube' && (
                    <Play className="w-3 h-3 text-red-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {e.user_name} <span className="text-gray-400 font-medium">sent an {e.action_type}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
