import React, { useState, useEffect } from 'react';
import { X, Calendar, History, Share2, Plus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any; // Use your MemberData interface here
}

export const AppointmentsModal: React.FC<AppointmentsModalProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'department'>('create');
  
  if (!isOpen) return null;

  // Role-based check: Allow access to Departmental tab if they have a leadership role
  const canManageDepartment = userData?.role?.toLowerCase().includes('head') || 
                               userData?.role?.toLowerCase().includes('admin') ||
                               userData?.role?.toLowerCase().includes('leader');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Appointments & Calendar</h2>
              <p className="text-xs text-gray-500">Manage your church engagements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50">
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={<Plus size={18}/>} label="New" />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18}/>} label="History" />
          {canManageDepartment && (
            <TabButton active={activeTab === 'department'} onClick={() => setActiveTab('department')} icon={<Users size={18}/>} label="Ministry/Zone" />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'create' && <CreateAppointmentForm userData={userData} />}
          {activeTab === 'history' && <AppointmentsHistory userData={userData} />}
          {activeTab === 'department' && <DepartmentalCalendar userData={userData} />}
        </div>
      </div>
    </div>
  );
};

// Sub-components for clarity
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon} {label}
  </button>
);

const CreateAppointmentForm = ({ userData }: { userData: any }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. SMART DEFAULTS FIX: Fallback to first ministry or 'Individual' if none exists
  const firstMinistry = userData?.ministry_name ? userData.ministry_name.split(',')[0].trim() : 'Individual';

  const [formData, setFormData] = useState({
    title: '',
    particulars: '',
    location: '',
    date: '',
    time: '',
    category: userData?.ministry_name ? 'Ministry' : 'Personal', // Dynamic fallback
    target_group: userData?.ministry_name ? firstMinistry : 'Individual'
  });

  // Check if user is a leader
  const isLeader = userData?.role?.toLowerCase().includes('head') || 
                   userData?.role?.toLowerCase().includes('chair') ||
                   userData?.role?.toLowerCase().includes('leader');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Please fill in required fields");
    
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/post-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          member_id: userData.id,
          org_id: userData.org_id,
          shop_id: userData.shop_id,
          ministry_id: formData.category === 'Ministry' ? (userData.ministry_id || userData.department_id) : null,
          zone_id: formData.category === 'Zone' ? userData.zone_id : null,
          department: formData.category === 'Ministry' ? userData.ministry_name : 'General',
          zone_name: formData.category === 'Zone' ? userData.zone_name : null,
          final_scope: formData.category === 'Personal' ? 'Individual' : formData.category
        }),
      });

      if (response.ok) {
        alert("Appointment/Event posted successfully!");
        setFormData({ title: '', particulars: '', date: '', time: '', location: '', category: 'Ministry', target_group: '' });
      } else {
        throw new Error('Server integration error');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit event details. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  // 2. THE RENDER FIX: Injecting the new select state value structure and inputs
  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <h3 className="font-semibold text-gray-800">New Engagement</h3>
      
      {/* Dynamic Dropdown for Leaders */}
      {isLeader && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="text-xs font-bold text-blue-600 ml-2 mb-1 block uppercase tracking-wider">
            Posting Scope & Target
          </label>
          <select 
            // TRACKING FIX: Assembles a compound value string to perfectly match option formats
            value={`${formData.category}|${formData.target_group}`}
            onChange={(e) => {
              const [selectedCategory, selectedTargetGroup] = e.target.value.split('|');
              setFormData({
                ...formData,
                category: selectedCategory,
                target_group: selectedTargetGroup 
              });
            }}
            className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800 cursor-pointer"
          >
            <option value="Personal|Individual">🔒 Personal Appointment (Just Me)</option>
            <option value="Department|General">⛪ Departmental Activity (General)</option>
            
            {/* Dynamic Zone Group Selection Option */}
            {userData?.zone_name && (
              <option value={`Zone|${userData.zone_name}`}>
                👥 Meeting: {userData.zone_name} Zone
              </option>
            )}

            {/* Dynamic Multi-Ministry Option Splitter */}
            {userData?.ministry_name && userData.ministry_name.split(',').map((ministryName: string, idx: number) => {
              const cleanMinistryName = ministryName.trim();
              return (
                <option key={idx} value={`Ministry|${cleanMinistryName}`}>
                  🎺 Event: {cleanMinistryName} Ministry
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Title Input Field */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
          Event Title *
        </label>
        <input 
          type="text" 
          placeholder="e.g., Committee Planning Session" 
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
          required
        />
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
            Date *
          </label>
          <input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
            Start Time
          </label>
          <input 
            type="time" 
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
          />
        </div>
      </div>

      {/* Venue Location Field */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
          Venue / Location
        </label>
        <input 
          type="text" 
          placeholder="e.g., Main Sanctuary or Zoom" 
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
        />
      </div>

      {/* Particulars Textarea Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
          Particulars / Descriptions
        </label>
        <textarea 
          placeholder="Provide additional details or guidelines for attendees..." 
          value={formData.particulars}
          onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
          className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 h-28 resize-none"
        />
      </div>

      {/* Form Submission Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-98 disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? "Publishing to Calendar..." : "🗓️ Publish Engagement"}
      </button>
    </form>
  );
}; 

const AppointmentsHistory = ({ userData }: any) => (
  <div className="text-center py-10 text-gray-500">
    <History size={48} className="mx-auto mb-4 opacity-20" />
    <p>No past appointments found.</p>
  </div>
);

const DepartmentalCalendar = ({ userData }: { userData: any }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupEventsFromWebhook = async () => {
      if (!userData?.shop_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Dispatch a clean POST request directly to your n8n API engine gateway
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-group-diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop_id: Number(userData.shop_id),
            user_id: Number(userData.id),
            zone_name: userData.zone_name,
            ministry_name: userData.ministry_name // Passes: "KAMA, Praise & Worship, Children"
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch group calendars');
        const rawData = await response.json();
        
        // Ensure we are working with an array payload ledger
        const allEvents = Array.isArray(rawData) ? rawData : (rawData.events || []);

        // 2. Tokenize the comma-separated string of ministries for strict boundary evaluation
        const userMinistries = userData.ministry_name
          ? userData.ministry_name.split(',').map((m: string) => m.trim().toLowerCase())
          : [];

        // 3. Client-side matching to isolate relevant feeds cleanly
        const filteredEvents = allEvents.filter((event: any) => {
          const eventCategory = event.category?.toLowerCase();
          const targetGroup = event.target_group?.toLowerCase();

          // Rule A: General departmental events are visible to everyone
          if (eventCategory === 'department' || eventCategory === 'general') return true;

          // Rule B: Match the target group with the member's exact zone name
          if (eventCategory === 'zone' && userData.zone_name) {
            return targetGroup === userData.zone_name.toLowerCase();
          }

          // Rule C: Check if the target group exists in their ministry list
          if (eventCategory === 'ministry') {
            return userMinistries.includes(targetGroup);
          }

          return false; // Safely omit non-matching entries
        });

        setEvents(filteredEvents);
      } catch (err) {
        console.error("Error loading group calendar via n8n POST webhook:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupEventsFromWebhook();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-blue-600 font-bold text-xs gap-2">
        <span className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></span>
        Syncing Shared Calendars...
      </div>
    );
  }


  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200">
      {/* Leadership Context Summary Info Bar */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs font-semibold text-emerald-800">
        📌 Displaying shared schedules for: <span className="font-black text-emerald-950">{userData?.zone_name || 'No Zone'}</span> and ministries: <span className="font-black text-emerald-950">{userData?.ministry_name || 'None'}</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-sm font-bold text-gray-400 italic">No shared meetings or events scheduled right now.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {events.map((event) => {
            // Determine badge aesthetic coloring dynamically based on scoping
            const isZone = event.category?.toLowerCase() === 'zone';
            const isDept = event.category?.toLowerCase() === 'department';
            
            return (
              <div 
                key={event.id} 
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Scoping Badge */}
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      isZone 
                        ? 'bg-orange-50 text-orange-600 border-orange-100' 
                        : isDept 
                          ? 'bg-purple-50 text-purple-600 border-purple-100' 
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {event.category} {event.target_group ? `• ${event.target_group}` : ''}
                    </span>
                    
                    {event.location && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 border rounded-md">
                        📍 {event.location}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-gray-800 leading-tight">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs font-medium text-gray-500 whitespace-pre-line max-w-xl">{event.description}</p>
                  )}
                </div>

                {/* Calendar Schedule Timing Block */}
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 min-w-[110px] text-center flex flex-col justify-center">
                  <span className="text-xs font-black text-gray-700">
                    {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {event.event_time && (
                    <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                      ⏰ {event.event_time.substring(0, 5)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
