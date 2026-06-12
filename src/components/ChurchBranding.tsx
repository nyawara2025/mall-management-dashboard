import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../contexts/AuthContext'; 

interface ChurchBrandingProps { 
  departmentName: string; 
} 

interface ChurchProfileData {
  church_name: string;
  church_logo: string;
  church_slogan: string;
}

export const ChurchBranding: React.FC<ChurchBrandingProps> = ({ departmentName }) => { 
  const { user } = useAuth(); 
  const [profile, setProfile] = useState<ChurchProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDynamicBranding = async () => {
      let resolvedShopId = user?.shop_id;

      // 🔍 FACTUAL LOOKUP: If auth hook context is empty, pull directly from the local storage cache
      if (!resolvedShopId) {
        try {
          const cachedUserData = localStorage.getItem('geofence_user_data');
          if (cachedUserData) {
            const parsedData = JSON.parse(cachedUserData);
            resolvedShopId = parsedData.shop_id;
          }
        } catch (e) {
          console.error("Failed to read user session data from cache", e);
        }
      }

      // Final fallback anchor if state hasn't fully loaded yet
      if (!resolvedShopId) {
        console.warn("ChurchBranding delayed: Waiting for valid shop_id context.");
        return;
      }

      console.log(`🚀 Triggering branding webhook for shop_id: ${resolvedShopId}`);

      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: resolvedShopId,
            user_id: user?.id || 0
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            church_name: data.church_name || "Anglican Church of Kenya",
            church_logo: data.logo_url || data.church_logo,
            church_slogan: data.church_slogan || "The home of encouragement!"
          });
        }
      } catch (err) {
        console.error("Dynamic billing profiling network connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicBranding();
  }, [user]);

  // Fallbacks to present placeholder data cleanly while webhook resolves
  const resolvedName = profile?.church_name || "Anglican Church of Kenya";
  const resolvedSlogan = profile?.church_slogan || "Back to basics!";
  const resolvedLogo = profile?.church_logo || "https://supabase.co";

  return ( 
    <div className="flex justify-between items-center mb-6 text-left"> 
      <div> 
        <h1 className="text-2xl italic text-gray-700 tracking-tight font-['Century_Gothic']"> 
          {departmentName} 
        </h1> 
        <h2 className="text-lg font-semibold italic text-blue-600 mt-0 font-['Century_Gothic'] flex flex-col md:flex-row md:items-center gap-1"> 
          {resolvedName} 
          {loading ? (
            <span className="text-[10px] text-gray-400 font-normal animate-pulse">(Updating profile views...)</span>
          ) : (
            <span className="text-gray-500 font-normal text-xs md:ml-1">- {resolvedSlogan}</span>
          )}
        </h2> 
      </div> 

      <div className="flex items-center shrink-0"> 
        <img 
          src={resolvedLogo} 
          alt="Church Logo" 
          className="h-20 w-32 object-contain" 
          onError={(e) => { 
            e.currentTarget.onerror = null; 
            e.currentTarget.src = "https://supabase.co"; 
          }} 
        /> 
      </div> 
    </div> 
  ); 
};
