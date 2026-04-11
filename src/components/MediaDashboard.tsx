import React, { useState } from 'react';
import { Monitor, Radio, Upload, Type, Play, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchBranding } from './ChurchBranding';

export const MediaDashboard = () => {
  const { user } = useAuth();
  const [streamUrl, setStreamUrl] = useState('');
  const [isLive, setIsLive] = useState(false);

  // Example: Tracking what's currently on the "Big Screen" or Livestream Overlay
  const [overlayText, setOverlayText] = useState('');

  const handleUpdateStream = async () => {
    try {
      await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id,
          action: 'UPDATE_LIVESTREAM',
          url: streamUrl,
          status: isLive ? 'LIVE' : 'OFFLINE',
          updated_by: user?.id
        }),
      });
      alert("Livestream status updated!");
    } catch (error) {
      alert("Failed to update media status.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
    <ChurchBranding departmentName="Media & Production" />  
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-600" /> Media & Production
        </h2>
        <div className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isLive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
          <Radio className="w-4 h-4" /> {isLive ? 'ON AIR' : 'OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Livestream Control Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-red-500" /> Livestream Link
          </h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="YouTube / Facebook URL..."
              className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
            />
            <button 
              onClick={() => setIsLive(!isLive)}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                isLive ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
              }`}
            >
              {isLive ? 'End Stream' : 'Go Live Now'}
            </button>
          </div>
        </div>

        {/* 2. Lower Thirds / Overlays */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-500" /> Screen Overlays
          </h3>
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Display Text (Bible Verse/Name)</p>
          <textarea 
            className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm h-24"
            placeholder="Enter text for the projector or stream..."
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
          />
          <button className="mt-3 w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100">
            Push to Screen
          </button>
        </div>

        {/* 3. Asset Upload / Sermon Recording */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-500" /> Sermon Media
          </h3>
          <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-gray-400">Drag sermon audio or slides here</p>
            <button className="mt-4 text-xs font-black text-purple-600 uppercase tracking-widest">Browse Files</button>
          </div>
        </div>

      </div>

      {/* Quick Links / External Tools */}
      <div className="bg-blue-900 p-6 rounded-3xl text-white">
        <h4 className="font-bold flex items-center gap-2 mb-4">
          <ExternalLink className="w-4 h-4" /> Production Tools
        </h4>
        <div className="flex gap-4">
          {['vMix', 'OBS Cloud', 'EasyWorship', 'Planning Center'].map(tool => (
            <div key={tool} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-medium cursor-pointer hover:bg-white/20 transition-all">
              {tool}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
