import React from 'react';
import { PhoneOff } from 'lucide-react';

interface IntegratedVideoConferenceProps {
  activeCallUrl: string;
  activeCallTitle: string;
  onDisconnect: () => void;
}

export const IntegratedVideoConference: React.FC<IntegratedVideoConferenceProps> = ({
  activeCallUrl,
  activeCallTitle,
  onDisconnect,
}) => {
  const handleConfirmExit = () => {
    if (window.confirm("Are you sure you want to disconnect and leave this virtual fellowship room?")) {
      onDisconnect();
    }
  };

  return (
    <div className="flex-1 min-h-[65vh] flex flex-col bg-gray-950 relative rounded-2xl overflow-hidden shadow-inner animate-fadeIn">
      {/* Top Floating Control Bar Overlay */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 flex items-center justify-between pointer-events-none">
        <div className="text-left">
          <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
            Live Sanctuary Room
          </span>
          <h4 className="text-white font-black text-sm drop-shadow-sm mt-1">{activeCallTitle}</h4>
        </div>
        
        <button 
          type="button" 
          onClick={handleConfirmExit}
          className="pointer-events-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <PhoneOff className="w-3.5 h-3.5" /> Disconnect & Exit
        </button>
      </div>

      {/* Embedded WebRTC High-Performance VDO.Ninja Frame */}
      <iframe
        src={activeCallUrl}
        allow="camera; microphone; display-capture; autoplay; encrypted-media;"
        className="w-full flex-1 border-0 bg-gray-950 min-h-[60vh]"
        title="ChurchMate Video Portal Frame"
      />
    </div>
  );
};
