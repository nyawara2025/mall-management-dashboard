import React, { useState } from 'react';

interface PlotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  farmName: string;
  userSession: { name: string; role: string } | null;
  onPlotSaved?: () => void; // Callback hook to refresh selectors downstream
}

export const PlotConfigModal: React.FC<PlotConfigModalProps> = ({
  isOpen,
  onClose,
  shopId,
  farmName,
  userSession,
  onPlotSaved
}) => {
  const [plotName, setPlotName] = useState('');
  const [farmSection, setFarmSection] = useState('North Block');
  const [soilType, setSoilType] = useState('Red Volcanic');
  const [plotSize, setPlotSize] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSavePlotDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim() || !plotSize || parseFloat(plotSize) <= 0) {
      alert("Please fill in accurate field dimension profile metrics.");
      return;
    }

    setLoading(true);

    const payload = {
      action: 'save_farm_plot_definition',
      shop_id: parseInt(shopId),
      farm_name: farmName,
      plot_name: plotName.trim(),
      farm_section: farmSection,
      soil_type: soilType,
      allocated_acreage: parseFloat(plotSize),
      created_by: userSession?.name || 'Manager',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`Successfully defined and logged layout for plot: ${plotName}!`);
        setPlotName('');
        setPlotSize('');
        if (onPlotSaved) onPlotSaved();
        onClose();
      } else {
        alert("Server failed to log topological farm profile mapping.");
      }
    } catch (err) {
      console.error("Plots tracking configuration fault:", err);
      alert("Network exception communicating data to server.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center z-50 p-4 font-sans animate-fadeIn">
      <div className="w-full bg-white rounded-3xl p-5 shadow-xl max-w-md border border-slate-100 flex flex-col space-y-4 animate-slideUp">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-blue-900 tracking-wide uppercase">Define Farm Plot Layout</h3>
          <button onClick={onClose} className="text-slate-400 font-bold hover:text-slate-600 text-xs uppercase">Cancel</button>
        </div>

        <form onSubmit={handleSavePlotDefinition} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Unique Plot Name</label>
            <input 
              type="text" 
              placeholder="e.g., Plot A Phase 1, Low Terrace"
              value={plotName} 
              onChange={e => setPlotName(e.target.value)}
              required 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Farm Zone Section</label>
              <select 
                value={farmSection} 
                onChange={(e) => setFarmSection(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none"
              >
                <option value="North Block">North Block</option>
                <option value="South Terrace">South Terrace</option>
                <option value="East Side Flats">East Side Flats</option>
                <option value="West Hilltop">West Hilltop</option>
                <option value="Greenhouse Zone">Greenhouse Zone</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Soil Profile Type</label>
              <select 
                value={soilType} 
                onChange={(e) => setSoilType(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 focus:outline-none"
              >
                <option value="Red Volcanic">Red Volcanic</option>
                <option value="Black Cotton">Black Cotton</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Heavy">Clay Heavy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Plot Area Dimension (Acres)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Enter size in Acres" 
              value={plotSize} 
              onChange={e => setPlotSize(e.target.value)}
              required 
              className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 font-bold focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase py-3.5 rounded-xl transition-all shadow-xs"
          >
            {loading ? "Registering Coordinates..." : "💾 Save New Plot Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};
