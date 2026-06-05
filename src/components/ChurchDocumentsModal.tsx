import React, { useState } from 'react';
import { X, FileText, ScrollText, Landmark, Loader2, ArrowLeft } from 'lucide-react';

// 🟢 MATCHED PATTERN: Explicitly matching the signature of your other modals
interface ChurchDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  shopId: string | number;
}

export const ChurchDocumentsModal: React.FC<ChurchDocumentsModalProps> = ({ isOpen, onClose, userData, shopId }) => {
  if (!isOpen) return null;

  const [activeHtmlReport, setActiveHtmlReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  const docs = [
    { title: 'Wedding Booking Form', desc: 'Schedule counseling and marriage liturgy', icon: HeartIcon },
    { title: 'Church Hall Booking', desc: 'Hire main hall or meeting rooms for events', icon: Landmark },
    { title: 'Funeral Service Planning', desc: 'Coordinate mass schedules and family support', icon: ScrollText },
    { title: 'The Past Week Tithes & Offertoty', desc: 'The Past Week Givings, Offertory & Tithes', icon: ScrollText }
  ];

  const handleViewTithesReport = async () => {
    setLoadingReport(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-member-access-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🟢 FIXED PAYLOAD: Explicitly uses your component props variable naming
        body: JSON.stringify({ 
          shop_id: shopId || userData?.shop_id || 68,
          action: 'fetch_weekly_report'
        })
      });
      
      const data = await response.json();
      
      if (data && data.html) {
        setActiveHtmlReport(data.html);
      } else if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
        setActiveHtmlReport(data);
      } else {
        alert("Report generated but failed to parse clean HTML document formatting.");
      }
    } catch (err) {
      console.error("Failed to stream collection ledger:", err);
      alert("System connection timeout. Could not synchronize church financial ledger records.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white w-full rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left transition-all duration-300 ${
        activeHtmlReport ? 'max-w-3xl' : 'max-w-md'
      }`}>
        
        {/* Header */}
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            {activeHtmlReport && (
              <button 
                onClick={() => setActiveHtmlReport(null)}
                className="p-1.5 hover:bg-slate-700 rounded-lg mr-1 transition-colors"
                title="Go Back to Directory"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <FileText size={20} /> {activeHtmlReport ? 'Weekly Collection Report' : 'Church Services & Forms'}
              </h3>
              <p className="text-xs text-slate-300 uppercase font-medium mt-0.5">
                {activeHtmlReport ? 'Verified Parish Financial Ledger' : 'Parish Desk Document Directory'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Modal Main View Render Panel */}
        <div className="p-6 overflow-y-auto flex-1">
          {loadingReport ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={36} className="animate-spin text-blue-600" />
              <p className="text-xs font-black uppercase tracking-widest animate-pulse">
                Compiling collection matrix data...
              </p>
            </div>
          ) : activeHtmlReport ? (
            <div className="bg-white p-2 rounded-xl animate-in fade-in duration-200 html-report-wrapper">
              <iframe 
                srcDoc={activeHtmlReport} 
                title="Church Financial Statement Ledger"
                className="w-full min-h-[50vh] max-h-[60vh] border-0 rounded-xl"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            /* Default List Grid View */
            <div className="space-y-3">
              {docs.map((doc, idx) => {
                const isTithesDoc = doc.title.includes('Tithes & Offertoty');
                
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (isTithesDoc) {
                        handleViewTithesReport();
                      } else {
                        alert(`Digital intake pipeline for "${doc.title}" coming soon to parish desk.`);
                      }
                    }}
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
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const HeartIcon = () => (
  <svg xmlns="http://w3.org" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
