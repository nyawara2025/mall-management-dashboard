import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, User, Heart, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface SacramentApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | number;
  user: any; // 🟢 ADD THIS LINE TO THE PROPS INTERFACE
}

export const SacramentApprovalsModal: React.FC<SacramentApprovalsModalProps> = ({ 
  isOpen, 
  onClose, 
  shopId,
  user
}) => {
 ;
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-sacrament-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, status: 'Pending' })
      });
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading sacraments:", err);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Now triggers specifically when the modal transitions to an open state
  useEffect(() => {
    if (isOpen && shopId) {
      fetchApplications();
    }
  }, [isOpen, shopId]); // <-- Added isOpen to dependencies

  // MOVED: Place the conditional layout gate right here before rendering the template view
  if (!isOpen) return null;

  const handleUpdateStatus = async (id: number, targetStatus: 'Approved' | 'Declined') => {
    let reasonText = null;

    if (targetStatus === 'Declined') {
      const inputReason = prompt("Reason for application rejection:");
      if (inputReason === null) return;
      if (!inputReason.trim()) {
        alert("A reason is required to reject an intake application.");
        return;
      }
      reasonText = inputReason.trim();
    }

    // Locates the clicked row from your local state array cleanly
    const currentApp = applications.find(item => item.id === id);
    if (!currentApp) {
      alert("Application data context lost. Please refresh the dashboard.");
      return;
    }

    setActioningId(id);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-update-sacrament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: id,
          status: targetStatus, 
          shop_id: shopId, 
          rejection_reason: reasonText,

          // 🟢 KEYS PERFECTLY MATCHING YOUR ATTACHED SCHEMA
          member_id: currentApp.member_id, // e.g., 104
          actioned_by: user?.username || 'Admin Staff', // Active approver name

          candidate_name: currentApp.candidate_name,
          sacrament: currentApp.sacrament,
          father_name: currentApp.father_name,
          mother_name: currentApp.mother_name,
        
          // Dynamic fallback fallback if phone number is joined inside your component state
          phone_number: currentApp.phone_number || currentApp.member_phone || '' 
      })

    });

    if (response.ok) {
      alert(`Application successfully ${targetStatus.toLowerCase()}!`);
      setApplications(prev => prev.filter(item => item.id !== id));
    } else {
      throw new Error("Server error");
    }
  } catch (err) {
    alert("Failed to update record state.");
  } finally {
    setActioningId(null);
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left">
        
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Award size={20} /> Sacrament Intake Registry
            </h3>
            <p className="text-xs text-slate-300 uppercase font-medium mt-0.5">Review Baptism and Confirmation Submissions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/40">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={36} className="animate-spin text-blue-600" />
              <p className="text-xs font-black uppercase tracking-widest animate-pulse">Streaming Applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-[2rem] bg-white text-gray-400 text-xs font-medium px-4">
              🎉 No pending sacrament applications requiring review.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((item) => (
                <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        item.sacrament === 'Baptism' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {item.sacrament} {item.sacrament === 'Baptism' ? '(Infant)' : ''}
                      </span>
                    </div>

                    <h4 className="font-black text-gray-900 text-sm flex items-center gap-1">
                      <User size={14} className="text-gray-400" /> Candidate: {item.candidate_name}
                    </h4>

                    <p className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                      <Calendar size={12} /> DoB: {item.date_of_birth}
                    </p>

                    {item.sacrament === 'Baptism' && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 font-medium">
                        <div><span className="text-gray-400 block text-[9px] uppercase font-black">Father</span> {item.father_name}</div>
                        <div><span className="text-gray-400 block text-[9px] uppercase font-black">Mother</span> {item.mother_name}</div>
                        <div><span className="text-gray-400 block text-[9px] uppercase font-black">Godparent</span> {item.godparent_name}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end border-t border-gray-50 pt-3">
                    <button
                      disabled={actioningId !== null}
                      onClick={() => handleUpdateStatus(item.id, 'Declined')}
                      className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40"
                    >
                      <XCircle size={18} />
                    </button>
                    <button
                      disabled={actioningId !== null}
                      onClick={() => handleUpdateStatus(item.id, 'Approved')}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <CheckCircle size={14} /> Endorse Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
