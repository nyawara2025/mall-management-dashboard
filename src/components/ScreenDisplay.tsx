import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface ProjectionPayload {
  type: 'idle' | 'video' | 'text';
  url?: string;
  content?: string;
}

export const ScreenDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Unique identity marker for this screen (e.g., ?id=living_room or ?id=altar)
  const screenId = searchParams.get('id') || 'living_room';
  const shopId = searchParams.get('shop_id') || '68';

  const [streamState, setStreamState] = useState<ProjectionPayload>({ type: 'idle' });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Establish a real-time event pipeline stream to your n8n orchestration broker
    // We append shop_id and screen_id as query parameters so n8n isolates the traffic
    const sseUrl = `https://tenear.com{shopId}&screen_id=${screenId}`;
    const eventSource = new EventSource(sseUrl);

    console.log(`📺 TV Screen Engine Active: Listening to channel [${screenId}]`);

    // 2. Listen for incoming projection events
    eventSource.onmessage = (event) => {
      try {
        const data: ProjectionPayload = JSON.parse(event.data);
        setStreamState(data);
      } catch (err) {
        console.error("Failed to parse incoming streaming frame:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection dropped. Retrying automatically...", err);
    };

    return () => {
      eventSource.close();
    };
  }, [screenId, shopId]);

  // 3. Force browser autoplay rules whenever a new video URL arrives
  useEffect(() => {
    if (streamState.type === 'video' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay blocked by TV browser security policies. Awaiting user interaction gesture.", error);
      });
    }
  }, [streamState]);

  return (
    <div className="fixed inset-0 bg-black text-white w-screen h-screen overflow-hidden flex flex-col items-center justify-center select-none font-sans">
      
      {/* IDLE STATE: Displayed when no media is actively projected */}
      {streamState.type === 'idle' && (
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-4 h-4 bg-emerald-500 rounded-full mx-auto shadow-[0_0_15px_#10b981]" />
          <p className="text-[11px] font-black tracking-widest uppercase text-slate-600">
            {screenId} Display Ready • Awaiting Command Cue
          </p>
        </div>
      )}

      {/* VIDEO STATE: HTML5 Video Player covering the full canvas viewport */}
      {streamState.type === 'video' && streamState.url && (
        <video
          ref={videoRef}
          src={streamState.url}
          autoPlay
          controls={false}
          playsInline
          className="w-full h-full object-contain bg-black animate-in fade-in duration-300"
        />
      )}

      {/* TEXT STATE: High-contrast overlay for emergency alerts or bible scripture drops */}
      {streamState.type === 'text' && streamState.content && (
        <div className="p-12 text-center max-w-5xl animate-in zoom-in-95 duration-200">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-snug bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent">
            {streamState.content}
          </h1>
        </div>
      )}

    </div>
  );
};
