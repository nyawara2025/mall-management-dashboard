import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, Lock } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  pin_code: string; // Added to interface
}

interface StaffSelectionProps {
  shopId: number;
  selectedWaiter: string;
  onSelectWaiter: (name: string) => void;
}

export const StaffSelection: React.FC<StaffSelectionProps> = ({ shopId, selectedWaiter, onSelectWaiter }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/pos-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId })
        });

        if (response.ok) {
          const data = await response.json();
          setStaffList(data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Staff fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) fetchStaff();
  }, [shopId]);

  // Security Function to verify PIN before selection
  const handleStaffClick = (staff: Staff) => {
    // If they are already selected, we don't need to re-verify for the same sale
    if (selectedWaiter === staff.name) return;

    const enteredPin = prompt(`Enter security PIN for ${staff.name}:`);
    
    if (enteredPin === staff.pin_code) {
      onSelectWaiter(staff.name);
    } else if (enteredPin !== null) {
      alert("⚠️ Access Denied: Incorrect PIN");
    }
  };

  if (loading) return <div className="p-4 text-[10px] animate-pulse text-gray-400 font-bold uppercase tracking-widest">Loading Staff...</div>;

  if (error) return (
    <div className="p-3 bg-red-50 text-red-500 text-[10px] flex items-center gap-2 font-black border border-red-100 rounded-lg mx-4 my-2">
      <AlertCircle size={14} /> FAILED TO LOAD STAFF LIST
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 border-b">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UserCheck size={14} className="text-blue-600" />
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Assign Waiter</h3>
        </div>
        {selectedWaiter && (
          <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <Lock size={10} /> Verified
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {staffList.map((staff) => (
          <button
            key={staff.id}
            onClick={() => handleStaffClick(staff)}
            className={`py-3 px-1 rounded-xl text-[10px] font-black transition-all border-2 flex flex-col items-center gap-1 uppercase tracking-tighter ${
              selectedWaiter === staff.name 
              ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 scale-95' 
              : 'border-white bg-white text-gray-500 hover:border-blue-200 shadow-sm'
            }`}
          >
            <span className="truncate w-full text-center px-1">
              {staff.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
