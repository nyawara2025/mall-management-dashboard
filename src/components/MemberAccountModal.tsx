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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isOpen || !userData?.id) return;

    async function fetchLatestWelfareData() {
      setIsLoadingProfile(true);
      setErrorMessage(null);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-member-bio2', { // Reusing your main authenticated node or dedicated profile fetch endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'get_member_profile',
            shop_id: shopId,
            user_id: userData.id,
            phone: phone // Fallback search vector
          }),
        });

        if (!response.ok) throw new Error('Failed to retrieve server bio');

        const remoteData = await response.json();
        
        // Populate inputs with server data, falling back gracefully to base userData attributes
        setProfileData({
          profession: remoteData?.profession || userData.profession || '',
          hobbies: remoteData?.hobbies || userData.hobbies || '',
          interests: remoteData?.interests || userData.interests || '',
          habits: remoteData?.habits || userData.habits || '',
          birthday: remoteData?.birthday || userData.birthday || '', 
          personality_word: remoteData?.personality_word || userData.personality_word || ''
        });

        if (remoteData?.signature_data_url || userData.signature_data_url) {
          setCurrentSignature(remoteData?.signature_data_url || userData.signature_data_url);
        }
      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
        // Fallback gracefully to basic prop values if offline or middleware fails
        setProfileData({
          profession: userData.profession || '',
          hobbies: userData.hobbies || '',
          interests: userData.interests || '',
          habits: userData.habits || '',
          birthday: userData.birthday || '', 
          personality_word: userData.personality_word || ''
        });
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchLatestWelfareData();
  }, [isOpen, userData?.id, shopId, phone]);

  if (!isOpen) return null;

  // 📝 Input change handler helper
  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

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
                {/* LOADING MASK */}
                {isLoadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-xs font-medium">Synchronizing profile ledger...</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {errorMessage && (
                      <div className="p-2.5 text-xs font-semibold bg-red-50 border border-red-100 text-red-700 rounded-xl">
                         ⚠️ {errorMessage}
                      </div>
                    )}

                    {/* Profession Input Block */}
                    <div className="relative">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Profession</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.profession}
                          onChange={(e) => handleInputChange('profession', e.target.value)}
                          placeholder="Your Profession (e.g. Software Engineer)"
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Hobbies & Interests Split Grid Rows */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Hobbies</label>
                        <input
                          type="text"
                          value={profileData.hobbies}
                          onChange={(e) => handleInputChange('hobbies', e.target.value)}
                          placeholder="Cooking, hiking..."
                          className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Interests</label>
                        <input
                          type="text"
                          value={profileData.interests}
                          onChange={(e) => handleInputChange('interests', e.target.value)}
                          placeholder="Mentorship, missions..."
                          className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Unique Habits Text Field */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Unique Habits</label>
                      <input
                        type="text"
                        value={profileData.habits}
                        onChange={(e) => handleInputChange('habits', e.target.value)}
                        placeholder="Early bird, avid reader..."
                        className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                      />
                    </div>

                    {/* Birthday & One Word Bio Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Birthday</label>
                        <input
                          type="text"
                          value={profileData.birthday}
                          onChange={(e) => handleInputChange('birthday', e.target.value)}
                          placeholder="DD-MM-YYYY"
                          className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">One Word Bio</label>
                        <input
                          type="text"
                          value={profileData.personality_word}
                          onChange={(e) => handleInputChange('personality_word', e.target.value)}
                          placeholder="Visionary, Catalyst..."
                          className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </form>
                )}


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
