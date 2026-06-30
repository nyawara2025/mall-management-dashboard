import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, Plus, 
  DollarSign, Download, BookOpen, BarChart3, X, Calendar, MapPin, 
  ChevronRight, FileSpreadsheet, Loader2, DownloadCloud 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchBranding } from './ChurchBranding';

export const FinanceDashboard = () => {
  const { user } = useAuth();
  
  // Basic UI States
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Tithes');
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [recentDiaryEntries, setRecentDiaryEntries] = useState<any[]>([]);
  
  // Reporting States
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState({
    period: 'Monthly',
    type: 'Statement of Activities',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    format: 'PDF'
  });

  const [diaryData, setDiaryData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'departmental',
    subject: '',
    details: '',
    venue: 'Church Office',
    status: 'Pending'
  });

  const fetchRecentEntries = async () => {
    if (!user?.shop_id) return;
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user.shop_id,
          department: user?.department || 'Treasury & Finance'
        }),
      });
      const data = await response.json();
      const records = Array.isArray(data) ? data : (data.records || []);
      setRecentDiaryEntries(records.slice(0, 3));
    } catch (err) {
      console.error("Diary fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchRecentEntries();
  }, [user?.shop_id]);

  const handleRecordTransaction = async (txType: 'INCOME' | 'EXPENSE') => {
    if (!amount) return alert("Please enter an amount");
    try {
      await fetch('https://n8n.tenear.com/webhook/finance-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id,
          action: 'RECORD_TRANSACTION',
          amount: parseFloat(amount),
          type: txType,
          category,
          recorded_by: user?.id,
          timestamp: new Date().toISOString()
        }),
      });
      alert(txType + " recorded successfully!");
      setAmount('');
    } catch (error) {
      alert("Failed to sync records.");
    }
  };

  const handlePublishDiary = async () => {
    if (!diaryData.subject || !diaryData.details) return alert("Fill in subject and details.");
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/post-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...diaryData,
          shop_id: user?.shop_id,
          user_id: user?.id,
          department: user?.department || 'Treasury & Finance',
          recorded_at: new Date().toISOString()
        }),
      });
      if (response.ok) {
        alert("Diary entry published!");
        setIsDiaryModalOpen(false);
        setDiaryData({ ...diaryData, subject: '', details: '' });
        fetchRecentEntries();
      }
    } catch (error) {
      alert("Publish failed.");
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setDownloadUrl(null);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/finance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportConfig,
          shop_id: user?.shop_id,
          user_id: user?.id,
          generated_at: new Date().toISOString()
        }),
      });
  
      if (response.ok) {
        alert("Report generation started in the background. It will appear in your 'Reports");
        setIsReportsModalOpen(false); // Close the modal so they aren't stuck waiting
      }  
    } catch (error) {
      console.error("Connection dropped:", error);
      alert("Request sent! Generating large reports can take a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ChurchBranding departmentName="Treasury & Finance" />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-600" /> Treasury & Finance
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg">
          <p className="text-emerald-100 text-xs font-bold uppercase mb-1">Total Balance</p>
          <h3 className="text-3xl font-black">KES 450,230</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3" /> +12% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl"><ArrowUpRight className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-gray-400 text-[10px] font-bold uppercase">Monthly Tithes</p><h4 className="text-xl font-bold text-gray-900">KES 120,000</h4></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl"><ArrowDownLeft className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-gray-400 text-[10px] font-bold uppercase">Expenses</p><h4 className="text-xl font-bold text-gray-900">KES 45,000</h4></div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl"><BookOpen className="w-6 h-6 text-emerald-600" /></div>
              <div><h4 className="text-lg font-black text-gray-900">Finance Diary</h4><p className="text-xs text-gray-500">Log observations and notes.</p></div>
            </div>
            <button onClick={() => setIsDiaryModalOpen(true)} className="p-2 bg-emerald-600 text-white rounded-full hover:scale-110 transition-transform"><Plus size={20} /></button>
          </div>
          <div className="space-y-2">
            {recentDiaryEntries.length > 0 ? (
              recentDiaryEntries.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={"w-2 h-2 rounded-full " + (entry.type === 'personal' ? 'bg-orange-400' : 'bg-emerald-400')} />
                    <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{entry.subject}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 flex items-center gap-1"><Calendar size={10} /> {entry.entry_date || entry.date} <ChevronRight size={12} /></span>
                </div>
              ))
            ) : (<p className="text-xs text-gray-400 italic p-4 text-center">No recent entries found.</p>)}
          </div>
        </div>

        <button onClick={() => { setIsReportsModalOpen(true); setDownloadUrl(null); }} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-blue-500 transition-all text-left flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors"><BarChart3 className="w-6 h-6 text-blue-600 group-hover:text-white" /></div>
            <div><h4 className="text-lg font-black text-gray-900">Periodical Reports</h4><p className="text-xs text-gray-500">Quarterly financial summaries.</p></div>
          </div>
          <div className="mt-8 flex justify-end"><div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50"><ChevronRight className="text-gray-400 group-hover:text-blue-600" /></div></div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Entry */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-500" /> Quick Entry</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Category</label><select className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm font-medium" value={category} onChange={(e) => setCategory(e.target.value)}><option>Tithes</option><option>Offertory</option><option>Welfare</option></select></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Amount</label><input type="number" className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm font-bold" value={amount} onChange={(e) => setAmount(e.target.value)}/></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleRecordTransaction('INCOME')} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg">Record Income</button>
              <button onClick={() => handleRecordTransaction('EXPENSE')} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold">Record Expense</button>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-500" /> Activity</h3>
          <div className="space-y-3">
            {[{ label: 'Tithes', amt: '+15,000', type: 'in' }, { label: 'Bills', amt: '-4,200', type: 'out' }].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3"><div className={"w-8 h-8 rounded-full flex items-center justify-center " + (item.type === 'in' ? 'bg-emerald-100' : 'bg-orange-100')}><DollarSign size={16} className={item.type === 'in' ? 'text-emerald-600' : 'text-orange-600'}/></div><span className="text-xs font-bold text-gray-700">{item.label}</span></div>
                <span className={"text-xs font-black " + (item.type === 'in' ? 'text-emerald-600' : 'text-orange-600')}>{item.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diary Modal */}
      {isDiaryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">Diary Entry</h3>
              <button onClick={() => setIsDiaryModalOpen(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="space-y-5">
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                {['personal', 'departmental'].map((t) => (
                  <button key={t} onClick={() => setDiaryData({ ...diaryData, type: t })} className={"flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all " + (diaryData.type === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400')}>{t}</button>
                ))}
              </div>
              <input type="text" placeholder="Subject" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={diaryData.subject} onChange={(e) => setDiaryData({...diaryData, subject: e.target.value})}/>
              <textarea rows={3} placeholder="Details" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-medium border-none" value={diaryData.details} onChange={(e) => setDiaryData({...diaryData, details: e.target.value})}/>
              <button onClick={handlePublishDiary} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg">Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {isReportsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">Periodical Reports</h3>
              <button onClick={() => setIsReportsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="space-y-5">
              <select className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" value={reportConfig.type} onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}>
                <option>Statement of Activities (P&L)</option>
                <option>Tithes & Offering Summary</option>
              </select>
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                {['PDF', 'Excel'].map((fmt) => (
                  <button key={fmt} onClick={() => setReportConfig({ ...reportConfig, format: fmt })} className={"flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all " + (reportConfig.format === fmt ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400')}>{fmt}</button>
                ))}
              </div>
              {downloadUrl ? (
                <a href={downloadUrl} target="_blank" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2"><DownloadCloud size={20} /> Download {reportConfig.format}</a>
              ) : (
                <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
                  {isGenerating ? 'Generating...' : 'Generate ' + reportConfig.format}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
