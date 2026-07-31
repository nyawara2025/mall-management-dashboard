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

interface DiscipleshipGroupRow {
  id: number;
  church_id: number;
  group_type: string;
  group_name: string;
  leader_name: string;
  active_members_count: number;
  current_topic: string | null;
  created_at: string;
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
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');

  // 💸 Phase 4: Refactored Welfare Contribution State Layers
  const [welfareModalOpen, setWelfareModalOpen] = useState(false);
  const [selectedWelfareMemberId, setSelectedWelfareMemberId] = useState(''); // Stores member primary key ID
  const [selectedWelfareGroupId, setSelectedWelfareGroupId] = useState('');   // Stores discipleship group ID (Zone/Cell)
  const [welfarePurposeEnum, setWelfarePurposeEnum] = useState('');           // Stores exact database enum type
  const [welfareAmount, setWelfareAmount] = useState('');
  const [submittingWelfare, setSubmittingWelfare] = useState(false);

  // 🏡 Discipleship Group Registry State Layers
  const [groupsList, setGroupsList] = useState<DiscipleshipGroupRow[]>([]);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('CELL_GROUP');
  const [selectedLeaderMemberId, setSelectedLeaderMemberId] = useState(''); // Stores member primary key ID
  const [submittingGroup, setSubmittingGroup] = useState(false);

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
        setHouseholdsList(data.households || []);
        setGroupsList(data.groups || []);
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
          is_communicant: newMemberCommunicant,
          household_id: selectedHouseholdId ? parseInt(selectedHouseholdId, 10) : null
        })
      });
      if (res.ok) {
        alert("New congregation member profile successfully committed into family register!");
        setMemberModalOpen(false);
        setNewMemberName('');
        setSelectedHouseholdId('');
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

  // 🏡 Phase 4: Create Discipleship Group Execution Handler
  const handleRegisterGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !selectedLeaderMemberId) {
      alert("Validation Error: Please fill in all mandatory group profile description fields.");
      return;
    }

    // Unpack the verified text name corresponding to the selected member ID reference
    const selectedMemberRow = membersList.find(m => String(m.id) === selectedLeaderMemberId);
    const resolvedLeaderName = selectedMemberRow ? selectedMemberRow.full_name : 'UNRESOLVED MEMBER';

    setSubmittingGroup(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-register-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: session.assigned_id,
          group_type: newGroupType,
          group_name: newGroupName.trim().toUpperCase(),
          leader_name: resolvedLeaderName,
          metadata: {
            leader_member_id: parseInt(selectedLeaderMemberId, 10) // Appends relational schema check tracking
          } 
        })
      });

      if (res.ok) {
        alert("New discipleship group registered and locked into the local assembly layout successfully!");
        setGroupModalOpen(false);
        setNewGroupName('');
        setSelectedLeaderMemberId('');
        // Refresh local data engine arrays to sync list dropdowns
        fetchLocalChurchData(); // Sync list arrays
      } else {
        alert("Transaction Failed: Unable to commit group structural record.");
      }
    } catch (err) {
      console.error("Failed executing group registration transaction:", err);
    } finally {
      setSubmittingGroup(false);
    }
  };

  // 💸 Phase 4: Refactored Relational Welfare Contribution Handler
  const handleRegisterWelfare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(welfareAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Validation Error: Welfare transaction amount must be a positive numeric value.");
      return;
    }

    if (!selectedWelfareMemberId || !selectedWelfareGroupId || !welfarePurposeEnum) {
      alert("Validation Error: Please select valid options for Member, Zone/Group, and Target Purpose.");
      return;
    }

    setSubmittingWelfare(true);
    
    // Generate a secure transaction reference checking trace
    const structuralPseudoRef = `ACK-WEL-${session.assigned_id}-${Date.now()}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-register-welfare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_tenant_id: session.assigned_id,
          recorded_by_user_id: session.assigned_id, 
          amount_kes: parsedAmount,
          fund_purpose: welfarePurposeEnum, // Sends exact database public.ack_fund_purpose value
          payment_method: 'M-PESA',
          transaction_reference: structuralPseudoRef,
          payment_status: 'COMPLETED',
          // Pass relational primary keys down to your n8n middleware for metadata/join logging
          metadata: {
            member_id: parseInt(selectedWelfareMemberId, 10),
            discipleship_group_id: parseInt(selectedWelfareGroupId, 10)
          }
        })
      });

      if (res.ok) {
        alert("Welfare contribution record committed to ledger archives successfully!");
        setWelfareModalOpen(false);
        setSelectedWelfareMemberId('');
        setSelectedWelfareGroupId('');
        setWelfarePurposeEnum('');
        setWelfareAmount('');
        fetchLocalChurchData();
      }
    } catch (err) {
      console.error("Relational welfare tracking trace exception:", err);
    } finally {
      setSubmittingWelfare(false);
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
            onClick={() => setWelfareModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
          >
            💝 Record Welfare
          </button>

          <button 
            onClick={() => setGroupModalOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
          >
            🏡 Create Group/Zone
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
                      
                      {/* 🛡️ SAFE AMOUNT RENDERING WITH FALLBACK */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        {log.amount_kes && !isNaN(Number(log.amount_kes)) 
                          ? Number(log.amount_kes).toLocaleString(undefined, { minimumFractionDigits: 2 }) 
                          : '0.00'}
                      </td>
                      
                      {/* 🛡️ SAFE DATE RENDERING WITH FALLBACK */}
                      <td className="p-3 text-center font-mono text-[10px] text-slate-400">
                        {log.recorded_at && !isNaN(Date.parse(log.recorded_at)) 
                          ? new Date(log.recorded_at).toLocaleDateString() 
                          : 'N/A'}
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

              {/* 🏡 HOUSEHOLD ASSOCIATION DROPDOWN LINK */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Assign to Family Household</label>
                <select 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase"
                  value={selectedHouseholdId}
                  onChange={e => setSelectedHouseholdId(e.target.value)}
                >
                  <option value="">-- INDEPENDENT MEMBER (NO HOUSEHOLD LINK) --</option>
                  {householdsList.map((hh) => (
                    <option key={hh.id} value={hh.id}>
                      {hh.household_name} ({hh.primary_contact_phone})
                    </option>
                  ))}
                </select>
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

      {/* 👥 PHASE 4: MEMBERSHIP & HOUSEHOLDS COMBINED DUAL VIEWPORTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
        {/* LEFT SIDE: MEMBERS TABLE PORT */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1.5">
            👤 Registered Congregation Members ({membersList.length})
          </span>
          {membersList.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
              No member profiles registered under this congregational checkpoint branch yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/30">
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
                    <tr key={idx} className="hover:bg-white transition-colors">
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
        </div>

        {/* RIGHT SIDE: HOUSEHOLDS TABLE PORT */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1.5">
            🏡 Registered Family Household Structures ({householdsList.length})
          </span>
          {householdsList.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
              No family household hubs registered under this parish location checkpoint yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-2.5">Household Name</th>
                    <th className="p-2.5">Primary Contact</th>
                    <th className="p-2.5">Physical Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {householdsList.map((hh, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="p-2.5 font-bold text-blue-900 uppercase">🏡 {hh.household_name}</td>
                      <td className="p-2.5 font-mono text-[10px] font-bold text-slate-500">{hh.primary_contact_phone || 'N/A'}</td>
                      <td className="p-2.5 text-[10px] text-slate-400 uppercase truncate max-w-[150px]">
                        {hh.physical_address || 'NOT SPECIFIED'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>   

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

        {/* 💝 PHASE 4: WELFARE TRANSACTION ENTRY FORM MODAL */}
      {welfareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setWelfareModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
                💝 Record Welfare Contribution
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Log mutual aid pool funds to the sub-zone register ledger</p>
            </div>

            <form onSubmit={handleRegisterWelfare} className="space-y-4">
 
              {/* DROPDOWN 1: MEMBER SELECTION MATRIX */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Select Contributor Member</label>
                <select 
                  required
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase"
                  value={selectedWelfareMemberId}
                  onChange={e => setSelectedWelfareMemberId(e.target.value)}
                >
                  <option value="">-- CHOOSE ACTIVE CONGREGATION PROFILE --</option>
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>

              {/* DROPDOWN 2: ZONE / CELL GROUP REGISTER LINK */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Select Discipleship Group / Zone</label>
                <select 
                  required
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase"
                  value={selectedWelfareGroupId}
                  onChange={e => setSelectedWelfareGroupId(e.target.value)}
                >
                  <option value="">-- CHOOSE LOCAL CELL ZONE --</option>
                  {groupsList.map((g: DiscipleshipGroupRow) => (
                    <option key={g.id} value={g.id}>{g.group_name} ({g.leader_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* AMOUNT INPUT BLOCK */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Amount (KES)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    required 
                    min="1"
                    step="0.01"
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" 
                    value={welfareAmount} 
                    onChange={e => setWelfareAmount(e.target.value)} 
                  />
                </div>

                {/* DROPDOWN 3: ENUM PURPOSE INSTANTIATION MATRIX */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Fund Target Purpose</label>
                  <select 
                    required
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase"
                    value={welfarePurposeEnum}
                    onChange={e => setWelfarePurposeEnum(e.target.value)}
                  >
                    <option value="">-- SELECT PURPOSE --</option>
                    <option value="WELFARE">WELFARE FUND</option>
                    <option value="BENEVOLENT">BENEVOLENT FUND</option>
                    <option value="CLERGY_WELFARE">CLERGY WELFARE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingWelfare}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300"
              >
                {submittingWelfare ? 'Processing Transaction...' : 'Commit Welfare Log'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* 🏡 PHASE 4: DISCIPLESHIP GROUP CONFIGURATION ENTRY MODAL */}
      {groupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setGroupModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                🏡 Register New Discipleship Group / Zone
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Establish a verified cell checkpoint entity structure</p>
            </div>

            <form onSubmit={handleRegisterGroup} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Group / Zone Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. UPPER HILL CELL ZONE" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase" 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Leader Name</label>
                  <select 
                    required
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase truncate"
                    value={selectedLeaderMemberId}
                    onChange={e => setSelectedLeaderMemberId(e.target.value)}
                  >
                    <option value="" disabled>-- SELECT LEADER --</option>
                    {membersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        👤 {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Classification Type</label>
                  <select 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none"
                    value={newGroupType}
                    onChange={e => setNewGroupType(e.target.value)}
                  >
                    <option value="CELL_GROUP">CELL GROUP</option>
                    <option value="BIBLE_STUDY">BIBLE STUDY</option>
                    <option value="HOME_FELLOWSHIP">HOME FELLOWSHIP</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingGroup}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300"
              >
                {submittingGroup ? 'Registering Group...' : 'Commit Group Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  </div>
);
};
