import React, { useState } from 'react';
import { Sun, Users, Languages, Volume2, Clock } from 'lucide-react';

interface RawActivity {
  service_name: string;
  start_time: string;
  activity_name: string;
  description: string;
}

export const ServiceOrderTabs = ({ data }: { data: RawActivity[] }) => {
  const [activeTab, setActiveTab] = useState('Morning Glory');

  // 1. Group the flat data by service name
  const services = data.reduce((acc: any, item) => {
    if (!acc[item.service_name]) {
      acc[item.service_name] = {
        name: item.service_name,
        time: item.start_time,
        activities: []
      };
    }
    acc[item.service_name].activities.push(item);
    return acc;
  }, {});

  const serviceNames = Object.keys(services);

  // Icon mapping helper
  const getIcon = (name: string) => {
    if (name.includes('Morning')) return <Sun size={18} />;
    if (name.includes('Youth')) return <Users size={18} />;
    if (name.includes('English')) return <Languages size={18} />;
    return <Volume2 size={18} />;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b bg-gray-50 overflow-x-auto scrollbar-hide">
        {serviceNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all whitespace-nowrap
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
      <div className="p-6 overflow-y-auto bg-white">
        {services[activeTab] && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6 text-blue-700 bg-blue-50 w-fit px-3 py-1 rounded-full">
              <Clock size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Starts at {services[activeTab].time}
              </span>
            </div>

            <div className="space-y-8">
              {services[activeTab].activities.map((act: any, idx: number) => (
                <div key={idx} className="border-l-2 border-gray-100 pl-4">
                  <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">
                    {act.activity_name}
                  </h3>
                  <div className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line text-sm">
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
