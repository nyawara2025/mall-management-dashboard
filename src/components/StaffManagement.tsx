import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Key, Save } from 'lucide-react';

export const StaffManagement: React.FC<{ shopId: number }> = ({ shopId }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    const res = await fetch('https://n8n.tenear.com/webhook/pos-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shopId, action: 'get' })
    });
    if (res.ok) setStaff(await res.json());
  };

  useEffect(() => { fetchStaff(); }, [shopId]);

  const handleAddStaff = async () => {
    if (!newStaffName || newStaffPin.length < 4) return alert("Enter name and 4-digit PIN");
    setLoading(true);
    await fetch('https://n8n.tenear.com/webhook/post-pos-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shopId, action: 'add', name: newStaffName, pin_code: newStaffPin })
    });
    setNewStaffName(''); setNewStaffPin('');
    await fetchStaff();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    await fetch('https://n8n.tenear.com/webhook/delete-pos-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shopId, action: 'delete', staff_id: id })
    });
    await fetchStaff();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border max-w-2xl mx-auto">
      <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
        <Users className="text-blue-600" /> Staff Management
      </h2>

      {/* Add Staff Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <input 
          placeholder="Staff Full Name"
          className="p-3 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={newStaffName} onChange={e => setNewStaffName(e.target.value)}
        />
        <input 
          placeholder="4-Digit PIN"
          maxLength={4}
          className="p-3 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={newStaffPin} onChange={e => setNewStaffPin(e.target.value)}
        />
        <button 
          onClick={handleAddStaff} disabled={loading}
          className="bg-blue-600 text-white rounded-lg font-black uppercase text-xs hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <UserPlus size={16} /> {loading ? 'Saving...' : 'Add Staff'}
        </button>
      </div>

      {/* Staff List */}
      <div className="space-y-2">
        {staff.map(s => (
          <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
            <div>
              <div className="font-bold text-gray-900">{s.name}</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1">
                <Key size={10} /> PIN: {s.pin_code}
              </div>
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
