import React from 'react';
import { Sprout, Droplets, Wheat, Tractor, Truck, FileText, Share2, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AgriDashboard = () => {
  const { user } = useAuth();

  const stats = [
  { label: 'Soil Health', value: '88%', change: '+2% health', icon: Sprout, color: 'bg-green-100 text-green-600', type: 'increase' },
  { label: 'Irrigation', value: 'Active', change: 'Optimal flow', icon: Droplets, color: 'bg-blue-100 text-blue-600', type: 'neutral' },
  { label: 'Crop Yield', value: '12.4t', change: '+1.2t vs last year', icon: Wheat, color: 'bg-yellow-100 text-yellow-600', type: 'increase' },
  { label: 'Machinery', value: '4/5', change: '1 in maintenance', icon: Tractor, color: 'bg-orange-100 text-orange-600', type: 'decrease' },
  { label: 'Logistics', value: 'On Track', change: '3 deliveries today', icon: Truck, color: 'bg-purple-100 text-purple-600', type: 'neutral' },
];

  return (
    <div className="p-6 bg-[#FFF8F1] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Farm Administration</h1>
        <p className="text-blue-600 italic">Sustainable Growth & Precision Farming</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className={`p-2 w-fit rounded-lg ${stat.color} mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            <p className={`text-[10px] mt-1 ${stat.type === 'increase' ? 'text-green-500' : stat.type === 'decrease' ? 'text-red-500' : 'text-gray-400'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-600 font-bold text-lg">$ Operations</span>
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100">
              <FileText size={12}/> Extract Farm PDF
            </button>
            <button className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-md border border-green-100">
              <Share2 size={12}/> Link WhatsApp
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['Harvesting', 'Inputs', 'Labor', 'Other'].map(cat => (
            <button key={cat} className="py-2 px-4 rounded-lg bg-gray-50 text-gray-500 text-sm hover:bg-green-500 hover:text-white transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
