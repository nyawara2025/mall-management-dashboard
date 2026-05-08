import React from 'react';
import { MapPin, TrendingUp, Users } from 'lucide-react';

interface HeatPoint {
  id: string;
  name: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  intensity: number; // 0.1 to 1.0
  color: string;
}

interface MobilizationHeatmapProps {
  data?: HeatPoint[];
}

export const MobilizationHeatmap: React.FC<MobilizationHeatmapProps> = ({ data }) => {
  // Default project coordinates centered around Nairobi/Karen/Langata logic
  const defaultPoints: HeatPoint[] = [
    { id: 'otiende', name: 'St. Barnabas Otiende', x: 50, y: 50, intensity: 0.9, color: '#1e293b' },
    { id: 'langata', name: 'Langata Kiosks', x: 45, y: 65, intensity: 0.7, color: '#f97316' },
    { id: 'karen', name: 'Karen KUFUGA', x: 30, y: 40, intensity: 0.5, color: '#3b82f6' },
  ];

  const points = data || defaultPoints;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h4 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Live Mobilization Map</h4>
          <p className="text-sm font-black text-gray-800">Community Engagement Reach</p>
        </div>
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          <TrendingUp size={12} />
          <span className="text-[10px] font-black uppercase">Live</span>
        </div>
      </div>

      {/* The Heatmap Canvas */}
      <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-[2.5rem] border-2 border-white shadow-inner overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            {points.map((p) => (
              <radialGradient id={`grad-${p.id}`} key={p.id}>
                <stop offset="0%" stopColor={p.color} stopOpacity={p.intensity} />
                <stop offset="100%" stopColor={p.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Heat Bubbles */}
          {points.map((p) => (
            <g key={p.id} className="animate-pulse" style={{ animationDuration: `${3 / p.intensity}s` }}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={10 + (p.intensity * 15)} 
                fill={`url(#grad-${p.id})`} 
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="1" 
                fill={p.color} 
                className="opacity-50"
              />
            </g>
          ))}
        </svg>

        {/* Labels Overlay */}
        {points.map((p) => (
          <div 
            key={`label-${p.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-help"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className="hidden group-hover:block absolute bottom-full mb-2 whitespace-nowrap bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-xl z-10 uppercase tracking-tighter">
              {p.name}: {Math.round(p.intensity * 100)}% Reach
            </div>
            <MapPin size={16} style={{ color: p.color }} className="drop-shadow-sm" />
          </div>
        ))}
      </div>

      {/* Legend / Metrics Quick Look */}
      <div className="grid grid-cols-3 gap-2">
        {points.map((p) => (
          <div key={`stat-${p.id}`} className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
            <p className="text-[8px] font-black text-gray-400 uppercase truncate">{p.name.split(' ')[0]}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black" style={{ color: p.color }}>{Math.round(p.intensity * 100)}%</span>
              <Users size={10} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobilizationHeatmap;
