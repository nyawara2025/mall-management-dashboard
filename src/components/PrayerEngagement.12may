import React, { useState } from 'react';
import { Heart, Hand, MessageCircle, Smile } from 'lucide-react';

export const PrayerEngagement = ({ activeShopId, serviceName, userData }: any) => {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const reactions = [
    { id: 'love', icon: <Heart className="w-5 h-5" />, label: 'Love', color: 'bg-red-500' },
    { id: 'amen', icon: <Hand className="w-5 h-5" />, label: 'Amen', color: 'bg-blue-600' },
    { id: 'shoutout', icon: <MessageCircle className="w-5 h-5" />, label: 'Shout', color: 'bg-green-600' },
    { id: 'like', icon: <Smile className="w-5 h-5" />, label: 'Like', color: 'bg-yellow-500' },
  ];

  const handleSend = async (type: string) => {
    setLastAction(type);
    await fetch('https://n8n.tenear.com/webhook/church-prayer-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shop_id: activeShopId,
        user_name: `${userData?.first_name || 'Member'}`,
        service_name: serviceName,
        action_type: type, // This now sends 'love', 'amen', etc.
        timestamp: new Date().toISOString()
      }),
    });
    setTimeout(() => setLastAction(null), 2000);
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-gray-100">
      {reactions.map((r) => (
        <button
          key={r.id}
          onClick={() => handleSend(r.id)}
          className={`flex flex-col items-center gap-1 p-3 rounded-full transition-all ${
            lastAction === r.id ? `${r.color} text-white scale-110` : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {r.icon}
          <span className="text-[8px] font-black uppercase">{r.label}</span>
        </button>
      ))}
    </div>
  );
};
