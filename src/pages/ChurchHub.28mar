import React, { useState, useEffect } from 'react';
import { Share2, MapPin, Phone, Calendar, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export function ChurchHub() {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');
  
  const [churchData, setChurchData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initHub() {
      if (!shopId) return;

      try {
        // 1. Track Visit & Fetch Data (Mirroring your Political logic)
        // Pointing to your specific church webhook endpoint
        const response = await fetch("https://n8n.tenear.com/webhook/track-church-visits", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: shopId,
            business_category: 'church', // Vital for your Cloudflare monitoring
            action: 'get_full_hub_data' 
          })
        });

        const result = await response.json();
        
        // Handling both single object or array response from n8n
        const actualData = Array.isArray(result) ? result[0] : result;

        if (actualData) {
          setChurchData(actualData.church_profile);
          setServices(actualData.active_services || []);
        }
      } catch (e) {
        console.error("Church Hub Init failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    initHub();
  }, [shopId]);

  const handleAction = async (type: string, metadata?: any) => {
    // Log interaction to n8n (similar to your track_campaign_view)
    try {
      await fetch("https://n8n.tenear.com/webhook/fetch-church-material", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'track_interaction',
          interaction_type: type,
          shop_id: shopId,
          business_category: 'church',
          metadata: metadata
        })
      });
    } catch (e) {
      console.warn("Interaction tracking failed", e);
    }

    if (type === 'share') {
      const text = `🙌 Join us at ${churchData?.church_name}!\n\n📍 ${churchData?.location}\n🔗 Order of Service: ${window.location.href}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen font-sans">Loading Church Hub...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pb-24 font-sans">
      {/* Church Header Section */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-6 mt-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 mx-auto border-4 border-white shadow-md flex items-center justify-center">
          {churchData?.logo_url ? (
            <img src={churchData.logo_url} alt="Church Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-blue-600 font-black text-2xl">CH</div>
          )}
        </div>
        <h1 className="text-3xl font-black text-gray-900 mt-4 tracking-tight leading-none">
          {churchData?.church_name || "Our Church"}
        </h1>
        <p className="text-blue-600 font-bold text-xs mt-3 uppercase tracking-widest flex items-center justify-center">
          <MapPin size={14} className="mr-1"/> {churchData?.location || "Welcome"}
        </p>
      </div>

      {/* Services Section */}
      <div className="w-full max-w-md space-y-4">
        {services.length === 0 ? (
          <div className="text-center p-10 text-gray-400 italic">No scheduled services today.</div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl leading-none">{service.service_name}</h3>
                    <p className="text-gray-500 text-sm mt-2 flex items-center">
                      <Clock size={14} className="mr-1" /> {service.start_time}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleAction('share', { service_name: service.service_name })}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl"
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                {/* Timeline UI for Order of Service */}
                <div className="mt-6 space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {service.activities?.sort((a:any, b:any) => a.sort_order - b.sort_order).map((act: any, idx: number) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500 z-10" />
                      <h4 className="font-bold text-gray-800 text-sm">{act.activity_name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
