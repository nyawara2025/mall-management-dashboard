import React, { useEffect, useRef } from 'react';
import { X, Navigation } from 'lucide-react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
  driverName: string;
  latitude: number;
  longitude: number;
}

export const TransportMapModal = ({ isOpen, onClose, routeName, driverName, latitude, longitude }: MapModalProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Dynamically inject Leaflet context natively into the DOM frame
    const initLeafletMap = async () => {
      // 💡 Safety check: Guard against unrendered DOM container node pointers
      if (!mapContainerRef.current) return;

      // @ts-ignore
      const L = await import('leaflet');

      // Initialize map canvas centered precisely on the incoming GPS fix
      if (!mapInstanceRef.current) {
        // 💡 Use an explicit type assertion (as HTMLElement) to completely satisfy TS compiler builds
        mapInstanceRef.current = L.map(mapContainerRef.current as HTMLElement, {
          zoomControl: true,
          attributionControl: false
        }).setView([latitude, longitude], 14);

        // OpenStreetMap high-definition tile Layer implementation configuration
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(mapInstanceRef.current);
      } else {
        // Smoothly pan map container frame if coordinates bubble up via streaming updates
        mapInstanceRef.current.setView([latitude, longitude], 14);
      }

      // Re-initialize or shift the bus pin marker position layout
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([latitude, longitude]);
      } else {
        markerInstanceRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current)
          .bindPopup(`<b>${routeName} Fleet</b><br>Driver: ${driverName}`)
          .openPopup();
      }
    };



    initLeafletMap();

    // Clean up instances cleanly to defend against memory leaks during modal closures
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [isOpen, latitude, longitude, routeName, driverName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col h-[550px] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header Panel Context */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-left">
          <div>
            <span className="text-[9px] font-black bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit mb-1">
              <Navigation size={10} className="animate-pulse" /> Live Telemetry
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{routeName} Route Stream</h3>
            <p className="text-xs text-slate-500 font-medium">Monitoring Operator: <span className="font-bold text-slate-700">{driverName}</span></p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 transition-colors shadow-sm">
            <X size={18} />
          </button>
        </div>

        {/* Leaflet Map Frame Canvas Wrapper Container */}
        <div ref={mapContainerRef} className="flex-1 w-full bg-slate-100 z-10" style={{ minHeight: '350px' }} />

        {/* Modal Footer Statistics Indicator Strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 font-mono px-6">
          <span>LAT: {latitude.toFixed(5)}</span>
          <span>LNG: {longitude.toFixed(5)}</span>
          <span className="text-emerald-600 animate-pulse uppercase text-[10px] tracking-widest font-sans font-black">Active Stream Connection</span>
        </div>

      </div>
    </div>
  );
};
