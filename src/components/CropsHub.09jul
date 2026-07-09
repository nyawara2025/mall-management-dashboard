import React, { useState, useEffect } from 'react';
import { CropsModal } from './CropsModal';

interface CropsHubProps {
  shopId: string;
  farmName: string;
  userSession: { name: string; role: string } | null;
  isCropsModalOpen: boolean;
  setIsCropsModalOpen: (open: boolean) => void;
  // ADD THESE MISSING PARENT STATES AND SETTERS TO RESOLVE TYPE ERRORS 👇
  cropClass: 'Vegetables' | 'Fruits' | 'Tubers' | 'Grains';
  cropVariety: string;
  acreage: string;
  cropStartDate: string;
  harvestDate: string;
  setCropClass: (val: 'Vegetables' | 'Fruits' | 'Tubers' | 'Grains') => void;
  setCropVariety: (val: string) => void;
  setAcreage: (val: string) => void;
  setCropStartDate: (val: string) => void;
}

interface CropCycle {
  id: string | number;
  crop_class: 'Vegetables' | 'Fruits' | 'Tubers' | 'Grains';
  variety: string;
  acreage: number;
  start_date: string;
  expected_harvest_date: string;
  plot_name?: string;
}

export const CropsHub: React.FC<CropsHubProps> = ({ 
  shopId, 
  farmName, 
  userSession,
  isCropsModalOpen,
  setIsCropsModalOpen,
  // DESTRUCTURE THE MISSING PARAMETERS HERE 👇
  cropClass,
  cropVariety,
  acreage,
  cropStartDate,
  harvestDate,
  setCropClass,
  setCropVariety,
  setAcreage,
  setCropStartDate
}) => {

  const [activeCycles, setActiveCycles] = useState<CropCycle[]>([]);

  // 1. CHANGER OR ADD THIS EXACT LOCAL STATE INITIALIZER HERE 👇
  const [summaryMetrics, setSummaryMetrics] = useState({
    total_plots: 0,
    active_acreage: 0,
    projected_yield_kg: 0
  });

  // Navigation State Panel Switcher
  const [cropsView, setCropsView] = useState<'menu' | 'production' | 'inputs' | 'tasks' | 'weather'>('menu');
  const [loading, setLoading] = useState(false);
  
  // Local Weather Sync States
  const [weatherData, setWeatherData] = useState<{ temp: number; text: string; rainProb: number; ward: string; constituency: string; county: string;} | null>(null);

  // Operational Form Buffer States
  const [inputCategory, setInputCategory] = useState<'Fertilizer' | 'Manure' | 'Chemical' | 'Seeds'>('Fertilizer');
  const [inputName, setInputName] = useState('D.A.P.');
  const [inputQuantity, setInputQuantity] = useState('');
  const [targetPlot, setTargetPlot] = useState('Plot A / Phase 1');

  // Task / Field Preparation Tracking States
  const [taskType, setTaskType] = useState<'Land Prep' | 'Spraying' | 'Top Dressing' | 'Weeding' | 'Harvesting'>('Land Prep');
  const [workerPhone, setWorkerPhone] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle cascading sub-choices for common Kenyan inputs
  const handleInputCategoryChange = (cat: 'Fertilizer' | 'Manure' | 'Chemical' | 'Seeds') => {
    setInputCategory(cat);
    if (cat === 'Fertilizer') setInputName('D.A.P.');
    else if (cat === 'Manure') setInputName('Goat Manure (Cured)');
    else if (cat === 'Chemical') setInputName('Mastercop Fungicide');
    else if (cat === 'Seeds') setInputName('H6214 Maize Seeds');
  };

  const getWeatherAdvisory = (code: number): { condition: string; advisory: string } => {
    if (code <= 1) return { condition: 'Clear Skies', advisory: 'Ideal for crop inspection & top-dressing application.' };
    if (code <= 3) return { condition: 'Partly Cloudy', advisory: 'Good conditions for land preparation and general farm tasks.' };
    if (code >= 51 && code <= 55) return { condition: 'Drizzle', advisory: 'Light moisture. Safe for weeding, but avoid spraying fungicides.' };
    if (code >= 61 && code <= 65) return { condition: 'Rain Showers', advisory: 'High soil moisture. Suspend chemical spraying; ideal for transplanting seedlings.' };
    if (code >= 80 && code <= 82) return { condition: 'Heavy Downpour', advisory: 'Risk of runoff. Check field drainage channels immediately.' };
    if (code >= 95) return { condition: 'Thunderstorms', advisory: 'Severe weather alert. Ensure field workers seek shelter.' };
    return { condition: 'Overcast', advisory: 'Monitor local moisture levels before scheduling irrigation.' };
  };

  // 🌍 1. Link to Regional Weather Tracking Databases Dynamically via Webhook
  const fetchRegionalWeather = async () => {
    try {
      const coordResponse = await fetch('https://n8n.tenear.com/webhook/fetch-farm-coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });

      if (coordResponse.ok) {
        const rawPayload = await coordResponse.json();

        // 🔍 FORCE EXTRACTING THE FIRST ITEM IF WEBHOOK RETURNS AN ARRAY
        const farmData = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;

        console.log("Parsed Farm JSON Data Object:", farmData);

        if (farmData && farmData.latitude && farmData.longitude) {
          const lat = String(farmData.latitude).trim();
          const lon = String(farmData.longitude).trim();
          
          const queryParams = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current_weather: 'true',
            daily: 'precipitation_probability_max',
            timezone: 'Africa/Nairobi'
          });

          const weatherUrl = 'https://api.open-meteo.com/v1/forecast?' + queryParams.toString();
          
          console.log("Dispatching Weather Network Fetch Request to:", weatherUrl);
          
          const weatherResponse = await fetch(weatherUrl);
          if (weatherResponse.ok) {
            const data = await weatherResponse.json();
            
            // Extract values safely
            const currentTemp = data.current_weather?.temperature != null ? Math.round(data.current_weather.temperature) : 24;
            const weatherCode = data.current_weather?.weathercode ?? 0;
            const maxRainProb = data.daily?.precipitation_probability_max?.[0] ?? 0;

            const currentCode = data.current_weather.weathercode;
            const agroDetails = getWeatherAdvisory(currentCode);


            setWeatherData({
              temp: Math.round(data.current_weather.temperature),
              text: agroDetails.advisory, // Stores ONLY the raw advisory string
              rainProb: data.daily?.precipitation_probability_max?.[0] || 0,
              ward: farmData.ward || "Local",
              constituency: farmData.constituency || "Region",
              county: farmData.county || "County"
            });
          } else {
            console.error("Open-Meteo endpoint returned a bad response code:", weatherResponse.status);
          }
        } else {
          console.warn("Weather skip flag triggered: Check if latitude/longitude exist on this object:", farmData);
        }
      }
    } catch (e) {
      console.error("Failed executing dynamic weather pipeline elements:", e);
    }
  };
  

  // 📊 1. Fetch Summary Data Matrix for the Operational Counter Cards
  const fetchCropsDashboardData = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/get-crops-financial-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const data = await response.json();
        setSummaryMetrics({
          total_plots: parseInt(data.total_plots) || 0,
          active_acreage: parseFloat(data.active_acreage) || 0,
          projected_yield_kg: parseFloat(data.projected_yield_kg) || 0
        });
      }
    } catch (e) {
      console.error("Failed fetching agronomy summary statistics:", e);
    }
  };

  // 🥬 2. Fetch Active Crop Cycles List (Replaces "No active tracking timelines")
  // You can hook this up to update local category rows when expanding database grids
  const fetchActiveCycles = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/get-active-crop-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const data = await response.json();
        // Save the dynamic database records array directly into your state
        // Handles if n8n returns an object wrapper or raw array
        const cyclesArray = Array.isArray(data) ? data : (data.cycles || []);
        setActiveCycles(cyclesArray);
      }
    } catch (e) {
      console.error("Failed fetching active crop cycle tracking matrices:", e);
    }
  };

  // 🔄 3. CLEAN LIFECYCLE CONTROLLER (Replaces your existing simple weather useEffect)
  useEffect(() => {
    if (shopId) {
      fetchRegionalWeather();      // Always refresh weather status on boot
      fetchCropsDashboardData();  // Automatically load the 0 metrics counter totals
      fetchActiveCycles();        // Automatically look for active crop cycle records
    }
  }, [cropsView, shopId]);

  useEffect(() => {
    if (cropsView === 'weather' || cropsView === 'menu') {
      fetchRegionalWeather();
    }
  }, [cropsView]);

  // 📱 2. Evolution API Gateway WhatsApp Notification Dispatcher
  const triggerWhatsAppAlert = async (phone: string, message: string) => {
    try {
      await fetch('https://n8n.tenear.com/webhook/crop-whatsapp-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          farm_name: farmName,
          target_recipient: phone.trim(),
          alert_body: message,
          timestamp: new Date().toISOString()
        })
      });
      console.log('WhatsApp notification sequence queued inside gateway lines cleanly.');
    } catch (err) {
      console.error('Failed processing Evolution API routing hook:', err);
    }
  };

  // 📝 3. Commit Input Logging Transactions (Fertilizer/Manure/Spraying)
  const handleLogInputRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuantity || parseFloat(inputQuantity) <= 0) return alert("Enter valid quantity volume.");
    setLoading(true);

    const payload = {
      action: 'log_farm_input',
      shop_id: shopId,
      category: inputCategory,
      item_name: inputName,
      quantity: parseFloat(inputQuantity),
      plot_location: targetPlot,
      logged_by: userSession?.name || 'Manager',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/log-fertilizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`Successfully logged application of ${inputQuantity} units of ${inputName} onto ${targetPlot}!`);
        
        // Auto-Trigger alert notification run for farm management tracking transparency
        if (workerPhone) {
          const alertMessage = `🚨 *TeNEAR Farm-Alert: Input Logged*\n\nWorkspace: *${farmName}*\nItem Applied: *${inputName}*\nVolume: *${inputQuantity} Units*\nTarget Field: *${targetPlot}*\nLogged By: *${userSession?.name}*`;
          await triggerWhatsAppAlert(workerPhone, alertMessage);
        }
        
        setInputQuantity('');
        setCropsView('menu');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // 📅 4. Commit Task Scheduling & Due Dates Trackers
  const handleScheduleTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerPhone) return alert("Provide worker WhatsApp phone tracking identifier.");
    setLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/schedule-farm-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule_crop_task',
          shop_id: shopId,
          task_type: taskType,
          due_date: taskDueDate,
          target_plot: targetPlot,
          assigned_worker_contact: workerPhone
        })
      });

      if (response.ok) {
        alert(`Task scheduled successfully! Dispatching notification sequence...`);
        
        // ⚡ Direct execution push into your local Evolution WhatsApp instance pipelines
        const reminderMsg = `📅 *TeNEAR Task Assignment: ${taskType.toUpperCase()}*\n\nFarm: *${farmName}*\nAction Due: *${taskType}*\nTarget Plot: *${targetPlot}*\nDeadline Date: *${taskDueDate}*\n\nPlease update your operational log sheet immediately upon completion.`;
        await triggerWhatsAppAlert(workerPhone, reminderMsg);
        
        setWorkerPhone('');
        setCropsView('menu');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Main Crops Hub Sub-Menu
  if (cropsView === 'menu') {
    return (
      <div className="space-y-4 animate-fadeIn text-left font-sans">
        
        {/* 🌦️ Weather Indicator Banner Widget */}
        <div onClick={() => setCropsView('weather')} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 shadow-xs flex justify-between items-center cursor-pointer">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌦️</span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Regional Weather Status</h4>
              <p className="text-[11px] opacity-90">{weatherData ? `${weatherData.temp}°C • ${weatherData.text} (Rain Risk: ${weatherData.rainProb}%)` : 'Syncing meteorological nodes...'}</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md">View Details</span>
        </div>

        {/* 📊 Accounting Overview Card Matrix */}
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Crops Operational Matrix</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50/50 border border-slate-100 p-2 rounded-xl text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Active Plots</span>
              {/* FIXED: Uses your active summaryMetrics variables */}
              <span className="text-xs font-black text-slate-700 block mt-0.5">{summaryMetrics.total_plots} Fields</span>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 p-2 rounded-xl text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Total Acreage</span>
              {/* FIXED: Uses your active summaryMetrics variables */}
              <span className="text-xs font-black text-emerald-700 block mt-0.5">{summaryMetrics.active_acreage} Acres</span>
            </div>
            <div className="bg-emerald-50/40 border border-emerald-100 p-2 rounded-xl text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Est. Yield</span>
              {/* FIXED: Uses your active summaryMetrics variables */}
              <span className="text-xs font-black text-blue-600 block mt-0.5">{summaryMetrics.projected_yield_kg} Kg</span>
            </div>
          </div>
        </div>

        {/* 🛠️ Dashboard Operation Selector Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setCropsView('inputs')}
            className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-center space-y-1"
          >
            <span className="text-lg">🌾</span>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Inputs Log</span>
          </button>

          <button 
            onClick={() => setCropsView('tasks')}
            className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-center space-y-1"
          >
            <span className="text-lg">📅</span>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Task Alerts</span>
          </button>
        </div>

        {/* 🌽 YOUR PRODUCTION CATEGORY CARDS (Brought Back & Integrated) */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Crop Cultivation Cycles</h3>
            <button 
              onClick={() => setIsCropsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] tracking-wide py-1 px-2.5 rounded-lg transition-all"
            >
              + NEW PLOT
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {['Vegetables', 'Fruits', 'Tubers', 'Grains'].map((cls) => {
              // Filter the global array to see if records match this specific type block
              const classCycles = activeCycles.filter(c => c.crop_class === cls);
              
              return (
                <div key={cls} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{cls} Records</h4>
                    </div>
                    <span className="text-lg">
                      {cls === 'Vegetables' ? '🥬' : cls === 'Fruits' ? '🥑' : cls === 'Tubers' ? '🥔' : '🌾'}
                    </span>
                  </div>

                  {classCycles.length > 0 ? (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      {classCycles.map((cycle) => (
                        <div key={cycle.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <div>
                            <p className="text-[11px] font-black text-slate-800">{cycle.variety}</p>
                            <p className="text-[9px] text-slate-500 font-medium">Planted: {cycle.start_date} • Plot: {cycle.plot_name || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                              {cycle.acreage} Ac
                            </span>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Est: {cycle.expected_harvest_date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-50">
                      No active crop tracking timelines on file
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 📱 Form Pop-up Integration */}
        <CropsModal 
          isOpen={isCropsModalOpen}
          onClose={() => setIsCropsModalOpen(false)}
          shopId={shopId}
          farmName={farmName}
          userSession={userSession}
          cropClass={cropClass}
          cropVariety={cropVariety}
          acreage={acreage}
          cropStartDate={cropStartDate}
          harvestDate={harvestDate}
          setCropClass={setCropClass}
          setCropVariety={setCropVariety}
          setAcreage={setAcreage}
          setCropStartDate={setCropStartDate}
        />
      </div>
    );
  }
   


  // Input Tracking Input Management Form Component Layout
  if (cropsView === 'inputs') {
    return (
      <div className="space-y-4 animate-fadeIn text-left">
        <button onClick={() => setCropsView('menu')} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-black tracking-wide uppercase">
          ← Back to Crops Menu
        </button>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-4">Log Input Application</h3>
          <form onSubmit={handleLogInputRun} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Input Stream Category</label>
              <select value={inputCategory} onChange={(e) => handleInputCategoryChange(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                <option value="Fertilizer">Fertilizer (D.A.P. / C.A.N. / N.P.K.)</option>
                <option value="Manure">Organic Manure (Cattle / Poultry / Goat)</option>
                <option value="Chemical">Crop Protection / Chemical Sprays</option>
                <option value="Seeds">Seed Lots / Varieties</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Specific Item Name</label>
              <select value={inputName} onChange={(e) => setInputName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                {inputCategory === 'Fertilizer' && (
                  <>
                    <option value="D.A.P.">D.A.P. (Planting Base)</option>
                    <option value="C.A.N.">C.A.N. (Top Dressing)</option>
                    <option value="N.P.K. 17:17:17">N.P.K. 17:17:17 Foliar</option>
                  </>
                )}
                {inputCategory === 'Manure' && (
                  <>
                    <option value="Goat Manure (Cured)">Goat Manure (Cured)</option>
                    <option value="Poultry Droppings">Poultry Droppings (High Nitrogen)</option>
                    <option value="Cow Compost">Cow Manure Compost</option>
                  </>
                )}
                {inputCategory === 'Chemical' && (
                  <>
                    <option value="Mastercop Fungicide">Mastercop Fungicide (Early Blight)</option>
                    <option value="Match 50EC">Match 50EC Insecticide</option>
                    <option value="Roundup Turbo">Roundup Turbo Herbicide</option>
                  </>
                )}
                {inputCategory === 'Seeds' && (
                  <>
                    <option value="H6214 Maize Seeds">Kenya Seed H6214 Maize</option>
                    <option value="Pana 691">Pannar 691 Hybrid</option>
                    <option value="Assorted Greens Seedlings">Assorted Veg Seedlings</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Volume / Qty</label>
                <input type="number" placeholder="Bags / Liters" value={inputQuantity} onChange={e => setInputQuantity(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Target Field / Plot</label>
                <select value={targetPlot} onChange={e => setTargetPlot(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  <option value="Plot A / Phase 1">Plot A (Lower Section)</option>
                  <option value="Plot B / Upper Block">Plot B (Upper Section)</option>
                  <option value="Greenhouse Alpha">Greenhouse Alpha</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Farm Hand WhatsApp Line (Optional Notification)</label>
              <input type="tel" placeholder="e.g. 0716300197" value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl text-sm uppercase tracking-wider shadow-md">
              {loading ? 'Transmitting Data...' : 'Commit Input Run'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Task Scheduler & WhatsApp Alert Interface Component Layout
  if (cropsView === 'tasks') {
    return (
      <div className="space-y-4 animate-fadeIn text-left">
        <button onClick={() => setCropsView('menu')} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-black tracking-wide uppercase">
          ← Back to Crops Menu
        </button>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-4">Assign Task & Queue WhatsApp Alert</h3>
          <form onSubmit={handleScheduleTask} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Task Core Action</label>
              <select value={taskType} onChange={(e) => setTaskType(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                <option value="Land Prep">🚜 Land Preparation (Ploughing/Harrowing)</option>
                <option value="Spraying">🚫 Spraying Regime (Pesticide/Fungicide)</option>
                <option value="Top Dressing">🌱 Fertilizer Top Dressing (C.A.N.)</option>
                <option value="Weeding">🌿 Field Weeding / Clearing</option>
                <option value="Harvesting">🧺 Harvest Sorting & Batch Packing</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Target Field / Plot</label>
                <select value={targetPlot} onChange={e => setTargetPlot(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  <option value="Plot A / Phase 1">Plot A (Lower Section)</option>
                  <option value="Plot B / Upper Block">Plot B (Upper Section)</option>
                  <option value="Greenhouse Alpha">Greenhouse Alpha</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Deadline Date</label>
                <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 font-bold text-slate-700 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Assigned Worker WhatsApp Mobile Line</label>
              <input type="tel" placeholder="e.g. 0716300197" value={workerPhone} onChange={e => setWorkerPhone(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3.5 rounded-xl text-sm uppercase tracking-wider shadow-md">
              {loading ? 'Scheduling Operation...' : 'Assign & Dispatch Alert'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Weather Overview Subview Component Panel Layout
  return (
    <div className="space-y-4 animate-fadeIn text-left">
      <button onClick={() => setCropsView('menu')} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-black tracking-wide uppercase">
        ← Back to Crops Menu
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-center">
        {/* Dynamic icon depending on rain probability */}
        <span className="text-3xl block mb-2">{(weatherData?.rainProb ?? 0) >= 50 ? '🌧️' : '☀️'}</span>
        
        {/* 📍 Fully dynamic administrative regional header */}
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">
          {weatherData ? `${weatherData.ward} Ward Weather` : 'Meteorological Safety Dashboard'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {farmName || 'Your Farm'} • {weatherData ? `${weatherData.constituency}, ${weatherData.county} County` : 'Analyzing localized regional parameters...'}
        </p>

        {weatherData && (
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl inline-block w-full text-left space-y-2">
            <p className="text-xs text-slate-600 font-bold">Current Ambient Temperature: <span className="text-slate-900 font-black">{weatherData.temp}°C</span></p>
            <p className="text-xs text-slate-600 font-bold">Agronomic Advisory: <span className="text-slate-900 font-black">{weatherData.text}</span></p>
            <p className="text-xs text-slate-600 font-bold">Precipitation Probability (Rain): <span className="text-blue-600 font-black">{weatherData.rainProb}%</span></p>

            {weatherData.rainProb >= 50 ? (
              <div className="p-2.5 rounded-xl text-[10px] font-black uppercase text-center mt-2 bg-rose-50 text-rose-700 border border-rose-100">
                 ⚠️ Warning: High rain risk for {weatherData.ward}. Postpone spray or top-dressing runs.
              </div>
            ) : (
              <div className="p-2.5 rounded-xl text-[10px] font-black uppercase text-center mt-2 bg-emerald-50 text-emerald-700 border border-emerald-100">
                ✅ Safe: Low rain probability in {weatherData.constituency}. Ideal for foliar input application.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
