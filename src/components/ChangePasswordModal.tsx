import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff, Loader2 } from 'lucide-react';

interface MemberData {
  id: number;
  phone_number: string;
  // ... you can add the other fields if you need them here, 
  // but phone_number is the important one for this file.
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  shopId: number;
  userData: MemberData | null;
}

export const ChangePasswordModal = ({ isOpen, onClose, phone, shopId, userData }: ChangePasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          shop_id: shopId,
          newPassword
        }),
      });

      if (!response.ok) throw new Error("Failed to update password. Try again.");
      
      alert("Password updated successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-gray-100">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Secure Your Account</h2>
          <p className="text-gray-500 text-sm mt-2 px-4">Please set a new password to complete your membership setup.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="New Password"
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 pr-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-4 text-gray-400"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Update & Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};
