import React, { useState, useEffect } from 'react';
import { 
  Monitor, Radio, Upload, Type, Play, RefreshCw,
  ExternalLink, Calendar as CalendarIcon, X, Layout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchBranding } from './ChurchBranding';
import { LivePrayerFeed } from './LivePrayerFeed';
import { EngagementHeatmap } from './EngagementHeatmap';

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

    // Dynamically look up the clean string text name from your existing DEPARTMENTS array
    const matchedDept = DEPARTMENTS.find(d => d.id === (payload.department_id || selectedDeptId));
    const currentDeptName = matchedDept ? matchedDept.name : 'General';

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/calendar-and-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          shop_id: user?.shop_id || 101,
          action,

          // Appends the raw string name so your n8n filter logic runs cleanly
          department_name: currentDeptName,
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

  const handleToggleLive = async (status: 'ON' | 'OFF') => {
    if (status === 'ON' && !streamUrl) {
      alert("Please enter a YouTube Live URL first!");
      return;
    }

    setIsLive(status === 'ON');

    try {
      await fetch('https://n8n.tenear.com/webhook/youTubeLive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id || 68,
          action: status === 'ON' ? 'GO_LIVE' : 'GO_OFFLINE',
          url: streamUrl,
          service_name: "Morning Glory", // This can be dynamic based on your schedule
          timestamp: new Date().toISOString()
        }),
      });
    
      if (status === 'OFF') setStreamUrl(''); // Reset on offline
    } catch (error) {
      console.error("Failed to update live status:", error);
    }
  };

  const handleCategorizedUpload = async (event?: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target.files?.[0];

    // 2. Validation logic
    if (!uploadTitle) {
      alert("Please enter a title.");
      return;
    }

    if (uploadCategory !== 'youtube_live' && !file) {
      alert("Please select a file.");
      return;
    }

    if (!uploadTitle) {
      alert("Please enter a title.");
      return;
    }

    setIsUploading(true);

    try {
      let payload: BodyInit;
      let headers: HeadersInit = {};

      if (uploadCategory === 'youtube_live') {
        // Send as JSON for URLs
        payload = JSON.stringify({
          shop_id: user?.shop_id || 101,
          department: user?.department || 1,
          category: 'youtube_live',
          title: uploadTitle,
          url: streamUrl
        });
        headers = { 'Content-Type': 'application/json' };
      } else {

        const formData = new FormData();
        formData.append('file', file!);
        formData.append('shop_id', String(user?.shop_id || 101));
        formData.append('department', String(user?.department || 1));
        formData.append('category', uploadCategory);
        formData.append('title', uploadTitle);
        payload = formData;
        // Note: Don't set Content-Type header for FormData, browser does it automatically
      }
   
      const response = await fetch('https://n8n.tenear.com/webhook/church-mediafiles', {
        method: 'POST',
        headers: headers,
        body: payload,
      });

      if (response.ok) {
        alert(`${uploadCategory === 'youtube_live' ? 'Live link' : uploadCategory} published!`);
        setUploadTitle(''); // Reset form
        setStreamUrl('');
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
        <div className={`px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
          isLive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'
        }`}>
          <Radio className="w-4 h-4" /> {isLive ? 'ON AIR' : 'OFFLINE'}
        </div>

      </div>

      {/* !!! ADD THIS LINE HERE TO OPEN THE GRID !!! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {/* 1. Livestream Control Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Play className={`w-5 h-5 ${isLive ? 'text-green-500' : 'text-red-500'}`} /> 
            {isLive ? 'Active Livestream' : 'Livestream Setup'}
          </h3>
  
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Paste YouTube Live URL..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              disabled={isLive} // Lock input while live
            />
    
            {isLive ? (
              <button onClick={() => handleToggleLive('OFF')} className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-red-200 transition-all">
                <X className="w-4 h-4" /> STOP SERVICE
              </button>
            ) : (
              <button onClick={() => handleToggleLive('ON')} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
                <Radio className="w-4 h-4" /> GO LIVE NOW
              </button>
            )}
          </div>
        </div>


        {/* 2. LIVE PRAYER FEED (NEW) */}
        <div className="lg:col-span-1">
          <LivePrayerFeed shopId={user?.shop_id || 101} />
        </div>

        {/* 3. Lower Thirds / Overlays */}
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

        {/* Place this inside your grid in MediaDashboard.tsx */}
        <div className="md:col-span-2 lg:col-span-3">
          <EngagementHeatmap shopId={user?.shop_id || 68} />
        </div> 

        {/* 4. Publish Content Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-500" /> Publish Content
          </h3>
  
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Content Title (e.g. Sunday Bulletin)"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
    
            <select 
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
            >
              <option value="video">Video Content</option>
              <option value="image">Image / Graphic</option>
              <option value="document">Document / PDF</option>
              <option value="youtube_live">YouTube Live Feed</option> {/* New Option */}
            </select>

            {uploadCategory === 'youtube_live' ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Paste YouTube Live URL here..."
                  className="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                />
                <button 
                  onClick={() => handleCategorizedUpload()} // Trigger manual submit
                  disabled={isUploading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {isUploading ? <RefreshCw className="animate-spin" /> : 'Publish Live Link'}
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-gray-500 font-medium">
                  {isUploading ? 'Uploading...' : `Click to upload ${uploadCategory}`}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleCategorizedUpload}
                  disabled={isUploading}
                />
              </label>
            )}
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
