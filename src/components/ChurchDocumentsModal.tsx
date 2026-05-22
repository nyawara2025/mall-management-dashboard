import React from 'react';
import { X, FileText, ScrollText, Calendar, Landmark } from 'lucide-react';

interface ChurchDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChurchDocumentsModal: React.FC<ChurchDocumentsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const docs = [
    { title: 'Wedding Booking Form', desc: 'Schedule counseling and marriage liturgy', icon: HeartIcon },
    { title: 'Church Hall Booking', desc: 'Hire main hall or meeting rooms for events', icon: Landmark },
    { title: 'Funeral Service Planning', desc: 'Coordinate mass schedules and family support', icon: ScrollText },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <FileText size={20} /> Church Services & Forms
            </h3>
            <p className="text-xs text-slate-300 uppercase font-medium mt-0.5">Parish Desk Document Directory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* List Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          {docs.map((doc, idx) => (
            <div 
              key={idx}
              onClick={() => alert(`Digital intake pipeline for "${doc.title}" coming soon to St. Barnabas parish desk.`)}
              className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-50/40 hover:border-blue-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white border border-gray-100 text-slate-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <doc.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{doc.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{doc.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">Open</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

// Quick structural spacer icon mapping
const HeartIcon = () => (
  <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
