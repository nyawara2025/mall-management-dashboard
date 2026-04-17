import React, { useEffect, useState } from 'react';
import { X, FileDown, FileText, Table as TableIcon, Loader2 } from 'lucide-react';

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
          contribution_type: selectedType === 'All' ? null : selectedType
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

  const totalAmount = contributions.reduce((sum, item) => sum + item.amount, 0);

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-900 tracking-tight">Canon's Oversight Panel</h2>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Financial Reporting Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={28} className="text-blue-900" />
          </button>
        </div>

        {/* Filter & Summary Bar */}
        <div className="p-6 bg-gray-50 border-b flex flex-wrap lg:flex-nowrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Date From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 rounded-2xl border-none shadow-sm bg-white font-bold text-sm" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Date To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 rounded-2xl border-none shadow-sm bg-white font-bold text-sm" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-3 rounded-2xl border-none shadow-sm bg-white font-bold text-sm">
              {['All', 'Tithe', 'Offertory', 'Contribution', 'Giving', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 lg:ml-auto">
            <div className="bg-blue-900 text-white px-6 py-2 rounded-2xl flex flex-col items-end min-w-[180px] shadow-lg shadow-blue-100">
              <span className="text-[8px] font-black uppercase opacity-60">Total for Period</span>
              <span className="text-xl font-black">KES {totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="p-4 bg-white text-gray-700 rounded-2xl shadow-sm hover:text-green-600 transition-all border border-gray-100">
                <TableIcon size={20} />
              </button>
              <button onClick={downloadPDF} disabled={exporting} className="p-4 bg-white text-gray-700 rounded-2xl shadow-sm hover:text-red-600 transition-all border border-gray-100 flex items-center">
                {exporting ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6 overflow-y-auto">
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
                    <th className="py-4 px-4">Member</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {contributions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-4 px-4 font-bold text-gray-700 group-hover:text-blue-900">{item.member_name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-white border border-blue-100 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-blue-900">{item.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center text-gray-400 text-xs font-medium">{new Date(item.date).toLocaleDateString()}</td>
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
    </div>
  );
};
