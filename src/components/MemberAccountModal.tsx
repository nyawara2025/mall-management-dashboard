import React, { useState, useEffect } from 'react';
import { Shield, User, X, Briefcase, Heart, Sparkles, Cake, Loader2, Info } from 'lucide-react';
// Import the existing component
import { ChangePasswordModal } from './ChangePasswordModal'; 
import { SignatureCaptureModal } from './SignatureCaptureModal';

interface MemberAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  shopId: number;
  phone: string;
  onUpdateSuccess: (updatedUser: any) => void;
}

export const MemberAccountModal = ({ 
  isOpen, 
  onClose, 
  userData, 
  shopId, 
  phone,
  onUpdateSuccess 
}: MemberAccountModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [profession, setProfession] = useState(userData?.profession || '');
  const [hobbies, setHobbies] = useState(userData?.hobbies || '');
  const [interests, setInterests] = useState(userData?.interests || '');

  // 🚀 ONBOARDING ARTILLERY HOOKS: Tracks signature state changes inside profile view
  const [isSigOpen, setIsSigOpen] = useState(false);
  const [currentSignature, setCurrentSignature] = useState(userData?.signature_data_url || null);

  const [profileData, setProfileData] = useState({
    profession: userData?.profession || '',
    hobbies: userData?.hobbies || '',
    interests: userData?.interests || '',
    habits: userData?.habits || '',
    birthday: userData?.birthday || '', 
    personality_word: userData?.personality_word || ''
  });

  // This hook guarantees your form fields re-sync with fresh database data every single time the modal is opened
  useEffect(() => {
    if (userData && isOpen) {
      setProfileData({
        profession: userData.profession || '',
        hobbies: userData.hobbies || '',
        interests: userData.interests || '',
        habits: userData.habits || '',
        birthday: userData.birthday || '', 
        personality_word: userData.personality_word || ''
      });
      
      if (userData.signature_data_url) {
        setCurrentSignature(userData.signature_data_url);
      }
    }
  }, [userData, isOpen]); // Adding isOpen as a strict dependency forces the re-sync on click

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
        // Structure your updated object context array payload exactly
        const updatedUserContext = {
          ...userData,
          profession: profession,
          hobbies: hobbies,
          interests: interests
        };

        // Execute your parent callback to force instant layout re-hydration!
        onUpdateSuccess(updatedUserContext);
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
                  placeholder="Unique habits..."
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

                {/* 🚀 ONBOARDING SECURE SIGNATURE CARD ROW PANEL */}
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">Security Signing Identity</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Required for authorizing ledger transactions & minutes logs</p>
                  </div>

                  {currentSignature ? (
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-24 bg-white border border-gray-100 rounded-xl p-1 overflow-hidden flex items-center justify-center shadow-2xs">
                        <img src={currentSignature} alt="Locked Signature" className="h-full object-contain" />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsSigOpen(true)} 
                        className="px-3 py-1.5 bg-white border text-gray-600 hover:text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-2xs transition-all font-bold"
                      >
                        Update
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSigOpen(true)}
                      className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-50 transition-all active:scale-95 font-bold"
                    >
                      ✍️ Register Signature
                    </button>
                  )}
                </div>

                {/* Signature modal element capture hook canvas overlay */}
                <SignatureCaptureModal 
                  isOpen={isSigOpen}
                  onClose={() => setIsSigOpen(false)}
                  userData={userData}
                  onSaveSuccess={(dataUrl) => setCurrentSignature(dataUrl)}
                />

              </div> {/* Closes input grid space-y-4 container */}

              <button 
                type="button"
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
