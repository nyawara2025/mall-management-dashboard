import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const MediaPresentationController: React.FC = () => {
  const { user } = useAuth();
  const shopId = user?.shop_id || 68;
  const roomName = `TeNEAR-Church-Presentation-Channel-${shopId}`;

  // The controller URL template includes full toolbars so the media team can control the screen share
  const controllerUrl = `https://jit.si{roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-sm font-black tracking-widest uppercase text-blue-400">Live Screen Broadcast Console</h2>
          <p className="text-[11px] text-slate-400">Cast your browser tab smoothly to all sanctuary big screens.</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Left Side: Step-by-Step Instructions Panel */}
        <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-4 h-fit">
          <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">How to Start Presentation</h3>
          <ol className="text-xs text-slate-400 space-y-3 list-decimal pl-4 font-medium leading-relaxed">
            <li>Open a separate browser tab, log in as a member, and navigate to the application dashboard.</li>
            <li>In the video frame on the right, click the **Share Your Screen** icon (the small display monitor button in the toolbar).</li>
            <li>Select **Chrome Tab** or **Browser Tab** and choose your open application view tab.</li>
          </ol>
        </div>

        {/* Right Side: Embedded Live Streaming Stream Frame Container */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px] shadow-2xl relative">
          <iframe
            src={controllerUrl}
            allow="camera; microphone; display-capture"
            className="w-full h-full border-none"
            title="Media Desk Broadcast Broadcaster Node"
          />
        </div>
      </div>
    </div>
  );
};
