import React, { useEffect, useState } from 'react';
import { 
  Share2, MapPin, CalendarDays, LogOut, BookOpen, 
  Heart, MessageCircle, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- TYPES ---
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

// --- COMPONENT 1: Moved OUTSIDE to fix TS1184 ---
export const ChurchHubLogin = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    // Ensure your supabase client is initialized correctly in ../lib/supabase
    const { error } = await (supabase as any).auth.signInWithOtp({ phone });
    if (error) alert(error.message);
    else setStep('OTP');
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const { data: { session }, error } = await (supabase as any).auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });
  
    if (error) alert("Invalid Code");
    else console.log("Logged in!", session?.user);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl">
      {/* ... rest of your login UI ... */}
    </div>
  );
};

// --- COMPONENT 2: Main Hub ---
export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [church, setChurch] = useState<any>(null);
  const [services, setServices] = useState<ChurchService[]>([]);
  const [loading, setLoading] = useState(true);
  
  const activeShopId = shopId || 68;

  useEffect(() => {
    async function fetchHubData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('churches')
          .select('*')
          .eq('shop_id', activeShopId)
          .limit(1);

        if (error) throw error;
        if (data?.[0]) setChurch(data[0]);

        const response = await fetch('https://n8n.tenear.com/webhook/fetch-public-service-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: activeShopId }),
        });

        if (response.ok) {
          const n8nData = await response.json();
          if (n8nData?.services) setServices(n8nData.services);
        }
      } catch (error) {
        console.error('Error fetching hub data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHubData();
  }, [activeShopId]);

  if (loading) return <div>Loading...</div>;
  if (!church) return <div>Church Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ... rest of your Hub UI ... */}
      <ChurchHubLogin /> 
    </div>
  );
};
