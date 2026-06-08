import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface ProjectionPayload {
  type: 'idle' | 'video' | 'text';
  url?: string;
  content?: string;
}

export const ScreenDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const screenId = searchParams.get('id') || 'living_room';
  const shopId = searchParams.get('shop_id') || '68';

  const [streamState, setStreamState] = useState<ProjectionPayload>({ type: 'idle' });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log(`📺 TV Polling Active: Querying [${screenId}] every 2 seconds.`);

    const checkForMediaUpdates = async () => {
      try {
        // Spelled out target endpoint destination:
        // h t t p s : / / n 8 n . t e n e a r . c o m / w e b h o o k / s c r e e n - s t r e a m - g a t e w a y ? a c t i o n = g e t
        const targetUrl = `https://n8n.tenear.com/webhook/screen-stream-gateway?action=get`;
        
        const response = await fetch(targetUrl, { method: 'GET' });
        
        if (response.ok) {
          const data: ProjectionPayload = await response.json();
          
          // Only change state memory layers if incoming payload variables differ
          setStreamState((prevState) => {
            if (prevState.url === data.url && prevState.type === data.type && prevState.content === data.content) {
              return prevState;
            }
            return data;
          });
        }
      } catch (err) {
        console.error("Polling database network mismatch error:", err);
      }
    };

    // Run verification instantly on load, then loop every 2000 milliseconds
    checkForMediaUpdates();
    const intervalId = setInterval(checkForMediaUpdates, 2000);

    return () => clearInterval(intervalId);
  }, [screenId, shopId]);

  // Handle browser video player reloading rules
  useEffect(() => {
    if (streamState.type === 'video' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay blocked by standard browser security limits.", error);
      });
    }
  }, [streamState]);

  return (
    <div className="fixed inset-0 bg-black text-white w-screen h-screen overflow-hidden flex flex-col items-center justify-center select-none font-sans">
      
      {/* 🟢 IDLE STATE */}
      {streamState.type === 'idle' && (
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-4 h-4 bg-emerald-500 rounded-full mx-auto shadow-[0_0_15px_#10b981]" />
          <p className="text-[11px] font-black tracking-widest uppercase text-slate-600">
            {screenId} Display Ready • Awaiting Command
          </p>
        </div>
      )}

      {/* 🎬 VIDEO PLAYER CANVAS SCREEN */}
      {streamState.type === 'video' && streamState.url && (
        <video
          ref={videoRef}
          src={streamState.url}
          autoPlay
          muted
          controls={false}
          playsInline
          className="w-full h-full object-contain bg-black"
        />
      )}

      {/* 📺 NEW: YOUTUBE EMBED MODULE SPECIFICALLY FOR SMART TV HARDWARE COMPATIBILITY */}
      {streamState.type === 'video' && streamState.url && (streamState.url.includes('youtube.com') || streamState.url.includes('youtu.be')) && (
        <div className="w-full h-screen absolute inset-0 bg-black animate-in fade-in duration-300">
          <iframe
            className="w-full h-full border-0 pointer-events-none"
            src={`https://youtube.com{
              streamState.url.includes('youtu.be/') 
                ? streamState.url.split('youtu.be/')[1].split('?')[0] 
                : streamState.url.split('v=')[1].split('&')[0]
            }?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1`}
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* 📝 OVERLAY CAPTIONS LAYOUT SCREEN */}
      {streamState.type === 'text' && streamState.content && (
        <div className="p-12 text-center max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-black text-white leading-snug">
            {streamState.content}
          </h1>
        </div>
      )}

    </div>
  );
};
