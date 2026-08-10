import React, { useState } from 'react';
import { X, FileText, ChevronRight } from 'lucide-react';

// Definitions matching your d-portal.org payload context
export interface Opportunity {
  id: string;
  client_company_name: string;
  origin_city: string;
  destination_city: string;
  cargo_type: string;     // Uses your database schema naming
  offered_rate: number;   // Uses your database schema naming
  opening_date?: string;  // Kept optional for d-portal.org data compatibility
  closing_date?: string;  // Kept optional for d-portal.org data compatibility
  supporting_documents?: Array<{ title: string; url: string }>;
}

interface BidSubmissionForm {
  bidAmount: string;
  proposalText: string;
  estimatedDays: string;
  attachments: File[];
}

interface ContractDetailsModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSubmitBid: (opportunityId: string, formData: BidSubmissionForm) => Promise<void>;
}

export const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onSubmitBid,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<BidSubmissionForm>({
    bidAmount: '',
    proposalText: '',
    estimatedDays: '',
    attachments: [],
  });

  if (!isOpen || !opportunity) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)],
      }));
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitBid(opportunity.id, formData);
      onClose(); // Auto close on successful upload
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
          <div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Project Ref: #{opportunity.id}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              {opportunity.client_company_name}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Form wrapped to handle submit clean) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            
            {/* Core Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block uppercase font-medium">Estimated Value</span>
                <span className="text-lg font-bold text-emerald-600">
                  KES {Number(opportunity.offered_rate).toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block uppercase font-medium">Route Blueprint</span>
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-1">
                  {opportunity.origin_city || 'Nairobi ICD'} <ChevronRight className="w-3 h-3 text-gray-400" /> {opportunity.destination_city || 'Dynamic Route'}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 block uppercase font-medium">Closing Date</span>
                <span className="text-sm font-semibold text-red-600 mt-1 block">
                  {opportunity.closing_date ? new Date(opportunity.closing_date).toLocaleDateString() : 'Urgent Opportunity'}
                </span>
              </div>
            </div>

            {/* Detailed Scope */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Load Specifications & Framework
              </h3>
              <p className="text-sm text-gray-600 bg-blue-50/40 p-4 rounded-lg border border-blue-100/50 leading-relaxed whitespace-pre-line">
                {opportunity.cargo_type}
              </p>
            </div>

            {/* Supporting Sourcing Docs */}
            {opportunity.supporting_documents && opportunity.supporting_documents.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Linked Tender Documents</h3>
                <div className="space-y-2">
                  {opportunity.supporting_documents.map((doc, idx) => (
                    <a 
                      key={idx} 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-sm text-blue-600 font-medium"
                    >
                      <span className="flex items-center gap-2 truncate">📂 {doc.title}</span>
                      <span className="text-xs text-gray-400 font-normal">View Document ↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Proposal Forms */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Compile Your Logistics Proposal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Your Quote (KES) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 95000"
                    value={formData.bidAmount}
                    onChange={(e) => setFormData({...formData, bidAmount: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 objective-none outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Execution Timeline (Days) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 5"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({...formData, estimatedDays: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 objective-none outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fleet Allocation / Operational Strategy *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Detail your transport capacity, vehicle configurations, and safety readiness parameters..."
                  value={formData.proposalText}
                  onChange={(e) => setFormData({...formData, proposalText: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 objective-none outline-none"
                />
              </div>

              {/* Upload Dossier Drag Drop */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Upload Compliance Dossier / Insurance / Logbooks</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <p className="text-xs text-gray-500 font-medium">Drag and drop or click to upload credentials</p>
                  <p className="text-[10px] text-gray-400 mt-1">PDF, PNG, JPG up to 10MB each</p>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {formData.attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded text-xs border border-gray-200">
                        <span className="truncate text-gray-600 font-medium">📎 {file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeAttachment(i)}
                          className="text-red-500 hover:text-red-700 font-bold ml-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all"
            >
              {isSubmitting ? 'Routing via Middleware...' : 'Confirm & File Official Bid'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
