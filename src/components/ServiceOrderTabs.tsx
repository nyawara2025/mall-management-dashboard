import React, { useState, useEffect } from 'react';
import { Sun, Users, Languages, Volume2, Clock, AlertCircle } from 'lucide-react';

export const ServiceOrderTabs = ({ data }: { data: any[] }) => {
  const [activeTab, setActiveTab] = useState('');

  // 1. Enhanced Grouping Logic
  const services = React.useMemo(() => {
    // n8n sometimes sends an object with a 'data' array, or just an array
    const items = Array.isArray(data) ? data : (data as any)?.data || [];
    
    return items.reduce((acc: any, item: any) => {
      // Handle n8n's .json wrapper vs flat objects
      const fields = item.json || item; 
      
      // Use logical fallbacks for field names
      const serviceName = fields.service_name || fields.service || 'General';
      const activityName = fields.activity_name || fields.title || fields.activity;
      const description = fields.description || fields.content || fields.desc;

      if (!acc[serviceName]) {
        acc[serviceName] = {
          name: serviceName,
          time: fields.start_time || fields.time || '--:--',
          activities: []
        };
      }
      
      if (activityName || description) {
        acc[serviceName].activities.push({
          activity_name: activityName,
          description: description
        });
      }
      return acc;
    }, {});
  }, [data]);

  const serviceNames = Object.keys(services);

  useEffect(() => {
    if (serviceNames.length > 0 && !activeTab) {
      setActiveTab(serviceNames[0]);
    }
  }, [serviceNames, activeTab]);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('morning')) return <Sun size={18} />;
    if (n.includes('youth')) return <Users size={18} />;
    if (n.includes('english')) return <Languages size={18} />;
    return <Volume2 size={18} />;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b bg-gray-50/50 overflow-x-auto scrollbar-hide">
        {serviceNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === name ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
          >
            {getIcon(name)} {name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab && services[activeTab]?.activities.length > 0 ? (
          <div className="space-y-8 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100" />
            {services[activeTab].activities.map((act: any, idx: number) => (
              <div key={idx} className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-600" />
                <h3 className="font-black text-gray-900 uppercase text-sm mb-2">{act.activity_name || 'No Title'}</h3>
                <div className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {act.description || 'No description provided.'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <AlertCircle className="mx-auto text-orange-400 mb-2" />
            <p className="text-gray-500 font-bold">Data received but fields not recognized.</p>
            
            {/* DEBUG VIEW: This will show us exactly what the first item looks like */}
            <div className="mt-6 p-4 bg-black text-green-400 text-left text-[10px] font-mono rounded-lg overflow-auto max-h-40">
              <p className="mb-2 text-white font-bold underline">DEBUG: First Item structure:</p>
              {data && data.length > 0 ? JSON.stringify(data[0], null, 2) : "Data array is empty"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
