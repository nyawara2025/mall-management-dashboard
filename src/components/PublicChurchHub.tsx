import React, { useEffect, useState } from 'react';
import { 
  MapPin, CalendarDays, BookOpen, 
  LogOut, Lock, Phone as PhoneIcon,
  User, ShieldCheck, Users, Activity,
  MessageSquare, Heart, Radio, Wallet, Book, Globe, Bell, ClipboardList,
  Image as ImageIcon, MessageCircle, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SokoniModal from './SokoniModal';
import { PrayerRequestModal } from './PrayerRequestModal';
import { ReceivedRequestsModal } from './ReceivedRequestsModal';

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
  registration_date: string;
  payment_history: PaymentRecord[] | null;
  shop_id: number; // Add this line
  org_id: number;
}

interface ServiceActivity {
  activity_name: string;
  description: string;
  sort_order: number;
}

interface ChurchService {
  id: string;
  service_name: string;
  service_date: string;
  start_time: string;
  service_activities: ServiceActivity[];
}

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  category: 'All Church' | 'Zonal' | 'Regional' | 'Ministry' | 'Ad hoc';
  location: string;
  shop_id: number; // Add this line
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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  
  const handleAuth = async () => {
    // Basic Validation
    if (!phone || !password) {
      alert("Please enter both phone and password");
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
        shop_id: shopId,
        // Only send names if it's a Signup attempt
        first_name: isSignUp ? firstName : undefined,
        last_name: isSignUp ? lastName : undefined,
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
        if (isSignUp) {
          alert("Welcome! Your account has been created successfully.");
        }
      
        // Save to localStorage so session persists on refresh
        localStorage.setItem(`church_auth_${shopId}`, 'true');
        localStorage.setItem(`church_user_${shopId}`, JSON.stringify(userData));
      
        // Trigger the parent component state update
        onLoginSuccess(userData);
      } else {
        throw new Error("The server response was incomplete. Please try again.");
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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isSignUp ? 'Join Us' : 'Welcome Back'}</h2>
          <p className="text-gray-500 text-sm mt-2">Access the St. Barnabas Member Hub</p>
        </div>

        <div className="space-y-4">

          {/* Name Fields: Only visible during Sign Up */}
          {isSignUp && (
            <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700"
                  required
                />
              </div>
            </div>
          )}

          <div className="relative">
            <PhoneIcon className="absolute left-4 top-4 text-gray-400" size={20} />
            <input className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone (254...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="password" className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button onClick={handleAuth} disabled={loading} className={`w-full text-white p-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${isSignUp ? 'bg-green-600' : 'bg-blue-600'} ${loading ? 'opacity-50' : ''}`}>
            {loading ? 'Processing...' : (isSignUp ? 'Request Membership' : 'Sign In')}
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-sm text-gray-400 hover:text-blue-600 transition-colors text-center font-semibold mt-2">
            {isSignUp ? 'Already a member? Sign In' : 'New here? Request Access'}
          </button>
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

const WelfareModal = ({ isOpen, onClose, userData }: { isOpen: boolean, onClose: () => void, userData: MemberData | null }) => {
  const [selectedKitty, setSelectedKitty] = useState('Social Welfare');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'stk' | 'manual'>('stk');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const kitties = ['Ministry', 'Zone', 'Regional', 'Social Welfare', 'Ad hoc'];

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) return alert("Please enter a valid amount");
    setIsProcessing(true);
    
    try {
      const payload = {
        userId: userData?.id,
        shop_id: userData?.shop_id,
        phone: userData?.phone_number,
        amount,
        kitty: selectedKitty,
        mode: paymentMode,
        code: paymentMode === 'manual' ? confirmationCode : null
      };

      // Replace with your n8n/backend payment endpoint
      const response = await fetch('https://n8n.tenear.com/webhook/post-to-church-welfare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(paymentMode === 'stk' ? "STK Push sent! Check your phone." : "Payment submitted for verification.");
        onClose();
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-gray-900">Welfare Fund</h3>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
          </div>

          <div className="space-y-5">
            {/* Kitty Selection */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 ml-1">Select Kitty</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {kitties.map(k => (
                  <button 
                    key={k}
                    onClick={() => setSelectedKitty(k)}
                    className={`p-3 rounded-xl text-sm font-semibold border transition-all ${selectedKitty === k ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">KES</span>
              <input 
                type="number" 
                placeholder="Amount" 
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-14 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Payment Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button onClick={() => setPaymentMode('stk')} className={`flex-1 p-2 rounded-xl text-xs font-bold transition-all ${paymentMode === 'stk' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>M-PESA PUSH</button>
              <button onClick={() => setPaymentMode('manual')} className={`flex-1 p-2 rounded-xl text-xs font-bold transition-all ${paymentMode === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>MANUAL CODE</button>
            </div>

            {paymentMode === 'manual' && (
              <input 
                placeholder="Enter M-Pesa Code (e.g. RBT45...)" 
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none uppercase"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            )}

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              {isProcessing ? 'Processing...' : 'Contribute Now'}
            </button>
          </div>
        </div>

        {/* History Preview */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 max-h-48 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Your Payment History</p>
          {userData?.payment_history?.map((pay, i) => (
            <div key={i} className="flex justify-between items-center mb-2 bg-white p-3 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800">KES {pay.amount}</p>
                <p className="text-[10px] text-gray-400">{new Date(pay.payment_date).toLocaleDateString()}</p>
              </div>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">{pay.status}</span>
            </div>
          ))}
        </div>
      </div>
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
            <p className="text-gray-400 font-medium mt-1">St. Barnabas Anglican</p>
          </div>

          {/* Data Display Slots */}
          <div className="w-full space-y-3">
            {/* Zone Display */}
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm mr-4">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Zone</p>
                <p className="text-gray-900 font-bold leading-none">{userData?.zone_name || 'Not Assigned'}</p>
              </div>
            </div>

            {/* Ministry Display */}
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm mr-4">
                <Users size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Ministry</p>
                <p className="text-gray-900 font-bold leading-none">{userData?.ministry_name || 'General Member'}</p>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Meetings</h3>
            <p className="text-sm text-gray-500">Scheduled gatherings & sessions</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto">
          {/* Admin Create Section */}
          {userData?.role === 'admin' && (
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="w-full mb-6 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-dashed border-blue-200"
            >
              {isCreating ? 'Cancel' : '+ Schedule New Meeting'}
            </button>
          )}

          {isCreating && (
            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <input 
                className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" 
                placeholder="Meeting Title" 
                onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="p-4 rounded-xl ring-1 ring-gray-200" onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}/>
                <input type="time" className="p-4 rounded-xl ring-1 ring-gray-200" onChange={e => setNewMeeting({...newMeeting, time: e.target.value})}/>
              </div>
              <select 
                className="w-full p-4 rounded-xl ring-1 ring-gray-200"
                onChange={e => setNewMeeting({...newMeeting, category: e.target.value as any})}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat} Meeting</option>)}
              </select>
              <button onClick={handleCreateMeeting} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">Post Meeting</button>
            </div>
          )}

          {/* Meetings List (Members & Admins) */}
          <div className="space-y-4">
            {loading ? <p className="text-center text-gray-400">Loading schedules...</p> : 
             meetings.length === 0 ? <p className="text-center text-gray-400 py-10">No upcoming meetings</p> :
             meetings.map((m) => (
              <div key={m.id} className="p-5 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    m.category === 'All Church' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {m.category}
                  </span>
                  <div className="flex items-center text-gray-400 text-xs gap-1">
                    <CalendarDays size={14} /> {m.meeting_date}
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{m.title}</h4>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><ClipboardList size={14}/> {m.meeting_time}</span>
                  <span className="flex items-center gap-1"><MapPin size={14}/> {m.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GalleryModal = ({ isOpen, onClose, userData, shopId }: { isOpen: boolean, onClose: () => void, userData: MemberData | null, shopId: number }) => {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
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
              {images.map((img) => (
                <div key={img.name} className="relative group overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                  <img src={img.url} alt="Gallery" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
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
  const [services, setServices] = useState<ChurchService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<MemberData | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'service_order' | 'welfare'>('dashboard');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeShopId = shopId || 68;
  const [isWelfareModalOpen, setIsWelfareModalOpen] = useState(false);

  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isSokoniOpen, setIsSokoniOpen] = useState(false);
  const [shops, setShops] = useState<any[]>([]);

  const getActiveShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    return data || [];
  };

   const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

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
          const rawServices = Array.isArray(n8nData) ? n8nData[0]?.services : n8nData?.services;
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

  // --- SUB-VIEW: Welfare Dashboard (RESTORED HISTORY DISPLAY) ---
  const WelfarePage = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => setActiveView('dashboard')} className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
        ← Back to Hub
      </button>
      
      {/* WELFARE HISTORY MODAL UI */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welfare History</h2>
          <button onClick={() => setActiveView('dashboard')} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[500px] overflow-y-auto">
          {userData?.payment_history && userData.payment_history.length > 0 ? (
            userData.payment_history.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-gray-700 mt-1">Contribution</p>
                </div>
                <p className="text-xl font-black text-blue-600">
                  KES {payment.amount}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 italic font-medium">
              No contributions found in your history.
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-50">
          <button className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:scale-[1.01] active:scale-95 transition-all">
            Make New Contribution
          </button>
        </div>
      </div>
    </div>
  );

  // --- SUB-VIEW: Order of Service ---
  const ServiceOrderView = () => (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button onClick={() => setActiveView('dashboard')} className="text-blue-600 font-bold flex items-center gap-2">
        ← Back to Hub
      </button>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Order of Service</h2>
        {services.map((service) => (
          <div key={service.id} className="mb-8 last:mb-0">
            <h3 className="text-xl font-bold text-blue-600">{service.service_name}</h3>
            <p className="text-sm text-gray-400 mb-4">{service.service_date} • {service.start_time}</p>
            <div className="space-y-3">
              {service.service_activities.map((activity, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-800">{activity.activity_name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Hub...</div>;
  if (!isAuthenticated) return <ChurchHubLogin shopId={activeShopId} onLoginSuccess={(u) => {setUserData(u); setIsAuthenticated(true); localStorage.setItem(`church_auth_${activeShopId}`, 'true'); localStorage.setItem(`church_user_${activeShopId}`, JSON.stringify(u));}} />;
  if (!church) return <div className="p-10 text-center font-bold">Church Profile Not Found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
            {church.church_name?.charAt(0) || 'S'}
          </div>
          <h1 className="font-bold text-gray-800 text-sm md:text-base truncate max-w-[200px]">
            {church.church_name}
          </h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{userData?.role || 'MEMBER'}</span>
                </div>
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-100">
                  {userData?.first_name ? userData.first_name.charAt(0) : 'M'}
                  {userData?.last_name ? userData.last_name.charAt(0) : ''}
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  {userData?.first_name || 'Church'} {userData?.last_name || 'Member'}
                </h2>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><ShieldCheck size={20} /></div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ZONE</p><p className="font-bold text-gray-700">{userData?.zone_name}</p></div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Users size={20} /></div>
                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CURRENT MINISTRY</p><p className="font-bold text-gray-700">{userData?.ministry_name}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-50 group-hover:text-purple-600"><MessageSquare size={28} /></div>
                <span className="text-xs font-black text-purple-400 uppercase tracking-widest text-center">OPINION</span>
              </button>
              <button 
                onClick={() => setIsPrayerModalOpen(true)}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95"
              >
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl italic">
                  <Heart size={32} />
                </div>
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Prayer Request</span>
              </button>

              {/* ONLY SHOW FOR CANON */}
              {userData?.role?.toLowerCase() === 'canon' && (
                <button 
                  onClick={() => setIsInboxOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-300 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg mb-4"
                >
                  <MessageSquare size={10} /> View Prayer Requests
                </button>
              )}

              <button onClick={() => setActiveView('service_order')} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Book size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">ORDER OF SERVICE</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">BROADCAST</span>
              </button>
              
              <button
                onClick={() => setIsMeetingsOpen(true)}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-xl transition-all active:scale-95"
              >
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-400">
                  <ClipboardList size={32} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">Meetings</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Activity size={28} /></div>
                <span className="text-xs font-black text-purple-400 uppercase tracking-widest text-center">TITHES & GIVING</span>
              </button>
              <button 
                onClick={() => setIsWelfareModalOpen(true)}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                  <Wallet className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Welfare Contributions</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">DEVOTIONS</span>
              </button>
              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">A MOMENT WITH GOD</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Newsletters & Notifications</span>

              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Appointments</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-purple-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Radio size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">My Account</span>
              </button>

              <button
                onClick={() => setIsGalleryOpen(true)}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-xl transition-all active:scale-95"
              >
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-400">
                  <ImageIcon size={32} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">Photo Gallery</span> 
                
              </button>
             
              {/* Find your Chat Grid Item and update it like this */}
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <MessageCircle className="text-gray-400 group-hover:text-blue-600" size={32} />
                </div>
                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Chat</span>
              </button> 

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Activity size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Church Projects</span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Activity size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Community Service</span>
              </button>

              {/* Sokoni Card */}
              <button 
                onClick={handleOpenSokoni}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-4 group"
              >
                <div className="text-blue-600 group-hover:scale-110 transition-transform">
                  <Activity size={32} /> {/* Or your preferred icon */}
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Sokoni
                </span>
              </button>

              <button className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-all active:scale-95 group">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"><Activity size={28} /></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Join a Ministry</span>
              </button>


            </div>
          </div>
        ) : activeView === 'welfare' ? (
          <WelfarePage />
        ) : (
          <ServiceOrderView />
        )}
      </main>

      {/* Render the Modal */}
      <WelfareModal 
        isOpen={isWelfareModalOpen} 
        onClose={() => setIsWelfareModalOpen(false)} 
        userData={userData}
      />

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

    </div>
  );
};
