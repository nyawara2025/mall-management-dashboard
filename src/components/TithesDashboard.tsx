import React, { useState } from 'react';
import { Search, Heart, X } from 'lucide-react';

interface Member {
  id: string | number;
  first_name: string;
  last_name: string;
  ministry?: string;
}

export const TithesDashboard = ({ user }: { user: any }) => {
  const [memberQuery, setMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [titheAmount, setTitheAmount] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  const handleSearchMembers = async (query: string) => {
    setMemberQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-tithing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: user?.shop_id, search_query: query }),
      });
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleSaveTithe = async () => {
    if (!selectedMember || !titheAmount) return alert("Please select a member and enter amount.");
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/post-tithe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: user?.shop_id,
          member_id: selectedMember.id,
          member_name: `${selectedMember.first_name} ${selectedMember.last_name}`,
          amount: parseFloat(titheAmount),
          payment_month: paymentMonth,
          recorded_by: user?.username || 'Admin'
        }),
      });
      if (response.ok) {
        alert("Tithe recorded successfully!");
        setSelectedMember(null);
        setTitheAmount('');
        setMemberQuery('');
      }
    } catch (error) {
      alert("Failed to save tithe.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Heart className="text-red-500" /> Record Tithe / Offering
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Member</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Start typing name..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              value={memberQuery}
              onChange={(e) => handleSearchMembers(e.target.value)}
            />
          </div>
          
          {searchResults.length > 0 && !selectedMember && (
            <div className="mt-1 border rounded-lg shadow-lg bg-white max-h-40 overflow-y-auto">
              {searchResults.map(m => (
                <div 
                  key={m.id}
                  onClick={() => { setSelectedMember(m); setMemberQuery(`${m.first_name} ${m.last_name}`); }}
                  className="p-2 hover:bg-purple-50 cursor-pointer text-sm"
                >
                  {m.first_name} {m.last_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg"
              value={titheAmount}
              onChange={(e) => setTitheAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg bg-gray-50"
              value={paymentMonth}
              readOnly
            />
          </div>
        </div>

        <button 
          onClick={handleSaveTithe}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors"
        >
          Submit Record
        </button>
      </div>
    </div>
  );
};
