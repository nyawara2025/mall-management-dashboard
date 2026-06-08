import React, { useState } from 'react';
import { Monitor, Video, Loader2 } from 'lucide-react';

export const MediaControlsCard: React.FC = () => {
  // Paste your copied public Supabase video link here as the default text value
  const [videoUrl, setVideoUrl] = useState('https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/video_2026-04-20_21-55-12.mp4');
  const [isPushing, setIsPushing] = useState(false);

  const handlePushVideo = async () => {
    if (!videoUrl.trim()) return;
    setIsPushing(true);

    try {
      // Spelled-out production target URL string construction
      const n8nTargetUrl = 'https://n8n.tenear.com/webhook/screen-stream-gateway';
      const fullQueryUrl = `${n8nTargetUrl}?action=push&video_url=${encodeURIComponent(videoUrl)}`;

      // Fire a quick GET request to push the new video into n8n memory
      const response = await fetch(fullQueryUrl, { method: 'GET' });

      if (response.ok) {
        alert('🚀 Video successfully pushed to n8n memory layer!');
      } else {
        alert('⚠️ Processing pipeline rejected transmission.');
      }
    } catch (err) {
      console.error('Network request failed:', err);
      alert('❌ Pipeline connection error.');
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-left space-y-4">
      <div>
        <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Monitor className="w-4 h-4 text-blue-600" /> Sanctuary Overlays Projector
        </h3>
        <p className="text-[11px] text-gray-400 font-medium">
          Broadcast your uploaded mobile phone footage directly to the active living room screen.
        </p>
      </div>

      {/* Video URL Input Field */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
          Supabase Video Storage URL Link
        </label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste your public mp4 link path here..."
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
        />
      </div>

      {/* Submission Control Button */}
      <button
        type="button"
        disabled={isPushing}
        onClick={handlePushVideo}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
      >
        {isPushing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Transmitting Command...
          </>
        ) : (
          <>
            <Video className="w-3.5 h-3.5" /> Project Video Footage
          </>
        )}
      </button>
    </div>
  );
};
