import React from 'react';
import { Hammer, Info } from 'lucide-react';

interface Donor {
  name: string;
  amount: number;
  message?: string;
}

interface ChurchBrickBuilderProps {
  estimatedCost: number;
  fundsAvailable: number;
  donorLogs: Donor[];
  isStaff: boolean;
}

const ChurchBrickBuilder: React.FC<ChurchBrickBuilderProps> = ({
  estimatedCost,
  fundsAvailable,
  donorLogs,
  isStaff
}) => {
  const brickPrice = 1000;
  const totalBricks = Math.floor(estimatedCost / brickPrice);
  const filledBricks = Math.floor(fundsAvailable / brickPrice);
  
  // We represent the wall using 100 visual "blocks" to maintain grid symmetry
  // regardless of whether the project needs 1,000 or 10,000 actual bricks.
  const visualGridSize = 100;
  const progressPercent = (fundsAvailable / estimatedCost) * 100;
  const filledVisualBlocks = Math.floor((progressPercent / 100) * visualGridSize);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 my-4 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Hammer size={14} className="text-orange-600 animate-bounce" /> 
            Building Progress
          </h5>
          <p className="text-2xl font-black text-slate-900">
            {Math.round(progressPercent)}% <span className="text-sm font-medium text-slate-400">Complete</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-orange-600 uppercase">Bricks Sowed</p>
          <p className="text-xl font-black text-slate-800">{filledBricks.toLocaleString()} / {totalBricks.toLocaleString()}</p>
        </div>
      </div>

      {/* The Brick Wall Grid */}
      <div className="grid grid-cols-10 gap-1.5 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
        {[...Array(visualGridSize)].map((_, i) => {
          const isFilled = i < filledVisualBlocks;
          
          // Map visual block to a donor for staff insights
          const donorIndex = donorLogs.length > 0 ? i % donorLogs.length : -1;
          const assignedDonor = donorIndex !== -1 ? donorLogs[donorIndex] : null;

          return (
            <div
              key={i}
              className={`
                relative group h-4 rounded-[2px] transition-all duration-700
                ${isFilled 
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-b-2 border-orange-800 shadow-sm' 
                  : 'bg-slate-100 border-b-2 border-slate-200'}
                ${isFilled && i === filledVisualBlocks - 1 ? 'animate-pulse' : ''}
              `}
            >
              {/* Tooltip logic */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-slate-900 text-white text-[9px] font-bold py-2 px-3 rounded-lg shadow-2xl whitespace-nowrap border border-white/10">
                  {isFilled ? (
                    isStaff && assignedDonor ? (
                      <div className="space-y-1">
                        <p className="text-orange-400">Donor: {assignedDonor.name}</p>
                        <p>Contributed: KES {assignedDonor.amount.toLocaleString()}</p>
                      </div>
                    ) : (
                      "Brick Secured by Faith"
                    )
                  ) : (
                    "Available for Sowing"
                  )}
                </div>
                {/* Tooltip Arrow */}
                <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 border-r border-b border-white/10"></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
        <Info size={12} />
        Each brick represents KES {brickPrice.toLocaleString()} towards the sanctuary.
      </div>
    </div>
  );
};

export default ChurchBrickBuilder;
