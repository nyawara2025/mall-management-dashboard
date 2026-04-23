import React, { useState } from 'react';
import { 
  X, PieChart, Construction, FileText, Landmark, 
  HandCoins, Info, TrendingUp, Calendar, ArrowLeft 
} from 'lucide-react';
// 1. Import the Renderer we built earlier
import { ProjectsRenderer } from './ProjectsRenderer';

interface FinancialsAndProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: number;
}

export const FinancialsAndProjectsModal: React.FC<FinancialsAndProjectsModalProps> = ({ isOpen, onClose, shopId }) => {
  const [activeTab, setActiveTab] = useState<'financials' | 'projects'>('financials');
  
  // 2. State to track which specific project category we are viewing
  const [activeProjectView, setActiveProjectView] = useState<'planned' | 'fundraising' | 'current' | null>(null);

  if (!isOpen) return null;

  // Cleanup helper to close the modal and reset navigation
  const handleClose = () => {
    setActiveProjectView(null);
    onClose();
  };

  const FinancialsContent = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {[
        { title: 'Quarterly Reports', icon: <FileText size={20} />, desc: 'View official church financial statements' },
        { title: 'Offertory, Tithes & Givings', icon: <Landmark size={20} />, desc: 'Detailed breakdown of collections' },
        { title: 'Other', icon: <Info size={20} />, desc: 'Miscellaneous financial disclosures' },
      ].map((item, i) => (
        <button key={i} className="w-full flex items-center gap-4 p-5 bg-blue-50/50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all text-left group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );

  const ProjectsContent = () => {
    // 3. Logic: If a view is selected, show the Renderer. Otherwise show the buttons.
    if (activeProjectView) {
      return (
        <ProjectsRenderer 
          view={activeProjectView === 'fundraising' ? 'fundraising' : 'planned'} 
          onBack={() => setActiveProjectView(null)}
          shopId={shopId} 
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {[
          { id: 'current', title: 'Current Projects', icon: <Construction size={20} />, color: 'bg-green-50 text-green-600' },
          { id: 'planned', title: 'Planned Projects', icon: <Calendar size={20} />, color: 'bg-amber-50 text-amber-600' },
          { id: 'fundraising', title: 'Fund Raising', icon: <HandCoins size={20} />, color: 'bg-blue-50 text-blue-600' },
          { id: 'other', title: 'Other', icon: <Info size={20} />, color: 'bg-gray-50 text-gray-600' },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={() => setActiveProjectView(item.id as any)}
            className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all text-left group"
          >
            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <span className="font-bold text-gray-800">{item.title}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Church Insights</h2>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-70">
              {activeProjectView ? `View: ${activeProjectView.replace('_', ' ')}` : 'Financials & Development Portal'}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher - Only show if we aren't "deep" in a project view */}
        {!activeProjectView && (
          <div className="flex p-2 bg-gray-50 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('financials')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'financials' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              <PieChart size={16} /> Financials
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'projects' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
            >
              <Construction size={16} /> Projects
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto bg-white">
          {activeTab === 'financials' ? <FinancialsContent /> : <ProjectsContent />}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Transparency & Accountability • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};
