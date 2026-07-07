import React, { useState, useEffect } from 'react';

interface FarmOption {
  id: number;
  name: string;
}

export const PublicAgricHub: React.FC = () => {
  // 💾 State Management Layer
  const [shopId, setShopId] = useState<string | null>(() => localStorage.getItem('remembered_shop_id'));
  const [farmName, setFarmName] = useState<string>(() => localStorage.getItem('remembered_farm_name') || '');
  const [farmsList, setFarmsList] = useState<FarmOption[]>([]);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>(() => {
    return localStorage.getItem('remembered_session_name') ? 'dashboard' : 'login';
  });

  // Auth & Session Trackers
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [category, setCategory] = useState('farm_hand');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'poultry' | 'crops' | 'livestock'>('poultry');
  const [poultryView, setPoultryView] = useState<'menu' | 'production' | 'feed' | 'implements' | 'vaccination' | 'purchases' | 'sales'>('menu');
  const [userSession, setUserSession] = useState<{ name: string; role: string } | null>(() => {
    const cachedName = localStorage.getItem('remembered_session_name');
    const cachedRole = localStorage.getItem('remembered_session_role');
    return cachedName && cachedRole ? { name: cachedName, role: cachedRole } : null;
  });

  // 📋 Production Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState('Broiler');
  const [chickCount, setChickCount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [productionDays, setProductionDays] = useState(42); // Default Broiler timeframe
  const [maturityDate, setMaturityDate] = useState('');

  // 🔄 Automated Date Calculators matching the reference image layout specifications
  useEffect(() => {
    if (startDate && productionDays) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + Number(productionDays));
      setMaturityDate(start.toISOString().split('T')[0]);
    }
  }, [startDate, productionDays]);

  // Adjust standard production targets instantly when product dropdown value toggles
  const handleProductChange = (type: string) => {
    setModalProduct(type);
    if (type === 'Broiler') setProductionDays(42);
    else if (type === 'Layers') setProductionDays(140); // Standard point of lay timeframe
    else if (type === 'Kenbro') setProductionDays(84);
    else if (type === 'Geese') setProductionDays(180);
    else if (type === 'Turkey') setProductionDays(150);
  };


  // 🌽 Crops Production Modal States
  const [isCropsModalOpen, setIsCropsModalOpen] = useState(false);
  const [cropClass, setCropClass] = useState<'Vegetables' | 'Fruits' | 'Tubers'>('Vegetables');
  const [cropVariety, setCropVariety] = useState('Spinach');
  const [acreage, setAcreage] = useState('');
  const [cropStartDate, setCropStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestDate, setHarvestDate] = useState('');

  // 🔄 Automated Crop Harvest Timeline Predictor 
  useEffect(() => {
    if (cropStartDate) {
      const start = new Date(cropStartDate);
      let growingDays = 90; // Default fallback duration layout
      
      // Auto-compute average duration timelines matching standard local varieties
      if (cropVariety === 'Spinach' || cropVariety === 'Sukuma Wiki') growingDays = 60;
      else if (cropVariety === 'Tomato') growingDays = 90;
      else if (cropVariety === 'Avocado' || cropVariety === 'Mango') growingDays = 365 * 3; // Long-term orchard trees
      else if (cropVariety === 'Potatoes') growingDays = 105;
      else if (cropVariety === 'Carrots') growingDays = 90;
      else if (cropVariety === 'Mhogo') growingDays = 270;

      start.setDate(start.getDate() + growingDays);
      setHarvestDate(start.toISOString().split('T')[0]);
    }
  }, [cropStartDate, cropVariety]);

  // Handle cascading dropdown state values cleanly
  const handleCropClassChange = (value: 'Vegetables' | 'Fruits' | 'Tubers') => {
    setCropClass(value);
    if (value === 'Vegetables') setCropVariety('Spinach');
    else if (value === 'Fruits') setCropVariety('Avocado');
    else if (value === 'Tubers') setCropVariety('Potatoes');
  };

  // 🐄 Livestock Production Modal States
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [animalClass, setAnimalClass] = useState<'Cattle' | 'Goats' | 'Sheep'>('Cattle');
  const [breedVariety, setBreedVariety] = useState('Friesian');
  const [headCount, setHeadCount] = useState('');
  const [healthStatus, setHealthStatus] = useState('Healthy');

  // Handle cascading dropdown states cleanly for common local breeds
  const handleAnimalClassChange = (value: 'Cattle' | 'Goats' | 'Sheep') => {
    setAnimalClass(value);
    if (value === 'Cattle') setBreedVariety('Friesian');
    else if (value === 'Goats') setBreedVariety('Boer');
    else if (value === 'Sheep') setBreedVariety('Dorper');
  };

  // Fetch active agri-tenants on initialization
  useEffect(() => {
    if (!shopId) {
      async function fetchActiveFarms() {
        try {
          const response = await fetch('https://n8n.tenear.com/webhook/fetch-farms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business_category: 'agricultural' })
          });
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setFarmsList(data);
            setShopId(data[0].id.toString());
            setFarmName(data[0].name);
          }
        } catch (err) {
          console.error("Failed loading farms context", err);
        }
      }
      fetchActiveFarms();
    }
  }, [shopId]);

  const handleFarmDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const match = farmsList.find(f => f.id.toString() === selectedId);
    if (match) {
      setShopId(selectedId);
      setFarmName(match.name);
    }
  };

  const handleAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    if (!shopId) return alert("Select farm workspace.");
    setLoading(true);
    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`;
    const payload = type === 'register'
      ? { action: 'register', shop_id: parseInt(shopId), phone_number: phone, password, full_name: combinedFullName, user_category: category }
      : { action: 'login', shop_id: parseInt(shopId), phone_number: phone, password };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/sign-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        localStorage.setItem('remembered_shop_id', shopId);
        localStorage.setItem('remembered_farm_name', farmName);
        localStorage.setItem('remembered_session_name', data.user.full_name);
        localStorage.setItem('remembered_session_role', data.user.user_category);
        localStorage.setItem('remembered_phone_number', phone);
        setUserSession({ name: data.user.full_name, role: data.user.user_category });
        setView('dashboard');
      } else {
        alert(data.message || "Auth match error.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💾 Commit New Cycle Records to n8n Gateway Backend
  const handleSaveCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/save-poultry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_poultry_cycle',
          shop_id: parseInt(shopId || '81'),
          phone_number: localStorage.getItem('remembered_phone_number') || '0700000000',
          bird_type: modalProduct,
          quantity: parseInt(chickCount),
          start_date: startDate,
          maturity_date: maturityDate,
          production_days: productionDays
        })
      });

      if (response.ok) {
        alert(`Production entry sequence logged successfully for ${chickCount} ${modalProduct}s!`);
        setIsModalOpen(false);
        setChickCount('');
      } else {
        alert("Failed to commit cycle data metrics.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearRememberedFarm = () => {
    localStorage.clear();
    setShopId(null);
    setFarmName('');
    setUserSession(null);
    setView('login');
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 text-slate-800 font-sans max-w-md mx-auto flex flex-col justify-start relative">
      
      {view !== 'dashboard' && (
        <div className="bg-emerald-950 p-4 rounded-2xl text-white mb-6 flex justify-between items-center shadow-xs">
          <div>
            <h3 className="text-[10px] uppercase tracking-wider opacity-60">System Target</h3>
            <h2 className="text-md font-bold">{farmName || 'Loading Setup...'}</h2>
          </div>
        </div>
      )}

      {/* LOGIN & REGISTRATION SECTIONS REMAIN UNCHANGED FOR AUTHENTICATION PASSES */}
      {view === 'login' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs my-auto">
          <h2 className="text-xl font-black text-slate-900 mb-6">Sign In</h2>
          <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
              <input type="tel" placeholder="0716300197" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white p-3.5 rounded-xl font-bold text-sm">Access Dashboard</button>
          </form>
          <p className="text-xs text-center text-slate-500 mt-6">New user? <button onClick={() => setView('register')} className="text-emerald-600 font-bold underline">Register Account</button></p>
        </div>
      )}

      {view === 'register' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xl font-black text-emerald-800 mb-4">Worker Registration</h2>
          <form onSubmit={(e) => handleAuth(e, 'register')} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Select Farm Environment</label>
              <select value={shopId || ''} onChange={handleFarmDropdownChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white font-bold">
                {farmsList.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required className="p-3 border border-slate-200 rounded-xl text-sm" />
              <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required className="p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <input type="tel" placeholder="WhatsApp Phone Line" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">WhatsApp Mobile Line</label>
              <input 
                type="tel" 
                placeholder="0716300197" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                required 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Corporate Assignment Role</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-700"
              >
                <option value="farm_hand">Operational Farm Hand</option>
                <option value="manager">Farm Field Manager</option>
                <option value="owner">Strategic Farm Owner</option>
                <option value="vet">Veterinary Medical Officer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Create Access Password</label>
              <input 
                type="password" 
                placeholder="Min 6 alphanumeric characters" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xs"
            >
              {loading ? 'Committing Profile Space...' : 'Complete System Sign-On'}
            </button>
          </form>
          <p className="text-xs text-center text-slate-500 mt-4">
            Already registered? <button onClick={() => setView('login')} className="text-emerald-600 font-bold underline">Login Instead</button>
          </p>
        </div>
      )}

      {/* VIEW C: LIVE DATA METRICS DISPLAY CONSOLE */}
      {view === 'dashboard' && (
        <div className="w-full flex-grow animate-fadeIn">
          <div className="bg-emerald-800 text-white rounded-2xl p-4 mb-4 shadow-sm flex justify-between items-center">
            <div>
              <h1 className="text-md font-bold tracking-wide">{farmName || 'TeNEAR Agri-Control'}</h1>
              <p className="text-[11px] opacity-80">User: <span className="font-semibold">{userSession?.name}</span></p>
            </div>
            <button onClick={clearRememberedFarm} className="text-[10px] bg-emerald-950 font-bold px-2 py-1.5 rounded-lg">
              Log Out
            </button>
          </div>

          {/* Primary Operations Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {(['poultry', 'crops', 'livestock'] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => {
                  setActiveTab(tab);
                  setPoultryView('menu');
                }} 
                className={`py-2.5 px-1 rounded-xl font-bold text-xs capitalize transition-all border ${
                  activeTab === tab ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 📋 Role-Based Operations Panel Action Strips */}
          {userSession?.role === 'farm_hand' ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl mb-4 text-xs text-emerald-900 flex justify-between items-center shadow-xs">
              <span className="font-semibold">📋 Daily Tasks Assignment</span>
              <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">Active</span>
            </div>
          ) : ['owner', 'manager', 'vet'].includes(userSession?.role || '') ? (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl mb-4 text-xs text-blue-900 flex justify-between items-center shadow-xs">
              <span className="font-semibold">🚨 Open Farm Alerts</span>
              <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">All Clear</span>
            </div>
          ) : null}

          {/* 🐓 POULTRY MANAGEMENT HUB PANELS */}
          {activeTab === 'poultry' && poultryView === 'menu' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Menu Intro Header */}
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Poultry Operations</h3>
                <p className="text-[10px] text-slate-400">Select an operational sub-sector to manage your poultry records</p>
              </div>

              {/* Functional Dashboard Hub Options */}
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Poultry Production Menu Trigger */}
                <button
                  onClick={() => setPoultryView('production')}
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Poultry Production
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Manage production cycles & flock segments</p>
                  </div>
                  <span className="text-lg">🐣</span>
                </button>

                {/* 2. Feed Management Menu Trigger */}
                <button
                  onClick={() => setPoultryView('feed')}
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Feed Management
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Track feed stock, formulations & consumption</p>
                  </div>
                  <span className="text-lg">🌾</span>
                </button>

                {/* 3. Implements Menu Trigger */}
                <button
                  onClick={() => setPoultryView('implements')}
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Implements
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Inventory of feeders, drinkers, & farm equipment</p>
                  </div>
                  <span className="text-lg">🛠️</span>
                </button>

                {/* 4. Vaccination Menu Trigger */}
                <button
                  onClick={() => setPoultryView('vaccination')}
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Vaccination
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Schedule drug administration & health tracking</p>
                  </div>
                  <span className="text-lg">💉</span>
                </button>

                {/* 5. Purchases Menu Trigger */}
                <button
                  onClick={() => setPoultryView('purchases')}
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Purchases
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Record Purchases</p>
                  </div>
                  <span className="text-lg">💰</span>
                </button>

                {/* 6. Sales Menu Trigger */}
                <button
                  onClick={() => setPoultryView('sales')}
                  className="w-full bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center text-left hover:border-slate-300 transition-colors group"
                >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                      Sales
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Record egg distribution & meat batch sales</p>
                  </div>
                  <span className="text-lg">💰</span>
                </button>
              </div>
            </div>
          )}

          {/* 🐣 SUB-MENU VIEW: POULTRY PRODUCTION */}
          {activeTab === 'poultry' && poultryView === 'production' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Back to Top Level Menu Ribbon */}
              <button
                onClick={() => setPoultryView('menu')}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-black tracking-wide uppercase flex items-center gap-1 transition-all"
              >
                ← Back to Poultry Overview
              </button>

              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Poultry Production</h3>
                  <p className="text-[10px] text-slate-400">Log active farm cycles and flock segments</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] tracking-wide py-2 px-3.5 rounded-xl transition-all shadow-xs"
                >
                  + NEW CYCLE
                </button>
              </div>

              {/* Dynamic rendering loop matching your original card elements */}
              <div className="grid grid-cols-1 gap-3">
                {['Broilers', 'Layers', 'Kenbros', 'Geese', 'Turkeys'].map((cls) => (
                  <div key={cls} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        {cls === 'Layers' ? 'Layerss' : cls === 'Geese' ? 'Geeses' : cls}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">No Active Cycles</p>
                    </div>
                    <span className="text-lg">
                      {cls === 'Broilers' || cls === 'Layers' || cls === 'Kenbros' ? '🐤' : '🪶'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🌾 PLACEHOLDERS FOR NEW SUB-VIEWS (FEED, IMPLEMENTS, VACCINATION, PURCHASES, SALES) */}
          {activeTab === 'poultry' && poultryView !== 'menu' && poultryView !== 'production' && (
            <div className="space-y-4 animate-fadeIn">
              <button
                onClick={() => setPoultryView('menu')}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-black tracking-wide uppercase flex items-center gap-1"
              >
                ← Back to Poultry Overview
              </button>

              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs text-center">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-1">
                  {poultryView} Dashboard
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Database interface integrations for sub-module features coming soon.
                </p>
              </div>
            </div>
          )}

          {/* 🌽 CROPS PRODUCTION TRACKING PANELS */}
          {activeTab === 'crops' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Crop Cultivation</h3>
                  <p className="text-[10px] text-slate-400">Log new field allocations and variety plots</p>
                </div>
                <button 
                  onClick={() => setIsCropsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] tracking-wide py-2 px-3.5 rounded-xl transition-all shadow-xs"
                >
                  + NEW PLOT
                </button>
              </div>

              {/* Displaying Categories precisely as defined by your schema requirements */}
              <div className="grid grid-cols-1 gap-3">
                {['Vegetables', 'Fruits', 'Tubers'].map((cls) => (
                  <div key={cls} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{cls} Records</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">No active crop tracking timelines on file</p>
                    </div>
                    <span className="text-lg">{cls === 'Vegetables' ? '🥬' : cls === 'Fruits' ? '🥑' : '🥔'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🐄 LIVESTOCK INVENTORY TRACKING PANELS */}
          {activeTab === 'livestock' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Livestock Management</h3>
                  <p className="text-[10px] text-slate-400">Log herd counts, breeding groups, and health states</p>
                </div>
                <button 
                  onClick={() => setIsLiveModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] tracking-wide py-2 px-3.5 rounded-xl transition-all shadow-xs"
                >
                  + UPDATE STOCK
                </button>
              </div>

              {/* Displaying Livestock sectors */}
              <div className="grid grid-cols-1 gap-3">
                {['Cattle', 'Goats', 'Sheep'].map((cls) => (
                  <div key={cls} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{cls} Inventory</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">No logged tracking metrics on file</p>
                    </div>
                    <span className="text-lg">{cls === 'Cattle' ? '🐄' : cls === 'Goats' ? '🐐' : '🐑'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      )}

      {/* 📱 THE DYNAMIC INPUT MODAL GRID SYSTEM (Mirrors the reference layout specifications) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-blue-900 tracking-wide">Configure Production Cycle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 text-xs">Cancel</button>
            </div>

            <form onSubmit={handleSaveCycle} className="space-y-4 text-left">
              {/* 1. Product Field Option Select Input Container */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Product</label>
                <select 
                  value={modalProduct} 
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="Broiler">Broiler - Day Old Chicks</option>
                  <option value="Layers">Layers - Day Old Chicks</option>
                  <option value="Kenbro">Kenbro - Day Old Chicks</option>
                  <option value="Geese">Geese - Production Stock</option>
                  <option value="Turkey">Turkey - Production Stock</option>
                </select>
              </div>

              {/* 2. Volume Field Content Input Block Container */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Number of Chicks</label>
                <input 
                  type="number" 
                  placeholder="Enter total volume count" 
                  value={chickCount} 
                  onChange={e => setChickCount(e.target.value)}
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" 
                />
              </div>

              {/* 3. Operational Start Date Metric Log Parameter */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" 
                />
              </div>

              {/* 4. Automated Maturity Metric Field Elements Block Container */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Production Days</label>
                  <input 
                    type="number" 
                    value={productionDays} 
                    onChange={e => setProductionDays(parseInt(e.target.value) || 0)}
                    required 
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 font-bold focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Maturity Date</label>
                  <input 
                    type="date" 
                    value={maturityDate} 
                    readOnly
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 font-bold focus:outline-none" 
                  />
                </div>
              </div>

              {/* 5. Execution Action Command Submit Trigger Bar */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide transition-all shadow-md pt-3"
              >
                {loading ? 'Saving Parameters...' : 'SAVE CYCLE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📱 THE DYNAMIC CROPS INPUT MODAL GRID SYSTEM */}
      {isCropsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-blue-900 tracking-wide">Configure Crop Allocation</h3>
              <button onClick={() => setIsCropsModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 text-xs">Cancel</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const response = await fetch('https://n8n.tenear.com/webhook/update-crops', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'save_crop_cycle',
                    shop_id: parseInt(shopId || '81'),
                    phone_number: localStorage.getItem('remembered_phone_number'),
                    crop_class: cropClass,
                    crop_variety: cropVariety,
                    acreage: parseFloat(acreage),
                    start_date: cropStartDate,
                    expected_harvest_date: harvestDate
                  })
                });
                if (response.ok) {
                  alert(`Successfully logged ${acreage} Acres of ${cropVariety}!`);
                  setIsCropsModalOpen(false);
                  setAcreage('');
                }
              } catch(err) { console.error(err); }
              finally { setLoading(false); }
            }} className="space-y-4 text-left">
              
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Crop Class</label>
                <select value={cropClass} onChange={(e) => handleCropClassChange(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  <option value="Vegetables">🥬 Vegetables (Greens / Tomatoes)</option>
                  <option value="Fruits">🥑 Fruits (Orchard Trees)</option>
                  <option value="Tubers">🥔 Tubers (Root Crops)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Select Crop Variety</label>
                <select value={cropVariety} onChange={(e) => setCropVariety(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  {cropClass === 'Vegetables' && (
                    <>
                      <option value="Spinach">Spinach</option>
                      <option value="Sukuma Wiki">Sukuma Wiki (Kale)</option>
                      <option value="Kunde">Kunde</option>
                      <option value="Osuga">Osuga</option>
                      <option value="Terere">Terere</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Other Vegetables">Other Variety</option>
                    </>
                  )}
                  {cropClass === 'Fruits' && (
                    <>
                      <option value="Avocado">Avocado</option>
                      <option value="Orange">Orange</option>
                      <option value="Dragon Fruit">Dragon Fruit</option>
                      <option value="Apple">Apple</option>
                      <option value="Mango">Mango</option>
                      <option value="Luquarts">Loquats</option>
                      <option value="Other Fruits">Other Variety</option>
                    </>
                  )}
                  {cropClass === 'Tubers' && (
                    <>
                      <option value="Potatoes">Potatoes</option>
                      <option value="Carrots">Carrots</option>
                      <option value="Mhogo">Mhogo (Cassava)</option>
                      <option value="Yams">Yams</option>
                      <option value="Other Tubers">Other Variety</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Plot Size (Acreage)</label>
                <input type="number" step="0.01" placeholder="e.g., 1.50 Acres" value={acreage} onChange={e => setAcreage(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Planting Date</label>
                  <input type="date" value={cropStartDate} onChange={e => setCropStartDate(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Est. Harvest</label>
                  <input type="date" value={harvestDate} readOnly className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 font-bold focus:outline-none" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide transition-all shadow-md">
                {loading ? 'Saving Data...' : 'SAVE PLOT RECORDS'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📱 THE DYNAMIC LIVESTOCK INPUT MODAL */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4">
          <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-blue-900 tracking-wide">Log Livestock Updates</h3>
              <button onClick={() => setIsLiveModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 text-xs">Cancel</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const response = await fetch('https://n8n.tenear.com/webhook/update-livestock', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'save_livestock_inventory',
                    shop_id: parseInt(shopId || '81'),
                    phone_number: localStorage.getItem('remembered_phone_number'),
                    animal_class: animalClass,
                    breed_variety: breedVariety,
                    head_count: parseInt(headCount),
                    health_status: healthStatus
                  })
                });
                if (response.ok) {
                  alert(`Successfully updated inventory for ${headCount} ${breedVariety} Head!`);
                  setIsLiveModalOpen(false);
                  setHeadCount('');
                }
              } catch(err) { console.error(err); }
              finally { setLoading(false); }
            }} className="space-y-4 text-left">
              
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Animal Class</label>
                <select value={animalClass} onChange={(e) => handleAnimalClassChange(e.target.value as any)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  <option value="Cattle">🐄 Cattle (Dairy / Beef)</option>
                  <option value="Goats">🐐 Goats (Dairy / Meat)</option>
                  <option value="Sheep">🐑 Sheep (Wool / Mutton)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Breed / Variety</label>
                <select value={breedVariety} onChange={(e) => setBreedVariety(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  {animalClass === 'Cattle' && (
                    <>
                      <option value="Friesian">Friesian</option>
                      <option value="Ayrshire">Ayrshire</option>
                      <option value="Guernsey">Guernsey</option>
                      <option value="Jersey">Jersey</option>
                      <option value="Boran">Boran</option>
                      <option value="Sahiwal">Sahiwal</option>
                      <option value="Other Cattle">Other Breed</option>
                    </>
                  )}
                  {animalClass === 'Goats' && (
                    <>
                      <option value="Boer">Boer</option>
                      <option value="Toggenburg">Toggenburg</option>
                      <option value="Saanen">Saanen</option>
                      <option value="Alpine">Alpine</option>
                      <option value="Galla">Galla</option>
                      <option value="Other Goats">Other Breed</option>
                    </>
                  )}
                  {animalClass === 'Sheep' && (
                    <>
                      <option value="Dorper">Dorper</option>
                      <option value="Red Maasai">Red Maasai</option>
                      <option value="Merino">Merino</option>
                      <option value="Corriedale">Corriedale</option>
                      <option value="Other Sheep">Other Breed</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Total Head Count</label>
                <input type="number" placeholder="Enter number of animals" value={headCount} onChange={e => setHeadCount(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Current Health Status</label>
                <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none">
                  <option value="Healthy">🟢 Healthy & Productive</option>
                  <option value="Treatment">🟡 Under Medical Treatment</option>
                  <option value="Quarantined">🔴 Quarantined / Isolated</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide transition-all shadow-md">
                {loading ? 'Saving Data...' : 'SAVE LIVESTOCK RECORDS'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
