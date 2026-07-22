import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Truck, MapPin, FileText, Fuel, ShieldAlert, 
  DollarSign, UserCheck, Clock, Briefcase, ChevronRight, X
} from 'lucide-react';

interface DriverProfile {
  name: string;
  role: string;
  assignedTruck: string;
  routeZone: string;
  currentMissions: string[];
}

interface Opportunity {
  id: string;
  client: string;
  route: string;
  cargo: string;
  rate: string;
}

export const PublicLogisticsHub: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id') || '90';
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [intelOpen, setIntelOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulated local market cargo requests tailored to current hub vicinity coordinates
  const marketIntel: Opportunity[] = [
    { id: '1', client: 'Bamburi Cement Ltd', route: 'Mombasa → Nairobi', cargo: 'Bulk Cement (28 Tons)', rate: 'KES 145,000' },
    { id: '2', client: 'KTDA Tea Factory', route: 'Kericho → Mombasa Port', cargo: 'Export Tea Pallets', rate: 'KES 180,000' },
    { id: '3', client: 'Grain Bulk Handlers', route: 'Mombasa → Eldoret', cargo: 'Wheat Mill Cargo', rate: 'KES 165,000' }
  ];

  useEffect(() => {
    const loadContext = async () => {
      setProfile({
        name: "Eric Nyawara",
        role: "OPERATOR / DRIVER",
        assignedTruck: "KBC 123X / Trailer 04",
        routeZone: "Mombasa - Malaba Corridor",
        currentMissions: ["Mombasa Port Clearance", "Transit Fuel Voucher Verification"]
      });
      setLoading(false);
    };
    loadContext();
  }, [shopId]);

  const hubActions = [
    { id: 'trip_manifest', label: 'TRIP MANIFEST & NTSA LOG', icon: <FileText className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'fuel_allocation', label: 'FUEL VOUCHER & EXPENSES', icon: <Fuel className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'cargo_tracking', label: 'WAYBILL & CARGO STATUS', icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'weighbridge_clearance', label: 'WEIGHBRIDGE & PORT DOCS', icon: <UserCheck className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'payments_invoicing', label: 'M-PESA / FREIGHT PAYMENTS', icon: <DollarSign className="w-5 h-5" />, color: 'bg-blue-600' },
    { id: 'market_intel', label: 'MARKET OPPORTUNITIES', icon: <Briefcase className="w-5 h-5" />, color: 'bg-emerald-600' },
    { id: 'breakdown_alert', label: 'EMERGENCY & BREAKDOWN', icon: <ShieldAlert className="w-5 h-5" />, color: 'bg-red-600' }
  ];

  const handleActionClick = (id: string) => {
    if (id === 'market_intel') setIntelOpen(true);
    else console.log(`Triggering module ${id} for shop ${shopId}`);
  };

  if (loading) return <div className="p-20 text-center font-medium">Loading Fleet System Hub...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Identity Sidebar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm h-fit">
          <div className="flex flex-col items-center border-b border-slate-100 pb-4 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3 shadow-inner">
              EN
            </div>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-blue-100 uppercase">
              {profile?.role}
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-2">{profile?.name}</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-3">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Asset ID</span>
                <span className="text-xs font-semibold text-slate-700">{profile?.assignedTruck}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Corridor Zone</span>
                <span className="text-xs font-semibold text-slate-700">{profile?.routeZone}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Active Missions</span>
              {profile?.currentMissions.map((m, i) => (
                <span key={i} className="block text-[11px] bg-white border border-slate-100 text-slate-600 px-2 py-1 rounded-md mt-1 font-medium">
                  • {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scaled-down action matrix Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hubActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`transition-all duration-150 rounded-xl p-4 text-white flex items-center gap-4 text-left shadow-sm hover:brightness-95 group font-medium ${action.color} ${
                action.id === 'breakdown_alert' || action.id === 'market_intel' ? 'sm:col-span-2' : ''
              }`}
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:scale-105 transition-transform">
                {action.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Market Intel Slider Over Panel */}
      {intelOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Regional Market Intel</h3>
                <p className="text-xs text-slate-400">Available cargo manifests matching your fleet capacity</p>
              </div>
              <button onClick={() => setIntelOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {marketIntel.map((job) => (
                <div key={job.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-emerald-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-800">{job.client}</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{job.rate}</span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-slate-400" /> {job.route}</p>
                  <p className="text-[11px] text-slate-500 mt-1 pl-4">• Load Profile: {job.cargo}</p>
                  <button className="w-full mt-3 bg-emerald-600 text-white font-bold text-[10px] tracking-wider py-1.5 rounded-lg flex items-center justify-center gap-1 uppercase">
                    Bid for Load <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
