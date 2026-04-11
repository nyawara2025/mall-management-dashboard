import React, { useState } from 'react';
import { 
  Building2, 
  Target, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  HardHat, 
  HeartHandshake,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchBranding } from './ChurchBranding';

export const DevelopmentDashboard = () => {
  const { user } = useAuth();
  
  // State for a sample project progress
  const [projectGoal, setProjectGoal] = useState(5000000);
  const [raisedAmount, setRaisedAmount] = useState(2750000);

  const progressPercentage = Math.round((raisedAmount / projectGoal) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ChurchBranding departmentName="Development & Projects" />
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" /> Projects & Development
        </h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2">
          <Target className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* active Project Highlight (e.g., New Sanctuary) */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
              Primary Project
            </span>
            <h3 className="text-2xl font-black text-gray-900">Main Sanctuary Expansion</h3>
            <p className="text-sm text-gray-500 max-w-md">Construction phase: Roofing & Internal Finishes. Estimated completion: Dec 2024.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Fundraising Progress</p>
            <h4 className="text-3xl font-black text-indigo-600">{progressPercentage}%</h4>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs font-bold text-gray-400">
          <span>Raised: KES {raisedAmount.toLocaleString()}</span>
          <span>Goal: KES {projectGoal.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Project Milestones */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Milestones
          </h3>
          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
            {[
              { task: 'Foundation & Pillar Setting', status: 'Completed', date: 'Jan 2024', icon: <CheckCircle2 className="text-emerald-500" /> },
              { task: 'Wall Masonry & Roofing', status: 'In Progress', date: 'Current', icon: <Clock className="text-amber-500" /> },
              { task: 'Electrical & Plumbing', status: 'Pending', date: 'Oct 2024', icon: <HardHat className="text-gray-300" /> },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-4 relative z-10">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-bold text-gray-900">{m.task}</p>
                    <span className="text-[10px] font-black text-gray-400 uppercase">{m.date}</span>
                  </div>
                  <p className="text-xs text-gray-500">{m.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Community & Volunteers */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Project Team
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-900">Volunteer Labor</p>
                  <p className="text-[10px] text-indigo-600 font-medium">12 members signed up for Saturday</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase">External Contractors</p>
              {['Elite Builders Ltd', 'Spark Electricals'].map(vendor => (
                <div key={vendor} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl">
                  <span className="text-xs font-bold text-gray-700">{vendor}</span>
                  <Calendar className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
              Manage Stakeholders
            </button>
          </div>
        </div>

      </div>

      {/* Fundraiser Analytics Placeholder */}
      <div className="bg-indigo-900 p-6 rounded-3xl text-white overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="font-bold flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" /> Fundraiser Insights
          </h4>
          <p className="text-xs text-indigo-200 mb-4">Average donation size per project member has increased by 15% this month.</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold hover:bg-white/20 transition-all">Download Pledges</button>
            <button className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold hover:bg-white/20 transition-all">View All Project Assets</button>
          </div>
        </div>
        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
      </div>
    </div>
  );
};
