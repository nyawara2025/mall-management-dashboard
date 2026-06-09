import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const ScreenDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id') || '68';

  // Create a completely unique, secure meeting room hash for this church branch
  const roomName = `TeNEAR-Church-Presentation-Channel-${shopId}`;

  // Build the clean stream path using the public global Jitsi network infrastructure
  // We append configuration variables directly to the URL string to force a silent, full-screen layout
  const streamUrl = `https://jit.si{roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=[]&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

  return (
    <div className="fixed inset-0 bg-black w-screen h-screen overflow-hidden z-[999]">
      <iframe
        src={streamUrl}
        allow="camera; microphone; display-capture"
        className="w-full h-full border-none absolute inset-0 select-none"
        title="Sanctuary Display Receiver Node"
      />
    </div>
  );
};
