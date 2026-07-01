import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, Plus, 
  DollarSign, Download, BookOpen, BarChart3, X, Calendar, MapPin, 
  ChevronRight, FileSpreadsheet, Loader2, DownloadCloud, Edit3, Check, CheckCircle, Smartphone 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChurchBranding } from './ChurchBranding';

export const FinanceDashboard = () => {
  const { user } = useAuth();
  const shopId = user?.shop_id || 'default_tenant';

  // basic ui states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('tithes');
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [recentDiaryEntries, setRecentDiaryEntries] = useState<any[]>([]);
  
  // reporting states
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState({ 
    period: 'monthly', type: 'statement of activities', month: new Date().getMonth() + 1, year: new Date().getFullYear(), format: 'pdf' 
  });
  const [diaryData, setDiaryData] = useState({ 
    date: new Date().toISOString().split('T')[0], type: 'departmental', subject: '', details: '', venue: 'church office', status: 'pending' 
  });

  // Tithes Verification Card States
  const [titheEntries, setTitheEntries] = useState<any[]>([]);
  const [isLoadingTithes, setIsLoadingTithes] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: 0, contributor_name: '' });

  // Add these inside the component function block
  const [nameFilter, setNameFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Computed filtering function evaluated on each render cycle
  const filteredEntries = titheEntries.filter(item => {
    const matchesName = item.contributor_name?.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesAmount = amountFilter ? Number(item.amount) >= Number(amountFilter) : true;
    
    // Check if the record's creation date string matches the HTML input date string
    const itemDate = new Date(item.created_at).toISOString().split('T')[0];
    const matchesDate = dateFilter ? itemDate === dateFilter : true;

    return matchesName && matchesAmount && matchesDate;
  });

  // Fetch tithes from your POST Webhook
  useEffect(() => {
    const fetchTithesFromWebhook = async () => {
      try {
        setIsLoadingTithes(true);
        const response = await fetch('https://n8n.tenear.com/webhook/tithe-for-finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'GET_TITHE_ENTRIES',
            shop_id: shopId,
            limit: 10
          }),
        });

        if (!response.ok) throw new Error('Network error fetching ledger');
        const result = await response.json();
        setTitheEntries(result.data || []);
      } catch (err) {
        console.error('Error syncing church_tithes ledger:', err);
      } finally {
        setIsLoadingTithes(false);
      }
    };

    if (user) fetchTithesFromWebhook();
  }, [user, shopId]);

  // Update manual entries via POST Webhook
  const handleUpdateManualTithe = async (id: string) => {
    try {
      setTitheEntries(prev => prev.map(item => 
        item.id === id ? { ...item, amount: editForm.amount, contributor_name: editForm.contributor_name } : item
      ));
      setEditingId(null);

      const response = await fetch('https://n8n.tenear.com/webhook/update-manual-tithe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MANUAL_ENTRY',
          shop_id: shopId,
          record_id: id,
          payload: {
            amount: editForm.amount,
            contributor_name: editForm.contributor_name,
            updated_at: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to save manual modification');
    } catch (err) {
      console.error('Failed processing ledger update:', err);
    }
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditForm({ amount: item.amount, contributor_name: item.contributor_name || '' });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      {/* 1. TOP HEADER NAVIGATION BLOCK */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ArrowDownLeft className="h-5 w-5 rotate-90" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Treasury & Finance</h1>
        </div>
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>

      {/* 2. CHURCH BRANDING SUB-HEADER (Restored to original architectural layout) */}
      <div className="max-w-7xl mx-auto mb-8">
        <ChurchBranding departmentName="" />
      </div>

      {/* 3. CORE METRICS HERO CARDS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden group">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 opacity-90">Total Balance</p>
          <p className="text-3xl font-extrabold tracking-tight mt-2">KES 450,230</p>
          <div className="inline-flex items-center text-xs font-semibold bg-emerald-500/40 rounded-full px-3 py-1 mt-4 text-emerald-50 border border-emerald-400/20">
            <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Tithes</p>
            <p className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">KES 120,000</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expenses</p>
            <p className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">KES 45,000</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 4. WORKFLOW CARDS GRID (DIARY & REPORTS) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Finance Diary</h3>
                <p className="text-xs text-slate-400">Log observations and notes.</p>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm hover:bg-emerald-700 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="font-semibold text-slate-700">Finance Committee Review...</span>
              </div>
              <span className="text-slate-400 font-medium">2026-06-21 <ChevronRight className="inline h-3 w-3 ml-0.5" /></span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Periodical Reports</h3>
              <p className="text-xs text-slate-400">Quarterly financial summaries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ADDED TITHE VERIFICATION CARD */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Tithes & Offerings Verification</h3>
            <p className="text-xs text-slate-400 mt-0.5">Review captured real-time M-Pesa transactions and records.</p>
          </div>

          {/* Clean Filter Panel Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Search by Name</label>
              <input
                type="text"
                placeholder="Filter contributor..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Min Amount (KES)</label>
              <input
                type="number"
                placeholder="Filter minimum..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Filter by Date</label>
              <input
                type="date"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 text-slate-600"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingTithes ? (
            <div className="flex items-center justify-center py-12 text-slate-400 space-x-2 text-xs font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Syncing live transactions...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10 font-medium">No recorded transactions match the filter criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/30">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Contributor Identifier</th>
                    <th className="py-3.5 px-4">Channel</th>
                    <th className="py-3.5 px-4 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {filteredEntries.map((item) => {
                    const isMpesa = item.payment_method?.toLowerCase() === 'mpesa';

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isMpesa ? 'bg-emerald-50/5' : ''}`}>
                        <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString('en-KE', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>

                        <td className="py-4 px-4 text-slate-900 font-semibold">
                          <div className="flex items-center space-x-2">
                            <span>{item.contributor_name}</span>
                            {isMpesa && item.mpesa_receipt_number && (
                              <span className="text-[10px] text-slate-400 font-mono font-normal">[{item.mpesa_receipt_number}]</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isMpesa 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {isMpesa ? <Smartphone className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                            {item.payment_method}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                          <span>KES {Number(item.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
