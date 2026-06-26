import React, { useState, useEffect } from 'react'; 
import { useAuth } from '../contexts/AuthContext'; 

interface SchoolBrandingProps { 
  departmentName: string; 
} 

interface SchoolProfileData {
  school_name: string;
  logo_url: string;
  school_motto: string;
}

export const SchoolBranding: React.FC<SchoolBrandingProps> = ({ departmentName }) => { 
  const { user } = useAuth(); 
  const [profile, setProfile] = useState<SchoolProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDynamicSchoolBranding = async () => {
      let resolvedShopId = user?.shop_id;

      // 🔍 FACTUAL LOOKUP: Pull from local storage cache if context is loading
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

      // Safeguard fallback anchor
      if (!resolvedShopId) {
        console.warn("SchoolBranding delayed: Waiting for valid shop_id context.");
        return;
      }

      try {
        // 🚀 Hit your dedicated school profile webhook instance
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-branding', {
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
            // Fallback nicely to payload variables or standard string defaults
            school_name: data.school_name || data.shop || "Lang'ata Junior Academy",
            logo_url: data.logo_url || data.logoUrl || "https://supabase.co",
            school_motto: data.school_motto || data.slogan || "Striving for Excellence"
          });
        }
      } catch (err) {
        console.error("Dynamic school profile network error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicSchoolBranding();
  }, [user]);

  // Clean fallback anchors matching your n8n log details
  const resolvedName = profile?.school_name || "Lang'ata Junior Academy";
  const resolvedMotto = profile?.school_motto || "Knowledge is Power";
  const resolvedLogo = profile?.logo_url || "https://supabase.co";

  return ( 
    <div className="flex justify-between items-center mb-6 text-left border-b border-gray-100 pb-4 animate-in fade-in duration-300"> 
      <div> 
        <h1 className="text-2xl font-black text-gray-800 tracking-tight"> 
          {departmentName} 
        </h1> 
        <h2 className="text-sm font-bold text-indigo-600 mt-1 flex flex-col md:flex-row md:items-center gap-1"> 
          {resolvedName} 
          {loading ? (
            <span className="text-[10px] text-gray-400 font-normal animate-pulse">(Syncing profile...)</span>
          ) : (
            <span className="text-gray-400 font-medium text-xs md:ml-1">- {resolvedMotto}</span>
          )}
        </h2> 
      </div> 

      <div className="flex items-center shrink-0"> 
        <img 
          src={resolvedLogo} 
          alt="School Logo" 
          className="h-16 w-24 object-contain bg-gray-50/50 p-1 rounded-xl border border-gray-100" 
          onError={(e) => { 
            e.currentTarget.onerror = null; 
            e.currentTarget.src = "https://supabase.co"; 
          }} 
        /> 
      </div> 
    </div> 
  ); 
};
