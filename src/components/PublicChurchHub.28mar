import React, { useEffect, useState } from 'react';
import { Share2, MapPin, Phone, CalendarDays } from 'lucide-react';
// 1. Import your supabase client (adjust path accordingly)
import { supabase } from '../lib/supabase'; 

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

export const PublicChurchHub = ({ shopId }: { shopId: number }) => {
  const [church, setChurch] = useState<any>(null);
  const [services, setServices] = useState<ChurchService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHubData() {
      setLoading(true);
      try {
        // 1. Fetch Church Profile
        const { data, error } = await supabase
          .from('churches')
          .select('*')
          .eq('shop_id', shopId)
          .limit(1);

        const churchData = data?.[0] || null;
        if (churchData) setChurch(churchData);
        
        setChurch(churchData);

        // 2. POST to n8n to get latest service orders
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-public-service-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shop_id: shopId }),
        });

        const n8nData = await response.json();
        if (n8nData && n8nData.services) {
            setServices(n8nData.services);
        }
      } catch (error) {
        console.error('Error fetching hub data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (shopId) {
        fetchHubData();
    }
  }, [shopId]);

  if (loading) return <div className="p-4">Loading Church Hub...</div>;
  if (!church) return <div className="p-4">Church not found.</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <header className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{church.church_name}</h1>
        <p className="text-gray-600 flex items-center gap-2 mt-2">
            <MapPin size={18} /> {church.address}
        </p>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarDays /> Upcoming Services
        </h2>
        
        {services.map((service) => (
          <div key={service.id} className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold">{service.service_name}</h3>
            <p className="text-sm text-gray-500 mb-4">{service.service_date} at {service.start_time}</p>
            
            <ol className="border-l-2 border-blue-200 ml-2 space-y-4">
              {service.service_activities
                .sort((a,b) => a.sort_order - b.sort_order)
                .map((activity, index) => (
                <li key={index} className="pl-4">
                  <div className="font-medium text-gray-800">{activity.activity_name}</div>
                  <div className="text-sm text-gray-600">{activity.description}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};
