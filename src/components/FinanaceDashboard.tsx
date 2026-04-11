import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Plus, 
  DollarSign,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const FinanceDashboard = () => {
  const { user } = useAuth();
  
  // Local state for quick entry (e.g., Sunday Collection)
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Tithes');

  const handleRecordTransaction = async (type: 'INCOME' | 'EXPENSE') => {
    if (!amount) return alert("Please enter an amount");
    
    try {
      await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id,
          action: 'RECORD_TRANSACTION',
          amount: parseFloat(amount),
          type: type,
          category: category,
          recorded_by: user?.id,
          timestamp: new Date().toISOString()
        }),
      });
      alert(`${type} recorded successfully!`);
      setAmount('');
    } catch (error) {
      alert("Failed to sync with financial records.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-600" /> Treasury & Finance
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
          <h3 className="text-3xl font-black">KES 450,230</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3" /> +12% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase">Monthly Tithes</p>
              <h4 className="text-xl font-bold text-gray-900">KES 120,000</h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-xl">
              <ArrowDownLeft className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase">Expenses</p>
              <h4 className="text-xl font-bold text-gray-900">KES 45,000</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Quick Entry Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" /> Quick Collection Entry
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Category</label>
                <select 
                  className="w-full mt-1 p-3 bg-gray-50 border-none rounded-xl text-sm font-medium"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Tithes</option>
                  <option>Offertory</option>
                  <option>Building Fund</option>
                  <option>Thanksgiving</option>
                  <option>Welfare</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">KES</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full mt-1 p-3 pl-12 bg-gray-50 border-none rounded-xl text-sm font-bold"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleRecordTransaction('INCOME')}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-50"
              >
                Record Income
              </button>
              <button 
                onClick={() => handleRecordTransaction('EXPENSE')}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
              >
                Record Expense
              </button>
            </div>
          </div>
        </div>

        {/* 2. Recent Ledger / Activity */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Tithes - Sunday Service', amt: '+15,000', type: 'in' },
              { label: 'Electricity Bill', amt: '-4,200', type: 'out' },
              { label: 'Welfare Donation', amt: '+2,500', type: 'in' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'in' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                    <DollarSign className={`w-4 h-4 ${item.type === 'in' ? 'text-emerald-600' : 'text-orange-600'}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.label}</span>
                </div>
                <span className={`text-xs font-black ${item.type === 'in' ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {item.amt}
                </span>
              </div>
            ))}
            <button className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
              View All Transactions
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
