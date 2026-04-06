import React, { useState } from 'react';
import { Calendar, Clock, Save, Plus, Trash2 } from 'lucide-react';

interface ServiceActivity {
  id: number;
  activity: string;
  details: string; // New field for Hymn lyrics, verses, etc.
}

interface Service {
  name: string;
  startTime: string;
  endTime: string;
  orderOfService: ServiceActivity[];
}

export const ServicePlanner = ({ shopId }: { shopId: string }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [services, setServices] = useState<Service[]>([
    { name: 'Youth Service', startTime: '08:00', endTime: '10:00', orderOfService: [] },
    { name: 'English Service', startTime: '10:00', endTime: '12:00', orderOfService: [] },
    { name: 'Kiswahili Service', startTime: '12:00', endTime: '13:00', orderOfService: [] }
  ]);

  const handleSave = async () => {
    const payload = {
      shop_id: shopId,
      date,
      business_category: 'church',
      services
    };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-service-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) alert('Service Plan Published Successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const addActivity = (serviceIndex: number) => {
    const newServices = [...services];
    newServices[serviceIndex].orderOfService.push({
      id: Date.now(),
      activity: '',
      details: ''
    });
    setServices(newServices);
  };

  const removeActivity = (serviceIndex: number, activityId: number) => {
    const newServices = [...services];
    newServices[serviceIndex].orderOfService = newServices[serviceIndex].orderOfService.filter(
      item => item.id !== activityId
    );
    setServices(newServices);
  };

  const updateActivity = (serviceIndex: number, activityIndex: number, field: 'activity' | 'details', value: string) => {
    const newServices = [...services];
    newServices[serviceIndex].orderOfService[activityIndex][field] = value;
    setServices(newServices);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-blue-600" /> Sunday Service Planner
        </h2>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="space-y-6">
        {services.map((service, sIdx) => (
          <div key={service.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-800">{service.name}</span>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-white px-2 py-1 rounded border">
                <Clock size={14} className="text-blue-500" /> {service.startTime} - {service.endTime}
              </div>
            </div>
            
            <div className="space-y-4">
              {service.orderOfService.map((item, iIdx) => (
                <div key={item.id} className="relative group">
                  <div className="flex flex-col border rounded-lg overflow-hidden shadow-sm bg-white">
                    {/* Activity Title */}
                    <div className="flex items-center bg-white border-b">
                       <input
                        placeholder={`Activity ${iIdx + 1} (e.g. Opening Prayer, Sermon)`}
                        className="flex-1 p-2 text-sm font-semibold outline-none placeholder:font-normal"
                        value={item.activity}
                        onChange={(e) => updateActivity(sIdx, iIdx, 'activity', e.target.value)}
                      />
                      <button 
                        onClick={() => removeActivity(sIdx, item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove activity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Detail Box */}
                    <textarea
                      placeholder="Add details, verses, or hymn lyrics here..."
                      rows={2}
                      className="w-full p-2 text-sm bg-gray-50 focus:bg-white transition-colors outline-none resize-none border-none"
                      value={item.details}
                      onChange={(e) => updateActivity(sIdx, iIdx, 'details', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={() => addActivity(sIdx)}
                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-500 flex items-center justify-center gap-1 hover:border-blue-300 hover:text-blue-600 transition-all bg-white/50"
              >
                <Plus size={14} /> Add Activity to {service.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
      >
        <Save size={20} /> Publish to Member Hub & WhatsApp
      </button>
    </div>
  );
};
