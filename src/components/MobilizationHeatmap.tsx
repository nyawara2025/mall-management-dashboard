import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, TrendingUp, Users, Loader2 } from 'lucide-react';

// REMOVE the static import that was causing the error:
// import kenyaConstituencies from '../data/kenya_constituencies.json'; 

interface MobilizationHeatmapProps {
  data?: any[];
}

export const MobilizationHeatmap: React.FC<MobilizationHeatmapProps> = ({ data }) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  const nairobiCenter: [number, number] = [-1.335, 36.745];

  // Load the GeoJSON from the public folder
  useEffect(() => {
    fetch('/data/kenya_constituencies.json')
      .then(res => res.json())
      .then(json => {
        // Filter for Langata & Kibra exactly as before
        const filtered = {
          ...json,
          features: json.features.filter((f: any) => 
            ['Langata', 'Kibra'].includes(f.properties.constituency_name)
          )
        };
        setGeoJsonData(filtered);
        setIsLoadingMap(false);
      })
      .catch(err => {
        console.error("Error loading GeoJSON:", err);
        setIsLoadingMap(false);
      });
  }, []);

  const defaultPoints = [
    { id: 'otiende', name: 'St. Barnabas Otiende', lat: -1.332, lng: 36.764, intensity: 0.9, color: '#1e293b' },
    { id: 'langata', name: 'Langata Kiosks', lat: -1.341, lng: 36.755, intensity: 0.7, color: '#f97316' },
    { id: 'karen', name: 'Karen KUFUGA', lat: -1.350, lng: 36.710, intensity: 0.5, color: '#3b82f6' },
  ];

  const points = data || defaultPoints;

  if (isLoadingMap) return (
    <div className="flex items-center justify-center p-12 bg-slate-50 rounded-[2.5rem]">
      <Loader2 className="animate-spin text-blue-600 mr-2" />
      <span className="font-black text-xs uppercase tracking-widest text-gray-400">Loading Map Infra...</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ... (Existing Header UI) ... */}

      <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-[2.5rem] border-2 border-white shadow-xl overflow-hidden z-0">
        <MapContainer center={nairobiCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render the fetched and filtered GeoJSON */}
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={{
                fillColor: "#3b82f6",
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.1
              }} 
            />
          )}

          {points.map((p) => (
            <React.Fragment key={p.id}>
              <Circle 
                center={[p.lat, p.lng]} 
                radius={300 + (p.intensity * 500)} 
                pathOptions={{ fillColor: p.color, fillOpacity: 0.2, color: 'transparent' }} 
              />
              <Marker position={[p.lat, p.lng]}>
                <Popup>
                  <div className="text-center font-black uppercase text-[10px]">
                    {p.name}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
      
      {/* ... (Existing Legend Stats) ... */}
    </div>
  );
};

export default MobilizationHeatmap;
