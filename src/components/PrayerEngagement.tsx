import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface PrayerEngagementProps {
  activeShopId: number;
  serviceName: string;
  userData: any;
}

export const PrayerEngagement: React.FC<PrayerEngagementProps> = ({ 
  activeShopId, 
  serviceName, 
  userData 
}) => {
  const [hasPrayed, setHasPrayed] = useState(false);

  const handlePrayClick = async () => {
    if (hasPrayed) return; // Prevent spamming
    
    setHasPrayed(true);

    try {
      await fetch('https://n8n.tenear.com/webhook/church-prayer-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: activeShopId,
          service_name: serviceName,
          user_name: `${userData?.first_name || 'A member'}`,
          action: 'PRAYER_ENGAGEMENT',
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Prayer trigger failed:', error);
    }

    // Reset button state after 5 seconds
    setTimeout(() => setHasPrayed(false), 5000);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      <button
        onClick={handlePrayClick}
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black shadow-2xl transition-all duration-700 transform hover:scale-105 active:scale-95 ${
          hasPrayed 
          ? 'bg-red-500 text-white translate-y-[-10px]' 
          : 'bg-white text-blue-600 border-2 border-blue-50'
        }`}
      >
        <div className="relative">
           <Heart className={`w-6 h-6 ${hasPrayed ? 'fill-current animate-ping' : ''}`} />
           {hasPrayed && (
             <Heart className="w-6 h-6 fill-current absolute inset-0 animate-bounce" />
           )}
        </div>
        <span className="text-sm tracking-tight">
          {hasPrayed ? 'PRAYING WITH YOU!' : 'PRAYING WITH YOU'}
        </span>
      </button>
    </div>
  );
};
