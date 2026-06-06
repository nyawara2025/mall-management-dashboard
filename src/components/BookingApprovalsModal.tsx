import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BookingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | number;
}

export const BookingApprovalsModal: React.FC<BookingApprovalsModalProps> = ({ isOpen, onClose, shopId }) => {
  if (!isOpen) return null;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-pending-facility-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, filter: 'Pending' })
      });
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, [shopId]);

  const handleUpdateStatus = async (id: number, targetStatus: 'Approved' | 'Declined') => {

    let reasonText = null;

    // Prompt the user for an explanation if they click decline
    if (targetStatus === 'Declined') {
      const inputReason = prompt("Please provide a brief reason for rejecting this booking request:");
      if (inputReason === null) return; // User canceled out of the prompt window
      if (!inputReason.trim()) {
        alert("A reason is required to reject a facility reservation request.");
        return;
      }
      reasonText = inputReason.trim();
    }

    setActioningId(id);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-update-facility-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id, status: targetStatus, shop_id: shopId, rejection_reason: reasonText })
      });

      if (response.ok) {
        alert(`Reservation request successfully ${targetStatus.toLowerCase()}!`);
        setBookings(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error("Server rejected state change");
      }
    } catch (err) {
      alert("Failed to synchronize state change to database.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left">
        
        {/* Header Layout */}
        <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Calendar size={20} /> Facility Booking Approvals
            </h3>
            <p className="text-xs text-slate-300 uppercase font-medium mt-0.5">
              Review and allocate parish communal resources
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Body Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/40">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={36} className="animate-spin text-blue-600" />
              <p className="text-xs font-black uppercase tracking-widest animate-pulse">
                Fetching reservation ledger entries...
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-[2rem] bg-white text-gray-400 text-xs font-medium px-4">
              🎉 No pending room or facility allocation requests requiring review.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((item) => (
                <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        item.facility === 'Church Hall' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {item.facility}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold">
                        by {item.member_name}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm">“{item.purpose}”</h4>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" /> {item.event_date}
                      </span>
                      {item.facility === 'Church Hall' ? (
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-gray-400" /> Attending: {item.attendance || 'N/A'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-gray-400" /> {item.start_time} - {item.end_time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      disabled={actioningId !== null}
                      onClick={() => handleUpdateStatus(item.id, 'Declined')}
                      className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-40"
                      title="Decline Request"
                    >
                      <XCircle size={18} />
                    </button>
                    <button
                      disabled={actioningId !== null}
                      onClick={() => handleUpdateStatus(item.id, 'Approved')}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
