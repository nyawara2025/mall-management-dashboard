import React, { useState } from 'react';
import { X, Award, Loader2, Send } from 'lucide-react';

interface BaptismConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

export const BaptismConfirmationModal: React.FC<BaptismConfirmationModalProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState<'baptism' | 'confirmation'>('baptism');
  const [sending, setSending] = useState(false);

  // =========================================================================
  // 📝 STATE SCHEMA MATCHING ST. BARNABAS PHYSICAL FORM
  // =========================================================================
  const [baptismForm, setBaptismForm] = useState({
    dob: '',
    christianNames: '',
    surname: '',
    poBox: '',
    officeTel: '',
    houseTel: '',
    residentialAddress: '',
    attendsRegularly: 'yes',
    fatherName: '',
    motherName: '',
    sponsorName1: '',
    sponsorIsAnglican1: 'yes',
    sponsorName2: '',
    sponsorIsAnglican2: 'yes'
  });

  const [confirmationForm, setConfirmationForm] = useState({
    fullName: '',
    age: '',
    baptismDate: '',
    baptismParish: ''
  });

  if (!isOpen) return null;

  // =========================================================================
  // ⚙️ SUBMISSION HANDLER
  // =========================================================================
  const handleSubmit = async (type: 'baptism' | 'confirmation', payload: any) => {
    setSending(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-baptism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_type: type,
          shop_id: userData?.shop_id || 68,
          member_id: userData?.id,
          phone_number: userData?.phone_number,
          details: payload
        }),
      });

      if (response.ok) {
        alert(`${type === 'baptism' ? 'Baptism Application' : 'Confirmation Application'} submitted successfully!`);
        
        // Reset states to original schemas
        setBaptismForm({
          dob: '',
          christianNames: '',
          surname: '',
          poBox: '',
          officeTel: '',
          houseTel: '',
          residentialAddress: '',
          attendsRegularly: 'yes',
          fatherName: '',
          motherName: '',
          sponsorName1: '',
          sponsorIsAnglican1: 'yes',
          sponsorName2: '',
          sponsorIsAnglican2: 'yes'
        });
        setConfirmationForm({
          fullName: '',
          age: '',
          baptismDate: '',
          baptismParish: ''
        });
        onClose();
      } else {
        alert("Server responded with an error. Please try again.");
      }
    } catch (err) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Award size={22} /> Sacraments
            </h3>
            <p className="text-xs text-blue-100 uppercase font-medium mt-0.5">Digital Application Registry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50">
          <button 
            onClick={() => setActiveTab('baptism')} 
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'baptism' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            1. Baptism (Infant)
          </button>
          <button 
            onClick={() => setActiveTab('confirmation')} 
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'confirmation' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            2. Confirmation
          </button>
        </div>

        {/* Form Container Panel */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'baptism' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('baptism', baptismForm); }} className="space-y-4">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2">Child's Baptism Intake Form</h4>
              
              {/* Section: Candidate */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide border-b pb-1">Candidate Details</p>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Date of Birth</label>
                  <input type="date" required value={baptismForm.dob} onChange={e => setBaptismForm({...baptismForm, dob: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <input type="text" placeholder="Proposed Christian Name(s)" required value={baptismForm.christianNames} onChange={e => setBaptismForm({...baptismForm, christianNames: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Surname(s)" required value={baptismForm.surname} onChange={e => setBaptismForm({...baptismForm, surname: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Address - P. O. Box" value={baptismForm.poBox} onChange={e => setBaptismForm({...baptismForm, poBox: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Office Tel" value={baptismForm.officeTel} onChange={e => setBaptismForm({...baptismForm, officeTel: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="tel" placeholder="House Tel" value={baptismForm.houseTel} onChange={e => setBaptismForm({...baptismForm, houseTel: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <input type="text" placeholder="Residential Address" required value={baptismForm.residentialAddress} onChange={e => setBaptismForm({...baptismForm, residentialAddress: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Does the Candidate attend St. Barnabas Church regularly?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input type="radio" name="attendsRegularly" value="yes" checked={baptismForm.attendsRegularly === 'yes'} onChange={e => setBaptismForm({...baptismForm, attendsRegularly: e.target.value})} className="text-blue-600 focus:ring-blue-500" /> Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input type="radio" name="attendsRegularly" value="no" checked={baptismForm.attendsRegularly === 'no'} onChange={e => setBaptismForm({...baptismForm, attendsRegularly: e.target.value})} className="text-blue-600 focus:ring-blue-500" /> No
                    </label>
                  </div>
                </div>
              </div>

              {/* Section: Parents */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide border-b pb-1">Parents Information</p>
                <input type="text" placeholder="Father's Name" value={baptismForm.fatherName} onChange={e => setBaptismForm({...baptismForm, fatherName: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Mother's Name" required value={baptismForm.motherName} onChange={e => setBaptismForm({...baptismForm, motherName: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Section: Witnesses / Sponsors */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide border-b pb-1">Witnesses / Sponsors</p>

                {/* Sponsor 1 */}
                <div className="space-y-2">
                  <input type="text" placeholder="Sponsor 1 Full Name" required value={baptismForm.sponsorName1} onChange={e => setBaptismForm({...baptismForm, sponsorName1: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Is Sponsor 1 Anglican?</span>
                    <div className="flex gap-3">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><input type="radio" value="yes" checked={baptismForm.sponsorIsAnglican1 === 'yes'} onChange={e => setBaptismForm({...baptismForm, sponsorIsAnglican1: e.target.value})} /> Yes</label>
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><input type="radio" value="no" checked={baptismForm.sponsorIsAnglican1 === 'no'} onChange={e => setBaptismForm({...baptismForm, sponsorIsAnglican1: e.target.value})} /> No</label>
                    </div>
                  </div>
                </div>

                {/* Sponsor 2 */}
                <div className="space-y-2 pt-2">
                  <input type="text" placeholder="Sponsor 2 Full Name" value={baptismForm.sponsorName2} onChange={e => setBaptismForm({...baptismForm, sponsorName2: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Is Sponsor 2 Anglican?</span>
                    <div className="flex gap-3">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><input type="radio" value="yes" checked={baptismForm.sponsorIsAnglican2 === 'yes'} onChange={e => setBaptismForm({...baptismForm, sponsorIsAnglican2: e.target.value})} /> Yes</label>
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1"><input type="radio" value="no" checked={baptismForm.sponsorIsAnglican2 === 'no'} onChange={e => setBaptismForm({...baptismForm, sponsorIsAnglican2: e.target.value})} /> No</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Charges Notice */}
              <div className="p-3 bg-amber-50 rounded-xl text-[11px] font-medium text-amber-800 leading-relaxed">
                <strong>Charges Note:</strong> There is no fee for Baptism, but it is fitting that a thank-offering be made at the Service. The cost of a Baptism Certificate is <strong>Kshs. 300/-</strong> which amount must be paid in full at the time of booking.
              </div>

              <button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg transition-all">
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Submit Application
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('confirmation', confirmationForm); }} className="space-y-4">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2">Adult Confirmation Class Form</h4>
              
              <input type="text" placeholder="Candidate's Full Name" required value={confirmationForm.fullName} onChange={e => setConfirmationForm({...confirmationForm, fullName: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Age" required value={confirmationForm.age} onChange={e => setConfirmationForm({...confirmationForm, age: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Date of Holy Baptism</label>
                <input type="date" required value={confirmationForm.baptismDate} onChange={e => setConfirmationForm({...confirmationForm, baptismDate: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <input type="text" placeholder="Parish Where Baptised (e.g. St. Barnabas)" required value={confirmationForm.baptismParish} onChange={e => setConfirmationForm({...confirmationForm, baptismParish: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              
              <button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg transition-all">
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Register for Classes
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
