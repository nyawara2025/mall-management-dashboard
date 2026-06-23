import React, { useState, useEffect, useRef } from 'react';
import { Bus, Play, Square, AlertTriangle, LogOut } from 'lucide-react';

interface DriverPortalProps {
  shopId: number;
  user: {
    id: string;
    name: string;
    assigned_route_id: string;
    email: string;
    educational_role: string;
  } | null;
  onLogout: () => void;
}

export const DriverPortal = ({ shopId, user, onLogout }: DriverPortalProps) => {
  const [isTransitActive, setIsTransitActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Safely extract names/IDs falling back to default placeholders
  const routeId = user?.assigned_route_id || '';
  const driverName = user?.name || 'Transit Operator';

  // 📡 High-accuracy hardware sensor telemetry broadcaster
  const transmitLiveCoordinates = () => {
    if (!navigator.geolocation) return;

    setSyncStatus('syncing');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const payload = {
          shop_id: shopId,
          route_id: routeId,
          latitude: position.coords.latitude,   // Clean numeric float
          longitude: position.coords.longitude // Clean numeric float
        };

        try {
          // Targets spelled out n8n webhook location updates gate natively
          const response = await fetch('https://n8n.tenear.com/webhook/transmit-current-GPS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            setCurrentCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
            setSyncStatus('idle');
          } else {
            setSyncStatus('error');
          }
        } catch (err) {
          setSyncStatus('error');
          console.error("Telemetry uplink failed:", err);
        }
      },
      (error) => {
        setSyncStatus('error');
        console.error("GPS hardware access exception:", error);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleToggleTransit = async () => {
    const nextState = !isTransitActive;
    
    try {
      // Notify n8n gateway to trigger parent WhatsApp alerts or update database status fields
      await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          route_id: routeId,
          alert_type: nextState ? 'route_start' : 'route_end',
          timestamp: new Date().toISOString()
        })
      });

      if (nextState) {
        setIsTransitActive(true);
        transmitLiveCoordinates();
        // Fire location stream loop updates every 20 seconds
        streamIntervalRef.current = setInterval(transmitLiveCoordinates, 20000);
      } else {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setIsTransitActive(false);
        setSyncStatus('idle');
      }
    } catch (e) {
      alert("Network exception updating route status gateway parameters.");
    }
  };

  // Defensive lifecycle cleanup to clear active timers if driver logs out
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen text-white p-6 flex flex-col justify-between font-sans text-left">
      
      {/* Upper Status Panel */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
              <Bus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Active Route</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TeNEAR Transit Mobile</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2.5 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        {/* Informational Status Card */}
        <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-3xl space-y-3">
          <p className="text-xs text-slate-400 font-bold">Active Operator: <span className="text-white font-black">{driverName}</span></p>
          <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800/40 text-xs">
            <span className="text-slate-400">Uplink Status:</span>
            {syncStatus === 'syncing' && <span className="text-amber-400 font-black animate-pulse uppercase tracking-wider text-[10px]">Streaming...</span>}
            {syncStatus === 'error' && <span className="text-red-400 font-black uppercase tracking-wider text-[10px]">Signal Error</span>}
            {syncStatus === 'idle' && (
              <span className={`font-black uppercase tracking-wider text-[10px] ${isTransitActive ? 'text-green-400 animate-pulse' : 'text-slate-500'}`}>
                {isTransitActive ? 'Live Sync Active' : 'Offline'}
              </span>
            )}
          </div>
        </div>

        {/* Coordinate Readout Block */}
        {currentCoords && isTransitActive && (
          <div className="bg-slate-800/30 border border-dashed border-slate-700 p-4 rounded-2xl font-mono text-[11px] text-slate-400 space-y-1">
            <p className="flex justify-between"><span>Latitude:</span> <span className="text-blue-400 font-bold">{currentCoords.lat.toFixed(6)}</span></p>
            <p className="flex justify-between"><span>Longitude:</span> <span className="text-blue-400 font-bold">{currentCoords.lng.toFixed(6)}</span></p>
          </div>
        )}
      </div>

      {/* Main Core Mobile Action Interface Buttons */}
      <div className="space-y-3 pb-8">
        <button
          type="button"
          onClick={handleToggleTransit}
          className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
            isTransitActive 
              ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20 text-white' 
              : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20 text-white'
          }`}
        >
          {isTransitActive ? (
            <><Square size={18} fill="white" /> Terminate Transit Route</>
          ) : (
            <><Play size={18} fill="white" /> Initialize Transit Route</>
          )}
        </button>

        {/* Emergency Warning Trigger Alert */}
        {isTransitActive && (
          <button 
            type="button"
            onClick={async () => {
              await fetch('https://tenear.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_id: shopId, route_id: routeId, alert_type: 'transit_delay' })
              });
              alert("Delay bulletin transmitted to parent feeds.");
            }}
            className="w-full py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-500 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <AlertTriangle size={16} /> Broadcast Delay Alert
          </button>
        )}
      </div>

    </div>
  );
};
