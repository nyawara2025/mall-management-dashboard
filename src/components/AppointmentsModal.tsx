import React, { useState, useEffect } from 'react';
import { X, Calendar, History, Share2, Plus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any; // Use your MemberData interface here
}

export const AppointmentsModal: React.FC<AppointmentsModalProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'department'>('create');
  
  if (!isOpen) return null;

  // Role-based check: Allow access to Departmental tab if they have a leadership role
  const canManageDepartment = userData?.role?.toLowerCase().includes('head') || 
                               userData?.role?.toLowerCase().includes('admin') ||
                               userData?.role?.toLowerCase().includes('leader');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Appointments & Calendar</h2>
              <p className="text-xs text-gray-500">Manage your church engagements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50">
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={<Plus size={18}/>} label="New" />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={18}/>} label="History" />
          {canManageDepartment && (
            <TabButton active={activeTab === 'department'} onClick={() => setActiveTab('department')} icon={<Users size={18}/>} label="Ministry/Zone" />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'create' && <CreateAppointmentForm userData={userData} />}
          {activeTab === 'history' && <AppointmentsHistory userData={userData} />}
          {activeTab === 'department' && <DepartmentalCalendar userData={userData} />}
        </div>
      </div>
    </div>
  );
};

// Sub-components for clarity
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon} {label}
  </button>
);

const CreateAppointmentForm = ({ userData }: any) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-800">Schedule an Appointment</h3>
    <input type="text" placeholder="Reason for visit" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
    <div className="grid grid-cols-2 gap-4">
      <input type="date" className="p-4 bg-gray-50 rounded-2xl border border-gray-100" />
      <input type="time" className="p-4 bg-gray-50 rounded-2xl border border-gray-100" />
    </div>
    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
      Confirm Appointment
    </button>
  </div>
);

const AppointmentsHistory = ({ userData }: any) => (
  <div className="text-center py-10 text-gray-500">
    <History size={48} className="mx-auto mb-4 opacity-20" />
    <p>No past appointments found.</p>
  </div>
);

const DepartmentalCalendar = ({ userData }: any) => (
  <div className="space-y-4">
    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
      <p className="text-sm text-green-700 font-medium">Leadership Access: {userData?.ministry_name || 'Ministry Head'}</p>
    </div>
    <div className="p-4 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-3">
      <Share2 className="text-blue-500" />
      <p className="text-sm text-gray-600 text-center">Share {userData?.ministry_name} events with other teams (Media, Ushers, etc.)</p>
      <button className="text-blue-600 font-bold text-sm">Select Teams to Share With</button>
    </div>
  </div>
);
