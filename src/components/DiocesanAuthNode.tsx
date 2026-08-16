import React, { useState } from 'react';
import { Church, Lock, Phone, Eye, EyeOff } from 'lucide-react';

interface AuthNodeProps {
  onAuthSuccess: () => void;
}

export const DiocesanAuthNode: React.FC<AuthNodeProps> = ({ onAuthSuccess }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/ack-diocese-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phone.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {

        // 🧠 DEFENSIVE PATTERN: Dynamically intercepts any casing or property key name variation from n8n
        const dynamicTier = data.user.tier_level || data.user.tier_access || data.user.tier || 'DAUGHTER_CHURCH';
        const dynamicRole = data.user.user_role || data.user.role || 'MEMBER';
        const dynamicTenantId = data.user.tenant_id || data.user.assigned_id || data.user.id;

        // Cache session credentials securely, forcing uppercase styling to match DiocesanRouter
        localStorage.setItem('ack_erp_tier_access', String(dynamicTier).toUpperCase().trim()); 
        localStorage.setItem('ack_erp_assigned_id', String(dynamicTenantId));
        localStorage.setItem('ack_erp_user_name', data.user.full_name || 'Church Official');
        localStorage.setItem('ack_erp_user_role', String(dynamicRole).toUpperCase().trim());
        localStorage.setItem('ack_erp_phone', phone.trim());
        localStorage.setItem('ack_erp_user_id', String(data.user.id));
        localStorage.setItem('ack_erp_organization_name', String(data.user.organization_name));

        onAuthSuccess(); // Fire callback to shift the layout viewport
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Auth Link Failed:', err);
      setErrorMsg('Network Connection Error. Diocesan verification node unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mx-auto text-white mb-2 shadow-md">
            <Church className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">ACK Diocesan ERP</h2>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">Integrated Portal Gateway</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-xs font-bold uppercase tracking-wide">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input 
              type="tel" 
              placeholder="Phone Number (e.g. 0712...)" 
              required 
              disabled={loading}
              className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 relative">
            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Security Access Pin/Password" 
              required 
              disabled={loading}
              className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none pr-8" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Identity...' : 'Secure Log On'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Authorized Personnel Access Only. Under compliance of Kenyan Data Protection Act & Diocesan Governance framework policies.
          </p>
        </div>
      </div>
    </div>
  );
};
