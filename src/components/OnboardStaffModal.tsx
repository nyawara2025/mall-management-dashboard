import React, { useState } from 'react';
import { X, UserPlus, Loader2, ShieldCheck } from 'lucide-react';

interface OnboardStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
}

const CAMPAIGN_ROLES = [
  { id: 'field_agent', label: 'Field Agent' },
  { id: 'admin', label: 'Campaign Admin' },
  { id: 'analyst', label: 'Data Analyst' },
  { id: 'candidate', label: 'Candidate Account' },
  { id: 'clerical', label: 'Clerical Staff' },
  { id: 'advisor', label: 'Strategic Advisor' }
];

export const OnboardStaffModal: React.FC<OnboardStaffModalProps> = ({ isOpen, onClose, shopId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    role: 'field_agent'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.password || !formData.firstName) {
      return alert("Please fulfill all required fields.");
    }

    setIsSaving(true);

    // Standardize input format into a clean E.164 string format
    let formattedPhone = formData.phone.trim().replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '+254' + formattedPhone;
    }

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/onboard-political-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          agent_phone: formattedPhone,
          plain_password: formData.password, // Handled and hashed on the backend/n8n side
          agent_first_name: formData.firstName,
          agent_last_name: formData.lastName,
          role: formData.role,
          status: 'active'
        })
      });

      if (!response.ok) throw new Error('Onboarding request failed');

      alert('Campaign staff member onboarded successfully!');
      setFormData({ firstName: '', lastName: '', phone: '', password: '', role: 'field_agent' });
      onClose();
    } catch (error) {
      console.error("Onboarding transaction failure:", error);
      alert('Failed to register agent. Ensure phone number format is unique.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 
animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex 
flex-col">
        <div className="bg-gray-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-md">Onboard Campaign Personnel</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">First Name *</label>
              <input
                type="text" required placeholder="James"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 
focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Last Name</label>
              <input
                type="text" placeholder="Nyikal"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 
focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kenyan Mobile Number *</label>
            <input
              type="tel" required placeholder="e.g. 0712345678"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 
focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Operational Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl bg-white focus:ring-2 
focus:ring-blue-500"
            >
              {CAMPAIGN_ROLES.map(role => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Temporary Password *</label>
            <input
              type="password" required placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 
focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex gap-3 border-t border-gray-50">
            <button
              type="button" onClick={onClose}
              className="w-1/2 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 
text-sm"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSaving}
              className="w-1/2 py-3 bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 
hover:bg-blue-700 disabled:opacity-50 text-sm shadow-md"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Save Access Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
