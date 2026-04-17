import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// We need to redefine these here so TypeScript knows what they are
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

export const ViewGivings: React.FC<ViewGivingsProps> = ({ isOpen, onClose, userData }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userData?.org_id) {
      fetchContributions();
    }
  }, [isOpen, userData]);

  const fetchContributions = async () => {
    if (!userData?.org_id) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-church-givings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Fixed: Ensure the JSON body contains both fields correctly
        body: JSON.stringify({ 
          org_id: userData.org_id,
          phone_number: userData.phone_number 
        }),
      });
      
      const data = await response.json();
      setContributions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-blue-50 rounded-t-[2.5rem]">
          <div>
            <h2 className="text-2xl font-black text-blue-900">Church Contributions</h2>
            <p className="text-blue-600 text-sm">Canon's Oversight View</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-blue-900" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10 italic">Loading financial records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 px-4 text-gray-500 font-bold uppercase text-xs">Member</th>
                    <th className="py-3 px-4 text-gray-500 font-bold uppercase text-xs">Type</th>
                    <th className="py-3 px-4 text-gray-500 font-bold uppercase text-xs text-right">Amount</th>
                    <th className="py-3 px-4 text-gray-500 font-bold uppercase text-xs text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {contributions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-800">{item.member_name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-green-600">
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500 text-sm">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contributions.length === 0 && (
                <div className="text-center py-10 text-gray-400">No records found for this organization.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
