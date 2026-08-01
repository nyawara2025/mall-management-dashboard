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
  total_monthly_collections_kes: number; // Sum of Tithes + Thanksgiving
  pending_diocesan_quota_kes: number;     // Aggregated Calculated Quota Line
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

interface DevelopmentProjectRow {
  id: number;
  tenant_id: number;
  project_title: string;
  project_scope: string;
  total_estimated_cost_kes: number;
  funds_raised_kes: number;
  expenditure_to_date_kes: number;
  percentage_progress: number;
  identified_risks: string | null;
  photograph_evidence_url: string | null;
  created_at: string;
}

interface DaughterChurchDashboardProps {
  session: {
    user_id: number;
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

  const [projectsList, setProjectsList] = useState<DevelopmentProjectRow[]>([])
  
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

  // 💸 MVP Capability No. 5: Monthly Returns & Remittance States
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [monthlyTithes, setMonthlyTithes] = useState('');
  const [monthlyThanksgiving, setMonthlyThanksgiving] = useState('');
  const [monthlyWelfare, setMonthlyWelfare] = useState('');
  const [reportingMonthDate, setReportingMonthDate] = useState('2026-07');
  const [submittingFinanceReturn, setSubmittingFinanceReturn] = useState(false);
  const [financeReturnsList, setFinanceReturnsList] = useState<any[]>([]);

  // 🏗️ MVP No. 6: Corrected Capital Project Tracking State Layers
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [projectCost, setProjectCost] = useState('');
  const [identifiedRisks, setIdentifiedRisks] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);

  const [monthlyReturnsList, setMonthlyReturnsList] = useState<any[]>([])

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
        setProjectsList(data.projects || []);
        setMonthlyReturnsList(data.monthly_returns || []);
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
          finance_reached: 0,
          entered_by_user_id: session.user_id
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
          entered_by_user_id: session.user_id,
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
          entered_by_user_id: session.user_id,
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
          entered_by_user_id: session.user_id, 
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
          entered_by_user_id: session.user_id,
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

  // 🏗️ Phase 5: Register New Capital Project Execution Method
  const handleRegisterProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedCost = parseFloat(projectCost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      alert("Validation Error: Total estimated cost must be a positive numeric value.");
      return;
    }

    if (!projectScope.trim()) {
      alert("Validation Error: Project scope and operational objectives cannot be blank.");
      return;
    }

    setSubmittingProject(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-register-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id, // Maps to your schema foreign key constraint
          project_title: projectTitle.trim().toUpperCase(),
          project_scope: projectScope.trim(),
          total_estimated_cost_kes: parsedCost,
          entered_by_user_id: session.user_id,
          identified_risks: identifiedRisks.trim() || null,
          photograph_evidence_url: null // Handled downstream via Supabase Storage buckets
        })
      });

      if (res.ok) {
        alert("New capital project blueprint successfully committed to development registries!");
        setProjectModalOpen(false);
        setProjectTitle('');
        setProjectScope('');
        setProjectCost('');
        setIdentifiedRisks('');
        fetchLocalChurchData(); // Refresh unified local lists
      } else {
        alert("Transaction Aborted: Failed to execute project registration payload.");
      }
    } catch (err) {
      console.error("Project registry transaction failure exception:", err);
      alert("Network Error: Unable to establish connection to n8n intake gateways.");
    } finally {
      setSubmittingProject(false);
    }
  };

  // 💸 Phase 2/3: Submit Monthly Finance Ledger Return up to the Parish
  const handleRegisterMonthlyReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedTithes = parseFloat(monthlyTithes) || 0;
    const parsedThanks = parseFloat(monthlyThanksgiving) || 0;
    const parsedWelfare = parseFloat(monthlyWelfare) || 0;
    
    if (parsedTithes <= 0 && parsedThanks <= 0) {
      alert("Validation Error: Please input valid collection numbers before submission.");
      return;
    }

    setSubmittingFinanceReturn(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-submit-monthly-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: session.assigned_id,
          reporting_month: `${reportingMonthDate}-01`, // Force first day of target month calendar mapping
          total_tithes_kes: parsedTithes,
          total_thanksgiving_kes: parsedThanks,
          total_welfare_kes: parsedWelfare,
          entered_by_user_id: session.user_id // Maps user reference ID scope context
        })
      });

      if (res.ok) {
        alert("Monthly financial return successfully transmitted upstream for validation!");
        setFinanceModalOpen(false);
        setMonthlyTithes('');
        setMonthlyThanksgiving('');
        setMonthlyWelfare('');
        fetchLocalChurchData(); // Sync list counters
      } else {
        alert("Transaction Refused: A return ledger row already exists for this calculation period.");
      }
    } catch (err) {
      console.error("Monthly return transmission exception:", err);
    } finally {
      setSubmittingFinanceReturn(false);
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
          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">Local Assembly Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">
              {session.name} • <span className="text-emerald-700">{session.role.replace('_', ' ')}</span>
            </p>

          </div>
        </div>

        {/* DYNAMIC ACTION CONTROLS BUTTONS GRID */}
        {/* Drops to a 2-column stacked layout on small viewports, changing to inline-flex rows on medium screens */}
        <div className="grid grid-cols-2 xs:flex xs:flex-wrap sm:flex md:items-center gap-2 w-full md:w-auto">

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
            💝 Welfare
          </button>

          {/* 👤 RE-INJECTED MEMBERSHIP ENTRY TRIGGER */}
          <button 
            onClick={() => setMemberModalOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-950 text-white font-black text-[9px] tracking-wide px-2.5 py-2 rounded-xl uppercase flex items-center justify-center gap-1 transition-colors shadow-xs active:scale-95"
          >
            👥 Add Member
          </button>

          {/* 🏡 RE-INJECTED HOUSEHOLD ENTRY TRIGGER */}
          <button 
            onClick={() => setHouseholdModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] tracking-wide px-2.5 py-2 rounded-xl uppercase flex items-center justify-center gap-1 transition-colors shadow-xs active:scale-95"
          >
            🏠 Household
          </button>

          <button 
            onClick={() => setGroupModalOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
          >
            🏡 Cell Group
          </button>

          {/* 🏗️ INJECT THIS MVP CAPABILITY NO.6 ACTION BUTTON */}
          <button 
            onClick={() => setProjectModalOpen(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
          >
            🏗️  Project
          </button>

          <button 
            onClick={() => setFinanceModalOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-950 text-white font-black text-[9px] tracking-wide px-2.5 py-2 rounded-xl uppercase flex items-center justify-center gap-1 transition-colors shadow-xs active:scale-95"
          >
            💰 Monthly Return
          </button>

          {/* UTILITY SYSTEMS ROW LOOP CONTAINER */}
          <div className="col-span-2 flex items-center justify-between sm:justify-start gap-2 border-t border-slate-100 pt-2 sm:pt-0 sm:border-0 mt-1 sm:mt-0">

            <button 
              onClick={fetchLocalChurchData}
              disabled={refreshing}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onLogout}
              className="flex-[2] sm:flex-none bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-[9px] tracking-wide px-3 py-2 rounded-xl uppercase flex items-center justify-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div> 
      </header>

      {/* 📊 DYNAMICALLY RESIZING LOCAL CONGREGATIONAL METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
  
        {/* CARD 1: WORSHIP ATTENDANCE */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 sm:mb-2.5">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Attendance Count</span>
            <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
              {metrics?.total_attendance?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
 
        {/* CARD 2: LOCAL WELFARE POOL */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-red-700 bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center mb-2 shrink-0">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Local Welfare Pool</span>
            <span className="block text-base font-black text-slate-800 tracking-tight mt-0.5 font-mono">
              KES {metrics?.total_welfare_kes?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        </div>

        {/* CARD 3: INJECTED TOTAL MONTHLY COLLECTIONS (TITHES + THANKSGIVING) */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-7 h-7 rounded-lg flex items-center justify-center mb-2 shrink-0">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Monthly Collections</span>
          <span className="block text-base font-black text-blue-900 tracking-tight mt-0.5 font-mono">
            {metrics?.total_monthly_collections_kes?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-7 h-7 rounded-lg flex items-center justify-center mb-2 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last Logged Period</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5 font-mono text-blue-700">
            {metrics?.last_logged_period || 'NONE'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-amber-700 bg-amber-50 w-7 h-7 rounded-lg flex items-center justify-center mb-2 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
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

        {/* 🏗️ MVP NO. 6: DEVELOPMENT PROJECTS CAPITAL TRACKING VIEWPANEL */}
        <div className="mt-6 space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1.5">
             🏗️ Active Structural & Capital Development Projects ({projectsList.length})
          </span>
          {projectsList.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
              No capital development projects or structural blueprints registered under this checkpoint location.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-3">Project Title</th>
                    <th className="p-3">Scope Target</th>
                    <th className="p-3 text-right">Estimated Budget</th>
                    <th className="p-3 text-center">Progress Metrics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {projectsList.map((project, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="p-3 font-bold text-slate-900 uppercase">🏗️ {project.project_title}</td>
                      <td className="p-3 text-slate-500 uppercase truncate max-w-[200px]">{project.project_scope}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900">
                        KES {Number(project.total_estimated_cost_kes).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${project.percentage_progress}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700">{project.percentage_progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* 💰 MVP NO. 5: MONTHLY FINANCIAL RETURNS AUDIT HISTORY TABLE */}
        <div className="mt-6 space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1.5">
            💰 Historical Monthly Financial Returns & Remittances ({monthlyReturnsList.length})
          </span>
          {monthlyReturnsList.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
              No historical monthly financial returns or remittance records submitted under this assembly.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-ctrl-400 uppercase">
                    <th className="p-3">Fiscal Month</th>
                    <th className="p-3 text-right">Tithes + Thanks</th>
                    <th className="p-3 text-right">Diocesan Quota</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {monthlyReturnsList.map((record, idx) => {
                    const combinedPool = Number(record.total_tithes_kes || 0) + Number(record.total_thanksgiving_kes || 0);
            
                    // Format date correctly from database DATE string format (YYYY-MM-DD)
                    const dateObj = record.reporting_month ? new Date(record.reporting_month) : null;
                    const formattedMonth = dateObj && !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase()
                      : 'UNKNOWN';

                    return (
                       <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="p-3 font-bold text-slate-900 font-mono">{formattedMonth}</td>
                        <td className="p-3 text-right font-mono text-slate-600">
                          KES {combinedPool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-amber-700">
                          KES {Number(record.calculated_diocesan_remittance_kes || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded uppercase ${
                            record.return_status === 'APPROVED_LOCKED' ? 'bg-emerald-50 text-emerald-700' :
                            record.return_status === 'PENDING_VICAR_REVIEW' ? 'bg-blue-50 text-blue-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {record.return_status ? record.return_status.replace(/_/g, ' ') : 'DRAFT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
        
        {/* 💰 PHASE 2: MONTHLY FINANCIAL RETURNS DATA ENTRY MODAL PANEL */}
        {financeModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setFinanceModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
                  💰 Log Monthly Financial Return
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Broadcast aggregated cash collections and calculate diocesan remittances</p>
              </div>

              <form onSubmit={handleRegisterMonthlyReturn} className="space-y-3.5">
        
                {/* TARGET MONTH PICKER */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Target Fiscal Month Period</label>
                  <input 
                    type="month" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={reportingMonthDate} 
                    onChange={e => setReportingMonthDate(e.target.value)} 
                  />
                </div>

                {/* TITHES AND THANKSGIVING SPLIT FIELDS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Total Tithes Pool (KES)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      min="0"
                      className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" 
                      value={monthlyTithes} 
                      onChange={e => setMonthlyTithes(e.target.value)} 
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Thanksgiving Pool (KES)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      required 
                      min="0"
                      className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" 
                      value={monthlyThanksgiving} 
                      onChange={e => setMonthlyThanksgiving(e.target.value)} 
                    />
                  </div>
                </div>

                {/* LOCAL WELFARE RETENTION BLOCK */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Total Welfare Collection (KES)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    required 
                    min="0"
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" 
                    value={monthlyWelfare} 
                    onChange={e => setMonthlyWelfare(e.target.value)} 
                  />
                </div>

                {/* COMPLIANCE ALERT NOTATION DESIGN ANCHOR */}
                <div className="p-2.5 border border-amber-100 bg-amber-50/40 rounded-xl text-[10px] text-slate-500 font-medium leading-normal">
                   ⚠️ <strong>Diocesan Remittance Notice:</strong> Submission automatically calculates the mandatory 20% quota payout due to the Diocesan Treasury.
                </div>

                {/* SUBMIT EXECUTIVE BUTTON */}
                <button
                  type="submit"
                  disabled={submittingFinanceReturn}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300"
                >
                  {submittingFinanceReturn ? 'Calculating Quotas...' : 'Transmit Financial Return'}
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

      {/* 🏗️ PHASE 5: CAPITAL DEVELOPMENT PROJECT CREATION ENTRY PANEL */}
      {projectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setProjectModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                🏗️ Initiate Local Capital Project
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Log development tracking requirements directly to the project ledger</p>
            </div>

            <form onSubmit={handleRegisterProject} className="space-y-4">
        
              {/* PROJECT TITLE */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Project Title / Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. PERMANENT SANCTUARY EXTENSION PHASE 1" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase" 
                  value={projectTitle} 
                  onChange={e => setProjectTitle(e.target.value)} 
                />
              </div>

              {/* TOTAL ESTIMATED BUDGET COST */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Total Estimated Cost Budget (KES)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  required 
                  min="1"
                  step="0.01"
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" 
                  value={projectCost} 
                  onChange={e => setProjectCost(e.target.value)} 
                />
              </div>

              {/* PROJECT SCOPE OBJECTIVES */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Project Scope Description</label>
                <textarea 
                  placeholder="Outline materials, construction phases, and targeted spatial boundaries..." 
                  required 
                  rows={2}
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase resize-none leading-normal" 
                  value={projectScope} 
                  onChange={e => setProjectScope(e.target.value)} 
                />
              </div>

              {/* IDENTIFIED RISKS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Identified Risks & Mitigations (Optional)</label>
                <textarea 
                  placeholder="e.g. Rainy season delays, material supply fluctuations..." 
                  rows={2}
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none uppercase resize-none leading-normal" 
                  value={identifiedRisks} 
                  onChange={e => setIdentifiedRisks(e.target.value)} 
                />
              </div>

              {/* SUBMIT BUTTON TRIGGER */}
              <button
                type="submit"
                disabled={submittingProject}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submittingProject ? 'Committing Blueprint Spec...' : 'Commit Project Blueprint'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  </div>
);
};
