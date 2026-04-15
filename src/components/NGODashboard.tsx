import React from 'react';
import { Heart, Globe, Users, Target, FileText, Share2, Landmark } from 'lucide-react';

export const NGODashboard = () => {
  const stats = [
  { label: 'Total Impact', value: '12.5k', change: '+15% reach', icon: Globe, color: 'bg-indigo-100 text-indigo-600', type: 'increase' },
  { label: 'Donors', value: '842', change: '12 new this week', icon: Heart, color: 'bg-red-100 text-red-600', type: 'increase' },
  { label: 'Volunteers', value: '156', change: 'Active projects', icon: Users, color: 'bg-blue-100 text-blue-600', type: 'neutral' },
  { label: 'Goal Progress', value: '74%', change: '$25k remaining', icon: Target, color: 'bg-green-100 text-green-600', type: 'neutral' },
  { label: 'Grants', value: '3 Pending', change: 'Reviewing status', icon: Landmark, color: 'bg-amber-100 text-amber-600', type: 'neutral' },
];

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Impact Administration</h1>
        <p className="text-indigo-600 italic">Transparency & Community Empowerment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className={`p-2 w-fit rounded-lg ${stat.color} mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            <p className={`text-[10px] mt-1 ${stat.type === 'increase' ? 'text-green-500' : 'text-gray-400'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-indigo-600 font-bold text-lg">$ Fundraising</span>
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
              <FileText size={12}/> Impact Report
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['Grants', 'Donations', 'In-Kind', 'Sponsorship'].map(cat => (
            <button key={cat} className="py-2 px-4 rounded-lg bg-gray-50 text-gray-500 text-sm hover:bg-indigo-600 hover:text-white transition-all">
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
