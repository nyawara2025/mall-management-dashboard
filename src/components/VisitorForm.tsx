import React, { useState } from 'react';
import { User, Smartphone, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { ConsentSection } from './ConsentSection'; // Reusing your compliant component

export const VisitorForm = ({ onComplete }: { onComplete: () => void }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [hasConsented, setHasConsented] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) return alert("Please provide consent to continue.");
    
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, shop_id: 68, consent_given: true })
      });

      if (response.ok) onComplete();
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-500">
      <div className="relative">
        <User className="absolute left-4 top-4 text-gray-400" size={18} />
        <input 
          required
          className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none font-bold text-gray-900"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className="relative">
        <Smartphone className="absolute left-4 top-4 text-blue-400" size={18} />
        <input 
          required
          className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none font-bold text-gray-900"
          placeholder="Phone Number (07...)"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-4 top-4 text-orange-400" size={18} />
        <input 
          type="email"
          className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none font-bold text-gray-900"
          placeholder="Email (Optional)"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <ConsentSection hasConsented={hasConsented} setHasConsented={setHasConsented} />

      <button 
        disabled={loading || !hasConsented}
        className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
          hasConsented ? 'bg-blue-600 text-white active:scale-95' : 'bg-gray-200 text-gray-400'
        }`}
      >
        {loading ? <Loader2 className="animate-spin" /> : "CHECK-IN & VIEW ORDER OF SERVICE"}
      </button>
    </form>
  );
};
