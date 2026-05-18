import React, { useState, useEffect } from 'react';
import { VisitorForm } from './VisitorForm'; // Ensure this matches your filename
import { CheckCircle2, Loader2, ChevronDown, FileText, ClipboardList, Clock } from 'lucide-react';

const VisitorQuestionnaire = ({ shopId }: { shopId: number }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    currentChurch: '',
    attendanceStatus: '',
    talents: '',
    comments: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-visitor-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shop_id: shopId,
          submitted_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Praise God! Your feedback has been received.");
        // Optional: you could reset state here to clear the form
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Webhook Error:', error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full p-3 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all disabled:opacity-50";
  const labelClasses = "block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <label className={labelClasses}>Current Church / Place of Worship</label>
        <input 
          type="text" name="currentChurch" value={formData.currentChurch}
          onChange={handleChange} placeholder="Name of your previous church"
          className={inputClasses} disabled={isSubmitting}
        />
      </div>

      <div>
        <label className={labelClasses}>Are you here to stay or just passing by?</label>
        <select 
          name="attendanceStatus" value={formData.attendanceStatus}
          onChange={handleChange} className={inputClasses} disabled={isSubmitting}
        >
          <option value="">Select an option...</option>
          <option value="stay">Looking for a new church home</option>
          <option value="passing">Just passing by / Visiting</option>
          <option value="regular">Regular visitor</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>Your Talents / Areas of Interest</label>
        <select 
          name="talents" value={formData.talents}
          onChange={handleChange} className={inputClasses} disabled={isSubmitting}
        >
          <option value="">Select your area...</option>
          <option value="choir">Praise & Worship / Choir</option>
          <option value="ushering">Ushering & Hospitality</option>
          <option value="media">Media & IT Team</option>
          <option value="sunday_school">Sunday School / Children</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>Comments or Prayer Requests</label>
        <textarea 
          name="comments" value={formData.comments}
          onChange={handleChange} rows={3}
          className={`${inputClasses} resize-none`} disabled={isSubmitting}
        />
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest"
      >
        {isSubmitting ? 'Sending...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

// Using a Named Export to match your App.tsx import
export const VisitorWelcomePage = ({ shopId }: { shopId: number }) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const [serviceData, setServiceData] = useState<any[]>([]);

  const [selectedHubItem, setSelectedHubItem] = useState('menu'); // 'menu', 'package', 'oos', 'overview', 'survey'

  const [selectedService, setSelectedService] = useState('English Service');

  useEffect(() => {
    if (hasCheckedIn && selectedHubItem === 'oos') {
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
            }
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
      };
      getOrderOfService();
    }
  }, [hasCheckedIn, shopId, selectedService, selectedHubItem]);


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
              Praise God! You are checked in.
            </p>
          </div>

          {/* 1. SHOW THE MENU ONLY IF NOTHING IS SELECTED */}
          {selectedHubItem === 'menu' ? (
            <div className="space-y-2">
              <HubButton 
                icon={<FileText size={18} />} 
                  label="Welcome Package" 
                  onClick={() => window.open('https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/StBarnabasVisitorWelcomePage.pdf', '_blank')} 
                />
                <HubButton 
                  icon={<Clock size={18} />} 
                  label="Today's Order of Service" 
                  onClick={() => setSelectedHubItem('oos')} 
                />
                <HubButton 
                  icon={<FileText size={18} />} 
                  label="Overview of ACK St. Barnabas" 
                  onClick={() => window.open('https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/StBarnabasVisitorWelcomePage.pdf', '_blank')}
                />
                <HubButton 
                  icon={<ClipboardList size={18} />} 
                  label="Brief Questionnaire" 
                  onClick={() => setSelectedHubItem('survey')} 
                />
              </div>
            ) : (
              /* 2. SHOW THE BACK BUTTON IF SOMETHING IS SELECTED */
              <button 
                onClick={() => setSelectedHubItem('menu')}
                className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all"
              >
                ← Back to Menu
              </button>
            )}
    
            {/* 3. DYNAMIC CONTENT: OOS  */}
            {selectedHubItem === 'oos' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* SERVICE TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Morning Glory', 'Youth Service', 'English Service', 'Kiswahili Service'].map((service) => (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${
                        selectedService === service 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-gray-500 border-gray-100'
                      }`}
                    >
                      {service.toUpperCase()}
                    </button>
                  ))}
                </div>

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
                        <p className="text-sm font-black text-gray-800 leading-tight">{activity.activity_name}</p>
                        <p className="text-[11px] font-medium text-gray-500 italic">{activity.description}</p>
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
            )}

            {/* 3. VIEW: QUESTIONNAIRE */}
            {selectedHubItem === 'survey' && (
              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 animate-in slide-in-from-top-2 duration-300">
                <h3 className="font-black text-blue-800 mb-6 text-center text-xs uppercase tracking-widest">
                  Visitor Questionnaire
                </h3>
                {/* We pass the shopId prop here */}
                <VisitorQuestionnaire shopId={shopId} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // HELPER COMPONENTS PLACED AT BOTTOM TO AVOID SCOPING ERRORS
  const HubButton = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-left">
      <div className="text-blue-600">{icon}</div>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </button>
  );
