import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Heart, Users, ChevronDown, Activity } from 'lucide-react';

export const CommunityAndZones = ({ userData }: { userData: any }) => {
  const [activeTab, setActiveTab] = useState('zonal');
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [diaryEvents, setDiaryEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Innovative Community Service categories
  const communityCategories = [
    "Outreach & Evangelism",
    "Medical & Health Missions",
    "Charity & Works of Mercy",
    "Education & Skills Support",
    "Environmental & Clean-up"
  ];

  // 1. Fetch ALL zones via n8n
  useEffect(() => {
    async function fetchZones() {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-zone-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: userData?.shop_id, 
            org_id: userData?.org_id 
          }),
        });
        const data = await response.json();
        setZones(Array.isArray(data) ? data : [data]);
      } catch (e) { console.error("Zones fetch failed", e); }
    }
    fetchZones();
  }, [userData]);

  // 2. Fetch Diary or Community Service via n8n
  useEffect(() => {
    async function fetchActivities() {
      if (!selectedZone && !selectedCategory) return;
      setLoading(true);
      
      const endpoint = activeTab === 'zonal' 
        ? 'https://n8n.tenear.com/webhook/fetch-community-activity' 
        : 'https://n8n.tenear.com/webhook/fetch-community-activity';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: userData?.shop_id, 
            org_id: userData?.org_id,
            zone_name: selectedZone,      // For Zonal tab
            category: selectedCategory    // For Community tab
          }),
        });
        const data = await response.json();
        setDiaryEvents(Array.isArray(data) ? data : [data]);
      } catch (e) { console.error("Activity fetch failed", e); }
      setLoading(false);
    }
    fetchActivities();
  }, [selectedZone, selectedCategory, activeTab, userData]);


  return (
    <div className="flex flex-col h-[75vh] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex bg-gray-100 p-2 gap-2 m-4 rounded-3xl">
        <button 
          onClick={() => { setActiveTab('zonal'); setDiaryEvents([]); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all
            ${activeTab === 'zonal' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}
        >
          <Users size={16} /> Zonal Activities
        </button>
        <button 
          onClick={() => { setActiveTab('community'); setDiaryEvents([]); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all
            ${activeTab === 'community' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}
        >
          <Heart size={16} /> Community Service
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {/* Selection Area */}
        <div className="mb-8">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block px-2">
            Discover {activeTab === 'zonal' ? 'Zone Missions' : 'Community Service'}
          </label>
          <div className="relative">
            <select 
              value={activeTab === 'zonal' ? selectedZone : selectedCategory}
              onChange={(e) => activeTab === 'zonal' ? setSelectedZone(e.target.value) : setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-4 px-6 font-bold text-gray-700 appearance-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">-- Choose from List --</option>
              {activeTab === 'zonal' ? (
                zones.map(z => <option key={z.zone_name} value={z.zone_name}>{z.zone_name}</option>)
              ) : (
                communityCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
              )}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4 pb-6">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Activity className="text-blue-600 animate-spin" size={32} />
              <p className="text-gray-400 font-bold italic">Loading the diary...</p>
            </div>
          ) : diaryEvents.length > 0 ? (
            diaryEvents.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-black text-gray-900 text-lg mb-2 uppercase tracking-tight">{event.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{event.description}</p>
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase">
                    <Calendar size={14} /> {event.event_date}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                    <MapPin size={14} /> {event.location}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-bold italic">Select an option above to see upcoming events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
