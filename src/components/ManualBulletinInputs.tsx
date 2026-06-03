import React from 'react';

interface ManualInputsProps {
  manualCashTithes: number; setManualCashTithes: (v: number) => void;
  manualCashGiving: number; setManualCashGiving: (v: number) => void;
  manualCashOffertory: number; setManualCashOffertory: (v: number) => void;
  manualChqTithes: number; setManualChqTithes: (v: number) => void;
  manualChqGiving: number; setManualChqGiving: (v: number) => void;
  manualChqOffertory: number; setManualChqOffertory: (v: number) => void;
  manualPdqTithes: number; setManualPdqTithes: (v: number) => void;
  manualPdqGiving: number; setManualPdqGiving: (v: number) => void;
  manualPdqOffertory: number; setManualPdqOffertory: (v: number) => void;
}

export const ManualBulletinInputs: React.FC<ManualInputsProps> = (props) => {
  return (
    <div className="my-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
      <div className="grid grid-cols-4 gap-2 items-center text-[10px] font-black uppercase tracking-wider text-gray-400 pb-1 border-b border-gray-200">
        <div>Type</div>
        <div>Tithes</div>
        <div>T. Giving</div>
        <div>Offertory</div>
      </div>
      {/* Cash Input Fields Row */}
      <div className="grid grid-cols-4 gap-2 items-center">
        <div className="text-[11px] font-bold text-gray-700">Cash</div>
        <input type="number" placeholder="0" value={props.manualCashTithes || ''} onChange={e => props.setManualCashTithes(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-green-600" />
        <input type="number" placeholder="0" value={props.manualCashGiving || ''} onChange={e => props.setManualCashGiving(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-green-600" />
        <input type="number" placeholder="0" value={props.manualCashOffertory || ''} onChange={e => props.setManualCashOffertory(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-green-600" />
      </div>
      {/* Cheques Input Fields Row */}
      <div className="grid grid-cols-4 gap-2 items-center">
        <div className="text-[11px] font-bold text-gray-700">CHQ</div>
        <input type="number" placeholder="0" value={props.manualChqTithes || ''} onChange={e => props.setManualChqTithes(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-blue-600" />
        <input type="number" placeholder="0" value={props.manualChqGiving || ''} onChange={e => props.setManualChqGiving(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-blue-600" />
        <input type="number" placeholder="0" value={props.manualChqOffertory || ''} onChange={e => props.setManualChqOffertory(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-blue-600" />
      </div>
      {/* Card PDQ Inputs Row */}
      <div className="grid grid-cols-4 gap-2 items-center">
        <div className="text-[11px] font-bold text-gray-700">PDQ</div>
        <input type="number" placeholder="0" value={props.manualPdqTithes || ''} onChange={e => props.setManualPdqTithes(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-purple-600" />
        <input type="number" placeholder="0" value={props.manualPdqGiving || ''} onChange={e => props.setManualPdqGiving(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-purple-600" />
        <input type="number" placeholder="0" value={props.manualPdqOffertory || ''} onChange={e => props.setManualPdqOffertory(parseFloat(e.target.value) || 0)} className="p-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-right focus:outline-none focus:border-purple-600" />
      </div>
    </div>
  );
};
