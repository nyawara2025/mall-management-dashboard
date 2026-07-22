import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, User, Heart, CheckCircle, FileText, XCircle, Loader2, ListCollapse, MessageSquare } from 'lucide-react';

interface SacramentApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | number;
  user: any; 
}

export const SacramentApprovalsModal: React.FC<SacramentApprovalsModalProps> = ({ isOpen, onClose, shopId, user }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [reviewingApp, setReviewingApp] = useState<any | null>(null);

  // 🔴 NEW: States for fetching and displaying the comprehensive multi-tenant list
  const [showGlobalReview, setShowGlobalReview] = useState(false);
  const [allApplicationsList, setAllApplicationsList] = useState<any[]>([]);
  const [loadingGlobalList, setLoadingGlobalList] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  // Production-safe feature flag configurations
  const [viewMode, setViewMode] = useState<'cards' | 'summary'>('cards');

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

  useEffect(() => {
    if (isOpen && shopId) {
      fetchApplications();
    }
  }, [isOpen, shopId]); 

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
          member_id: currentApp.member_id, 
          actioned_by: user?.username || 'Admin Staff', 
          candidate_name: currentApp.candidate_name,
          sacrament: currentApp.sacrament,
          father_name: currentApp.father_name,
          mother_name: currentApp.mother_name,
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

  // 🔴 NEW: Dynamic multi-tenant aggregator webhook
  const fetchAllCurrentApplications = async () => {
    setLoadingGlobalList(true);
    setShowGlobalReview(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-infant-baptism-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId }) // Isolated strictly by tenant
      });
      const data = await response.json();
      setAllApplicationsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error aggregating comprehensive list:", err);
      alert("Failed to compile global review data ledger.");
    } finally {
      setLoadingGlobalList(false);
    }
  };

  // Evolution API Whatsapp Broadcast Dispatcher
  const handleWhatsappBroadcast = async () => {
    const inputDate = prompt("Enter the scheduled Baptism Date & Time (e.g. Sunday, 15th March at 9:00 AM):");
    if (!inputDate || !inputDate.trim()) return;

    const confirmSend = window.confirm(`Are you sure you want to broadcast this date to all ${applications.length} pending applicants via your Whatsapp Gateway?`);
    if (!confirmSend) return;

    setBroadcasting(true);
    try {
      // Direct integration matching your dynamic multi-tenant architectural design pattern
      const response = await fetch('https://n8n.tenear.com/webhook/baptism-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          baptism_date: inputDate.trim(),
          actioned_by: user?.username || 'Admin Staff',
          // Maps subset payload array directly to prevent unnecessary backend payloads
          recipients: applications.map(app => ({
            application_id: app.id,
            candidate_name: app.candidate_name,
            phone: app.phone_number || app.member_phone || ''
          }))
        })
      });

      if (response.ok) {
        alert("WhatsApp intake broadcast successfully added to processing queue!");
      } else {
        alert("Gateway rejected broadcast payload. Please verify n8n configurations.");
      }
    } catch (error) {
      console.error("Broadcast failed:", error);
      alert("Network transmission error across Gateway.");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Width expanded gracefully to accommodate high-density summary data layout patterns */}
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left transition-all duration-300 relative">
        
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Award size={22} /> Baptism Approvals
            </h3>
            <p className="text-xs text-blue-100 uppercase font-medium mt-0.5">Pending Church Intake Verification</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Action Toggles for Multi-Layout Mode */}

            <button 
              onClick={fetchAllCurrentApplications}
              disabled={loading}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
            >
              {loadingGlobalList ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  Loading...
                </>
              ) : (
                <>
                  <FileText size={14} />
                  Review All Applications
                </>
              )}
            </button>
            
            <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Applications List Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Requests...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-bold uppercase tracking-wider">No pending applications found.</p>
            </div>
          ) : viewMode === 'summary' ? (
            
            /* GLOBAL HIGH-DENSITY INTREGITY SUMMARY LIST VIEW */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Intake Critical Mass Metrics</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Currently tracking <strong className="text-sm font-black text-amber-900">{applications.length}</strong> pending candidates awaiting ritual assignments.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${applications.length >= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-200 text-amber-800'}`}>
                    {applications.length >= 5 ? 'Critical Mass Reached' : 'Accumulating Volume'}
                  </span>
                  
                  {/* Evolution WhatsApp Trigger Mechanism */}
                  <button
                    onClick={handleWhatsappBroadcast}
                    disabled={broadcasting}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {broadcasting ? <Loader2 size={12} className="animate-spin"/> : <MessageSquare size={12}/>} Broadcast WhatsApp
                  </button>
                </div>
              </div>

              {/* Data Grid Layout */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="p-4">Candidate File</th>
                        <th className="p-4">Parent Records</th>
                        <th className="p-4">Contact Phone</th>
                        {/* 🔴 NEW HEADER COLUMN */}
                        <th className="p-4">Application Date</th>
                        <th className="p-4">Sacrament Status</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {allApplicationsList.map((row) => {
                      // 🔴 UNPACK THE N8N INTERNAL NESTED PROPERTIES LAYER
                      // Works flawlessly whether data is wrapped in .json or passed flat
                      const app = row?.json ? row.json : row;

                      // Schema property extractions with trailing whitespace sanitation
                      const firstName = app?.candidate_christian_name?.trim() || "";
                      const lastName = app?.candidate_surname?.trim() || "";
                      const fullCandidateName = `${firstName} ${lastName}`.trim() || "N/A";
                      
                      const contactPhone = app?.applicant_phone_number || app?.phone_number || "N/A";
                      
                      // Extracting DOB directly from your verified table keys
                      const dateOfBirth = app?.date_of_birth || "N/A";

                      // Clean human-readable timestamp formatting for the intake log date column
                      const applicationDate = app?.created_at 
                        ? new Date(app.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "N/A";

                      return (
                        <tr key={app.id || Math.random()} className="hover:bg-slate-50/50 transition-colors">
                          {/* Candidate File Column */}
                          <td className="p-4">
                            <p className="font-bold text-slate-900 uppercase tracking-wide">{fullCandidateName}</p>
                            <p className="text-[10px] text-gray-400 uppercase mt-0.5">DOB: {dateOfBirth}</p>
                          </td>

                          {/* Parent Contexts Column */}
                          <td className="p-4 text-slate-500">
                            <div><span className="font-bold text-slate-400">F:</span> {app.father_name || 'N/A'}</div>
                            <div><span className="font-bold text-slate-400">M:</span> {app.mother_name || 'N/A'}</div>
                          </td>

                          {/* Contact Phone Column */}
                          <td className="p-4 font-mono text-slate-600">{contactPhone}</td>

                          {/* Application Date Column */}
                          <td className="p-4">
                            <p className="text-slate-900 font-semibold">{applicationDate}</p>
                            <p className="text-[9px] text-slate-400 uppercase mt-0.5">Intake Record Date</p>
                          </td>

                          {/* Sacrament Status Badging Column */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              app.status === 'Approved' ? 'bg-green-50 text-green-700' :
                              app.status === 'Declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {app.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            </div>

          ) : (
            
            /* ORIGINAL INDIVIDUAL DETAIL CARD VIEW */
            applications.map((currentApp) => {
              const dynamicChurchName = currentApp?.church_name || "CANDIDATE RECORD";
              const candidateFullName = currentApp?.candidate_name || "N/A";
              const dob = currentApp?.dob || "N/A";
              const residentialAddress = currentApp?.residential_address || "N/A";
  
              const poBox = currentApp?.po_box || "N/A";
              const officeTel = currentApp?.office_tel || "N/A";
              const houseTel = currentApp?.house_tel || "N/A";
              const attendsRegularly = currentApp?.attends_regularly || "N/A";

              const fatherName = currentApp?.father_name || "N/A";
              const motherName = currentApp?.mother_name || "N/A";

              const sponsor1 = currentApp?.sponsor_name_1 || "N/A";
              const isAnglican1 = currentApp?.sponsor_is_anglican_1 || "N/A";
              const sponsor2 = currentApp?.sponsor_name_2 || "N/A";
              const isAnglican2 = currentApp?.sponsor_is_anglican_2 || "N/A";

              return (
                <div key={currentApp.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6 items-start">
                  
                  {/* Detailed Information Grid */}
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-2">
                        {currentApp?.sacrament || 'BAPTISM'}
                      </span>
                      <h4 className="text-base font-black text-gray-800 uppercase tracking-wide border-b pb-1">
                        {dynamicChurchName}
                      </h4>
                    </div>

                    {/* Grid Columns layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Candidate Column */}
                      <div className="space-y-1 text-sm font-medium text-gray-700 bg-gray-50 p-3.5 rounded-xl">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">1. Candidate Info</p>
                        <div><span className="text-xs font-bold text-gray-400 uppercase">Full Name:</span> {candidateFullName}</div>
                        <div><span className="text-xs font-bold text-gray-400 uppercase">DOB:</span> {dob}</div>
                        <div><span className="text-xs font-bold text-gray-400 uppercase">Residence:</span> {residentialAddress}</div>
                        
                        <div className="pt-1 text-xs text-gray-400 border-t border-gray-200/60 mt-1 flex flex-wrap gap-2">
                          <span>Box: {poBox}</span>
                          <span>Off: {officeTel}</span>
                          <span>House: {houseTel}</span>
                        </div>
                        
                        <div className="text-[10px] font-black mt-1 uppercase flex items-center gap-1.5 text-gray-500">
                          Regular Attendee: <span className={attendsRegularly === 'YES' ? 'text-green-600' : 'text-red-500'}>{attendsRegularly}</span>
                        </div>
                      </div>

                      {/* Family/Sponsors Column */}
                      <div className="space-y-3.5">
                        {/* Parents nested */}
                        <div className="space-y-1 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">2. Parents Info</p>
                          <div><span className="text-xs font-bold text-gray-400 uppercase">Father:</span> {fatherName}</div>
                          <div><span className="text-xs font-bold text-gray-400 uppercase">Mother:</span> {motherName}</div>
                        </div>

                        {/* Sponsors nested */}
                        <div className="space-y-1 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">3. Witnesses / Sponsors</p>
                          <div className="border-b border-dashed border-gray-200 pb-1 mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase">S1:</span> {sponsor1} 
                            <span className="text-[10px] ml-1.5 font-extrabold uppercase text-gray-500">(Anglican: {isAnglican1})</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase">S2:</span> {sponsor2} 
                            <span className="text-[10px] ml-1.5 font-extrabold uppercase text-gray-500">(Anglican: {isAnglican2})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col gap-2 w-full md:w-auto md:self-stretch justify-end md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <button
                      onClick={() => handleUpdateStatus(currentApp.id, 'Approved')}
                      disabled={actioningId !== null}
                      className="flex-1 md:flex-initial bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all"
                    >
                      {actioningId === currentApp.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(currentApp.id, 'Declined')}
                      disabled={actioningId !== null}
                      className="flex-1 md:flex-initial bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all"
                    >
                      {actioningId === currentApp.id ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />} Decline
                    </button>
                    
                    {/* NEW! THIRD BUTTON: REVIEW RECORD */}
                    <button onClick={() => setReviewingApp(currentApp)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all border border-slate-200" >
                      <FileText size={14} /> Review Record
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* READ-ONLY REVIEW MODAL SCREEN OVERLAY */}
        {reviewingApp && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-200 text-slate-800">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500 rounded text-white">
                  {reviewingApp?.sacrament || 'BAPTISM'} FILE
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight mt-1">
                  {reviewingApp?.candidate_name || 'Review Intake Record'}
                </h3>
              </div>
              <button onClick={() => setReviewingApp(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-slate-50 text-xs">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">1. Master Candidate Record</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-b pb-3 border-dashed">
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">Full Name</span> <p className="font-semibold text-slate-800 text-sm mt-0.5">{reviewingApp?.candidate_name || "N/A"}</p></div>
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">Date of Birth</span> <p className="font-semibold text-slate-800 text-sm mt-0.5">{reviewingApp?.dob || "N/A"}</p></div>
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">Residence</span> <p className="font-semibold text-slate-800 text-sm mt-0.5">{reviewingApp?.residential_address || "N/A"}</p></div>
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">P.O. Box</span> <p className="font-semibold text-slate-800 text-sm mt-0.5">{reviewingApp?.po_box || "N/A"}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 text-slate-700">
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">Office Tel</span> {reviewingApp?.office_tel || "N/A"}</div>
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">House Tel</span> {reviewingApp?.house_tel || "N/A"}</div>
                    <div><span className="font-bold text-slate-400 uppercase block text-[10px]">Regularity Flag</span> <span className="font-bold text-blue-600 uppercase">{reviewingApp?.attends_regularly || "N/A"}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">2. Biological Parents Info</p>
                  <div><span className="font-bold text-slate-400 uppercase block text-[10px]">Father's Full Name</span> <p className="font-semibold text-slate-800 mt-0.5">{reviewingApp?.father_name || "N/A"}</p></div>  
                  <div className="pt-2"><span className="font-bold text-slate-400 uppercase block text-[10px]">Mother's Full Name</span> <p className="font-semibold text-slate-800 mt-0.5">{reviewingApp?.mother_name || "N/A"}</p></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">3. Witnesses & Godparents</p>
                  <div>
                    <span className="font-bold text-slate-400 uppercase block text-[10px]">Sponsor 1</span> 
                    <p className="font-semibold text-slate-800 mt-0.5">{reviewingApp?.sponsor_name_1 || "N/A"}</p>
                    <span className="text-[10px] text-gray-400 uppercase">Anglican: {reviewingApp?.sponsor_is_anglican_1 || "N/A"}</span>
                  </div>  
                  <div className="pt-2">
                    <span className="font-bold text-slate-400 uppercase block text-[10px]">Sponsor 2</span> 
                    <p className="font-semibold text-slate-800 mt-0.5">{reviewingApp?.sponsor_name_2 || "N/A"}</p>
                    <span className="text-[10px] text-gray-400 uppercase">Anglican: {reviewingApp?.sponsor_is_anglican_2 || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔴 NEW: UNFILTERED COMPREHENSIVE OVERLAY VIEW */}
        {showGlobalReview && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-200 text-slate-800">
            {/* Overlay Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500 rounded text-white">
                  Global Intake Audit Log
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight mt-1">
                  Active Comprehensive Registry ({allApplicationsList.length})
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {/* Evolution API Gateway Dispatcher Trigger */}
                <button
                  onClick={handleWhatsappBroadcast}
                  disabled={broadcasting || allApplicationsList.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  {broadcasting ? <Loader2 size={14} className="animate-spin"/> : <MessageSquare size={14}/>} Broadcast WhatsApp
                </button>
                <button onClick={() => setShowGlobalReview(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                  <X size={20}/>
                </button>
              </div>
            </div>

            {/* Scrollable Data Workspace */}
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
              {loadingGlobalList ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <p className="text-xs font-bold uppercase tracking-wider">Compiling Tenant Registry...</p>
                </div>
              ) : allApplicationsList.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-bold uppercase tracking-wider">No active registry items returned for this shop.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="p-4">Candidate File</th>
                        <th className="p-4">Parent Records</th>
                        <th className="p-4">Contact Phone</th>
                        <th className="p-4">Sacrament Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {allApplicationsList.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-900 uppercase tracking-wide">{app.candidate_name || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400 uppercase mt-0.5">DOB: {app.dob || 'N/A'}</p>
                          </td>
                          <td className="p-4 text-slate-500">
                            <div><span className="font-bold text-slate-400">F:</span> {app.father_name || 'N/A'}</div>
                            <div><span className="font-bold text-slate-400">M:</span> {app.mother_name || 'N/A'}</div>
                          </td>
                          <td className="p-4 font-mono text-slate-600">{app.phone_number || app.member_phone || 'N/A'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              app.status === 'Approved' ? 'bg-green-50 text-green-700' :
                              app.status === 'Declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {app.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
