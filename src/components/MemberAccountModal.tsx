import React, { useState } from 'react';
import { Shield, User, X, Briefcase, Heart, Sparkles, Cake, Loader2, Info } from 'lucide-react';
// Import the existing component
import { ChangePasswordModal } from './ChangePasswordModal'; 

interface MemberAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  shopId: number;
  phone: string;
}

export const MemberAccountModal = ({ 
  isOpen, 
  onClose, 
  userData, 
  shopId, 
  phone 
}: MemberAccountModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    profession: userData?.profession || '',
    hobbies: userData?.hobbies || '',
    interests: userData?.interests || '',
    habits: userData?.habits || '',
    birthday: userData?.birthday || '', 
    personality_word: userData?.personality_word || ''
  });

  if (!isOpen) return null;

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-member-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userData?.id,
          shop_id: shopId,
          ...profileData 
        }),
      });

      if (response.ok) {
        alert("Profile bio updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Horizontal Tab Header */}
        <div className="flex bg-gray-50 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === 'profile' ? 'bg-white text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User size={16} /> My Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === 'security' ? 'bg-white text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Shield size={16} /> Change Password
          </button>
          <button onClick={onClose} className="px-6 text-gray-300 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {activeTab === 'security' ? (
            /* 
               CRITICAL FIX: 
               Since ChangePasswordModal has its own fixed-position backdrop, 
               we pass isOpen={true} so it renders its content. 
               This will effectively 'layer' it over the profile modal.
            */
            <ChangePasswordModal 
              isOpen={true} 
              onClose={onClose}
              userData={userData}
              shopId={shopId}
              phone={phone}
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-2">
                <h3 className="text-2xl font-black text-gray-900">Personal Bio</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter text-center">Tell the community about yourself</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Briefcase className="absolute left-4 top-4 text-blue-500" size={18} />
                  <input 
                    className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold"
                    placeholder="Profession"
                    value={profileData.profession}
                    onChange={e => setProfileData({...profileData, profession: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold"
                    placeholder="Hobbies"
                    value={profileData.hobbies}
                    onChange={e => setProfileData({...profileData, hobbies: e.target.value})}
                  />
                  <input 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold"
                    placeholder="Interests"
                    value={profileData.interests}
                    onChange={e => setProfileData({...profileData, interests: e.target.value})}
                  />
                </div>

                <textarea 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold min-h-[100px]"
                  placeholder="Idiosyncratic habits..."
                  value={profileData.habits}
                  onChange={e => setProfileData({...profileData, habits: e.target.value})}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold"
                    placeholder="Birthday (DD-MM)"
                    value={profileData.birthday}
                    onChange={e => setProfileData({...profileData, birthday: e.target.value})}
                  />
                  <input 
                    className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl border-none text-sm font-black text-center"
                    placeholder="One word bio"
                    value={profileData.personality_word}
                    onChange={e => setProfileData({...profileData, personality_word: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : 'SAVE BIO UPDATES'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
