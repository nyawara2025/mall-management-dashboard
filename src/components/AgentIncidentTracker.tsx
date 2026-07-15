import React, { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Clock, RefreshCw } from 'lucide-react';

interface Incident {
  id: string;
  polling_station_name: string;
  constituency_name: string;
  incident_type: string;
  description: string;
  status: 'critical' | 'investigating' | 'resolved';
  created_at: string;
}

export const AgentIncidentTracker = ({ shopId }: { shopId: string }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchLiveIncidents = async () => {
    setLoading(true);
    try {
      // Direct call to your multi-tenant analytics logging table
      const res = await fetch(`https://n8n.tenear.com/webhook/fetch-voter-incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch_agent_incidents',
          shop_id: shopId
        })
      });
      const data = await res.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load ground incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchLiveIncidents();
  }, [shopId]);

  const activeIncidents = filter === 'critical' 
    ? incidents.filter(i => i.status === 'critical') 
    : incidents;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[450px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-black text-gray-900">Ground Agent Intelligence</h3>
          <p className="text-xs text-gray-400 font-bold uppercase">Live Field Stream</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="text-xs bg-gray-50 border p-2 rounded-xl font-bold"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Logs</option>
            <option value="critical">Critical Only</option>
          </select>
          <button onClick={fetchLiveIncidents} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {activeIncidents.length > 0 ? (
          activeIncidents.map((incident) => (
            <div 
              key={incident.id} 
              className={`p-4 rounded-2xl border transition-all ${
                incident.status === 'critical' ? 'bg-red-50/60 border-red-100' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${incident.status === 'critical' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                  <ShieldAlert size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black uppercase text-gray-400">{incident.incident_type}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                      <Clock size={10} /> {new Date(incident.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mt-1">{incident.description}</p>
                  <div className="flex gap-3 mt-2 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {incident.polling_station_name}</span>
                    <span className="uppercase text-[10px] bg-white border px-2 py-0.5 rounded-md">{incident.constituency_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">
            No active incidents reported from the stream.
          </div>
        )}
      </div>
    </div>
  );
};
