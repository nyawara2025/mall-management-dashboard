import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  time: string;
  patient_name: string;
  service: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export const MedicalDashboard = () => {
  // 1. Destructure both token and user
  const { token, user } = useAuth();
  
  // 2. All state definitions at the top
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, waitTime: '0m', views: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });

  const statsCards = [
    { label: 'TOTAL PATIENTS', value: stats.total, icon: Users, color: 'text-blue-600' },
    { label: 'TODAY', value: stats.today, icon: Calendar, color: 'text-green-600' },
    { label: 'WAIT TIME', value: stats.waitTime, icon: Clock, color: 'text-orange-600' },
    { label: 'VIEWS', value: stats.views, icon: BarChart3, color: 'text-purple-600' }
  ];

  const updateStatus = async (appointmentId: string, newStatus: 'Confirmed' | 'Cancelled') => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-appointment-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ appointmentId, status: newStatus.toLowerCase() })
      });

      if (response.ok) {
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        ));
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/add-medical-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newService, shop_id: user?.shop_id })
      });
      if (response.ok) {
        setIsModalOpen(false);
        setNewService({ name: '', price: '', description: '' });
        alert("Service added successfully!");
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchMedicalData = async () => {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/get-medical-records', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        const data = Array.isArray(result) ? result[0] : result;

        if (data.stats) {
          setStats(data.stats);
        }

        const rawAppointments = data.appointments || [];
        const formattedAppointments: Appointment[] = rawAppointments.map((apt: any) => {
          const rawStatus = apt.status || 'pending';
          return {
            id: String(apt.id),
            time: apt.created_at 
              ? new Date(apt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : 'TBD',
            patient_name: apt.full_name || `Patient #${apt.patient_id}`,
            service: apt.notes || 'General Service',
            status: (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)) as Appointment['status']
          };
        });

        setAppointments(formattedAppointments);
      } catch (error) {
        console.error('Failed to fetch medical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalData();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gray-50 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-gray-800">APPOINTMENTS</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> ADD SERVICE
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{apt.time}</td>
                    <td className="px-6 py-4 font-medium">{apt.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.service}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => updateStatus(apt.id, 'Confirmed')} className="text-green-600 hover:text-green-800 text-xs font-bold">CONFIRM</button>
                      <button onClick={() => updateStatus(apt.id, 'Cancelled')} className="text-red-600 hover:text-red-800 text-xs font-bold">CANCEL</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">Add New Medical Service</h3>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">SERVICE NAME</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newService.name} 
                  onChange={e => setNewService({...newService, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">PRICE</label>
                <input 
                  type="number" 
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newService.price} 
                  onChange={e => setNewService({...newService, price: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">DESCRIPTION</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newService.description} 
                  onChange={e => setNewService({...newService, description: e.target.value})} 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2 border rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  SAVE SERVICE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
