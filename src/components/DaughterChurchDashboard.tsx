import React, { useState, useEffect } from 'react';
import { 
  Church, RefreshCw, LogOut, Users, DollarSign, Heart, 
  TrendingUp, Calendar, ClipboardCheck, ArrowUpRight, X 
} from 'lucide-react';

interface LocalMetrics {
  total_attendance: number;
  total_welfare_kes: number;
  last_logged_period: string;
  attendance_trend_percentage: number;
}

interface WelfareContributionRow {
  id: string;
  member_name: string;
  amount_kes: number;
  purpose_zone: string;
  recorded_at: string;
}

interface DaughterChurchDashboardProps {
  session: {
    name: string;
    role: string;
    assigned_id: number;
  };
  onLogout: () => void;
}

export const DaughterChurchDashboard: React.FC<DaughterChurchDashboardProps> = ({ session, onLogout }) => {
  // 📊 Local Operational States
  const [metrics, setMetrics] = useState<LocalMetrics | null>(null);
  const [welfareLogs, setWelfareLogs] = useState<WelfareContributionRow[]>([]);
  
  // ⚙️ Component Lifecycle and UI Toggles
  const [refreshing, setRefreshing] = useState(false);
  const [kpiFormOpen, setKpiFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 📝 KPI Metric Modal Inputs
  const [period, setPeriod] = useState('2026-W31');
  const [attendance, setAttendance] = useState('');
  const [sacraments, setSacraments] = useState('');

  // 👥 Phase 4: Member & Household State Layers
  const [membersList, setMembersList] = useState<any[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberStage, setNewMemberStage] = useState('ADULT');
  const [newMemberComm, setNewMemberComm] = useState('SMS');
  const [newMemberCommunicant, setNewMemberCommunicant] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // 🏡 Phase 4: Household Management State Layers
  const [householdsList, setHouseholdsList] = useState<any[]>([]);
  const [householdModalOpen, setHouseholdModalOpen] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [newHouseholdPhone, setNewHouseholdPhone] = useState('');     // <-- Add this
  const [newHouseholdAddress, setNewHouseholdAddress] = useState(''); // <-- Add this
  const [loadingHouseholds, setLoadingHouseholds] = useState(false);

  // 🔄 Consolidated Local Data Fetcher Engine
  const fetchLocalChurchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-daughter-church-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data) {
        setMetrics(data.metrics || null);
        setWelfareLogs(data.welfare || []);
        setMembersList(data.members || []);
      }
    } catch (err) {
      console.error("Error synchronizing daughter church operational data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocalChurchData();
  }, [session.assigned_id]);

  const handleSubmitKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-submit-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id,
          reporting_period: period,
          worship_attendance: parseInt(attendance, 10) || 0,
          sacraments_administered: parseInt(sacraments, 10) || 0,
          milestones_completed: 0,
          finance_reached: 0
        })
      });
      if (res.ok) {
        alert("Weekly congregational stats logged up to the parish successfully!");
        setKpiFormOpen(false);
        setAttendance('');
        setSacraments('');
        fetchLocalChurchData();
      }
    } catch (err) {
      console.error("Failed uploading weekly stats:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMembers(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-register-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id,
          full_name: newMemberName,
          life_stage: newMemberStage,
          communication_preference: newMemberComm,
          is_communicant: newMemberCommunicant
        })
      });
      if (res.ok) {
        alert("New congregation member profile successfully committed into family register!");
        setMemberModalOpen(false);
        setNewMemberName('');
        // Refresh local data engine arrays
        fetchLocalChurchData(); 
      }
    } catch (err) {
      console.error("Member registry transaction failure exception:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleRegisterHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHouseholds(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-register-household', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parish_id: session.assigned_id, // Maps to your schema's parish_id parameter
          household_name: newHouseholdName,
          primary_contact_phone: newHouseholdPhone, // State field for the contact number
          physical_address: newHouseholdAddress // State field for the address layout
        })
      });
      if (res.ok) {
        alert("New family household registry profile successfully committed!");
        setHouseholdModalOpen(false);
        setNewHouseholdName('');
        setNewHouseholdPhone('');
        setNewHouseholdAddress('');
        fetchLocalChurchData(); 
      }
    } catch (err) {
      console.error("Household creation transaction failure exception:", err);
    } finally {
      setLoadingHouseholds(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-12">
      {/* 👑 CONGREGATION HUB TOP BAR */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center text-white shadow-md">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Local Assembly Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {session.name} • <span className="text-emerald-700">{session.role} Workspace</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setKpiFormOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
          >
            📋 Log Weekly Stats
          </button>
          <button 
            onClick={fetchLocalChurchData}
            disabled={refreshing}
            className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onLogout}
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* 📊 LOCAL CONGREGATIONAL METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last Attendance Count</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.total_attendance?.toLocaleString() || '0'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-red-700 bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Heart className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Local Welfare Pool</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5 font-mono">
            KES {metrics?.total_welfare_kes?.toLocaleString() || '0.00'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last Logged Period</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5 font-mono text-blue-700">
            {metrics?.last_logged_period || 'NONE'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-amber-700 bg-amber-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attendance Momentum</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.attendance_trend_percentage || '0'}% Trend
          </span>
        </div>
      </div>

      {/* 🎛️ MAIN OPERATIONAL TRACKING VIEWPORT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 📋 CONGREGATIONAL WELFARE CONTRIBUTION LEDGER */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
              <Heart className="w-4 h-4" /> Local Welfare & Mutual Aid Registry
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Internal sub-zone mutual contribution ledger records</p>
          </div>

          {welfareLogs.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">
              No mutual aid or welfare tracking contributions recorded under this local registry block.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-3">Member Name</th>
                    <th className="p-3">Sub-Zone/Purpose</th>
                    <th className="p-3 text-right">Amount (KES)</th>
                    <th className="p-3 text-center">Recorded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {welfareLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 uppercase">{log.member_name}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {log.purpose_zone}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {Number(log.amount_kes).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center font-mono text-[10px] text-slate-400">
                        {new Date(log.recorded_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 📢 LOCAL PARISH COMMUNITY BOARD WIDGET */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
              <ArrowUpRight className="w-4 h-4" /> Operational Notes
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Direct reporting indicators from local supervision channels</p>
          </div>
          <div className="p-3 border border-blue-100 rounded-xl bg-blue-50/40 text-xs text-slate-600 font-medium leading-relaxed space-y-2">
            <span className="block text-[10px] font-black text-blue-700 uppercase tracking-wider">Parish Directive 2026</span>
            <p>Ensure all Sunday worship registries and holy sacrament administration records are uploaded by 4:00 PM every Sunday to maintain real-time parish ledger alignment.</p>
          </div>
        </div>
      </div>

      {/* 🏛️ LOG STATISTICS ENTRY FORM MODAL */}
      {kpiFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setKpiFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
                <ClipboardCheck className="w-4 h-4" /> Log Weekly Congregation Stats
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Broadcast attendance logs upstream to the parish registry table</p>
            </div>

            <form onSubmit={handleSubmitKPI} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Reporting Period</label>
                <input 
                  type="text" 
                  placeholder="e.g., 2026-W31" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                  value={period} 
                  onChange={e => setPeriod(e.target.value.toUpperCase())} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Total Worshipers</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={attendance} 
                    onChange={e => setAttendance(e.target.value)} 
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Sacraments Run</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={sacraments} 
                    onChange={e => setSacraments(e.target.value)} 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Uploading Metrics...' : 'Log Congregation Stats'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* 👥 MISSING PHASE 4: MEMBERSHIP REGISTER MODAL ENTRY PANEL */}
      {memberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setMemberModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
                👥 Register New Assembly Member
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Record a member into the family household registry layout</p>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase" 
                  value={newMemberName} 
                  onChange={e => setNewMemberName(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Life Stage Group</label>
                  <select 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none"
                    value={newMemberStage}
                    onChange={e => setNewMemberStage(e.target.value)}
                  >
                    <option value="ADULT">ADULT</option>
                    <option value="YOUTH">YOUTH</option>
                    <option value="CHILD">CHILD</option>
                  </select>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Alert Channel</label>
                  <select 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none"
                    value={newMemberComm}
                    onChange={e => setNewMemberComm(e.target.value)}
                  >
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="NONE">NONE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1">
                <input 
                  type="checkbox" 
                  id="communicant"
                  className="w-4 h-4 text-emerald-700 border-slate-300 rounded focus:ring-emerald-500"
                  checked={newMemberCommunicant}
                  onChange={e => setNewMemberCommunicant(e.target.checked)}
                />
                <label htmlFor="communicant" className="text-xs font-bold text-slate-600 select-none">
                  Confirmed Communicant Status (🍷)
                </label>
              </div>

              <button
                type="submit"
                disabled={loadingMembers}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loadingMembers ? 'Registering...' : 'Commit Member Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 👥 PHASE 4: LOCAL MEMBERSHIP & FAMILY HOUSEHOLD REGISTER */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 mt-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
                👥 Parish Family Member & Household Register
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Digital register preservation managing life stages and communication preferences</p>
            </div>
            
            {/* 🔒 Restrictions: Recorders and Admins can build entries */}
            {session.role !== 'MEMBER' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setHouseholdModalOpen(true)}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-wider px-3 py-1.5 rounded-lg uppercase transition-colors"
                >
                  🏡 Register Household
                </button>

                <button 
                  onClick={() => setMemberModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] tracking-wider px-3 py-1.5 rounded-lg uppercase transition-colors"
                >
                  ➕ Register Member
                </button>
              </div>
            )}
          </div>

          {membersList.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
              No household family profiles registered under this congregational checkpoint branch yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-2.5">Full Name</th>
                    <th className="p-2.5">Life Stage Group</th>
                    <th className="p-2.5">Communicant Status</th>
                    <th className="p-2.5">Alert Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {membersList.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 uppercase">{m.full_name}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-black tracking-wide bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                          {m.life_stage}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-black tracking-wide px-2 py-0.5 rounded uppercase ${
                          m.is_communicant ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {m.is_communicant ? '🍷 Confirmed' : 'Not Admitted'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[10px] font-bold text-slate-500 uppercase">{m.communication_preference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 🏡 PHASE 4: CORRECTED HOUSEHOLD REGISTER MODAL PANEL */}
          {householdModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                <button 
                  onClick={() => setHouseholdModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                    🏡 Create Family Household Hub
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Preserve central family structures under localized congregations</p>
                </div>

                <form onSubmit={handleRegisterHousehold} className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Household Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. THE RICKY NYAWARA FAMILY" 
                      required 
                      className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase" 
                      value={newHouseholdName} 
                      onChange={e => setNewHouseholdName(e.target.value)} 
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Primary Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +254 7XX XXX XXX" 
                      required 
                      className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                      value={newHouseholdPhone} 
                      onChange={e => setNewHouseholdPhone(e.target.value)} 
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Physical Address</label>
                    <textarea 
                      placeholder="e.g. Court 4, House 12, Estate Sub-location" 
                      rows={2}
                      className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase resize-none" 
                      value={newHouseholdAddress} 
                      onChange={e => setNewHouseholdAddress(e.target.value)} 
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingHouseholds}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300"
                  >
                    {loadingHouseholds ? 'Registering Household...' : 'Commit Family Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
