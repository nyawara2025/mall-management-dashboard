import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, CheckCircle2, Loader2, Info } from 'lucide-react';

interface JoinProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const JoinMinistryOrZone: React.FC<JoinProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<'ministry' | 'zone'>('ministry');
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derive current membership from userData based on active tab
  const currentMembership = activeTab === 'ministry' 
    ? (userData?.ministry_name || 'Not Assigned') 
    : (userData?.zone_name || 'Not Assigned');

  useEffect(() => {
    if (isOpen) {
      setSelected(''); // Reset selection on open/tab change
      fetchOptions();
    }
  }, [isOpen, activeTab]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: userData.org_id, action_type: activeTab }),
      });
      const data = await response.json();
      
      // Map n8n array of objects [{option: 'Name'}] to array of strings ['Name']
      if (Array.isArray(data)) {
        setOptions(data.map((item: any) => item.option));
      } else if (data.options) {
        setOptions(data.options);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!selected || selected === currentMembership) return;
    setSaving(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update_member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: userData.phone_number,
          org_id: userData.org_id,
          field: activeTab === 'ministry' ? 'ministry_name' : 'zone_name',
          value: selected
        }),
      });

      if (response.ok) {
        alert(`Success! You have joined the ${selected} ${activeTab}.`);
        onClose();
        // Force refresh to update the main dashboard data
        window.location.reload();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      alert("Update failed. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight leading-tight">Connect with Us</h2>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">St. Barnabas Member Hub</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors">
            <X size={24}/>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50 border-b">
          <button 
            onClick={() => setActiveTab('ministry')}
            className={`flex-1 p-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'ministry' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
          >
            <Users size={16}/> Ministry
          </button>
          <button 
            onClick={() => setActiveTab('zone')}
            className={`flex-1 p-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'zone' ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
          >
            <MapPin size={16}/> Zone
          </button>
        </div>

        <div className="p-8">
          {/* Current Membership Label */}
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Info size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter leading-none mb-1">Current {activeTab}</p>
              <p className="text-sm font-black text-blue-900">{currentMembership}</p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-4 font-medium italic">
            Choose a new {activeTab} to join:
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Loader2 className="animate-spin text-blue-600" />
              <span className="text-[10px] font-bold text-blue-400 uppercase">Fetching Options...</span>
            </div>
          ) : (
            <select 
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/10 outline-none mb-8 appearance-none cursor-pointer"
            >
              <option value="">-- Select {activeTab} --</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleJoin}
            disabled={!selected || saving || selected === currentMembership}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 disabled:bg-gray-200 disabled:shadow-none transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
            {saving ? 'UPDATING...' : (selected === currentMembership ? 'ALREADY JOINED' : `JOIN ${activeTab}`)}
          </button>
        </div>
      </div>
    </div>
  );
};
