import React, { useState, useEffect } from 'react';
import { 
  CreditCard, RefreshCw, Download, Search, 
  AlertCircle, CheckCircle, Receipt, TrendingUp, 
  Plus, LogOut, X, Landmark, Smartphone, Wallet
} from 'lucide-react';
import { SchoolBranding } from './SchoolBranding';

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

export const SchoolAccountant = ({ 
  shopId, 
  user, 
  onLogout 
}: { 
  shopId: number; 
  user?: any; 
  onLogout?: () => void; 
}) => {
  const [loading, setLoading] = useState(false);
  
  // Financial baseline aggregates initialized to matching view layout values
  const [totalCollected, setTotalCollected] = useState<number>(0); 
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0); 
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  
  // Filtering & Modal UI state trackers
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Manual payment transaction form inputs
  const [payStudentName, setPayStudentName] = useState('');
  const [payAdmissionNo, setPayAdmissionNo] = useState('');
  const [payClassId, setPayClassId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('M-Pesa');
  const [payReference, setPayReference] = useState('');

  const [studentDirectory, setStudentDirectory] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // 📊 Dedicated Fetch Engine: Automatically loads data from the fee_transactions table
  const handleFetchSchoolLedger = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-ledger', {
        method: 'POST', // Using POST to safely send the context payload
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'fetch_ledger', 
          shop_id: shopId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
      
        // 1. Update summary statistics totals from your database payload
        if (data.total_collected !== undefined) setTotalCollected(Number(data.total_collected));
        if (data.total_outstanding !== undefined) setTotalOutstanding(Number(data.total_outstanding));
      
        // 2. Load rows into transactions state for automatic rendering and filtering
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else if (Array.isArray(data)) {
          setTransactions(data);
        }
      } else {
        console.error("Ledger webhook responded with an error status:", response.status);
      }
    } catch (error) {
      console.error("Failed to automatically fetch school ledger:", error);
    } finally {
      setLoading(false);
    }
  };

        
  // 📝 Manual Payment Submission handler
  const handlePostManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/post-to-school-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          shop_id: shopId,
          student_name: payStudentName,
          admission_no: payAdmissionNo,
          class_id: payClassId,
          amount_paid: Number(payAmount),
          payment_method: payMethod, // Sends "Cash", "Cheque", or whatever option is picked
          reference_no: payReference,
          date_logged: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert("Receipt entry successfully recorded to system tables!");
        setIsModalOpen(false);
        
        // Wipe manual entry form fields clean
        setPayStudentName(''); 
        setPayAdmissionNo(''); 
        setPayClassId(''); 
        setPayAmount(''); 
        setPayReference('');
        
        // 🔄 Instantly re-fetch the ledger so the Accountant sees the new record immediately
        handleFetchSchoolLedger(); 
      } else {
        alert("Transaction upload rejected by data engine layers.");
      }
    } catch (err) {
      console.error("Payment transmission error failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Automatically trigger ledger load immediately when the Accountant dashboard mounts
  useEffect(() => {
    if (shopId) {
      handleFetchSchoolLedger();
    }
  }, [shopId]);  


  // 👥 Dynamic Student Profile Sync: Pulls live student names and metadata keys
  const handleLoadActiveStudentDirectory = async () => {
    if (!shopId) return;
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-active-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudentDirectory(Array.isArray(data) ? data : data.students || []);
      } else {
        console.error("Student directory webhook responded with status:", response.status);
      }
    } catch (err) {
      console.error("Failed to load secure student profiles directory:", err);
    }
  };



  // 🌟 Safe Array Check: Ensure it is a valid list array and add safe fallback values
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // 🧮 Compute Real-time metrics dynamically directly from the database row objects
  const liveTotalCollected = safeTransactions.reduce((sum, item) => {
    const rawVal = item?.amount_paid ?? (item as any)?.amount ?? 0;
    const cleanNum = isNaN(Number(rawVal)) ? 0 : Number(rawVal);
    return sum + cleanNum;
  }, 0);
  

  const liveTotalOutstanding = 12400; // Keep your current baseline placeholder or change to fit your rules

  // Unified visual anchors metrics config with live database values
  const bursarStats = [
    { 
      label: "Collected KES", 
      value: `KES ${liveTotalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" 
    },
    { 
      label: "Outstanding KES", 
      value: `KES ${liveTotalOutstanding.toLocaleString()}`, 
      icon: AlertCircle, bg: "bg-rose-50", color: "text-rose-600" 
    },
    { 
      label: "Total Pipeline Target", 
      value: `KES ${(liveTotalCollected + liveTotalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: TrendingUp, bg: "bg-blue-50", color: "text-blue-600" 
    },
    { 
      label: "Verified Clearances", 
      value: safeTransactions.length > 0 
        ? `${Math.round((safeTransactions.filter(t => Number(t?.balance_due || 0) <= 0).length / safeTransactions.length) * 100)}%` 
        : "0%", 
      icon: Receipt, bg: "bg-purple-50", color: "text-purple-600" 
    }
  ];

  // Inline array filter calculation loops
  const filteredTransactions = safeTransactions.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.admission_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.reference_no || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || item.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen relative">
      
      {/* 🚪 Top-Right Layout Logout Tool Trigger */}
      {onLogout && (
        <button 
          onClick={onLogout}
          className="absolute right-6 top-6 px-4 py-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer z-10"
        >
          <LogOut size={14} /> Sign Out
        </button>
      )}

      {/* 🌟 Dynamic Identity Branding Block */}
      <SchoolBranding departmentName="Bursar Ledger & Financials" />

      {/* --- Metrics Grid Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bursarStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-gray-800 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <IconComponent size={20} strokeWidth={2.5} />
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Operational Canvas Layout Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Tracker Card & Manual Action Tool */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
            <div className="mb-6">
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <CreditCard className="text-indigo-600" size={28} /> Target Tracking
              </h3>
              <p className="text-gray-500">Term collection efficiency ratios</p>
            </div>

            <div className="space-y-6">
              {(() => {
                const totalSum = liveTotalCollected + liveTotalOutstanding;
                const percentage = totalSum > 0 ? Math.round((liveTotalCollected / totalSum) * 100) : 0;
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                      <span>Target Clearances</span>
                      <span className="text-indigo-600 font-black">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })()}

              <button 
                type="button"
                disabled={loading}
                onClick={handleFetchSchoolLedger}
                className="w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-sm cursor-pointer mb-2"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Re-calculating..." : "Sync Live Invoicing"}
              </button>
            </div>
          </div>

          {/* ➕ Manual Payment Entry Trigger Button Block */}
          <div 
            onClick={() => {
              setIsModalOpen(true);
              handleLoadActiveStudentDirectory(); // ⚡ FORCES WEBHOOK TRIGGER ON CLICK
            }}
            className="p-6 bg-indigo-600 text-white rounded-3xl shadow-xl hover:bg-indigo-700 transition-all cursor-pointer text-left flex items-center gap-4 group"
          >
            <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-105 transition-transform">
              <Plus size={24} />
            </div>
            <div>
              <h4 className="font-black text-lg">Log Manual Payment</h4>
              <p className="text-xs text-indigo-200">Record direct bank slips, checks, or cash vouchers</p>
            </div>
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
            <div>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="text-xs font-bold px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-600">
                <option value="All">All Streams</option>
                {Array.from(new Set(safeTransactions.map(t => t?.class_id))).filter(Boolean).map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger Table Structure */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {loading && transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-bold animate-pulse uppercase">Auditing Dynamic Ledger Matrix Logs...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-medium">No payment ledger entries found for this school context.</div>
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
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wider">Cleared</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 uppercase tracking-wider">Bal: {tx.balance_due.toLocaleString()}</span>
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

      {/* 💳 BURSAR TRANSACTION INJECTOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 relative shadow-2xl">
      
            <div>
              <h3 className="text-xl font-black text-gray-800">Log Manual Receipts</h3>
              <p className="text-sm text-gray-400">Record off-line fee payments directly to ledger sheets.</p>
            </div>

            <form onSubmit={handlePostManualPayment} className="space-y-4">
        
              {/* 👤 Place the Safe Search Selection Dropdown right here inside the form! */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Student Profile</label>
                <select
                  className="w-full text-sm font-medium p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  onChange={(e) => {
                    const student = studentDirectory.find(s => s.student_id === e.target.value);
                    if (student) {
                      setSelectedStudent(student);
                      setPayStudentName(student.student_name);
                      setPayAdmissionNo(student.admission_no);
                      setPayClassId(student.class_id);
                    }
                  }}
                >
                  <option value="">-- Choose Student --</option>
                  {studentDirectory.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_name} ({s.admission_no})
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔒 Read-Only Safeguard Metadata Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-left">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Admission Target</span>
                  <span className="text-xs font-black text-gray-700">{payAdmissionNo || 'None Selected'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-left">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Stream Assigned</span>
                  <span className="text-xs font-black text-gray-700">{payClassId || 'None Selected'}</span>
                </div>
              </div>

              {/* --- Keep your original Amount, Channel, and Reference fields below this point --- */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase">Amount Paid (KES)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full text-sm font-medium p-3 bg-gray-50 border border-gray-200 rounded-xl" required />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase">Payment Channel</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full text-sm font-medium p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Slip">Bank Slip</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">Reference / Slip Number</label>
                <input type="text" value={payReference} onChange={e => setPayReference(e.target.value)} className="w-full text-sm font-medium p-3 bg-gray-50 border border-gray-200 rounded-xl" required />
              </div>

              <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                Commit Transaction Log
              </button>
            </form>
          </div>
        </div>
      )}
          


    </div>
  );
};
