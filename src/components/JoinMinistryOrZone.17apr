import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen) fetchOptions();
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
      setOptions(data.options || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch('https://n8n.tenear.com/webhook/update_member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: userData.phone_number,
          org_id: userData.org_id,
          field: activeTab === 'ministry' ? 'ministry_name' : 'zone_name',
          value: selected
        }),
      });
      alert(`Success! You have joined the ${selected} ${activeTab}.`);
      onClose();
    } catch (error) {
      alert("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tight">Connect with Us</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full"><X size={24}/></button>
        </div>

        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('ministry')}
            className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'ministry' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
          >
            <Users size={18}/> Ministry
          </button>
          <button 
            onClick={() => setActiveTab('zone')}
            className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'zone' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
          >
            <MapPin size={18}/> Zone
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-500 text-sm mb-6 font-medium">
            Please select the {activeTab} you wish to join below:
          </p>

          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <select 
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none mb-8"
            >
              <option value="">Select a {activeTab}...</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}

          <button
            onClick={handleJoin}
            disabled={!selected || saving}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-200"
          >
            {saving ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
            {saving ? 'Processing...' : `Join ${activeTab}`}
          </button>
        </div>
      </div>
    </div>
  );
};
