import React from 'react';
import { BookOpen, Users, Calendar, GraduationCap, ClipboardCheck, TrendingUp, LucideIcon, Milestone, Heart, UserPlus, Church } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon; // This tells TS to expect a component
  color: string;
}

export const EducationalDashboard = ({ onViewChange }: { onViewChange: (view: string) => void }) => {
  const stats: StatItem[] = [
  { label: 'Total Students', value: '2,100', change: '+3%', changeType: 'increase', icon: Users, color: 'text-blue-600' },
  { label: 'Average GPA', value: '3.4', change: '+0.2', changeType: 'increase', icon: Milestone, color: 'text-green-600' },
  { label: 'Attendance Rate', value: '94%', change: '+1%', changeType: 'increase', icon: Heart, color: 'text-indigo-600' },
  { label: 'Staff/Faculty', value: '142', change: '0%', changeType: 'neutral', icon: UserPlus, color: 'text-orange-600' },
  { label: 'Retention Rate', value: '88%', change: '-2%', changeType: 'decrease', icon: Church, color: 'text-red-600' }
];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4">Upcoming Academic Schedule</h3>
          <p className="text-gray-500 text-sm italic">Connect your Supabase 'events' table here...</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4">Recent Student Registrations</h3>
          <p className="text-gray-500 text-sm italic">Connect your Supabase 'students' table here...</p>
        </div>
      </div>
    </div>
  );
};
