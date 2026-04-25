import React, { useState, useEffect } from 'react';
import { Sun, Users, Languages, Volume2, Clock } from 'lucide-react';

interface RawActivity {
  service_name: string;
  start_time: string;
  activity_name: string;
  description: string;
}

export const ServiceOrderTabs = ({ data }: { data: RawActivity[] }) => {
  // 1. Group the flat data by service name
  // We use useMemo to ensure grouping only happens when data changes
  const services = React.useMemo(() => {
    return data.reduce((acc: any, item) => {
      const name = item.service_name || 'General';
      if (!acc[name]) {
        acc[name] = {
          name: name,
          time: item.start_time,
          activities: []
        };
      }
      acc[name].activities.push(item);
      return acc;
    }, {});
  }, [data]);

  const serviceNames = Object.keys(services);
  
  // 2. Set the default tab to the first service found in the data
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (serviceNames.length > 0 && !activeTab) {
      setActiveTab(serviceNames[0]);
    }
  }, [serviceNames, activeTab]);

  // Icon mapping helper based on common Kenyan church service names
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('morning')) return <Sun size={18} />;
    if (lowerName.includes('youth')) return <Users size={18} />;
    if (lowerName.includes('english')) return <Languages size={18} />;
    if (lowerName.includes('kiswahili') || lowerName.includes('swahili')) return <Volume2 size={18} />;
    return <Clock size={18} />;
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
        No service activities scheduled for today.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b bg-gray-50/50 overflow-x-auto scrollbar-hide">
        {serviceNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === name 
                ? 'bg-white border-b-2 border-blue-600 text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            {getIcon(name)}
            {name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-white custom-scrollbar">
        {activeTab && services[activeTab] ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Service Header Info */}
            <div className="flex items-center gap-2 mb-8 text-blue-700 bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
              <Clock size={15} className="animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Starts at {services[activeTab].time}
              </span>
            </div>

            {/* Activities List */}
            <div className="space-y-10 relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-gray-100" />
              
              {services[activeTab].activities.map((act: any, idx: number) => (
                <div key={idx} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white border border-blue-200 group-hover:scale-125 transition-transform" />
                  
                  <h3 className="font-black text-gray-900 text-base uppercase tracking-tight leading-none mb-3">
                    {act.activity_name}
                  </h3>
                  
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm font-medium">
                    {act.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>Select a service to view the order</p>
          </div>
        )}
      </div>
    </div>
  );
};
