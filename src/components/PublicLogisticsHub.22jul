import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  FileText, 
  Fuel, 
  ShieldAlert, 
  DollarSign, 
  UserCheck, 
  MessageSquare,
  Clock
} from 'lucide-react';

interface DriverProfile {
  name: string;
  assignedTruck: string;
  routeZone: string;
  currentMissions: string[];
}

export const PublicLogisticsHub: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id') || '90';
  
  // State for loading driver/client contextual metadata from Supabase
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user context by shop_id and current metadata via Supabase / n8n middleware
    const fetchHubData = async () => {
      try {
        // Simulating data payload returned based on your metadata architecture
        setProfile({
          name: "Eric Nyawara",
          assignedTruck: "KBC 123X / Trailer 04",
          routeZone: "Mombasa - Malaba Corridor",
          currentMissions: ["Mombasa Port Clearance", "Transit Fuel Voucher Verification"]
        });
      } catch (error) {
        console.error("Error loading logistics context:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHubData();
  }, [shopId]);

  // High-utility action configurations mapping to your operational microservices
  const hubActions = [
    {
      id: 'trip_manifest',
      label: 'TRIP MANIFEST & NTSA LOG',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      id: 'fuel_allocation',
      label: 'FUEL VOUCHER & EXPENSES',
      icon: <Fuel className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      id: 'cargo_tracking',
      label: 'WAYBILL & CARGO STATUS',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      id: 'weighbridge_clearance',
      label: 'WEIGHBRIDGE & PORT DOCS',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
    {
      id: 'breakdown_alert',
      label: 'EMERGENCY & BREAKDOWN',
      icon: <ShieldAlert className="w-6 h-6" />,
      color: 'bg-red-600', // Visual anchor for critical safety alerts
    },
    {
      id: 'payments_invoicing',
      label: 'M-PESA / FREIGHT PAYMENTS',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-blue-600',
    },
  ];

  const handleActionClick = (actionId: string) => {
    // Deep link or trigger n8n sub-orchestration workflows passing along multi-tenant metadata
    console.log(`Executing ${actionId} for tenant shop_id: ${shopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Hand Column: User Profile Panel (Matches UI/UX Design System) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center h-fit">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : 'TR'}
            </div>
            <span className="absolute -top-2 -right-4 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              OPERATOR
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">{profile?.name}</h2>

          {/* Logistics Metadata Badges */}
          <div className="w-full space-y-4 text-left border-t border-gray-100 pt-6">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fleet / Asset ID</p>
                <p className="text-sm font-medium text-gray-800">{profile?.assignedTruck}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Assigned Corridor</p>
                <p className="text-sm font-medium text-gray-800">{profile?.routeZone}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Assignments</p>
                <div className="mt-1 space-y-1">
                  {profile?.currentMissions.map((mission, idx) => (
                    <span key={idx} className="block text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                      • {mission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand Column: Heavy Operations Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
          {hubActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 rounded-2xl p-6 text-white flex flex-col items-center justify-center min-h-[140px] text-center shadow-sm relative group overflow-hidden"
              style={{ backgroundColor: action.id === 'breakdown_alert' ? '#DC2626' : '#3B82F6' }}
            >
              {/* Layout Icon Accent */}
              <div className="mb-3 p-3 bg-white bg-opacity-20 rounded-xl group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </div>
              <span className="font-bold text-sm tracking-wide px-2 uppercase">
                {action.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
