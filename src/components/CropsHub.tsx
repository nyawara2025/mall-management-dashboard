import React, { useState, useEffect } from 'react';
import { CropsModal } from './CropsModal';
import { PlotConfigModal } from './PlotConfigModal';

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

interface MarketPriceRow {
  id: string | number;
  commodity_name: string;
  unit_measure: string;
  retail_price_kes: number;
  wholesale_price_kes: number;
  market_trend: 'UP' | 'DOWN' | 'STABLE';
  trading_hub: string;
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

  const [isPlotModalOpen, setIsPlotModalOpen] = useState<boolean>(false);
 
  // 1. CHANGER OR ADD THIS EXACT LOCAL STATE INITIALIZER HERE 👇
  const [summaryMetrics, setSummaryMetrics] = useState({
    total_plots: 0,
    active_acreage: 0,
    projected_yield_kg: 0
  });

  // 2. Soko Intel array state tracker
  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  // Navigation State Panel Switcher
  const [cropsView, setCropsView] = useState<'menu' | 'production' | 'inputs' | 'tasks' | 'weather' | 'market' | 'pathology' | 'plots_config'>('menu');
  const [loading, setLoading] = useState(false);
 
  const [activePlotsList, setActivePlotsList] = useState<Array<{ id: string | number; plot_name: string }>>([]);
  const [selectedPlotName, setSelectedPlotName] = useState<string>('');

  // 🎙️ AI Voice Logger Hardware State Trackers
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceLoading, setVoiceLoading] = useState<boolean>(false);
  const [aiParsingLogs, setAiParsingLogs] = useState<string>("");
 
  // 📸 Crop Pathology Scanning Engine Local States
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiDiagnosing, setAiDiagnosing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  // Local Weather Sync States
  const [weatherData, setWeatherData] = useState<{
    temp: number; 
    text: string; 
    rainProb: number; 
    ward: string; 
    constituency: string; 
    county: string;
  } | null>(null);

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

  // 🌍 Consolidated Multi-Tenant Geographic & Market Intel Data Pipeline
  const fetchTenantRegionalDashboardData = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-farm-coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });

      if (!response.ok) return;
      const rawPayload = await response.json();

      // 🔍 FIX: Handle the array wrapper from n8n factually
      const farmData = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;

      // Verify the unpacked object structure properties match
      if (farmData && farmData.latitude && farmData.longitude) {

        // 1. Sync your Soko Intel list state instantly with the dynamic sub-array
        setMarketPrices(farmData.market_prices || []);

        const lat = String(farmData.latitude).trim();
        const lon = String(farmData.longitude).trim();

        // Step B: Fetch real-time numeric parameters using the precise database coordinates
        const queryParams = new URLSearchParams({
          latitude: lat,
          longitude: lon,
          current_weather: 'true',
          daily: 'precipitation_probability_max',
          timezone: 'Africa/Nairobi'
        });

        const weatherUrl = 'https://api.open-meteo.com/v1/forecast?' + queryParams.toString();
        const weatherResponse = await fetch(weatherUrl);
        
        if (weatherResponse.ok) {
          const weatherJson = await weatherResponse.json();
          
          // 2. Populate your weather widget layout with combined data elements
          setWeatherData({
            temp: Math.round(weatherJson.current_weather.temperature),
            text: weatherJson.current_weather.weathercode <= 3 ? 'Clear Skies' : 'Overcast / Rain Threat',
            rainProb: weatherJson.daily?.precipitation_probability_max?.[0] || 0,
            ward: farmData.ward || 'Local',
            constituency: farmData.constituency || 'Region',
            county: farmData.county || 'County'
          });
        }
      }
    } catch (e) {
      console.error("Failed executing unified multi-tenant dashboard pipeline:", e);
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

  // 🔄 3. CLEAN LIFECYCLE CONTROLLER (Fully Optimized for Multi-Tenant Data Structures)
  useEffect(() => {
    if (shopId) {
      // 1. Initial boot data extraction setup
      fetchTenantRegionalDashboardData(); // Loads coordinates, weather benchmarks, and soko prices in one go
      fetchCropsDashboardData();          // Automatically loads operational aggregates counters
      fetchActiveCycles();                // Automatically looks for active crop tracking timelines
      // 👇 FIX: Explicitly trigger your plot database sync routine on mount
      fetchActivePlots();

    }
  }, [shopId]); // Runs cleanly whenever switching between multi-tenant shops/tenants

  // 📱 REACTIVE PANEL VIEW SWITCHER WATCHER
  useEffect(() => {
    // Re-triggers data refreshing when navigating key subviews to guarantee data is always up to date
    if (cropsView === 'weather' || cropsView === 'menu' || cropsView === 'market') {
      fetchTenantRegionalDashboardData();
    }
    
    if (cropsView === 'menu') {
      fetchCropsDashboardData();
      fetchActiveCycles();
    }
  }, [cropsView]); // Explicitly triggers layout synchronization when panels toggle


  // Define the fetching mechanism using your n8n middleware path pattern
  const fetchActivePlots = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_active_plots',
          shop_id: parseInt(shopId)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setActivePlotsList(data);
        } else {
        setActivePlotsList(data.plots || []);
      }
    } 
      
  } catch (error) {
    console.error("Failed syncing topological grid matrix records:", error);
  }
};

  // Fire the network fetch hook automatically whenever the screen initializes
  useEffect(() => {
    if (shopId) {
      fetchActivePlots();
    }
  }, [shopId]);


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


  // 🟢 Start capturing audio stream from the worker's microphone
  const startVoiceCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await transmitVoiceToAiEngine(audioBlob);
        
        // Clean up and release the microphone hardware resources safely
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setAiParsingLogs("Listening to ground logs instructions...");
    } catch (err) {
      console.error("Microphone hardware access denied:", err);
      alert("Please unlock mic permissions to utilize AI voice logging.");
    }
  };

  // 🔴 Stop recording and trigger the compiling callback sequence
  const stopVoiceCapture = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // 🚀 Transmit raw audio binary package to your active n8n AI execution hook
  const transmitVoiceToAiEngine = async (audioBlob: Blob) => {
    setVoiceLoading(true);
    setAiParsingLogs("AI engine processing audio & parsing agricultural parameters...");
    
    try {
      const formData = new FormData();
      formData.append("voice_log", audioBlob, "farm_action.webm");
      formData.append("shop_id", shopId);
      formData.append("farm_name", farmName);

      const response = await fetch('https://n8n.tenear.com/webhook/farm-AI-audio', {
        method: 'POST',
        body: formData // Sends as multi-part binary data package
      });

      if (response.ok) {
        const result = await response.json();
        setAiParsingLogs(`✅ Success: ${result.message || 'Action logged cleanly to database rows.'}`);
        
        // Instantly reload dashboard counter total summaries to reflect updates on the fly
        fetchCropsDashboardData();
        fetchActiveCycles();
      } else {
        setAiParsingLogs("❌ AI Parsing Error: Could not determine agricultural action items cleanly.");
      }
    } catch (err) {
      console.error(err);
      setAiParsingLogs("❌ Pipeline Connection Error: Failed reaching n8n processing nodes.");
    } finally {
      setVoiceLoading(false);
    }
  };


  const handleCropDiagnosis = async (base64DataUri: string | null) => {
    // 🛑 Rule A: Kill execution instantly if no valid image data string exists
    if (!base64DataUri || base64DataUri.length < 50) {
      alert("Error: Canvas capture frame is empty. Please capture a leaf photo first.");
      return;
    }

    setAiDiagnosing(true);
    setDiagnosisResult(null);
    
    try {
      const currentActivePlot = activeCycles.find(c => c.plot_name === targetPlot);
      
      const dynamicCropContext = currentActivePlot 
        ? `${currentActivePlot.variety} (${currentActivePlot.crop_class})` 
        : "Unknown Plant Species";

      // ⚡ REAL FIX: Safely strip browser canvas prefixes and pull only the pure base64 text payload (Index 1)
      const cleanBase64Payload = base64DataUri.includes(',') 
        ? base64DataUri.split(',')[1] 
        : base64DataUri;

      const response = await fetch('https://n8n.tenear.com/webhook/crops-AI-camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(shopId) || 0, 
          userSession: userSession,
          image_base64: cleanBase64Payload, // Sends pure base64 string data cleanly
          crop_context: dynamicCropContext, 
          plot_location: targetPlot        
        })
      });

      if (response.ok) {
        const payloadResult = await response.json();
        setDiagnosisResult(payloadResult);
      } else {
        alert(`Server Error: Received status code ${response.status} from analysis endpoint.`);
      }
    } catch (err) {
      console.error("Pathology transmission crashed:", err);
      alert("Pipeline Exception: Check browser console payload logs.");
    } finally {
      setAiDiagnosing(false);
    }
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
        <div className="grid grid-cols-4 gap-1.5">

          {/* 👇 NEW DYNAMIC PLOT PROFILE LOG CONFIGURATION ACTION TILE */}
          <button 
            onClick={() => setCropsView('plots_config')}
            className="bg-white border border-slate-200 p-2 rounded-xl shadow-2xs hover:border-blue-300 transition-all text-center flex flex-col items-center justify-center space-y-1"
          >
            <span className="text-base">🗺️</span>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Plots Log</span>
          </button>

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

          {/* 👇 NEW SOKO INTELLIGENCE GATEWAY TILE */}
          <button 
            onClick={() => setCropsView('market')}
            className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-center space-y-1"
          >
            <span className="text-lg">📊</span>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Soko Intel</span>
          </button>

        </div>


        {/* 🏥 Updated Trigger Block */}
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex justify-between items-center">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">Crop Health Diagnostic Scanner</h4>
            <p className="text-[11px] text-emerald-700">Notice spots or leaf damage? Scan instantly via camera module feed.</p>
          </div>
          <button 
            onClick={() => {
              // 👇 SWITCH VIEW TO ISOLATE CAMERA CYCLES
              setCropsView('pathology');
              setDiagnosisResult(null);
              setCapturedImage(null);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            📷 Scan Leaf
          </button>
        </div>

        {/* 🤖 Embedded AI Voice Logger Action Panel */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">AI Voice-to-Action</h3>
              <p className="text-[10px] text-slate-400 font-medium">Log field inputs or tasks instantly via speech</p>
            </div>
            <span className="text-xl">🎙️</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 flex flex-col items-center justify-center text-center space-y-3 min-h-[110px]">
            {voiceLoading ? (
              /* A. Loading State Spinner */
              <div className="space-y-2">
                <span className="text-2xl block animate-spin">⏳</span>
                <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider animate-pulse">{aiParsingLogs}</p>
              </div>
            ) : isRecording ? (
              /* B. Live Recording Active State */
              <div className="space-y-3 w-full">
                <div className="flex justify-center items-center gap-1.5 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <p className="text-[11px] text-rose-400 font-black uppercase tracking-wider">Microphone Streaming Live</p>
                </div>
                <p className="text-[10px] text-slate-400 italic">"e.g., We applied 3 bags of DAP onto Plot A Phase 1 today..."</p>
                <button
                  onClick={stopVoiceCapture}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] tracking-wide py-2.5 px-4 rounded-xl transition-all uppercase"
                >
                  🛑 Finish & Process Recording
                </button>
              </div>
            ) : (
              /* C. Idle / Success State Widget Trigger */
              <div className="space-y-3 w-full">
                {aiParsingLogs ? (
                  <p className="text-[11px] font-medium text-slate-200 border-b border-slate-700/50 pb-2 leading-relaxed">
                    {aiParsingLogs}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-normal px-4">
                    Tap below and speak in English or Swahili to automatically sync logs to your Supabase tables.
                  </p>
                )}
                
                <button
                  onClick={startVoiceCapture}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] tracking-wide py-2.5 px-4 rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 shadow-xs"
                >
                  🎤 Start Audio Voice Recording
                </button>
              </div>
            )}
          </div>
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
          // 👇 ATTACH THESE NEW PARAMS TO SATISFY INTERFACE VALIDATION
          activePlotsList={activePlotsList}
          selectedPlotName={selectedPlotName}
          setSelectedPlotName={setSelectedPlotName}
        />

        <PlotConfigModal
          isOpen={isPlotModalOpen}
          onClose={() => setIsPlotModalOpen(false)}
          shopId={shopId}
          farmName={farmName}
          userSession={userSession}
          onPlotSaved={() => {
            fetchActivePlots();
          }}
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

  // 🔬 Dedicated Pathology Scanner Interface Screen Panel View
  if (cropsView === 'pathology') {
    return (
      <div className="space-y-4 animate-fadeIn text-left">
        <button 
          onClick={() => {
            // Kill active camera hardware frames before changing views
            const videoEl = document.getElementById('camera-stream-feed') as HTMLVideoElement;
            if (videoEl?.srcObject) {
              (videoEl.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            setCropsView('menu');
          }} 
          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-black tracking-wide uppercase"
        >
          ← Cancel & Back to Menu
        </button>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">AI Crop Health Diagnostics</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Active Target Plot: <span className="text-emerald-600">{targetPlot}</span></p>
          </div>

          {!capturedImage ? (
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-inner">
              <video 
                id="camera-stream-feed" 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                ref={(ref) => {
                  if (ref && !ref.srcObject) {
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                      .then(stream => { ref.srcObject = stream; })
                      .catch(err => {
                        console.error("Camera hardware block:", err);
                        alert("Camera Access Blocked: Ensure permissions are allowed.");
                      });
                  }
                }}
              />
              <button
                onClick={() => {
                  const video = document.getElementById('camera-stream-feed') as HTMLVideoElement;
                  if (video) {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 480;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                      setCapturedImage(canvas.toDataURL('image/jpeg'));
                      if (video.srcObject) {
                        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                      }
                    }
                  }
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-black text-[10px] tracking-wider uppercase px-5 py-2.5 rounded-xl shadow-xl active:scale-95 transition-all border border-slate-200"
              >
                📸 Capture Leaf Photo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <img src={capturedImage} alt="Crop Sample Preview" className="w-full aspect-video object-cover rounded-2xl border border-slate-200 shadow-xs" />
              
              {!diagnosisResult && !aiDiagnosing && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCapturedImage(null)} 
                    className="w-1/2 border border-slate-200 font-black text-[11px] uppercase tracking-wide py-3 rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-all"
                  >
                    🔄 Retake Photo
                  </button>
                  <button 
                    onClick={() => handleCropDiagnosis(capturedImage)}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wide py-3 rounded-xl shadow-xs transition-all"
                  >
                    🔬 Run AI Pathology
                  </button>
                </div>
              )}
            </div>
          )}

          {aiDiagnosing && (
            <div className="p-6 text-center space-y-2 border border-slate-100 bg-slate-50/50 rounded-2xl animate-pulse">
              <span className="text-2xl block animate-spin">🧬</span>
              <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">Analyzing Sample Tissue...</h5>
              <p className="text-[10px] text-slate-400">Querying multi-sector agronomy models.</p>
            </div>
          )}

          {diagnosisResult && (
            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3.5 text-[11px] animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-200/50 pb-2.5">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Identified Variety</span>
                  <strong className="text-slate-800 uppercase text-xs">{diagnosisResult.payload?.identified_crop || 'Unknown'}</strong>
                </div>
                <span className="px-2 py-0.5 rounded-md font-bold text-[9px] bg-emerald-100 text-emerald-800">
                  Confidence: {diagnosisResult.payload?.confidence_score || 'High'}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Suspected Ailment</span>
                <strong className="text-red-600 text-xs block mt-0.5">{diagnosisResult.payload?.possible_condition || 'Undetermined'}</strong>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Proposed Remedial Measures</span>
                <ul className="space-y-1.5 pl-0.5 text-slate-600 font-medium">
                  {diagnosisResult.payload?.remedial_measures?.map((measure: string, idx: number) => (
                    <li key={idx} className="flex gap-1.5 items-start">
                      <span className="text-emerald-500">✔</span> 
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[9px] text-slate-400 leading-normal pt-2 border-t border-slate-200/50 italic text-center">
                ⚠ AI insights are for tracking only. Verify inputs with a certified agronomy official before chemical application.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 📊 Multi-Tenant Localized Market Intelligence Component Dashboard Panel Layout
  if (cropsView === 'market') {
    return (
      <div className="space-y-4 animate-fadeIn text-left font-sans">
        <button 
          onClick={() => setCropsView('menu')} 
          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-black tracking-wide uppercase"
        >
          ← Back to Crops Menu
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Regional Soko Intelligence</h3>
            <span className="text-xl">📊</span>
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-normal">
            Tracking active commodity values for key commercial hubs nearest to <span className="font-black text-slate-700">{farmName || 'Your Farm'}</span>.
          </p>

          {/* Live Dynamic Price Table Layout */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Regional Trade Baselines</h4>
            
            {marketPrices.length > 0 ? (
              marketPrices.map((row) => (
                <div key={row.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-slate-800">{row.commodity_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase ${
                        row.market_trend === 'UP' ? 'text-emerald-600' : row.market_trend === 'DOWN' ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {row.market_trend === 'UP' ? '📈 Rising' : row.market_trend === 'DOWN' ? '📉 Dropping' : '↔️ Stable'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">• Hub: {row.trading_hub}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">KES {row.retail_price_kes} / {row.unit_measure}</span>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Wholesale: KES {row.wholesale_price_kes}</p>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback UX display placeholder card while n8n is fetching data records */
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center py-6">
                <span className="text-xl block mb-1">⏳</span>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Syncing Market Matrix Indices...</p>
                <p className="text-[10px] text-slate-400 font-medium px-4 mt-0.5">Fetching latest Kisumu county wholesale values from centralized network pipelines.</p>
              </div>
            )}
          </div>

          {/* Smart Multi-Tenant Advisory Alert Container */}
          <div className="mt-5 p-3 rounded-2xl text-[10px] font-black uppercase text-center bg-blue-50 text-blue-700 border border-blue-100 leading-relaxed">
            💡 Logistics Tip: Combined active cultivation matrices across your regional cluster reach substantial metrics this week. Coordinate cargo consolidations to lower transit transport freight expenses.
          </div>
        </div>
      </div>
    );
  }

  if (cropsView === 'plots_config') {
    return (
      <div className="space-y-4 animate-fadeIn text-left font-sans">
        <button 
          onClick={() => setCropsView('menu')} 
          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-black tracking-wide uppercase"
        >
          ← Back to Crops Menu
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Active Farm Plots</h3>
              <p className="text-[10px] text-slate-400 font-medium">Topological layout partitions registered under Shop ID: {shopId}</p>
            </div>
            <span className="text-xl">🗺️</span>
          </div>

          {/* List of current active plots on the farm */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {activePlotsList && activePlotsList.length > 0 ? (
              activePlotsList.map((plot: any) => (
                <div key={plot.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">{plot.plot_name}</h5>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                      Zone: {plot.farm_section || 'Main Field'} • Soil: {plot.soil_type || 'Red Volcanic'}
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-lg">
                    {plot.allocated_acreage || plot.acreage} Ac
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center py-6 bg-slate-50/30">
                <span className="text-lg block mb-1">🏜️</span>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">No Plots Defined Yet</p>
                <p className="text-[9px] text-slate-400 font-medium px-4 mt-0.5">Click the trigger below to configure your first layout block.</p>
              </div>
            )}
          </div>

          {/* Trigger to open your secondary Plot Configuration data entry form modal */}
          <button 
            onClick={() => {
              // Direct boolean state trigger to mount your PlotConfigModal layout visibility rules
              setIsPlotModalOpen(true); 
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wide rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            ➕ Register New Plot Layout
          </button>
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
