import React, { useState, useEffect } from 'react';
import { Sun, Users, Languages, Volume2, Clock } from 'lucide-react';

interface RawActivity {
  service_name: string;
  start_time: string;
  activity_name: string;
  description: string;
}

export const ServiceOrderTabs = ({ data }: { data: any[] }) => {
  // 1. Robust grouping logic to handle n8n data structures
  const services = React.useMemo(() => {
    const items = Array.isArray(data) ? data : [];
    
    return items.reduce((acc: any, item) => {
      // n8n often wraps data in a 'json' property. We check both.
      const fields = item.json || item; 
      
      const name = fields.service_name || 'General';
      if (!acc[name]) {
        acc[name] = {
          name: name,
          time: fields.start_time || '--:--',
          activities: []
        };
      }
      
      // We only add the activity if there is a name or description to prevent empty dots
      if (fields.activity_name || fields.description) {
        acc[name].activities.push({
          activity_name: fields.activity_name,
          description: fields.description,
          start_time: fields.start_time
        });
      }
      return acc;
    }, {});
  }, [data]);

  const serviceNames = Object.keys(services);
  const [activeTab, setActiveTab] = useState('');

  // 2. Automatically select the first tab when data loads
  useEffect(() => {
    if (serviceNames.length > 0 && !activeTab) {
      setActiveTab(serviceNames[0]);
    }
  }, [serviceNames, activeTab]);

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
      <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <Clock className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-500 font-medium">No service activities found for today.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b bg-gray-50/30 overflow-x-auto scrollbar-hide">
        {serviceNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-6 py-5 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === name 
                ? 'bg-white border-b-2 border-blue-600 text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)]' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
          >
            {getIcon(name)}
            {name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
        {activeTab && services[activeTab] ? (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Service Header */}
            <div className="flex items-center gap-3 mb-10 text-blue-700 bg-blue-50/80 w-fit px-5 py-2 rounded-2xl border border-blue-100">
              <Clock size={16} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">
                Starts at {services[activeTab].time}
              </span>
            </div>

            {/* Timeline Activities */}
            <div className="space-y-12 relative">
              {/* Central Timeline Line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-100 via-gray-100 to-transparent" />
              
              {services[activeTab].activities.map((act: any, idx: number) => (
                <div key={idx} className="relative pl-10 group">
                  {/* Timeline Node */}
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-500 shadow-sm group-hover:scale-125 transition-transform duration-300" />
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                      {act.activity_name || 'Service Activity'}
                    </h3>
                    
                    {act.description && (
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px] font-medium bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                        {act.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <p className="font-bold italic">Select a service to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
