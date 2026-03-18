import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Globe } from 'lucide-react';
import { HeatmapLayer } from './HeatmapLayer'; 
import 'leaflet/dist/leaflet.css';
import { 
  Users, 
  Megaphone, 
  TrendingUp, 
  MessageSquare, 
  MapPin, 
  Heart,
  BarChart3,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 
import { CampaignLinkGenerator } from './CampaignLinkGenerator';

interface PoliticalDashboardProps {
  onViewChange: (view: string) => void;
}

export function PoliticalDashboard({ onViewChange }: PoliticalDashboardProps) {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Voter Reach', value: '45.2k', icon: Users, color: 'text-blue-600', trend: '+12%' },
    { label: 'Endorsements', value: '12,840', icon: Heart, color: 'text-red-600', trend: '+5.4%' },
    { label: 'Active Ads', value: '24', icon: Megaphone, color: 'text-purple-600', trend: 'Steady' },
    { label: 'Engagement', value: '18.5%', icon: MessageSquare, color: 'text-green-600', trend: '+2.1%' },
  ];

  const quickActions = [
    { id: 'manifestos', title: 'Manage Manifestos', icon: Megaphone, desc: 'Update policy points' },
    { id: 'analytics', title: 'Voter Insights', icon: BarChart3, desc: 'Demographic breakdown' },
    { id: 'visitor-engagement', title: 'Town Hall Chats', icon: MessageSquare, desc: 'Respond to voters' },
    { id: 'qr-generation', title: 'Rally QR Codes', icon: Share2, desc: 'Check-in at events' },
    { 
      id: 'diaspora-hub', 
      title: 'Diaspora Connect', 
      icon: Globe, // Import Globe from lucide-react
      desc: 'Fundraising & US Town Halls' 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Command Centre</h2>
          <p className="text-gray-500">Real-time mobilization and voter sentiment tracking.</p>
        </div>
        <button 
          onClick={() => onViewChange('campaigns')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Launch New Ad
        </button>
      </div>

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onViewChange(action.id)}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-left group"
              >
                <action.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <CampaignLinkGenerator shopId={user?.shop_id?.toString() ?? ""} />
      </div>

      {/* 4. Geographical Reach - INTEGRATED MAP COMPONENT */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" /> Constituency Hotspots
        </h3>
        <div className="rounded-lg overflow-hidden border border-gray-200">
           <ConstituencyHotspots shopId={user?.shop_id?.toString() ?? ""} />
        </div>
      </div>
    </div>
  );
}

/**
 * Map Component wpescript fixes
 */
export const ConstituencyHotspots = ({ shopId }: { shopId: string }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [heatPoints] = useState<[number, number, number][]>([
    [-1.286, 36.817, 0.8], 
    [-1.292, 36.821, 0.5]
  ]);

  useEffect(() => {
    setIsLoading(true);
    fetch('/data/kenya_constituencies.json')
      .then(res => {
        if (!res.ok) throw new Error("Failed to load map data");
        return res.json();
      })
      .then(data => {
        // Basic GeoJSON validation
        if (data && data.type === "FeatureCollection") {
          setGeoData(data);
        } else {
          console.error("Invalid GeoJSON format received");
        }
      })
      .catch(err => console.error("Map Error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const constituencyStyle = {
    fillColor: "transparent",
    weight: 1,
    opacity: 1,
    color: "#666",
    fillOpacity: 0
  };

  const onEachConstituency = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.shapeName) {
      layer.bindPopup(`<strong>Constituency:</strong> ${feature.properties.shapeName}`);
    
      // Optional: Add a tooltip so the name appears on hover without clicking
      layer.bindTooltip(feature.properties.shapeName, {
        permanent: false, 
        direction: "center",
        className: "constituency-tooltip"
      });
    }
  };

  if (isLoading) return <div className="h-[500px] flex items-center justify-center bg-gray-50">Loading Map...</div>;

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer 
        center={[0.0236, 37.9062]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Only render GeoJSON if it exists and has features */}
        {geoData && geoData.features && (
          <GeoJSON 
            data={geoData} 
            style={constituencyStyle} 
            onEachFeature={onEachConstituency} 
          />
        )}

        <HeatmapLayer points={heatPoints} />
      </MapContainer>
    </div>
  );
};
   
