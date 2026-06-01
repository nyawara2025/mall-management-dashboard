import React, { useState, useEffect } from 'react';
import { X, Calendar, Filter, FileText, Download, Loader2, RefreshCw, BarChart4 } from 'lucide-react';

const N8N_WEBHOOK_URL = 'https://n8n.tenear.com/webhook/diocese-fetch';

interface DioceseActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | number;
  userData: any;
}

export const DioceseActivitiesModal = ({ isOpen, onClose, shopId, userData }: DioceseActivitiesModalProps) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'programmes'>('pillars');
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any[]>([]);
  
  // Reporting Filter Configurations State Matrix
  const [filterPhone, setFilterPhone] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const shopIdentifier = shopId?.toString() || userData?.shop_id?.toString() || '68';

  // Fetch compiled cross-tenant operational reporting rows via your centralized n8n pipeline
  const fetchReportLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_canon_report_data',
          shop_id: shopIdentifier,
          category_type: activeTab, // 'pillars' or 'programmes'
          filter_phone: filterPhone,
          filter_category: filterCategory,
          start_date: startDate,
          end_date: endDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data?.records || []);
      }
    } catch (err) {
      console.error('Failed aggregating database audit matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run fetching pipeline whenever Canon toggles tabs
  useEffect(() => {
    if (isOpen) fetchReportLogs();
  }, [isOpen, activeTab]);

  // Client-Side CSV/XLS Document Generation Stream
  const exportToExcelCSV = () => {
    if (reportData.length === 0) return;
    
    // Construct layout headers tracking unique framework parameters
    const headers = ['Member Phone', activeTab === 'pillars' ? 'Pillar Name' : 'Programme Name', 'Metrics / Indicators', 'Impact Evidence Summary', 'Logged Date'];
    
    const rows = reportData.map(row => [
      row.member_phone,
      activeTab === 'pillars' ? row.pillar_name : row.programme_name,
      JSON.stringify(row.indicators || ''),
      row.impact_evidence?.replace(/,/g, ';') || '', // Clean delimiter conflicts
      new Date(row.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Diocesan_${activeTab}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Triggers client browser print pipeline formatted cleanly as an executive PDF report
  const exportToPDFPrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 🚀 MATCHES FINANCIAL VIEW GIVINGS SHEET BOUNDARY EXACTLY */}
      <div className="bg-white w-full max-w-6xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[92vh] max-h-[92vh] overflow-hidden">
        
        {/* Header - Condensed Padding matching theme */}
        <div className="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
              <BarChart4 size={18} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black text-blue-900 tracking-tight leading-tight">Diocesan Activities Insights</h2>
              <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest">Canon Reporting Profile Registry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white rounded-full transition-colors">
            <X size={22} className="text-blue-900" />
          </button>
        </div>

        {/* 🚀 COMPACT FILTER BAR LAYOUT MATCH: Split tightly on one line to yield table height */}
        <div className="p-4 bg-gray-50 border-b space-y-3">
          <div className="grid grid-cols-3 gap-2 text-left">
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Filter Phone</label>
              <input type="text" value={filterPhone} onChange={(e) => setFilterPhone(e.target.value)} placeholder="e.g. 2547..." className="w-full p-2 rounded-xl border border-gray-100 shadow-2xs bg-white font-bold text-xs outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Date From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 rounded-xl border border-gray-100 shadow-2xs bg-white font-bold text-xs outline-none" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Date To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 rounded-xl border border-gray-100 shadow-2xs bg-white font-bold text-xs outline-none" />
            </div>
          </div>

          {/* Aggregates Summary Controls and Document Download Toggles Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/50">
            <div className="flex border-b border-transparent gap-1">
              <button 
                type="button"
                onClick={() => setActiveTab('pillars')}
                className={`py-1 px-2.5 text-[11px] font-black rounded-xl transition-all ${activeTab === 'pillars' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-700'}`}
              >
                Pillars
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('programmes')}
                className={`py-1 px-2.5 text-[11px] font-black rounded-xl transition-all ${activeTab === 'programmes' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-700'}`}
              >
                Programmes ({reportData.length})
              </button>
            </div>

            <div className="flex gap-1">
              <button onClick={fetchReportLogs} disabled={loading} className="p-2 bg-white text-blue-600 rounded-xl shadow-2xs border border-gray-100 flex items-center gap-1 text-[11px] font-black uppercase">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Search
              </button>
              <button onClick={exportToExcelCSV} disabled={reportData.length === 0} className="p-2 bg-white text-green-600 rounded-xl shadow-2xs border border-gray-100 flex items-center gap-1 text-[11px] font-black uppercase">
                <Download size={12} /> Excel
              </button>
              <button onClick={() => window.print()} disabled={reportData.length === 0} className="p-2 bg-white text-red-600 rounded-xl shadow-2xs border border-gray-100 flex items-center gap-1 text-[11px] font-black uppercase">
                <FileText size={12} /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 THE INDEPENDENTLY SCROLLING DATA MATRIX CONTAINER CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold">Syncing tracking parameters...</span>
            </div>
          ) : reportData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-gray-400 font-bold italic border border-dashed border-gray-200 rounded-[1.5rem] bg-gray-50/50">
              No entries discovered matching filters.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-[1.5rem] overflow-x-auto shadow-2xs bg-white w-full">
              <table className="w-full text-left border-collapse min-w-[700px] table-auto">
                <thead>
                  <tr className="bg-blue-50/50 border-b border-gray-200 text-[9px] font-black text-blue-900 uppercase tracking-wider">
                    <th className="p-3 whitespace-nowrap">Member Phone</th>
                    <th className="p-3">Category Name</th>
                    <th className="p-3">Performance Matrix</th>
                    <th className="p-3">Impact Analysis Evidence</th>
                    <th className="p-3">Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {reportData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-3 font-bold text-gray-900 whitespace-nowrap">{record.member_phone}</td>
                      <td className="p-3 font-black text-blue-900 max-w-[150px] break-words">
                        {activeTab === 'pillars' ? record.pillar_name : record.programme_name}
                      </td>
                      <td className="p-3 space-y-1.5 min-w-[180px]">
                        {record.indicators?.map((ind: any, i: number) => (
                          <div key={i} className="bg-gray-50/60 p-2 rounded-xl border border-gray-100">
                            <span className="block text-[8px] uppercase font-black text-gray-400 leading-tight">{ind.label}</span>
                            <span className="font-bold text-gray-800 break-words">{ind.value || <span className="text-gray-300 italic">Not logged</span>}</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-3 text-gray-600 font-semibold leading-relaxed min-w-[180px] max-w-[240px] break-words">
                        {record.impact_evidence || <span className="text-gray-300 italic">No evidence statement submitted.</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {record.file_urls && record.file_urls.length > 0 ? (
                          record.file_urls.map((url: string, uIdx: number) => (
                            <a 
                              key={uIdx} 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-black bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 block"
                            >
                              📎 Link #{uIdx + 1}
                            </a>
                          ))
                        ) : (
                          <span className="text-gray-300 font-bold italic">No files</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
