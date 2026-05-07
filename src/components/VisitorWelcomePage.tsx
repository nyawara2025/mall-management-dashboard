import React, { useState, useEffect } from 'react';
import { VisitorForm } from './VisitorForm'; // Ensure this matches your filename
import { CheckCircle2, Loader2 } from 'lucide-react';

// Using a Named Export to match your App.tsx import
export const VisitorWelcomePage = ({ shopId }: { shopId: number }) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const [serviceData, setServiceData] = useState<any[]>([]);

  const [selectedService, setSelectedService] = useState('English Service');

  useEffect(() => {
    if (hasCheckedIn) {
      const getOrderOfService = async () => {
        try {

          setServiceData([]);

          const response = await fetch('https://n8n.tenear.com/webhook/fetch-visitors-service-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              shop_id: shopId,
              service_type: selectedService 
            })
          });
          

          if (response.ok) {
            const n8nData = await response.json();
            
            // 1. Normalize the data exactly like your authenticated logic
            const rawServices = Array.isArray(n8nData) ? n8nData[0] : (n8nData.services ? n8nData.services[0] : n8nData);

            // 2. Extract the activities from the service
            if (rawServices && rawServices.service_activities) {
              setServiceData(rawServices.service_activities);
            } else {
              setServiceData([]);
            }
          }


        } catch (err) {
          console.error("Fetch error:", err);
          setServiceData([]);
        }
      };
      getOrderOfService();
    }
  }, [hasCheckedIn, selectedService, shopId]);


  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-8 space-y-8">
      {!hasCheckedIn ? (
        <>
          <div className="text-center">
            <img 
              src="https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church-logos/StBarnanasGoldenFinal27apr.jpeg" 
              className="w-20 h-20 mx-auto mb-4 drop-shadow-sm" 
              alt="St. Barnabas Logo"
            />
            <h2 className="text-2xl font-black text-gray-500 leading-tight">Welcome Home!</h2>
            <p className="text-lg text-blue-400 font-chancery mt-3 px-4">
              Feel welcome at ACK St. Barnabas Otiende.
              The home of encouragement!
            </p>
            <p className="text-base text-blue-400 font-chancery mt-2 italic">
              Kindly share with us your names and contacts below:                       
            </p>
          </div>
        
          <VisitorForm onComplete={() => setHasCheckedIn(true)} />
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100 text-green-700">
            <CheckCircle2 size={24} className="flex-shrink-0" />
            <p className="font-bold text-sm text-left leading-tight">
              Praise God! You are checked in. Here is today's Order of Service.
            </p>
          </div>

          {/* 1. SERVICE SELECTOR TABS */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
            {['Morning Glory', 'Youth Service', 'English Service', 'Kiswahili Service'].map((service) => (
              <button
                key={service}
                onClick={() => setSelectedService(service)}
                className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${
                  selectedService === service 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                }`}
              >
                {service.toUpperCase()}
              </button>
            ))}
          </div>

          {/* DYNAMIC SERVICE ACTIVITIES LIST */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b pb-2">
              {selectedService} Program
            </h3>
          
            {serviceData.length > 0 ? (
              serviceData.map((activity, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 shadow-sm">
                  <div className="bg-blue-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-800 leading-tight">
                      {activity.activity_name}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 italic leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Loader2 className="animate-spin mx-auto text-gray-300" size={24} />
                <p className="text-[10px] font-bold text-gray-400 mt-2">Loading today's schedule...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
 }
