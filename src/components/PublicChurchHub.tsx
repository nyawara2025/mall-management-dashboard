import React, { useEffect, useState } from 'react';
import { 
  MapPin, CalendarDays, BookOpen, 
  LogOut, Lock, Phone as PhoneIcon,
  User, ShieldCheck, Users, Activity,
  MessageSquare, Heart, Radio, Wallet, Book, Globe, Bell, ClipboardList,
  Image as ImageIcon, MessageCircle, X, Calendar, TrendingUp,
  Send, Loader2, Quote, Sparkles, Hand, HandHelping, Church, HeartHandshake, Award, ScrollText, ListMusic, Store, UsersRound, ListOrdered, Megaphone, BellDot, CalendarRange, Presentation, HandCoins, Gift 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SokoniModal from './SokoniModal';
import { PrayerRequestModal } from './PrayerRequestModal';
import { ReceivedRequestsModal } from './ReceivedRequestsModal';
import { MemberAccountModal } from './MemberAccountModal';
import { GivingModal } from './GivingModal';
import { AppointmentsModal } from './AppointmentsModal';
import { OpinionModal } from './OpinionModal';
import { MemberMediaAccess } from './MemberMediaAccess';
import { ViewGivings } from './ViewGivings';
import { JoinMinistryOrZone } from './JoinMinistryOrZone';
import { LeaderMessageModal } from './LeaderMessageModal';
import { ViewBroadcastsModal } from './ViewBroadcastsModal';
import { WelfareModal } from './WelfareModal';
import { CanonFeedback } from './CanonFeedback';
import { FinancialsAndProjectsModal } from './FinancialsAndProjectsModal';
import { DevotionsModal } from './DevotionsModal';
import { CommunityAndZones } from './CommunityAndZones';
import { ServiceOrderTabs } from './ServiceOrderTabs';
import { MomentWithGodModal } from './MomentWithGodModal';
import { ProjectsRenderer } from './ProjectsRenderer';
import { PrayerEngagement } from './PrayerEngagement';
import { MemberChatModal } from './MemberChatModal';
import { DioceseModal } from './DioceseModal';
import { BaptismConfirmationModal } from './BaptismConfirmationModal';
import { ChurchDocumentsModal } from './ChurchDocumentsModal';
import { LeaderCreateBroadcast } from './LeaderCreateBroadcast';
import { DioceseActivitiesModal } from './DioceseActivitiesModal';
import { AppDownloadWidget } from './AppDownloadWidget';
import { IntegratedVideoConference } from './IntegratedVideoConference'; 
import { ConsentSection } from './ConsentSection';

// --- TYPES ---
interface PaymentRecord {
  amount: number;
  payment_date: string;
  transaction_id: string;
  status: string;
}

interface MemberData {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role: string;
  zone_name: string;
  ministry_name: string;
  is_ministry_leader?: boolean; // Add this
  is_zone_leader?: boolean;     // Add this
  registration_date: string;
  payment_history: PaymentRecord[] | null;
  shop_id: number; // Add this line
  org_id: number;
  church_name?: string; // <-- ADD THIS LINE HERE
}

interface ServiceActivity {
  activity_name: string;
  description: string;
  sort_order?: number;
}

interface ChurchService {
  service_name: string;
  start_time: string;
  activity_name: string;   // Added this (Flat field from n8n)
  description: string;     // Added this (Flat field from n8n)
  id?: string;
  service_date?: string;
  // We keep this optional so old code doesn't crash, 
  // but n8n now fills the flat fields above instead.
  service_activities?: ServiceActivity[]; 
}

interface Meeting {
  id: string;
  title: string;
  content: string;
  recipient_type: string;
  recipient_value: string;
  meeting_date: string;
  meeting_time: string;
  category: string;
  location: string;
  agenda?: string;
  meeting_notes?: string;
  attendance_list?: any[];
  shop_id: number;
}

interface MeetingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: MemberData | null;
}

interface Notification {
  id: string;
  type: 'broadcast' | 'notice' | 'alert' | 'message';
  content: string;
  created_at: string;
  is_urgent: boolean;
}

interface Shop {
  id: number;
  name: string;
  category: string;
  description?: string;
  // add other fields your shop object has (e.g., image, location)
}

interface SokoniModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  onVisitShop: (shopId: number) => Promise<void> | void;
}


// --- COMPONENT 1: Login ---
export const ChurchHubLogin = ({ shopId, onLoginSuccess }: { shopId: number, onLoginSuccess: (data: MemberData) => void }) => {
  // 1. Core Tenant State Variables
  const [activeShopId, setActiveShopId] = useState<number>(shopId || 68);
  const [churches, setChurches] = useState<{ id: number; name: string }[]>([]);
  const [fetchingChurches, setFetchingChurches] = useState(false);

  // 2. Fetch all available churches dynamically from your n8n workflow
  useEffect(() => {
    const fetchChurchesFromWorkflow = async () => {
      setFetchingChurches(true);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-churches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_active_churches' }) // Optional payload if needed by n8n
        });

        if (!response.ok) throw new Error("Failed to pull registry folder");
        const result = await response.json();
        
        // Normalize if n8n returns an array or an object containing the list
        const churchList = Array.isArray(result) ? result : (result.churches || []);
        setChurches(churchList);
      } catch (err) {
        console.error("Error loading churches registry via n8n:", err);
      } finally {
        setFetchingChurches(false);
      }
    };

    fetchChurchesFromWorkflow();
  }, []);

  // Find the label matching our state for the UI string interpolation
  const activeChurchName = churches.find(c => c.id === activeShopId)?.name || "Selected Church";

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);

  const [resetStep, setResetStep] = useState(1); // 1 = Request, 2 = Verify & Update
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [hasConsented, setHasConsented] = useState(false);


  const handleForgotPassword = async () => {
    if (!phone) {
      alert("Please enter your phone number first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.startsWith('+') ? phone : `+${phone}`,
          shop_id: activeShopId
        }),
      });

      if (response.ok) {
        alert("Verification code sent to WhatsApp!");
        setIsResetMode(true);
        setResetStep(2);
      } else {
        throw new Error("Failed to request reset.");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // This function calls a second webhook: /church-confirm-reset
  const handleConfirmReset = async () => {
    if (!otpCode || !newPassword) {
      alert("Please enter the code and your new password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-confirm-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          otpCode, 
          newPassword, // n8n will bcrypt this before saving
          shop_id: activeShopId 
        }),
      });
     
      if (response.ok) {
        alert("Password updated successfully! You can now sign in.");
        setIsResetMode(false); // Go back to login screen
        setResetStep(1);      // Reset step for next time
        setPassword('');       // Clear old password field
      } else {
        const result = await response.json();
        throw new Error(result.message || "Failed to update password.");
      }
    } catch (error: any) {
      alert(error.message);


    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    // Basic Validation
    if (!phone || !password) {
      alert("Please enter both phone and password");
      return;
    }
  
    if (isSignUp && !hasConsented) {
      alert("Please accept the Data Privacy consent to continue.");
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      alert("Please enter your first and last name to create a profile");
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
  
    try {
      // Construct the payload
      const payload = {
        phone: formattedPhone,
        password: password,
        isSignUp: isSignUp,
        shop_id: activeShopId,
        // Only send names if it's a Signup attempt
        first_name: isSignUp ? firstName : undefined,
        last_name: isSignUp ? lastName : undefined,
        consent_given: isSignUp ? hasConsented : undefined,
        consent_timestamp: isSignUp ? new Date().toISOString() : undefined
      };

      const response = await fetch('https://n8n.tenear.com/webhook/church-user-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // 1. Handle HTTP Errors (400, 401, 500 etc)
      if (!response.ok) {
        throw new Error(result.message || result.error || "Authentication failed. Please check your credentials.");
      }

      // 2. Process Success
      // We normalize the result because n8n sometimes wraps objects in arrays
      const userData = Array.isArray(result) ? result[0] : result;

      if (userData && (userData.token || userData.id)) {
      
        // Save to localStorage so session persists on refresh
        localStorage.setItem(`church_auth_${shopId}`, 'true');
        localStorage.setItem(`church_user_${shopId}`, JSON.stringify(userData));
      
        // 2. CHECK THE FLAG HERE
        if (userData.mustChangePassword) {
           // Trigger your "Change Password" modal or view
   
           alert("Welcome! Please set a new password to secure your account.");
        } else if (isSignUp) {
           alert("Welcome! Your account has been created successfully.");
        }

        onLoginSuccess(userData);
      }

    } catch (error: any) {
      console.error("Auth Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock size={36} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isResetMode ? 'Reset Password' : isSignUp ? 'Join Us' : 'Welcome Back'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isResetMode ? 'Verify your identity' : `Access the ${activeChurchName} Member Hub`}
          </p>
        </div>

        <div className="space-y-4">

          {/* --- NEW DYNAMIC DROPDOWN SELECTOR BLOCK --- */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
              Select Your Church
            </label>
            <div className="relative">
              <select
                value={activeShopId}
                onChange={(e) => setActiveShopId(Number(e.target.value))}
                disabled={fetchingChurches}
                className="w-full p-4 bg-gray-50 text-gray-800 text-xs font-semibold rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer disabled:opacity-50"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, 
                  backgroundRepeat: 'no-repeat', 
                  backgroundPosition: 'right 16px center', 
                  backgroundSize: '16px' 
                }}
              >
                {fetchingChurches ? (
                  <option>Loading churches...</option>
                ) : (
                  churches.map((church) => (
                    <option key={church.id} value={church.id}>
                      {church.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          {/* --- END OF DROPDOWN BLOCK --- */}

          {/* Sign Up Fields */}
          {isSignUp && !isResetMode && (
            <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                required
              />

              {/* INSERT CONSENT SECTION HERE */}
              <ConsentSection 
                hasConsented={hasConsented} 
                setHasConsented={setHasConsented} 
              />

            </div>
          )}

          {/* Common Phone Input */}
          <div className="relative">
            <PhoneIcon className="absolute left-4 top-4 text-gray-400" size={20} />
            <input 
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Phone (254...)" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              disabled={resetStep === 2}
            />
          </div>

          {/* Logic for Reset Step 2 (Entering OTP and New Password) */}
          {isResetMode && resetStep === 2 ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-blue-50 p-4 rounded-2xl text-xs text-blue-700 font-medium">
                Enter the 6-digit code sent to your WhatsApp.
              </div>
              <input 
                type="text" 
                placeholder="Verification Code" 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          ) : (
            /* Regular Password Input (Login/Signup) */
            !isResetMode && (
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                <input 
                  type="password" 
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            )
          )}

          {!isSignUp && (
            <div className="flex justify-end px-2">
              <button 
                onClick={() => { setIsResetMode(!isResetMode); setResetStep(1); }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isResetMode ? 'Back to Login' : 'Forgot Password?'}
              </button>
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={
              isResetMode 
                ? (resetStep === 1 ? handleForgotPassword : handleConfirmReset) 
                : handleAuth
            }
            disabled={loading} 
            className={`w-full text-white p-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${isSignUp ? 'bg-green-600' : 'bg-blue-600'} ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Processing...' : (
              isResetMode 
                ? (resetStep === 1 ? 'Send WhatsApp Code' : 'Update Password') 
                : (isSignUp ? 'Request Membership' : 'Sign In')
            )}
          </button>

          {!isResetMode && (
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="w-full text-sm text-gray-400 hover:text-blue-600 transition-colors text-center font-semibold mt-2"
            >
              {isSignUp ? 'Already a member? Sign In' : 'New here? Request Access'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AlertsRibbon = ({ userId, shopId }: { userId: number, shopId: number }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, shopId }),
      });
      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Optional: Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading || alerts.length === 0) return null;

  return (
    <div className="w-full mb-8 space-y-3">

      {/* 🛑 PLUG IN OUR NEW LEADER WRAPPER COMPONENT HERE 🛑 */}
      <LeaderCreateBroadcast 
        role="leader"
        userId={userId} 
        shopId={shopId} 
        onBroadcastCreated={fetchAlerts} 
      />


      {alerts.map((alert, index) => (
        <div 
          key={index} 
          className={`flex items-center justify-between p-4 rounded-[2rem] border animate-in slide-in-from-top-2 duration-500 ${
            alert.priority === 'high' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${alert.priority === 'high' ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-lg`}>
              {alert.type === 'broadcast' ? <Radio size={20} /> : <Bell size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                {alert.category || 'General Notice'}
              </p>
              <p className="text-sm font-bold text-gray-800">{alert.message}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-2">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};



const ProfileCard = ({ userData }: { userData: MemberData }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
      {/* --- LEFT COLUMN: PROFILE --- */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 h-full flex flex-col items-center text-center relative overflow-hidden">
    
          {/* Member Badge */}
          <div className="absolute top-6 right-6">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
              {userData?.role || 'Member'}
            </span>
          </div>

          {/* Avatar */}
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-100 relative group transition-transform hover:scale-105">
            <span className="text-4xl font-black italic">
              {userData?.first_name?.charAt(0) || 'M'}
            </span>
          </div>

          {/* Personalized Greeting */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              {userData?.first_name ? `Jambo, ${userData.first_name}` : 'Welcome onboard!'}
            </h2>
            <p className="text-gray-400 font-medium mt-1">{userData?.church_name || 'My Church'}</p>
          </div>

          {/* Data Display Slots */}
          <div className="mt-8 space-y-3">
            {/* ZONE SECTION */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ZONE</p>
                <p className="font-bold text-gray-700">{userData?.zone_name || 'Not Assigned'}</p>
              </div>
            </div>

            {/* MINISTRIES SECTION - Now with Badges */}
            <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
              <div className="flex items-center gap-4 mb-1">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Users size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MY MINISTRIES</p>
              </div>
    
              <div className="flex flex-wrap gap-2 pl-14">
                {userData?.ministry_name && userData.ministry_name !== 'Not Assigned' ? (
                  (userData.ministry_name as string).split(',').map((ministry: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-white text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase shadow-sm"
                    >
                      {ministry.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-gray-300 italic">No Ministry Joined</span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const MeetingsModal = ({ isOpen, onClose, userData }: MeetingsModalProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // 🚀 PLAN STEP 1: Insert state engines for Agenda, Notes, and Attendance tracking
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<'agenda' | 'notes' | 'attendance'>('agenda');
  const [editedAgenda, setEditedAgenda] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // 🟢 VIDEO CONFERENCE STATE ENGINE INJECTIONS
  const [activeCallUrl, setActiveCallUrl] = useState<string | null>(null);
  const [activeCallTitle, setActiveCallTitle] = useState<string>('');

  // Form State for Admins
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    category: 'All Church',
    location: ''
  });

  const categories = ['All Church', 'Zonal', 'Regional', 'Ministry', 'Ad hoc'];

  useEffect(() => {
    if (isOpen) fetchMeetings();
  }, [isOpen]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/get-church-meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userData?.id,
          shop_id: userData?.shop_id,
          role: userData?.role,
          zone: userData?.zone_name,
          ministry: userData?.ministry_name 
        }),
      });
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      console.error("Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/create-church-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMeeting,
          created_by: userData?.id,
          org_id: userData?.org_id,
          shop_id: userData?.shop_id,
          // Dynamic names based on category selection
          target_name: newMeeting.category === 'Zonal' ? userData?.zone_name : 
                       newMeeting.category === 'Ministry' ? userData?.ministry_name : 'General'
        }),
      });
      if (response.ok) {
        alert("Meeting Scheduled!");
        setIsCreating(false);
        fetchMeetings();
      }
    } catch (err) {
      alert("Error creating meeting");
    }
  };

  // 🚀 PLAN STEP 2: Handle data committal back to the database via n8n
  const handleUpdateDocumentation = async () => {
    if (!selectedMeeting) return;
    setUpdating(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-church-meeting-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: selectedMeeting.id,
          org_id: userData?.org_id,
          shop_id: userData?.shop_id,
          agenda: editedAgenda,
          meeting_notes: editedNotes
        })
      });
      
      if (response.ok) {
        // Synchronize local states instantly
        setSelectedMeeting({ 
          ...selectedMeeting, 
          agenda: editedAgenda, 
          meeting_notes: editedNotes 
        });
        alert("Meeting records updated successfully!");
        fetchMeetings(); // Silently refresh the list array background
      } else {
        alert("Server rejected the update.");
      }
    } catch (err) {
      console.error("Documentation update error:", err);
      alert("Error committing documentation updates.");
    } finally {
      setUpdating(false);
    }
  };

  // 🚀 FIXED: Simple, flat variable declaration placed right before your open check guard
  const isLeader = 
    userData?.role?.toLowerCase() === 'canon' ||
    userData?.role?.toLowerCase() === 'leader' ||
    userData?.role?.toLowerCase() === 'chairman' ||
    userData?.role?.toLowerCase() === 'chairperson' ||
    userData?.is_ministry_leader ||
    userData?.is_zone_leader;

  // 🟢 VIDEO CONFERENCE ACTIVATION CONTROLLER
  const handleToggleLiveCall = async (meeting: any, action: 'join' | 'start') => {
    const fullName = userData ? `${userData.first_name} ${userData.last_name}`.trim() : 'Member';
    const cleanUsername = encodeURIComponent(fullName || userData?.phone_number || 'Member');
    
    if (action === 'start') {
      // 1. Leader dynamically generates an unguessable room signature hash
      const generatedRoomId = `stb_${userData?.shop_id || '68'}_rm_${meeting.id}_${Math.random().toString(36).substring(2, 7)}`;
      const roomPassword = Math.random().toString(36).substring(2, 7);
      
      const builtConferenceUrl = `https://vdo.ninja{generatedRoomId}&pw=${roomPassword}&label=${cleanUsername}&push&transparent&audiocodec=opus&videocodec=vp8`;

      try {
        // 2. Alert the n8n backend to update the meeting's row status to live with the room link
        await fetch('https://n8n.tenear.com/webhook/church-live-meeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meeting_id: meeting.id,
            shop_id: userData?.shop_id,
            vdo_url: builtConferenceUrl,
            is_live: true
          })
        });

        setActiveCallUrl(builtConferenceUrl);
        setActiveCallTitle(meeting.title || 'Live Fellowship');
        fetchMeetings(); // Refresh the local state lists view
      } catch (err) {
        alert("Failed to propagate video session signals across the network.");
      }
    } else {
      // 3. Members read the exact room link generated by the leader directly out of the row record data
      if (!meeting.vdo_url) {
        alert("Meeting link signature hasn't been propagated by the leader yet.");
        return;
      }
      // Overwrite the label parameter to pass the member's native username profile string safely
      const memberJoinUrl = `${meeting.vdo_url.split('&label=')[0]}&label=${cleanUsername}&push&transparent&audiocodec=opus&videocodec=vp8`;
      
      setActiveCallUrl(memberJoinUrl);
      setActiveCallTitle(meeting.title || 'Live Fellowship');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-[82vh] max-h-[82vh] overflow-hidden">
        
        {/* PANEL HEADER BANNER BOX */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {selectedMeeting ? "Session Workdesk" : "Meetings Hub"}
            </h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              {selectedMeeting ? selectedMeeting.title : "Parish gatherings schedule registry"}
            </p>
          </div>
          <button 
            onClick={() => selectedMeeting ? setSelectedMeeting(null) : onClose()} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* COMPONENT ROUTER PANEL MATRIX */}
        {activeCallUrl ? (
          /* 🟢 CHANNELS VIEW A: LIVE ALL-IN-ONE VIDEO CONFERENCE PANEL (STANDALONE) */
          <div className="flex-1 p-4 bg-gray-950 flex flex-col h-[70vh]">
            <IntegratedVideoConference 
              activeCallUrl={activeCallUrl}
              activeCallTitle={activeCallTitle}
              onDisconnect={() => setActiveCallUrl(null)}
            />
          </div>
        ) : !selectedMeeting ? (
          /* 📋 SUB-VIEW B: DYNAMIC INDEX MEETINGS LIST VIEW */
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
            {isLeader && (
              <button 
                onClick={() => setIsCreating(!isCreating)} 
                className="w-full py-3.5 border-2 border-dashed border-blue-200 bg-blue-50/40 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-all active:scale-99"
              > 
                {isCreating ? 'Dismiss Creator Form' : '+ Schedule New Meeting Session'} 
              </button> 
            )}

            {/* Admin Creator Drawer form injection spot hook */}
            {isCreating && isLeader && (
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Gathering Title Header</label>
                  <input type="text" placeholder="Type title..." value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full p-3 rounded-xl border-none bg-white text-sm font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Date</label>
                    <input type="date" value={newMeeting.date} onChange={e => setNewMeeting({...newMeeting, date: e.target.value})} className="w-full p-3 rounded-xl border-none bg-white text-sm font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Time</label>
                    <input type="time" value={newMeeting.time} onChange={e => setNewMeeting({...newMeeting, time: e.target.value})} className="w-full p-3 rounded-xl border-none bg-white text-sm font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Category Target Scope</label>
                    <select value={newMeeting.category} onChange={e => setNewMeeting({...newMeeting, category: e.target.value})} className="w-full p-3 rounded-xl border-none bg-white text-sm font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-wider">Location / Sanctuary Venue</label>
                    <input type="text" placeholder="e.g. Main Hall..." value={newMeeting.location} onChange={e => setNewMeeting({...newMeeting, location: e.target.value})} className="w-full p-3 rounded-xl border-none bg-white text-sm font-medium outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button type="button" onClick={handleCreateMeeting} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-50 hover:bg-blue-700 transition-colors mt-2">Publish Gathering Notice</button>
              </div>
            )}

            {loading ? (
              <p className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing parish registry calendar...</p>
            ) : meetings.length === 0 ? (
              <p className="text-center py-12 text-xs italic text-gray-400 font-medium">No meetings scheduled matching your membership profile permissions.</p>
            ) : (
              <div className="space-y-3"> 
                {meetings.map((meet: any, idx) => {
                  // 1. Identify authorization scopes using your explicit MemberData properties
                  const isLeader = userData?.role === 'leader' || userData?.role === 'admin' || userData?.is_ministry_leader || userData?.is_zone_leader;
              
                  return (
                    <div 
                      key={idx} 
                      onClick={() => { 
                        setSelectedMeeting(meet); 
                        setEditedAgenda(meet.agenda || ''); 
                        setEditedNotes(meet.meeting_notes || ''); 
                        setActiveTab('agenda'); 
                      }} 
                      className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-2xs hover:border-blue-100 transition-all cursor-pointer space-y-2 group relative"
                    > 
                      <div className="flex justify-between items-start text-[9px] font-black uppercase tracking-wider"> 
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100"> 
                            {meet.recipient_value || 'All Church'} 
                          </span> 
                          <span className="text-gray-400">📅 {meet.meeting_date} at {meet.meeting_time || 'TBA'}</span> 
                        </div>

                        {/* 🟢 THE VIDEO CONFERENCE CONTROL SWITCH AND BUTTONS PANEL */}
                        <div className="flex items-center gap-1.5">
                          {/* Control Option A: Authorised Leader sees the 'Go Live' switch if call is offline */}
                          {isLeader && !meet.is_live && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); // 🔐 Blocks parent modal panel navigation click
                                handleToggleLiveCall(meet, 'start');
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl shadow-sm hover:bg-blue-700 transition-all"
                            >
                              🎥 Go Live
                            </button>
                          )}

                          {/* Control Option B: All regular members see a glowing 'Join Live' pulse button once activated */}
                          {meet.is_live && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); // 🔐 Blocks parent modal panel navigation click
                                handleToggleLiveCall(meet, 'join');
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl shadow-sm animate-pulse flex items-center gap-1 hover:brightness-110 transition-all"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                              Join Live Call
                            </button>
                          )}
                        </div>
                      </div> 

                      <h3 className="font-black text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{meet.title}</h3> 
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{meet.content || meet.location}</p> 
                    </div> 
                  );
                })} 
              </div> 
            )} 
          </div> 
        ) : (



          /* 📥 SUB-VIEW B: ADVANCED TABBED DOCUMENTATION SYSTEM CANVAS VIEW */
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-150">
            
            {/* Top Internal Tab Selectors Bar */}
            <div className="flex border-b px-6 bg-gray-50/30 gap-4 text-[10px] font-black uppercase tracking-widest">
              {(['agenda', 'notes', 'attendance'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 border-b-2 transition-all ${
                    activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Selected Active Content Canvas Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'agenda' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <h4 className="font-black text-[10px] uppercase tracking-wider text-gray-400">🎬 Agenda Outlines</h4>
                  {isLeader ? (
                    <textarea 
                      value={editedAgenda} onChange={e => setEditedAgenda(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 font-medium text-xs text-gray-700 h-44 resize-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Compile agenda discussion headers..."
                    />
                  ) : (
                    <p className="p-4 bg-gray-50 border rounded-2xl text-xs text-gray-600 whitespace-pre-line leading-relaxed font-medium">
                      {selectedMeeting.agenda || "No agenda details published yet for this gathering session."}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <h4 className="font-black text-[10px] uppercase tracking-wider text-gray-400">📖 Minutes & Resolutions</h4>
                  {isLeader ? (
                    <textarea 
                      value={editedNotes} onChange={e => setEditedNotes(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 font-medium text-xs text-gray-700 h-44 resize-none outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                      placeholder="Log session decisions, notes or meeting minutes resolution logs here..."
                    />
                  ) : (
                    <p className="p-4 bg-gray-50 border rounded-2xl text-xs text-gray-600 whitespace-pre-line leading-relaxed font-medium">
                      {selectedMeeting.meeting_notes || "Meeting minutes have not been published by the secretary yet."}
                    </p>
                  )}  
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4 animate-in fade-in duration-100 text-left">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h4 className="font-black text-[10px] uppercase tracking-wider text-gray-400">
                      👥 Confirmed Attendees Registry ({selectedMeeting.attendance_list?.length || 0})
                    </h4>
                    
                    {/* 🚀 THE LIVE ATTENDANCE INTERACTIVE TRIGGgER BUTTON */}
                    <button
                      type="button"
                      onClick={async () => {
                        // 1. Safe extraction of current list array
                        let currentList = Array.isArray(selectedMeeting.attendance_list) ? [...selectedMeeting.attendance_list] : [];
                        const myKey = userData?.phone_number || userData?.email || "254716300197";
                        
                        // 2. Automated evaluation check (Toggle Sign-In / Leave mechanisms)
                        const isAlreadySigned = currentList.some((m: any) => m.phone === myKey);
                        if (isAlreadySigned) {
                          currentList = currentList.filter((m: any) => m.phone !== myKey);
                        } else {
                          currentList.push({
                            name: `${userData?.first_name || 'Parish'} ${userData?.last_name || 'Member'}`.trim(),
                            phone: myKey,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          });
                        }

                        // 3. Dispatch the complete payload directly to your backend network pipeline
                        try {
                          const response = await fetch('https://n8n.tenear.com/webhook/update-church-meeting-attendance', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              meeting_id: selectedMeeting.id,
                              attendance_list: currentList
                            })
                          });
                          if (response.ok) {
                            // Instantly re-hydrate client views dynamically without reloading page
                            setSelectedMeeting({ ...selectedMeeting, attendance_list: currentList });
                          } else {
                            alert("Attendance sync rejected by gateway.");
                          }
                        } catch (err) {
                          console.error("Attendance synchronization error:", err);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-2xs transition-all active:scale-95 flex items-center gap-1 ${
                        (selectedMeeting.attendance_list || []).some((m: any) => m.phone === (userData?.phone_number || userData?.email || "254716300197"))
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {(selectedMeeting.attendance_list || []).some((m: any) => m.phone === (userData?.phone_number || userData?.email || "254716300197")) 
                        ? '❌ Cancel Attendance' 
                        : '✍️ Sign Present'}
                    </button>
                  </div>

                  {/* ATTENDEE LIST ROW RENDER MATRIX */}
                  <div className="bg-gray-50 border rounded-2xl divide-y overflow-hidden max-h-44 overflow-y-auto">
                    {selectedMeeting.attendance_list && selectedMeeting.attendance_list.length > 0 ? (
                      selectedMeeting.attendance_list.map((m: any, i: number) => (
                        <div key={i} className="p-3 bg-white flex justify-between items-center text-xs px-4">
                          <p className="font-bold text-gray-800">{m.name}</p>
                          <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 border rounded-md">
                            ⏰ {m.time || 'Verified'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-xs font-medium text-gray-400 italic bg-white">
                        No attendance records found. Tap 'Sign Present' above to check-in right now!
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Leader Documentation Committal Footer Action Trigger */}
            {isLeader && activeTab !== 'attendance' && (
              <div className="p-4 border-t bg-gray-50/50 px-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateDocumentation}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md shadow-blue-50 active:scale-95"
                >
                  {updating ? 'Saving Changes...' : 'Commit Modifications'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};  
           



const GalleryModal = ({ isOpen, onClose, userData, shopId }: { isOpen: boolean, onClose: () => void, userData: MemberData | null, shopId: number }) => {
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const BUCKET_NAME = 'church-gallery';

  useEffect(() => {
    if (isOpen) fetchImages();
  }, [isOpen]);

  const fetchImages = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      // Replace with your actual n8n GET webhook URL
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shop_id: shopId,
          bucket: BUCKET_NAME,
          limit: 100 
        }),
      });


      if (!response.ok) throw new Error("Failed to fetch gallery");

      const result = await response.json();
    
      // Check for the .images property specifically
      if (result && Array.isArray(result.images)) {
        setImages(result.images);
      } else {
        setImages([]);
      }
   

    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('data', file); // 'data' matches the n8n binary property name
      formData.append('fileName', `${Date.now()}-${file.name}`);
      formData.append('shop_id', String(shopId));
      const response = await fetch('https://n8n.tenear.com/webhook/church-photos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Photo uploaded successfully!");
        fetchImages(); // Refresh the gallery view
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Photo Gallery</h3>
            <p className="text-sm text-gray-500">Memories from our community</p>
          </div>
          <div className="flex gap-3">
            {userData?.role === 'admin' && (
              <label className={`cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-2xl" />)}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">No photos uploaded yet.</div>
          ) : (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {images.map((img, index) => {

                // Check if the URL ends in a common video format
                const isVideo = img.url?.match(/\.(mp4|webm|ogg|mov)$/i);
                return (
                  <div key={img.id || index} className="relative group overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                    {isVideo ? (
                      <video 
                        src={img.url} 
                        controls 
                        className="w-full h-auto object-cover rounded-2xl"
                      />
                    ) : (
                      <img 
                        src={img.url} 
                        alt="Gallery" 
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- COMPONENT 2: Main Hub ---
export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [church, setChurch] = useState<any>(null);
 
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<MemberData | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'service_order' | 'welfare'>('dashboard');
  const [services, setServices] = useState<ChurchService[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeShopId = shopId || 68;
  const [isWelfareModalOpen, setIsWelfareModalOpen] = useState(false);

  const LOGO_URL = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church-logos/StBarnabasGoldebLogo1.jpeg";
  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isSokoniOpen, setIsSokoniOpen] = useState(false);
  const [shops, setShops] = useState<any[]>([]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [isGivingModalOpen, setIsGivingModalOpen] = useState(false);

  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isOpinionModalOpen, setIsOpinionModalOpen] = useState(false);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  
  const [isViewGivingsOpen, setIsViewGivingsOpen] = useState(false);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [isLeaderMessageOpen, setIsLeaderMessageOpen] = useState(false);
  
  const [isViewBroadcastsOpen, setIsViewBroadcastsOpen] = useState(false);

  const [isCanonFeedbackOpen, setIsCanonFeedbackOpen] = useState(false);

  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);

  const [isDevotionsOpen, setIsDevotionsOpen] = useState(false);

  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  const [isMomentOpen, setIsMomentOpen] = useState(false);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const [isSacramentOpen, setIsSacramentOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const [isActivitiesReportOpen, setIsActivitiesReportOpen] = useState<boolean>(false);

  const [isDioceseOpen, setIsDioceseOpen] = useState(false);

  // 1. Force extract tracking variables from the active browser address bar
  const urlParams = new URLSearchParams(window.location.search);
  const isPublicChurchView = urlParams.get('view') === 'public_church';
  const queryShopId = parseInt(urlParams.get('shop_id') || "68", 10);

  // 2. Add an independent state hook to hold public data profiles safely
  const [publicChurchData, setPublicChurchData] = useState<any>(null);
  const [publicLoading, setPublicLoading] = useState(isPublicChurchView);

  const [activeProjectView, setActiveProjectView] = useState<'planned' | 'fundraising' | null>(null);

  const handleAccountClick = () => {
    setIsPasswordModalOpen(true);
  };

  const getActiveShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    return data || [];
  };

   const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

  useEffect(() => {
  // Guard clause: Only run this fetch routine if the viewer enters through a public link
  if (!isPublicChurchView) return;

  async function loadPublicChurchNotices() {
    setPublicLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shop_id: queryShopId,
          is_public: true 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Handle both flat objects or indexed array responses cleanly
        setPublicChurchData(Array.isArray(result) ? result[0] : result);
      }
    } catch (err) {
      console.error("Public notice engine failure:", err);
    } finally {
      setPublicLoading(false);
    }
  }

  loadPublicChurchNotices();
}, [isPublicChurchView, queryShopId]);

  
  // --- PUBLIC VIEW INTERCEPTOR GUARD ---
if (isPublicChurchView) {
  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Dynamic Header Box */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-white/20 text-white uppercase tracking-widest">
            Church Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
            {publicChurchData?.church_name || 'Loading Sanctuary Details...'}
          </h1>
          <p className="text-blue-100 text-xs font-medium pt-0.5">Public Notice Board & Information Hub</p>
        </div>
        
        {/* DYNAMIC MULTI-TENANT BRANDING LOGO */}
        <div className="relative z-10 order-1 md:order-2 flex-shrink-0 self-start md:self-center">
          {publicChurchData?.logo_url && publicChurchData.logo_url.trim() !== "" ? (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 p-1 shadow-2xl overflow-hidden flex items-center justify-center">
              <img 
                src={publicChurchData.logo_url.split('http')[1] ? 'http' + publicChurchData.logo_url.split('http')[1] : publicChurchData.logo_url} 
                alt={`${publicChurchData?.church_name || 'Church'} Logo`} 
                className="w-full h-full object-contain p-1 bg-white rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            /* Elegant Text-Avatar Fallback if logo_url is completely null/missing */
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-xl font-black tracking-tighter text-white uppercase">
              {publicChurchData?.church_name ? publicChurchData.church_name.split(' ').map((n: string) => n[0]).join('').substring(0, 3) : 'ACK'}
            </div>
          )}
        </div>
      </div>

      {/* 📥 NEWLY INJECTED APP DOWNLOAD WIDGET */}
      <AppDownloadWidget />

      {/* Announcements Layout Arena */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Megaphone className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Notices & Community Events</h2>
        </div>

        {publicLoading ? (
          <div className="bg-white p-12 rounded-[2rem] border border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-400 shadow-xs">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <p className="text-[10px] font-black uppercase tracking-wider">Syncing notice board entries...</p>
          </div>
        ) : publicChurchData?.announcements && publicChurchData.announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            {publicChurchData.announcements.map((notice: any, idx: number) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-xs flex flex-col overflow-hidden hover:shadow-sm transition-all">
                
                {/* 🚀 FLYER IMAGE BANNER BLOCK */}
                {notice.image_url && notice.image_url.trim() !== "" && (
                  <div className="w-full max-h-64 overflow-hidden border-b border-gray-50 bg-slate-100 flex items-center justify-center relative">
                    <img 
                      src={notice.image_url} 
                      alt={notice.title}
                      className="w-full h-auto block object-contain hover:scale-[1.01] transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* TEXT CONTENT INNER CONTAINER */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl w-fit text-[10px] font-black uppercase tracking-wider">
                      <Calendar size={12} /> {notice.event_date || 'Upcoming'}
                    </div>
                    <h3 className="font-black text-gray-950 text-base tracking-tight leading-snug">{notice.title}</h3>
                    
                    {/* 🚀 FIXED: Dynamic Link Parser Content Body */}
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line text-left">
                      {(() => {
                        if (!notice.content) return '';
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const parts = notice.content.split(urlRegex);
                        return parts.map((part: string, i: number) => {
                          if (part.match(urlRegex)) {
                            return (
                              <a
                                key={i}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-bold underline break-all hover:text-blue-800 transition-colors inline-block"
                              >
                                {part}
                              </a>
                            );
                          }
                          return part;
                        });
                      })()}
                    </p>
                  </div>

                  {/* Card Footer Meta Attributes */}
                  {(notice.location || notice.time) && (
                    <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-black text-gray-400 uppercase tracking-wide">
                      {notice.time && <span className="flex items-center gap-1">⏰ {notice.time}</span>}
                      {notice.location && <span className="flex items-center gap-1">📍 {notice.location}</span>}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[2rem] border border-gray-100 text-center shadow-xs">
            <p className="text-xs italic text-gray-400 font-medium">No public updates or notice entries published at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
                


  const handleOpenSokoni = async () => {
    setIsSokoniOpen(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/nhc-active-shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // Simple Request: bypasses preflight
        },
        // Send an empty object as text so n8n can parse it if needed
        body: JSON.stringify({}) 
      });

      if (!response.ok) throw new Error('Failed to fetch shops');
      
      const data = await response.json();

      // Mapping to the "shops" key from your n8n output
      if (data && data.shops) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Sokoni Fetch Error:', error);
      setShops([]);
    }
  };


  const handleTrackShopView = async (shopId: number) => {
    const payload = {
      action: "track_view",
      product_id: "0", 
      shop_id: shopId.toString(),
      platform: "nhc residential",
      user_agent: navigator.userAgent,
      is_bot: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent),
      timestamp: new Date().toISOString()
    };

    try {
      // SIMPLE POST: no-cors + text/plain = No Preflight
      await fetch('https://n8n.tenear.com/webhook/shop-analytics-resident', {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      console.log('Analytics sent for shop:', shopId);
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  };
 

  useEffect(() => {
    const savedAuth = localStorage.getItem(`church_auth_${activeShopId}`);
    const savedUser = localStorage.getItem(`church_user_${activeShopId}`);

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(savedUser);
      setUserData(Array.isArray(parsedUser) ? parsedUser[0] : parsedUser);
    }

    async function fetchHubData() {
      if (!isAuthenticated && !savedAuth) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await supabase.from('churches').select('*').eq('shop_id', activeShopId);
        if (data && data.length > 0) setChurch(data[0]);

        const response = await fetch('https://n8n.tenear.com/webhook/fetch-public-service-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: activeShopId }),
        });

        if (response.ok) {
          const n8nData = await response.json();
          const rawServices = Array.isArray(n8nData) ? n8nData : (n8nData.services || n8nData);
          if (rawServices) setServices(rawServices);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHubData();
  }, [activeShopId, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem(`church_auth_${activeShopId}`);
    localStorage.removeItem(`church_user_${activeShopId}`);
    setIsAuthenticated(false);
    setUserData(null);
    setActiveView('dashboard');
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
  
    const userMsg = userInput;
    setUserInput(''); // Clear input immediately for UX
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/neochat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: activeShopId,
          user_id: userData?.id,
          user_name: `${userData?.first_name} ${userData?.last_name}`,
          message: userMsg,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data && data.text) {
        setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsSending(false);
    }
  };


  // --- SUB-VIEW: Order of Service ---
  const ServiceOrderView = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => setActiveView('dashboard')} className="text-blue-600 font-bold flex items-center gap-2">
        ← Back to Hub
      </button>
      <div className="flex-1 overflow-hidden">
        {/* Pass the flat 'services' array directly to your new component */}
        <ServiceOrderTabs data={services} />
      </div>

      {/* NEW: Prayer Engagement Component */}
      <PrayerEngagement 
        activeShopId={activeShopId} 
        serviceName="General Service" // You can track active tab here if needed
        userData={userData} 
      />

    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Hub...</div>;
  if (!isAuthenticated) return <ChurchHubLogin shopId={activeShopId} onLoginSuccess={(u) => {setUserData(u); setIsAuthenticated(true); localStorage.setItem(`church_auth_${activeShopId}`, 'true'); localStorage.setItem(`church_user_${activeShopId}`, JSON.stringify(u));}} />;
  if (!church) return <div className="p-10 text-center font-bold">Church Profile Not Found.</div>;

  return (
    <div className="min-h-screen relative font-sans text-gray-900 pb-20">
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${LOGO_URL})`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'contain', // Changed to contain so the logo doesn't crop
          backgroundPosition: 'center center'
        }}
      />
    
      {/* Transparent Overlay with Blur */}
      <div className="fixed inset-0 z-0 bg-white/60" />

      {/* Navigation - Adjusted to sit above background */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
            {userData?.church_name?.charAt(0) || 'S'}
          </div>
          <h1 className="font-bold text-gray-800 text-sm md:text-base truncate max-w-[200px]">
            {userData?.church_name || 'My Church'}
          </h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content - Wrapped in relative z-10 to appear above background */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/90 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {userData?.role || 'MEMBER'}
                  </span>
                </div>
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-100">
                  {userData?.first_name ? userData.first_name.charAt(0) : 'M'}
                  {userData?.last_name ? userData.last_name.charAt(0) : ''}
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  {userData?.first_name || 'Church'} {userData?.last_name || 'Member'}
                </h2>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black-400 uppercase tracking-widest">ZONE</p>
                      <p className="font-bold text-gray-700">{userData?.zone_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black-400 uppercase tracking-widest">CURRENT MINISTRY</p>
                      <p className="font-bold text-gray-700">{userData?.ministry_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
              <button 
                onClick={() => setIsOpinionModalOpen(true)}
                className="bg-blue-400 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all active:scale-95 group"
              > 
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center text-white-400">
                  <Sparkles size={20} className="md:w-[28px] md:h-[28px]" />
                </div>
                <span className="text-[9px] md:text-xs font-black text-white uppercase tracking-widest text-center">Share your thoughts</span>
              </button>
              <button 
                onClick={() => setIsPrayerModalOpen(true)}
                className="bg-blue-400 rounded-[2.5rem] p-8 shadow-sm border border-blue-50 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95"
              >
                <div className="p-4 bg-blue-50 text-white-600 rounded-2xl italic">
                  <HeartHandshake size={32} />
                </div>
                <span className="text-[10px] font-white text-white uppercase tracking-widest">Prayer Request</span>
              </button>

              {/* ONLY SHOW FOR CANON */}
              {userData?.role?.toLowerCase() === 'canon' && (
                <button 
                  onClick={() => setIsInboxOpen(true)}
                  className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:bg-blue-400 hover:shadow-md transition-all active:scale-95 group"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                    <Radio size={28} />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">
                    View Prayer Requests
                  </span>
                </button>
              )}

              <button onClick={() => setActiveView('service_order')} className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600"><ScrollText size={28} /></div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">ORDER OF SERVICE</span>
              </button>
              {/* BROADCAST SECTION */}
              <div className="relative group/container">
                <button 
                  onClick={() => setIsViewBroadcastsOpen(true)} // Assuming this opens the member's view
                  className="w-full bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Megaphone size={28} />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-widest text-center">Announcements</span>
                </button>

                {/* NEW: Small 'Send' button for Ministry/Zone Leaders */}
                {(userData?.is_ministry_leader || userData?.is_zone_leader) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents opening the member's 'received' view
                      setIsLeaderMessageOpen(true);
                    }}
                    className="absolute -top-2 -right-2 bg-amber-500 text-white p-3 rounded-xl shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 border-2 border-white z-10 animate-in zoom-in duration-200"
                    title="Send a Broadcast"
                  >
                    <Send size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Send Message</span>
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setIsMeetingsOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-xl transition-all active:scale-95"
              >
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-400">
                  <Users size={32} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-white">Meetings</span>
              </button>

              {/* TITHES & GIVING SECTION WITH CANON OVERLAY */}
              <div className="relative group/container">
                <button 
                  onClick={() => setIsGivingModalOpen(true)}
                  className="w-full h-full bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <HandCoins size={28} />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-widest text-center">TITHES & GIVING</span>
                </button>

                {/* Only show "View Givings" if the user role is Canon */}
                {userData?.role?.toLowerCase() === 'canon' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering the underlying GivingModal
                      setIsViewGivingsOpen(true);
                    }}
                    className="absolute -top-2 -right-2 bg-blue-900 text-white px-3 py-2 rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2 border-2 border-white z-10 animate-in zoom-in duration-200"
                  >
                    <BookOpen size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">View Givings</span>
                  </button>
                )}

                {/* New Overlay for Members: Canon's Appreciation/Feedback */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCanonFeedbackOpen(true);
                  }}
                  className="absolute -bottom-2 right-4 bg-yellow-400 text-blue-900 px-3 py-2 rounded-xl shadow-lg hover:bg-yellow-500 transition-all flex items-center gap-2 border-2 border-white z-10 animate-in slide-in-from-bottom-2 duration-300"
                >
                  <MessageCircle size={14} fill="currentColor" />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Canon's Feedback</span>
                </button>
              </div>

              <button 
                onClick={() => setIsWelfareModalOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                  <Wallet className="text-blue-400 group-hover:text-blue-600" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Welfare Contributions</span>
              </button>

              <button
                onClick={() => setIsDevotionsOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                  {/* Icon Grouping */}
                  <div className="relative">
                    <Users size={24} className="opacity-80" />
                    <Hand 
                      size={16} 
                      className="absolute -bottom-1 -right-1 bg-blue-50 rounded-full p-0.5" 
                    />
                  </div>
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">
                  DEVOTIONS
                </span>
              </button>
              <button 
                onClick={() => setIsMomentOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Church size={28} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">A MOMENT WITH GOD</span>
              </button>

              {/* 🌍 FIXED: Layout wrapper allowing the dashboard grid item and mini action controls to stay perfectly aligned */}
              <div className="relative group w-full">
                
                {/* 📊 THE CANON'S ANALYTICS ACCESS BADGE: Placed safely right on top of the border boundary card element line */}
                {userData?.role?.toLowerCase() === 'canon' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents clicking this mini button from opening the standard Member DioceseModal
                      setIsActivitiesReportOpen(true);
                    }}
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 hover:bg-gray-800 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg transition-all text-white border border-gray-700/50 flex items-center gap-1 z-20 whitespace-nowrap"
                  >
                    📊 View Activities
                  </button>
                )}

                {/* Primary Core Grid Navigation Card */}
                <button
                  type="button"
                  onClick={() => setIsDioceseOpen(true)}
                  className="w-full p-6 bg-blue-600 text-white rounded-[2rem] shadow-md shadow-blue-50 hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="bg-white/10 p-2.5 rounded-2xl group-hover:scale-105 transition-transform border border-white/10">
                    <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide">ACK DIOCESE OF NAIROBI</span>
                </button>
              </div>

              <button 
                onClick={() => setIsMediaOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-center hover:scale-[1.02] transition-transform active:scale-95"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <ScrollText size={24} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-wider text-white">
                  Newsletters & Publications
                </span>
              </button>

              <button
                onClick={() => setIsAppointmentsOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="p-4 bg-white-50 text-white rounded-2xl italic">
                  <Calendar size={32} />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">The Diary</span>
              </button>

              <button 
                onClick={handleAccountClick} 
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <User size={28} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">My Profile</span>
              </button>

              <button
                onClick={() => setIsGalleryOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-xl transition-all active:scale-95"
              >
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-400">
                  <ImageIcon size={32} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-white">Photo & Video Gallery</span> 
                
              </button>
             
              {/* Find your Chat Grid Item and update it like this */}
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-blue-400 p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <MessageCircle className="text-gray-400 group-hover:text-blue-600" size={32} />
                </div>
                <span className="text-[10px] font-black text-white tracking-widest uppercase">Knowledgebase (Church Inquiry)</span>
              </button> 

              {/* --- Church Financials & Projects Modal --- */}
              {isFinancialsOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
      
                    {/* Blue Header */}
                    <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Church Insights</h2>
                        <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Financials & Development Portal</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsFinancialsOpen(false);  // Closes the popup
                          setActiveProjectView(null);  // Resets the view to the menu
                        }}   
                        className="p-2 hover:bg-white/10 rounded-full transition"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex-1 overflow-y-auto">
                      {/* If a specific Project view is selected, show the Renderer. Otherwise show the Menu. */}
                      {activeProjectView ? (
                        <ProjectsRenderer 
                          view={activeProjectView} 
                          onBack={() => setActiveProjectView(null)}
                          shopId={activeShopId} 
                        />
                      ) : (
                        <div className="space-y-6">
                          {/* Tabs (Financials vs Projects) */}
                          <div className="flex gap-4 border-b border-gray-100 mb-6">
                            <button className="pb-4 text-xs font-black uppercase text-gray-400 tracking-widest border-b-2 border-transparent">Financials</button>
                            <button className="pb-4 text-xs font-black uppercase text-blue-600 tracking-widest border-b-2 border-blue-600">Projects</button>
                          </div>

                          {/* Project Menu Items */}
                          <div className="grid grid-cols-1 gap-4">
                            <button 
                              onClick={() => setActiveProjectView('planned')}
                              className="w-full flex items-center gap-5 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="p-4 bg-orange-50 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                                <Calendar size={28} />
                              </div>
                              <div>
                                <p className="font-black text-gray-800">Planned Projects</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">View Upcoming Developments</p>
                              </div>
                            </button>

                            <button 
                              onClick={() => setActiveProjectView('fundraising')}
                              className="w-full flex items-center gap-5 p-6 rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all text-left group"
                            >
                              <div className="p-4 bg-blue-50 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                                <TrendingUp size={28} />
                              </div>
                              <div>
                                <p className="font-black text-gray-800">Fund Raising</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Support Active Campaigns</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setIsFinancialsOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <HandCoins size={28} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">
                  Church Financials & Projects
                </span>
              </button>

              <button 
                onClick={() => setIsCommunityModalOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <HeartHandshake size={28} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">
                  Community Service & Zonal Activities
                </span>
              </button>

              {/* 💬 INDEPENDENT MEMBER-TO-MEMBER CHAT GRID BUTTON TRIGGER 💬 */}
              <button
                type="button"
                onClick={() => setIsChatModalOpen(true)}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl text-white shadow-md hover:scale-[1.02] transition-transform text-center gap-2"
              >
                <div className="p-3 bg-white/20 rounded-2xl">
                  <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Member Chat</span>
              </button>

              {/* ⛪ BAPTISM & CONFIRMATION BUTTON ⛪ */}
              <button
                onClick={() => setIsSacramentOpen(true)}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-400 to-blue-700 rounded-3xl text-white shadow-md hover:scale-[1.02] transition-transform text-center gap-2"
              >
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Award size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Baptism & Confirmation</span>
              </button>

              {/* 📂 CHURCH DOCUMENTS & REGISTRY BUTTON 📂 */}
              <button
                onClick={() => setIsDocsOpen(true)}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl text-white shadow-md hover:scale-[1.02] transition-transform text-center gap-2"
              >
                <div className="p-3 bg-white/20 rounded-2xl">
                  <ScrollText size={24} />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">Church Docs</span>
              </button>

              {/* Sokoni Card */}
              <button 
                onClick={handleOpenSokoni}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-4 group"
              >
                <div className="text-blue-600 group-hover:scale-110 transition-transform">
                  <Store size={32} /> {/* Or your preferred icon */}
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                  Sokoni
                </span>
              </button>

              <button 
                onClick={() => setIsJoinModalOpen(true)}
                className="bg-blue-400 p-8 rounded-[2.5rem] shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <UsersRound size={28} />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest text-center">JOIN MINISTRY/ZONE</span>
              </button>

               
            </div>
          </div>
 
        ) : (
          <ServiceOrderView />
        )}

      </main>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[600px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="font-bold">Church Assistant</h3>
              <button onClick={() => setIsChatOpen(false)}><X size={20} /></button>
            </div>
      
            {/* Message History Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-gray-800'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isSending && <div className="text-xs text-gray-400 animate-pulse">Typing...</div>}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 flex gap-2">
              <input 
                className="flex-1 bg-gray-50 p-4 rounded-2xl outline-none text-sm"
                placeholder="Ask something..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="bg-blue-600 p-4 rounded-2xl text-white active:scale-95 transition-transform"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the modal component at the bottom of your main return */}
      <MeetingsModal 
        isOpen={isMeetingsOpen} 
        onClose={() => setIsMeetingsOpen(false)} 
        userData={userData} 
      />

      <GalleryModal 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        userData={userData}
        shopId={activeShopId} 
      />

      {/* Sokoni Modal with Analytics prop */}
      <SokoniModal
        isOpen={isSokoniOpen}
        onClose={() => setIsSokoniOpen(false)}
        shops={shops}
        onVisitShop={handleTrackShopView}
      />

      <PrayerRequestModal
        isOpen={isPrayerModalOpen}
        onClose={() => setIsPrayerModalOpen(false)}
        userData={userData}
      />

      <ReceivedRequestsModal 
        isOpen={isInboxOpen} 
        onClose={() => setIsInboxOpen(false)}
        userData={userData} 
      />

      <MemberAccountModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)}
        userData={userData}
        shopId={activeShopId}
        phone={userData?.phone_number || ''}
      />

      <GivingModal 
        isOpen={isGivingModalOpen} 
        onClose={() => setIsGivingModalOpen(false)} 
        userData={userData} 
      />

      <AppointmentsModal 
        isOpen={isAppointmentsOpen} 
        onClose={() => setIsAppointmentsOpen(false)} 
        userData={userData} 
      />

      <OpinionModal 
        isOpen={isOpinionModalOpen} 
        onClose={() => setIsOpinionModalOpen(false)} 
        userData={userData} 
      />


      {/* 🚀 Mounts the Diocesan Information Center overlay sheet dynamically when clicked */}
      <DioceseModal 
        isOpen={isDioceseOpen} 
        onClose={() => setIsDioceseOpen(false)}
        userData={userData}
        shopId={activeShopId}  
      />

      {/* 📊 NEW: Mounts the specialized read-only report query lookup modal for the Canon registry profile */}
      <DioceseActivitiesModal
        isOpen={isActivitiesReportOpen}
        onClose={() => setIsActivitiesReportOpen(false)}
        shopId={activeShopId}
        userData={userData}
      />

      <MemberMediaAccess 
        isOpen={isMediaOpen} 
        onClose={() => setIsMediaOpen(false)} 
        shopId={userData?.shop_id || shopId}
        userData={userData} // Ensure this variable is passed here 
      />

      <ViewGivings 
        isOpen={isViewGivingsOpen} 
        onClose={() => setIsViewGivingsOpen(false)} 
        userData={userData}
      />

      <JoinMinistryOrZone 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        userData={userData} 
      />

      {/* Leader Broadcast Modal */}
      <LeaderMessageModal
        isOpen={isLeaderMessageOpen}
        onClose={() => setIsLeaderMessageOpen(false)}
        userData={userData}
      />

      <ViewBroadcastsModal 
        isOpen={isViewBroadcastsOpen} 
        onClose={() => setIsViewBroadcastsOpen(false)} 
        userData={userData} 
      />

      <CanonFeedback 
        isOpen={isCanonFeedbackOpen} 
        onClose={() => setIsCanonFeedbackOpen(false)} 
        memberPhone={userData?.phone_number}
        orgId={userData?.org_id}
      />

      <WelfareModal 
        isOpen={isWelfareModalOpen} 
        onClose={() => setIsWelfareModalOpen(false)} 
        userData={userData} 
      />

      <FinancialsAndProjectsModal 
        isOpen={isFinancialsOpen} 
        onClose={() => setIsFinancialsOpen(false)}
        shopId={activeShopId}
        userData={userData} 
      />

      <DevotionsModal
        isOpen={isDevotionsOpen}
        onClose={() => setIsDevotionsOpen(false)}
        userData={userData}
      />

      <MomentWithGodModal
        isOpen={isMomentOpen}
        onClose={() => setIsMomentOpen(false)}
        userData={userData}
        shopId={activeShopId}
      />

      <ChurchDocumentsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        shopId={activeShopId}
        userData={userData}
      />

      <MemberChatModal 
        isOpen={isChatModalOpen} 
        onClose={() => setIsChatModalOpen(false)} 
        userData={userData || { id: 0, shop_id: shopId }} 
      />

      <BaptismConfirmationModal isOpen={isSacramentOpen} onClose={() => setIsSacramentOpen(false)} userData={userData || { id: 0, shop_id: shopId }} />

      {isCommunityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl relative">
            <button 
              onClick={() => setIsCommunityModalOpen(false)}
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold"
            >
              <X size={20} /> Close
            </button>
            <CommunityAndZones userData={userData} />
          </div>
        </div>
      )}

    </div>
  );
};
