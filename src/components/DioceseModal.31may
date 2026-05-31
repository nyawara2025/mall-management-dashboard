import React, { useState } from 'react';
import { X, Award, ShieldAlert, Layers, HeartHandshake } from 'lucide-react';

interface DioceseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DioceseModal = ({ isOpen, onClose }: DioceseModalProps) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'programmes'>('pillars');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-[75vh] max-h-[75vh] overflow-hidden">
        
        {/* Modal Branding Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
              <Award className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none">ACK Diocese of Nairobi</h2>
              <p className="text-blue-200 text-[9px] font-black uppercase tracking-widest pt-1">Diocesan Central Knowledge Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex border-b px-6 bg-gray-50/50 gap-6 text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`py-4 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'pillars' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Layers size={14} /> Strategic Pillars
          </button>
          <button
            onClick={() => setActiveTab('programmes')}
            className={`py-4 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'programmes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <HeartHandshake size={14} /> Community Based Programmes
          </button>
        </div>

        {/* Interactive Tab Content Sheets Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {activeTab === 'pillars' ? (
            <div className="animate-in fade-in duration-100 space-y-4">
              <p className="text-xs text-gray-400 italic">Awaiting strategic pillar content items listing description...</p>
              {/* Strategic items loop will go here */}
            </div>
          ) : (
            <div className="animate-in fade-in duration-100 space-y-4">
              <p className="text-xs text-gray-400 italic">Awaiting community based program specifications data...</p>
              {/* Programmes items loop will go here */}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
