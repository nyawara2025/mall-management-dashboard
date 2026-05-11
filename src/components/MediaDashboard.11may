import React, { useState, useEffect } from 'react';
import { 
  Monitor, Radio, Upload, Type, Play, RefreshCw,
  ExternalLink, Calendar as CalendarIcon, X, Layout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchBranding } from './ChurchBranding';

const DEPARTMENTS = [
  { id: 1, name: 'Choir' },
  { id: 2, name: 'Youth' },
  { id: 3, name: 'Mothers Union' },
  { id: 4, name: 'KAMA' },
  { id: 5, name: 'Children' },
  { id: 6, name: 'Ushers' },
  { id: 7, name: 'Pastoral' },
  { id: 8, name: 'Media' },
  { id: 9, name: 'FCC' },
  { id: 10, name: 'CANON' },
  { id: 11, name: 'Praise & Worship'},
  { id: 12, name: 'Projects' }
];

export const MediaDashboard = () => {
  const { user } = useAuth();
  const [streamUrl, setStreamUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [overlayText, setOverlayText] = useState('');

  const [uploadCategory, setUploadCategory] = useState('video');
  const [uploadTitle, setUploadTitle] = useState('');
  
  // Planning Modal & OBS States
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isOBSOpen, setIsOBSOpen] = useState(false);
  const [obsUrl, setObsUrl] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(1);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  // Centralized n8n POST handler
  const fetchFromN8n = async (action: string, payload: any) => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/calendar-and-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id || 101,
          action,
          ...payload
        }),
      });
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`n8n error [${action}]:`, error);
      return null;
    }
  };

  const handleSync = async () => {
    setIsLoadingCalendar(true);
    const data = await fetchFromN8n('FETCH_CALENDAR', { department_id: selectedDeptId });
    setCalendarEvents(data?.events || []);
    setIsLoadingCalendar(false);
  };

  const handleOpenOBS = async () => {
    try {
      // Calling your specific OBS fetch webhook
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-OBS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id || 101,
          action: 'GET_PRODUCTION_URL',
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      // n8n should return { "url": "https://your-ubuntu-vnc-link" }
      if (data?.url) {
        setObsUrl(data.url);
        setIsOBSOpen(true);
      } else {
        alert("OBS Cloud is currently offline or unreachable.");
      }
    } catch (error) {
      console.error("Failed to fetch OBS session:", error);
    }
  };

  useEffect(() => {
    if (isPlanningOpen) handleSync();
  }, [selectedDeptId, isPlanningOpen]);

  // FULL SCREEN OBS STUDIO OVERLAY
  if (isOBSOpen) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-in fade-in duration-300">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-white font-bold text-sm tracking-widest uppercase">OBS Cloud Production Node</h2>
          </div>
          <button 
            onClick={() => setIsOBSOpen(false)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all"
          >
            EXIT STUDIO
          </button>
        </div>
        <iframe src={obsUrl} className="flex-1 w-full h-full border-none" title="OBS Studio" />
      </div>
    );
  }

  const handleCategorizedUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadTitle) {
      alert("Please enter a title and select a file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shop_id', String(user?.shop_id || 101));
    formData.append('department', String(user?.department || 1));
    formData.append('category', uploadCategory);
    formData.append('title', uploadTitle);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-mediafiles', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert(`${uploadCategory} uploaded and logged successfully!`);
        setUploadTitle(''); // Reset form
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload media.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
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
            placeholder="Enter text..."
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
          />
          <button className="mt-3 w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100">
            Push to Screen
          </button>
        </div>

        {/* 3. Asset Upload */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-500" /> Publish Content
          </h3>
  
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Content Title (e.g. Sunday Bulletin)"
              className="w-full p-2 bg-gray-50 border-none rounded-lg text-sm"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
    
            <select 
              className="w-full p-2 bg-gray-50 border-none rounded-lg text-sm text-gray-600"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
            >
              <option value="video">Video Content</option>
              <option value="image">Image / Graphic</option>
              <option value="document">Document / PDF</option>
            </select>

            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${isUploading ? 'bg-gray-100 border-gray-300' : 'hover:bg-purple-50 border-purple-100'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className={`w-8 h-8 mb-2 ${isUploading ? 'animate-bounce text-gray-400' : 'text-purple-400'}`} />
                <p className="text-xs text-gray-500 font-medium">
                  {isUploading ? 'Uploading...' : `Click to upload ${uploadCategory}`}
                </p>
              </div>
              <input type="file" className="hidden" onChange={handleCategorizedUpload} disabled={isUploading} />
            </label>
          </div>
        </div>


      </div>

      {/* Production Tools Section */}
      <div className="bg-blue-900 p-6 rounded-3xl text-white shadow-xl shadow-blue-900/20">
        <h4 className="font-bold flex items-center gap-2 mb-4">
          <ExternalLink className="w-4 h-4" /> Production Tools
        </h4>
        <div className="flex flex-wrap gap-4">
          {['vMix', 'OBS Cloud', 'EasyWorship', 'Planning Center', 'Planning'].map(tool => (
            <div 
              key={tool} 
              onClick={() => {
                if (tool === 'Planning') setIsPlanningOpen(true);
                if (tool === 'OBS Cloud') handleOpenOBS();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border border-white/10 ${
                tool === 'Planning' || tool === 'OBS Cloud' ? 'bg-blue-500 hover:bg-blue-400' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {tool === 'Planning' ? (
                <span className="flex items-center gap-2"><CalendarIcon className="w-3 h-3" /> Church Planning</span>
              ) : tool}
            </div>
          ))}
        </div>
      </div>

      {/* PLANNING MODAL */}
      {isPlanningOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="text-blue-600" /> Church Schedules
                </h2>
                <p className="text-xs text-gray-500 font-medium">Multi-department planning</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSync}
                  className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-all"
                  title="Sync with Server"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setIsPlanningOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDeptId === dept.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {isLoadingCalendar ? (
                <div className="py-20 text-center animate-pulse text-gray-400 text-sm font-bold uppercase tracking-widest">Syncing with Church Cloud...</div>
              ) : calendarEvents.length > 0 ? (
                calendarEvents.map((event) => {
                  const eventDate = new Date(event.start_time || event.created_at);
                  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                  const day = eventDate.getDate();
                  return (
                    <div key={event.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="bg-white px-3 py-2 rounded-xl shadow-sm text-center min-w-[60px] h-fit border border-gray-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase">{month}</p>
                        <p className="text-xl font-black text-gray-900 leading-none">{day}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-[9px] font-bold text-blue-600 rounded-full">Dept {event.department_id}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-gray-400 text-sm italic">No events found for this department.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
