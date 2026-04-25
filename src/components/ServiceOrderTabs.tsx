import React, { useState, useEffect } from 'react';
import { Sun, Users, Languages, Volume2, Clock } from 'lucide-react';

export const ServiceOrderTabs = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState('');

  // 1. Map to your specific nested structure: [ { services: [ { service_activities: [] } ] } ]
  const servicesData = React.useMemo(() => {
    // Extract the services array from the n8n structure
    const rawServices = Array.isArray(data) ? data[0]?.services : data?.services;
    
    if (!Array.isArray(rawServices)) return [];
    return rawServices;
  }, [data]);

  const serviceNames = servicesData.map((s: any) => s.service_name);

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

  const activeService = servicesData.find((s: any) => s.service_name === activeTab);

  if (!servicesData.length) return <div className="p-10 text-center text-gray-500">Loading Order of Service...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b bg-gray-50/50 overflow-x-auto scrollbar-hide">
        {serviceNames.map((name: string) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-6 py-5 text-sm font-black transition-all whitespace-nowrap
              ${activeTab === name 
                ? 'bg-white border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'}`}
          >
            {getIcon(name)} {name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white">
        {activeService && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-10 text-blue-700 bg-blue-50 w-fit px-4 py-1.5 rounded-2xl font-black text-[10px] tracking-widest uppercase border border-blue-100">
              <Clock size={14} /> Starts at {activeService.start_time}
            </div>

            <div className="space-y-12 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100" />
              
              {activeService.service_activities?.map((act: any, idx: number) => (
                <div key={idx} className="relative pl-10 group">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-600 shadow-sm" />
                  <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-3">
                    {act.activity_name}
                  </h3>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px] font-medium bg-gray-50/30 p-5 rounded-3xl border border-gray-50">
                    {act.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
