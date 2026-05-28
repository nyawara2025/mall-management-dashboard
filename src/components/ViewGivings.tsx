import React, { useEffect, useState } from 'react';
import { X, FileDown, FileText, Table as TableIcon, Loader2, MessageSquare, Hash } from 'lucide-react';

// --- SHARED INTERFACES ---
interface PaymentRecord {
  amount: number;
  payment_date: string;
  transaction_id: string;
  status: string;
}

interface MemberData {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role: string;
  org_id: number;
  payment_history: PaymentRecord[] | null;
}

interface Contribution {
  id: string;
  member_name: string;
  amount: number;
  type: string;
  date: string;
  phone_number: string;
}

interface ViewGivingsProps {
  isOpen: boolean;
  onClose: () => void;
  userData: MemberData | null;
}

// --- COMPONENT START ---
export const ViewGivings: React.FC<ViewGivingsProps> = ({ isOpen, onClose, userData }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState('All');

  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (isOpen && userData?.org_id) {
      fetchContributions();
    }
  }, [isOpen, userData, startDate, endDate, selectedType]);

  const fetchContributions = async () => {
    if (!userData?.org_id) return;
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-givings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          org_id: userData.org_id,
          start_date: startDate,
          end_date: endDate,
          contribution_type: selectedType
        }),
      });
      const data = await response.json();
      setContributions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendThankYou = async () => {
    if (!selectedContribution || !thankYouMessage.trim()) return;
  
    setSendingMessage(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-thankyou', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
        org_id: userData?.org_id,
        canon_name: `${userData?.first_name} ${userData?.last_name}`,
        member_phone: selectedContribution.phone_number,
        member_name: selectedContribution.member_name,
        amount: selectedContribution.amount,
        type: selectedContribution.type,
        message: thankYouMessage
      }),
    });

    if (response.ok) {
      alert("Message queued for WhatsApp and App Profile!");
      setSelectedContribution(null);
      setThankYouMessage("");
    }
  } catch (error) {
    alert("Failed to send message. Please check connection.");
  } finally {
    setSendingMessage(false);
  }
};

  // FIX: Force Number conversion to prevent string concatenation
  const totalAmount = contributions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const recordCount = contributions.length;

  const downloadCSV = () => {
    const headers = ['Member Name', 'Type', 'Amount', 'Date'];
    const rows = contributions.map(c => [
      c.member_name,
      c.type,
      c.amount,
      new Date(c.date).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Church_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    setExporting(true);
    try {
      const response = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          org_id: userData?.org_id,
          report_title: `Financial Report: ${selectedType}`,
          period: `${startDate} to ${endDate}`,
          data: contributions,
          total: totalAmount,
          generated_by: `${userData?.first_name} ${userData?.last_name}`
        }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Church_Financial_Report_${startDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Error generating PDF. Check n8n webhook.");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 🚀 FIXED: Dynamic max-h block leaves plenty of structural breathing room */}
      <div className="bg-white w-full max-w-6xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[92vh] max-h-[92vh] overflow-hidden">
        
        {/* Header (Condensed Padding) */}
        <div className="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
              <FileText size={18} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-blue-900 tracking-tight leading-tight">Canon's Oversight Panel</h2>
              <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Financial Reporting Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white rounded-full transition-colors">
            <X size={22} className="text-blue-900" />
          </button>
        </div>

        {/* 🚀 COMPACT FILTER BAR: Structured as a compact layout to maximize table room */}
        <div className="p-4 bg-gray-50 border-b space-y-3">
          {/* Inputs Row */}
          <div className="grid grid-cols-3 gap-2 text-left">
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Date From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 rounded-xl border border-gray-100 shadow-2xs bg-white font-bold text-xs outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Date To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 rounded-xl border border-gray-100 shadow-2xs bg-white font-bold text-xs outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-2 rounded-xl border border-gray-100 shadow-2xs bg-white font-bold text-xs outline-none">
                {['All', 'Tithe', 'Offertory', 'Giving', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Aggregates Summary Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/50">
            <div className="flex items-center gap-2 flex-1">
              {/* Entries Count */}
              <div className="bg-white border border-blue-100 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <span className="text-[9px] font-black text-gray-400 uppercase">Entries:</span>
                <span className="text-sm font-black text-blue-600 tracking-tighter">#{recordCount}</span>
              </div>
              {/* Total Display */}
              <div className="bg-blue-900 text-white px-3 py-1 rounded-xl flex items-center gap-2 shadow-sm flex-1 justify-between">
                <span className="text-[9px] font-black uppercase opacity-75">Total:</span>
                <span className="text-sm font-black tracking-tight">
                  KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-1">
              <button onClick={downloadCSV} className="p-2.5 bg-white text-gray-700 rounded-xl shadow-2xs hover:text-green-600 border border-gray-100">
                <TableIcon size={16} />
              </button>
              <button onClick={downloadPDF} disabled={exporting} className="p-2.5 bg-white text-gray-700 rounded-xl shadow-2xs hover:text-red-600 border border-gray-100">
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              </button>
            </div>
          </div>
        </div>


        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-blue-900 font-bold animate-pulse">Syncing Financial Records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    <th className="py-4 px-4">Member / Phone</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4 text-center">Date</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {contributions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-700 group-hover:text-blue-900">{item.member_name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{item.phone_number}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-white border border-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-blue-900">
                        {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-400 text-xs font-medium">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setSelectedContribution(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Send Thank You"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contributions.length === 0 && (
                <div className="text-center py-24">
                  <div className="text-gray-300 font-black text-sm uppercase tracking-[0.2em]">No transactions found for this period</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pastoral Message Overlay */}
      {selectedContribution && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-blue-900 tracking-tight">Send Appreciation</h3>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Direct Pastoral Note</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Recipient</div>
              <div className="font-bold text-blue-900">{selectedContribution.member_name}</div>
              <div className="text-xs text-gray-500">For {selectedContribution.type} of KES {Number(selectedContribution.amount).toLocaleString()}</div>
            </div>
            
            <textarea 
              autoFocus
              className="w-full p-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-sm h-40 resize-none"
              placeholder="Type your thank you message here..."
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
            />

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => {
                  setSelectedContribution(null);
                  setThankYouMessage("");
                }}
                className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-xs tracking-widest"
              >
                Discard
              </button>
              <button 
                onClick={sendThankYou}
                disabled={sendingMessage || !thankYouMessage.trim()}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                {sendingMessage ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
