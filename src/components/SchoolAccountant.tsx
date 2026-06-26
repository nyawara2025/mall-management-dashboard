import React, { useState, useEffect } from 'react';
import { 
  CreditCard, RefreshCw, Download, Printer, Search, 
  ArrowLeft, DollarSign, AlertCircle, CheckCircle, 
  Receipt, TrendingUp, Filter, Calendar, Target
} from 'lucide-react';
import { SchoolBranding } from './SchoolBranding';

// 📋 Type-safe structural contract matching your multi-tenant accounting ledgers
interface FeeTransaction {
  id: string;
  student_name: string;
  admission_no: string;
  class_id: string;
  amount_paid: number;
  balance_due: number;
  payment_method: string;
  reference_no: string;
  date_logged: string;
}

export const SchoolAccountant = ({ shopId }: { shopId: number }) => {
  const [loading, setLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  
  // Financial baseline aggregates
  const [totalCollected, setTotalCollected] = useState<number>(42500); 
  const [totalOutstanding, setTotalOutstanding] = useState<number>(12400); 
  const [targetProjections, setTargetProjections] = useState<number>(54900);

  // Structural ledger data arrays
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  
  // Ledger layout filtering state references
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 📡 Asynchronous Fetch Sync: Query financial ledger entries matching shop_id parameter context
  const fetchBursarLedgerMetrics = async () => {
    setLedgerLoading(true);
    try {
      const response = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      }
    } catch (err) {
      console.error("Bursar ledger engine connection tracking fault:", err);
    } finally {
      setLedgerLoading(false);
    }
  };

  // 📊 Core Metrics Sync Rule: Re-align total aggregates via dedicated fees tracker query loop
  const handleSynchronizeFees = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.total_collected !== undefined) setTotalCollected(Number(data.total_collected));
        if (data.total_outstanding !== undefined) setTotalOutstanding(Number(data.total_outstanding));
        if (data.target_projections !== undefined) setTargetProjections(Number(data.target_projections));
        alert("Bursar accounting data metrics synchronized with Supabase database!");
        fetchBursarLedgerMetrics(); // Cascade update list layout
      }
    } catch (error) {
      console.error("Failed to sync financial parameters from backend gateway:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mount transactional history tables immediately upon execution lifecycle
  useEffect(() => {
    fetchBursarLedgerMetrics();
  }, [shopId]);

  // Unified visual anchors metrics config matching EducationalDashboard layouts
  const bursarStats = [
    {
      label: "Collected KES",
      value: `KES ${totalCollected.toLocaleString()}`,
      icon: CheckCircle,
      bg: "bg-emerald-50",
      color: "text-emerald-600"
    },
    {
      label: "Outstanding KES",
      value: `KES ${totalOutstanding.toLocaleString()}`,
      icon: AlertCircle,
      bg: "bg-rose-50",
      color: "text-rose-600"
    },
    {
      label: "Total Pipeline Target",
      value: `KES ${(totalCollected + totalOutstanding).toLocaleString()}`,
      icon: Target,
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      label: "Verified Clearances",
      value: transactions.length > 0 
        ? `${Math.round((transactions.filter(t => t.balance_due <= 0).length / transactions.length) * 100)}%` 
        : "0%",
      icon: Receipt,
      bg: "bg-purple-50",
      color: "text-purple-600"
    }
  ];

  // Inline filtration logic matching operational matrix styles
  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.admission_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.reference_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || item.class_id === selectedClass;
    const matchesMethod = selectedMethod === 'All' || item.payment_method?.toLowerCase() === selectedMethod.toLowerCase();
    return matchesSearch && matchesClass && matchesMethod;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* 🌟 Dynamic Identity Branding Block */}
      <SchoolBranding departmentName="Bursar Ledger & Financials" />

      {/* --- Metrics Grid Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {bursarStats.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 text-left">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <IconComponent size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-xl font-black text-gray-800 mt-0.5">{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Operational Canvas Layout Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Collection Milestone Track Card */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
          <div className="mb-6">
            <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
              <TrendingUp className="text-indigo-600" size={28} /> Target Tracking
            </h3>
            <p className="text-gray-500">Term collection efficiency ratios</p>
          </div>

          <div className="space-y-6">
            {(() => {
              const totalSum = totalCollected + totalOutstanding;
              const percentage = totalSum > 0 ? Math.round((totalCollected / totalSum) * 100) : 0;
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Target Clearances</span>
                    <span className="text-indigo-600 font-black">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium text-right">Target collection efficiency matrix</p>
                </div>
              );
            })()}

            <button 
              type="button"
              disabled={loading}
              onClick={handleSynchronizeFees}
              className="w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-sm cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Re-calculating..." : "Sync Live Invoicing"}
            </button>
          </div>
        </div>

        {/* Dynamic Ledger Data Table Panel Container */}
        <div className="lg:col-span-2 space-y-4 text-left">
          
          {/* Action Toolbar Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-md">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student, adm, reference..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="text-xs font-bold px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-600">
                <option value="All">All Streams</option>
                {Array.from(new Set(transactions.map(t => t.class_id))).filter(Boolean).map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
              
              <button 
                onClick={() => {
                  if (filteredTransactions.length === 0) return alert("No ledger logs available to extract.");
                  const headers = ["Student", "Admission No", "Class", "Paid Amount", "Balance Due", "Method", "Ref No", "Timestamp"];
                  const rows = filteredTransactions.map(t => [`"${t.student_name}"`, `"${t.admission_no}"`, `"${t.class_id}"`, `"${t.amount_paid}"`, `"${t.balance_due}"`, `"${t.payment_method}"`, `"${t.reference_no}"`, `"${t.date_logged || ''}"`]);
                  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csvContent));
                  link.setAttribute("download", `Bursar_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link); link.click(); document.body.removeChild(link);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Ledger Table Structure */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {ledgerLoading ? (
              <div className="text-center py-16 text-gray-400 text-xs font-bold animate-pulse uppercase">Auditing Dynamic Ledger Matrix Logs...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-medium">No valid payment ledger entries recorded on the backend engine database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Learner Profile</th>
                      <th className="p-4">Stream</th>
                      <th className="p-4">Transaction Ref</th>
                      <th className="p-4 text-right">Paid</th>
                      <th className="p-4 text-center">Arrears Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-bold text-gray-900">{tx.student_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono tracking-tight">{tx.admission_no || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-md text-[10px] font-black uppercase">{tx.class_id}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-slate-700 font-bold">{tx.reference_no}</div>
                          <div className="text-[9px] text-gray-400 uppercase font-black">{tx.payment_method}</div>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          KES {tx.amount_paid.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          {tx.balance_due <= 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                              Cleared
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 uppercase tracking-wider">
                              Bal: {tx.balance_due.toLocaleString()}
                            </span>
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
    </div>
  );
};
