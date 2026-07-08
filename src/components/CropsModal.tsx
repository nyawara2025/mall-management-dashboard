import React, { useState } from 'react';

interface CropsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  farmName: string;
  userSession: { name: string; role: string } | null;
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

export const CropsModal: React.FC<CropsModalProps> = ({
  isOpen,
  onClose,
  shopId,
  farmName,
  userSession,
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
  const [loading, setLoading] = useState(false);

  // Handle cascading dropdown selectors precisely as requested by your framework setup
  const handleCropClassChange = (value: 'Vegetables' | 'Fruits' | 'Tubers' | 'Grains') => {
    setCropClass(value);
    if (value === 'Vegetables') setCropVariety('Spinach');
    else if (value === 'Fruits') setCropVariety('Avocado');
    else if (value === 'Tubers') setCropVariety('Potatoes');
    else if (value === 'Grains') setCropVariety('Beans');
  };

  const handleSaveCropCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acreage || parseFloat(acreage) <= 0) {
      alert("Please enter a valid positive acreage calculation profile.");
      return;
    }
    
    setLoading(true);

    const payload = {
      action: 'save_crop_cycle',
      shop_id: parseInt(shopId),
      farm_name: farmName,
      phone_number: localStorage.getItem('remembered_phone_number'),
      crop_class: cropClass,
      crop_variety: cropVariety,
      acreage: parseFloat(acreage),
      start_date: cropStartDate,
      expected_harvest_date: harvestDate,
      logged_by_role: userSession?.role || 'farm_hand',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`Successfully logged cultivation records for ${acreage} Acres of ${cropVariety}!`);
        setAcreage('');
        onClose();
      } else {
        alert("Server transmission error processing agronomy dataset metrics.");
      }
    } catch (err) {
      console.error("Crops logging transmission breakdown:", err);
      alert("Network exception communicating data to farm backend.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-blue-900 tracking-wide uppercase">Configure Crop Allocation</h3>
          <button onClick={onClose} className="text-slate-400 font-bold hover:text-slate-600 text-xs uppercase">Cancel</button>
        </div>

        <form onSubmit={handleSaveCropCycle} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Crop Class</label>
            <select 
              value={cropClass} 
              onChange={(e) => handleCropClassChange(e.target.value as any)} 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="Vegetables">🥬 Vegetables (Greens / Tomatoes)</option>
              <option value="Fruits">🥑 Fruits (Orchard Trees)</option>
              <option value="Tubers">🥔 Tubers (Root Crops)</option>
              <option value="Tubers">🥔 Grains (Grain Crops)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Select Crop Variety</label>
            <select 
              value={cropVariety} 
              onChange={(e) => setCropVariety(e.target.value)} 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
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
                  <option value="Avocado">Avocado (Hass)</option>
                  <option value="Mango">Mango (Ngowe)</option>
                  <option value="Other Fruits">Other Orchard</option>
                </>
              )}
              {cropClass === 'Tubers' && (
                <>
                  <option value="Potatoes">Irish Potatoes (Shangi)</option>
                  <option value="Carrots">Carrots (Nantes)</option>
                  <option value="Mhogo">Cassava / Mhogo</option>
                  <option value="Other Tubers">Other Root Crop</option>
                </>
              )}
              {cropClass === 'Grains' && (
                <>
                  <option value="Beans">Yellow Beans (Yellow)</option>
                  <option value="Green Grams">Green Grams (Dengu)</option>
                  <option value="Groundnuts">Groundnuts / Njugu</option>
                  <option value="Other Grains">Other Grains</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Acreage Volume</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Enter acreage coverage size" 
              value={acreage} 
              onChange={e => setAcreage(e.target.value)}
              required 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Planting Date</label>
              <input 
                type="date" 
                value={cropStartDate} 
                onChange={e => setCropStartDate(e.target.value)}
                required 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Est. Harvest Date</label>
              <input 
                type="date" 
                value={harvestDate} 
                readOnly
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 font-bold focus:outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl text-sm tracking-wide transition-all shadow-md uppercase"
          >
            {loading ? 'Processing Parameters...' : 'SAVE PLOT BATCH'}
          </button>
        </form>
      </div>
    </div>
  );
};
