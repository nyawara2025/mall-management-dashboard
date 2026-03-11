import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, BarChart3, Plus, MessageSquare, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  time: string;
  patient_name: string;
  service: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

interface Interaction {
  id: string;
  customer_phone: string;
  message: string;
  interaction_type: string;
  created_at: string;
}

export const MedicalDashboard = () => {
  const { token, user } = useAuth();
  
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, waitTime: '0m', views: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries'>('appointments');
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });

  const statsCards = [
    { label: 'TOTAL PATIENTS', value: stats.total, icon: Users, color: 'text-blue-600' },
    { label: 'TODAY', value: stats.today, icon: Calendar, color: 'text-green-600' },
    { label: 'WAIT TIME', value: stats.waitTime, icon: Clock, color: 'text-orange-600' },
    { label: 'VIEWS', value: stats.views, icon: BarChart3, color: 'text-purple-600' }
  ];

  const fetchData = async () => {
    try {
      // Fetch Appointments and Stats
      const medicalRes = await fetch('https://n8n.tenear.com/webhook/get-medical-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const medicalResult = await medicalRes.json();
      const medicalData = Array.isArray(medicalResult) ? medicalResult[0] : medicalResult;

      if (medicalData.stats) setStats(medicalData.stats);

      const formattedApts: Appointment[] = (medicalData.appointments || []).map((apt: any) => ({
        id: String(apt.id),
        time: apt.created_at ? new Date(apt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        patient_name: apt.full_name || `Patient #${apt.patient_id}`,
        service: apt.notes || 'General Service',
        status: (apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)) || 'Pending'
      }));
      setAppointments(formattedApts);

      // Fetch Product Interactions (Inquiries)
      const interactRes = await fetch('https://n8n.tenear.com/webhook/get-medical-inquiries', {
        method: 'POST', // Changed from GET to POST
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          shop_id: user?.shop_id // Sending as a distinct data object
        })
      });

      const interactData = await interactRes.json();
      setInteractions(interactData || []);


    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const updateStatus = async (appointmentId: string, newStatus: 'Confirmed' | 'Cancelled') => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-appointment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ appointmentId, status: newStatus.toLowerCase() })
      });
      if (response.ok) {
        setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt));
      }
    } catch (error) { console.error('Update failed:', error); }
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
        alert("Service added and synced to TeNEAR Sokoni!");
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Initializing TeNEAR Medical Space...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gray-50 ${card.color}`}><card.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-200/50 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <ClipboardList className="w-4 h-4" /> APPOINTMENTS
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inquiries' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <MessageSquare className="w-4 h-4" /> PATIENT INQUIRIES
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h2 className="font-extrabold text-gray-800 tracking-tight uppercase">
            {activeTab === 'appointments' ? 'Booking Schedule' : 'Sokoni App Interactions'}
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            <Plus className="w-4 h-4" /> ADD FACILITY SERVICE
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'appointments' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Service Requested</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{apt.time}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{apt.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{apt.service}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button onClick={() => updateStatus(apt.id, 'Confirmed')} className="text-green-600 hover:text-green-800 text-xs font-black">APPROVE</button>
                      <button onClick={() => updateStatus(apt.id, 'Cancelled')} className="text-red-400 hover:text-red-600 text-xs font-black">REJECT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4">Patient Contact</th>
                  <th className="px-6 py-4">Message / Inquiry</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4 text-right">Direct Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interactions.length > 0 ? interactions.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{item.customer_phone}</td>
                    <td className="px-6 py-4 text-sm italic text-gray-600">"{item.message}"</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">{item.interaction_type.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`https://wa.me{item.customer_phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all inline-block"
                      >
                        REPLY ON WHATSAPP
                      </a>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No inquiries from the Residential App yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-white">
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-xl font-black text-gray-800">New Medical Listing</h3>
              <p className="text-xs text-gray-500 font-bold">This will appear in the Neighborhood Sokoni App</p>
            </div>
            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Service Name (e.g. Dental Checkup)</label>
                <input type="text" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Fee (Kshs)</label>
                <input type="number" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Description for Patients</label>
                <textarea required rows={3} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl font-black text-gray-400 hover:bg-gray-50 transition-all text-xs">CANCEL</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-xs">LIST SERVICE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
