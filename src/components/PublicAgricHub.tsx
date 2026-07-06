import React, { useState, useEffect } from 'react';

interface FarmOption {
  id: string;
  name: string;
}

export const PublicAgricHub: React.FC = () => {
  // Try to load an already remembered farm context from previous sessions
  const [shopId, setShopId] = useState<string | null>(() => localStorage.getItem('remembered_shop_id'));
  const [farmName, setFarmName] = useState<string>(() => localStorage.getItem('remembered_farm_name') || '');
  
  const [farmsList, setFarmsList] = useState<FarmOption[]>([]);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  
  // Auth Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [category, setCategory] = useState('farm_hand');
  const [loading, setLoading] = useState(false);

  // Fetch active agri-tenants from n8n on component mount if no farm is remembered
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
          // Check if the response returned is a valid array directly
          if (Array.isArray(data) && data.length > 0) {
            setFarmsList(data); // Stores the farm array directly
  
            // Read from the first returned index row securely (e.g., Nyawara Ranch)
            setShopId(data[0].id.toString());
            setFarmName(data[0].name);
          } else if (data.success && data.farms) {
            // Fallback catch block in case your webhook wraps it later
            setFarmsList(data.farms);
            if (data.farms.length > 0) {
              setShopId(data.farms[0].id.toString());
              setFarmName(data.farms[0].name);
            }
          }


        } catch (err) {
          console.error("Failed to load farms from n8n gateway", err);
        }
      }
      fetchActiveFarms();
    }
  }, [shopId]);

  // Handle explicit selector changes in the dropdown menu
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
    if (!shopId) return alert("Please select a farm environment first.");
    setLoading(true);

    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`;

    const payload = type === 'register'
      ? { 
          action: 'register',
          shop_id: parseInt(shopId), 
          phone_number: phone, 
          password, 
          full_name: combinedFullName, // Ensure this points to combinedFullName
          user_category: category 
        }
      : { 
          action: 'login',
          shop_id: parseInt(shopId), 
          phone_number: phone, 
          password 
        };

    try {
      const response = await fetch(`https://n8n.tenear.com/webhook/sign-farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        // SUCCESS: Lock this selection into local device memory forever
        localStorage.setItem('remembered_shop_id', shopId);
        localStorage.setItem('remembered_farm_name', farmName);
        
        setView('dashboard');
      } else {
        alert(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error("Authentication error", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to allow users to switch farms or clear memory manually
  const clearRememberedFarm = () => {
    localStorage.removeItem('remembered_shop_id');
    localStorage.removeItem('remembered_farm_name');
    setShopId(null);
    setFarmName('');
    setView('login');
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 text-slate-800 font-sans max-w-md mx-auto">
      
      {/* Dynamic Header Badge showing the active context target */}
      <div className="bg-emerald-950 p-4 rounded-2xl text-white mb-6 flex justify-between items-center shadow-xs">
        <div>
          <h3 className="text-[10px] uppercase tracking-wider opacity-60">System Target</h3>
          <h2 className="text-lg font-bold">{farmName || 'Selecting Farm...'}</h2>
        </div>
        {localStorage.getItem('remembered_shop_id') && view !== 'dashboard' && (
          <button onClick={clearRememberedFarm} className="text-[10px] bg-emerald-800 hover:bg-emerald-700 px-2 py-1 rounded-lg transition-all">
            Change Farm
          </button>
        )}
      </div>

      {/* REGISTRATION VIEW WITH THE DROP-DOWN MENU */}
      {view === 'register' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xl font-bold text-emerald-800 mb-4">Worker Registration</h2>
          <form onSubmit={(e) => handleAuth(e, 'register')} className="space-y-4">
            
            {/* The Dynamic Dropdown: Renders choice if fresh device, drops back cleanly if remembered */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Select Farm Location</label>
              <select 
                value={shopId || ''} 
                onChange={handleFarmDropdownChange}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white font-medium"
              >
                {farmsList.map(farm => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 👥 Grid for Split First Name & Last Name inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">First Name</label>
                <input 
                  type="text" 
                  placeholder="Eric" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Nyawara" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Phone Number</label>
              <input type="tel" placeholder="0712345678" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Job Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white">
                <option value="farm_hand">Farm Hand</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
                <option value="vet">Veterinary Officer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Create Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-medium text-sm">
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
          </form>
          <p className="text-xs text-center text-slate-500 mt-4">Already registered? <button onClick={() => setView('login')} className="text-emerald-600 font-semibold underline">Login Instead</button></p>
        </div>
      )}

      {/* LOGIN VIEW (Defaults to the locked farm on subsequent logins) */}
      {view === 'login' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Sign In</h2>
          <p className="text-xs text-slate-400 mb-6">Enter security credentials to access dashboards.</p>
          
          <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Phone Number</label>
              <input type="tel" placeholder="0712345678" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-slate-200 rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-xl font-medium text-sm">Sign In</button>
          </form>
          <p className="text-xs text-center text-slate-500 mt-6">New on this farm? <button onClick={() => setView('register')} className="text-emerald-600 font-semibold underline">Register Profile</button></p>
        </div>
      )}

    </div>
  );
};
