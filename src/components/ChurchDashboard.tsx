import React from 'react';
import { Heart, Users, Church, DollarSign, Music, UserPlus, Milestone } from 'lucide-react';
import { LucideIcon } from 'lucide-react'; // Import the type
import { useAuth } from '../contexts/AuthContext';
import { ServicePlanner } from './ServicePlanner';

interface StatItem {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon; // This tells TS to expect a component
  color: string;
}

export const ChurchDashboard = ({ onViewChange }: { onViewChange: (view: string) => void }) => {
  const stats: StatItem[] = [
  { label: 'Total Members', value: '1,240', change: '+12%', changeType: 'increase', icon: Users, color: 'text-blue-600' },
  { label: 'Avg. Attendance', value: '850', change: '+5%', changeType: 'increase', icon: Church, color: 'text-green-600' },
  { label: 'Monthly Tithes', value: 'KES 450k', change: '-2%', changeType: 'decrease', icon: Heart, color: 'text-red-600' },
  { label: 'New Visitors', value: '24', change: '+18%', changeType: 'increase', icon: UserPlus, color: 'text-purple-600' },
  { label: 'Active Volunteers', value: '156', change: '0%', changeType: 'neutral', icon: Milestone, color: 'text-orange-600' }
];

  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Row stays the same */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             {/* ... stat content ... */}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: The new active component */}
        <div className="lg:col-span-2"> 
          {/* We pass the shopId prop here */}
          <ServicePlanner shopId={user?.shop_id?.toString() || ""} />
        </div>

        {/* RIGHT COLUMN: Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 self-start">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <button className="w-full mb-2 bg-blue-600 text-white py-2 rounded-lg text-sm">Send Newsletter</button>
          <button className="w-full mb-2 border border-gray-200 py-2 rounded-lg text-sm">Manage Tithes</button>
        </div>
      </div>
    </div>
  );
};
