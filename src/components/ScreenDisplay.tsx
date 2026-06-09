import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const ScreenDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id') || '68';

  // Create a completely unique, secure meeting room hash for this church branch
  const streamRoomId = "TeNEAR-Sanctuary-Cast-Channel-" + shopId;

  // Build the clean stream path using the public global Jitsi network infrastructure
  // We append configuration variables directly to the URL string to force a silent, full-screen layout
  const streamUrl = "https://vdo.ninja/?view=TeNEAR-Sactuary-Cast-Channel-68&autoplay=1&cleanoutput&transparent&mute=1";

  return (
    <div className="fixed inset-0 bg-black w-screen h-screen overflow-hidden z-50">
      
      {/* Tap-to-Unlock Overlay Banner for Mobile and Tablet WebOS Browsers */}
      <div 
        onClick={(e) => e.currentTarget.style.display = 'none'}
        className="absolute inset-0 z-50 bg-black/40 flex flex-col items-center justify-center cursor-pointer p-6 animate-pulse"
      >
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center max-w-xs shadow-2xl">
          <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">
            Tap Screen Once
          </p>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            Click anywhere on this display to unlock and activate the live sanctuary video feed.
          </p>
        </div>
      </div>

      <iframe
        src={streamUrl}
        allow="camera; microphone; display-capture; autoplay"
        className="w-full h-full border-none absolute inset-0 select-none"
        title="Sanctuary Display Receiver Node"
      />
    </div>
  );
}
