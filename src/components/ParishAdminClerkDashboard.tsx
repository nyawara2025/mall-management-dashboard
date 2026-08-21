import React, { useState, useEffect } from 'react';
import { 
  Layers, RefreshCw, LogOut, Users, DollarSign, Calendar, 
  TrendingUp, ClipboardCheck, FileText, CheckCircle2, AlertTriangle, Plus, X 
} from 'lucide-react';

interface LocalMetrics {
  total_attendance: number;
  total_monthly_collections_kes: number;
  last_logged_period: string;
}

interface AttendanceLog {
  id: string;
  reporting_period: string;
  church_name: string;
  worship_attendance_count: number;
  sacraments_administered_count: number;
  return_status: 'DRAFT' | 'PENDING_VICAR_REVIEW' | 'APPROVED_LOCKED' | 'CORRECTION_REQUESTED';
  vicar_feedback_notes?: string;
}

interface ClerkDashboardProps {
  session: {
    user_id: number;
    name: string;
    role: string;
    assigned_id: number;
    reporting_period?: string;
  };
  onLogout: () => void;
}

export const ParishAdminClerkDashboard: React.FC<ClerkDashboardProps> = ({ session, onLogout }) => {
  // 📊 Local Operational States
  const [metrics, setMetrics] = useState<LocalMetrics | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // 📝 Controlled Form States
  const [period, setPeriod] = useState<string>(session.reporting_period || '2026-W34');
  const [sacramentalCount, setSacramentalCount] = useState('');
  const [grossCollections, setGrossCollections] = useState(''); // Offertory
  const [breakdownMen, setBreakdownMen] = useState('');
  const [breakdownWomen, setBreakdownWomen] = useState('');
  const [breakdownYouth, setBreakdownYouth] = useState('');
  const [breakdownChildren, setBreakdownChildren] = useState('');
  const [titheAmount, setTitheAmount] = useState('');
  const [thanksgivingAmount, setThanksgivingAmount] = useState('');

  // 🧭 Multi-Module Active Screen & Modal Open Flags
  const [activeModule, setActiveModule] = useState<string>('DASHBOARD');
  const [welfareFormOpen, setWelfareFormOpen] = useState(false);
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [householdFormOpen, setHouseholdFormOpen] = useState(false);
  const [cellGroupFormOpen, setCellGroupFormOpen] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [monthlyReturnOpen, setMonthlyReturnOpen] = useState(false);

  // 🏠 Controlled State Mappings for Household Registry
  const [householdName, setHouseholdName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  
  // 👥 Controlled State Mappings for Membership Enrollment
  const [householdsList, setHouseholdsList] = useState<{ id: string; household_name: string }[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberGender, setMemberGender] = useState('MALE');

  // Network Connectivity Triggers
  useEffect(() => {
    const goOnline = () => { setIsOnline(true); checkAndSyncOfflineQueue(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Update Reporting Period once Router hydration settles down
  useEffect(() => {
    if (session.reporting_period) {
      setPeriod(session.reporting_period);
    }
  }, [session.reporting_period]);

  const fetchClerkData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-parish-ledger-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data) {
        setMetrics(data.metrics || null);
        setAttendanceLogs(data.attendance || []);
      }
    } catch (err) {
      console.error("Error retrieving clerk grid context vectors:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClerkData();
  }, [session.assigned_id]);

  // Fetch available relational household options whenever the member portal opens
  useEffect(() => {
    const fetchParishHouseholds = async () => {
      if (!memberFormOpen) return;
      try {
        const res = await fetch('https://n8n.tenear.com/webhook/ack-fetch-parish-family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action_intent: 'FETCH_PARISH_HOUSEHOLDS', 
            parish_id: session.assigned_id 
          })
        });
        const data = await res.json();
        if (data && data.households) {
          setHouseholdsList(data.households);
          if (data.households.length > 0) {
            setSelectedHouseholdId(data.households[0].id);
          }
        }
      } catch (err) {
        console.error("Failed pulling relational household options payload:", err);
      }
    };
    fetchParishHouseholds();
  }, [memberFormOpen, session.assigned_id]);

  const checkAndSyncOfflineQueue = async () => {
    const queueItem = localStorage.getItem('ack_parish_clerk_offline_cache');
    if (!queueItem) return;
    setSyncStatus('Network restored. Synchronizing offline payload records...');
    try {
      const res = await fetch('https://n8n.tenear.com/ack-submit-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: queueItem
      });
      if (res.ok) {
        localStorage.removeItem('ack_parish_clerk_offline_cache');
        setSyncStatus('Offline logs successfully synced!');
        fetchClerkData();
      }
    } catch {
      setSyncStatus('Sync execution failed. Staging local backup payload safely.');
    }
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const adultMale = parseInt(breakdownMen, 10) || 0;
    const adultFemale = parseInt(breakdownWomen, 10) || 0;
    const youth = parseInt(breakdownYouth, 10) || 0;
    const children = parseInt(breakdownChildren, 10) || 0;
    const combinedAttendance = adultMale + adultFemale + youth + children;

    const tithe = parseFloat(titheAmount) || 0;
    const thanksgiving = parseFloat(thanksgivingAmount) || 0;
    const offertory = parseFloat(grossCollections) || 0;

    const nestedPayload = {
      tenant_id: session.assigned_id,
      reporting_period: period,
      worship_attendance: combinedAttendance,
      sacraments_administered: parseInt(sacramentalCount, 10) || 0,
      maker_id: session.user_id,
      communicants_count: parseInt(sacramentalCount, 10) || 0,
      visitors_count: 0,
      demographics: { adult_male: adultMale, adult_female: adultFemale, youth, children },
      collections: { tithe, thanksgiving, offertory, ministry_group: 0 }
    };

    if (!isOnline) {
      localStorage.setItem('ack_parish_clerk_offline_cache', JSON.stringify(nestedPayload));
      setSyncStatus('System offline. Progress saved securely within browser cache database.');
      setLogFormOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhok/ack-vicar-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nestedPayload)
      });
      if (res.ok) {
        alert("Weekly log entry recorded successfully!");
        setLogFormOpen(false);
        setBreakdownMen(''); setBreakdownWomen(''); setBreakdownYouth(''); setBreakdownChildren('');
        setTitheAmount(''); setThanksgivingAmount(''); setGrossCollections(''); setSacramentalCount('');
        fetchClerkData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Compute active status logic from primary logs matrix arrays row
  const activeLog = attendanceLogs.find(log => log.reporting_period === period);
  const status = activeLog ? String(activeLog.return_status).toUpperCase() : 'DRAFT';
  const isPending = status === 'PENDING_VICAR_REVIEW';
  const isApproved = status === 'APPROVED_LOCKED' || status === 'APPROVED';
  const isReturned = status === 'CORRECTION_REQUESTED' || status === 'RETURNED_FOR_CORRECTION';

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-12 text-xs">
      
      {/* 👑 COMPONENT TOPBAR CONTAINER */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4 mb-6">
        
        {/* Row 1: Identity Profile & Network Infrastructure Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Parish Admin Metrics System</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {session.name} • <span className="text-blue-700">Parish Core Desk (5-Tier ERP)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide border uppercase ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 
'bg-red-50 text-red-700 border-red-200'}`}>
              {isOnline ? '● Connected' : '○ Offline Storage'}
            </span>
            <button 
              onClick={fetchClerkData}
              disabled={refreshing}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black tracking-wider px-3 py-2 rounded-xl uppercase flex 
items-center gap-1.5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Exit Desk
            </button>
          </div>
        </div>

        {/* Row 2: Comprehensive Modular Action Toolbar Array */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button 
            onClick={() => setLogFormOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex 
items-center gap-1"
          >
            📋 Log Weekly Stats
          </button>

          <button 
            onClick={() => setWelfareFormOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex 
items-center gap-1"
          >
            🤝 Welfare
          </button>

          <button 
            onClick={() => setMemberFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex 
items-center gap-1"
          >
            ➕ Add Member
          </button>

          <button 
            onClick={() => setHouseholdFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex 
items-center gap-1"
          >
            🏠 Household
          </button>

          <button 
            onClick={() => setCellGroupFormOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex 
items-center gap-1"
          >
            👥 Cell Group
          </button>

          <button 
            onClick={() => setProjectFormOpen(true)}
            className="bg-sky-700 hover:bg-sky-800 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex items-center 
gap-1"
          >
            🏗️ Project
          </button>

          <button 
            onClick={() => setMonthlyReturnOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] tracking-wider px-3 py-2 rounded-xl uppercase transition-all shadow-xs flex 
items-center gap-1"
          >
            📅 Monthly Return
          </button>
        </div>
      </header>

      {syncStatus && <div className="p-3 bg-blue-50 border-l-4 border-blue-700 rounded-r-xl font-bold text-blue-800 mb-4 animate-pulse">{syncStatus}</div>}

      {/* 🚀 METRICS DISPATCH CONTROL PANEL WITH WORKFLOW BINDINGS */}
      <div className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 mb-6 transition-all duration-200 ${isReturned ? 'border-red-200 bg-red-50/20' : isApproved ? 'border-green-200 bg-green-50/10' : 'border-slate-200/80'}`}>
        <div className="p-3.5 border border-slate-100 bg-white rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div>
            <span className={`inline-flex text-[9px] font-black tracking-wide border px-2 py-0.5 rounded uppercase mb-1.5 ${isReturned ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
              {isReturned ? '⚠️ CORRECTION REQUESTED BY VICAR' : isPending ? '⏳ QUEUED FOR VICAR APPROVAL' : isApproved ? '✅ APPROVED & RECORDS LOCKED' : 'LOCAL DRAFT STATUS'}
            </span>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">Active Week Period: {period}</p>
            <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
              Current Registered Metrics: {metrics?.total_attendance || '0'} Attended • KES {metrics?.total_monthly_collections_kes?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} Pool
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(isReturned || status === 'DRAFT') && (
              <button 
                onClick={() => setLogFormOpen(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-widest px-4 py-2.5 rounded-xl uppercase transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                {isReturned ? '✏️ Correct Figures' : '📋 Log New Metrics'}
              </button>
            )}

            {status === 'DRAFT' && (
              <button
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const res = await fetch('https://n8n.tenear.com/webhook/ack-vicar-adjustments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        reporting_period: period, 
                        action_intent: 'SUBMIT_TO_QUEUE', 
                        clerk_id: session.user_id, 
                        tenant_id: session.assigned_id, 
                        target_status: 'PENDING_VICAR_REVIEW' 
                      })
                    });
                    if (res.ok) { 
                      alert("Metrics successfully queued for the Vicar authorization pool!"); 
                      fetchClerkData(); 
                    }
                  } catch (e) { 
                    console.error(e); 
                  } finally { 
                    setSubmitting(false); 
                  }
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] tracking-widest px-4 py-2.5 rounded-xl uppercase transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                🚀 Submit to Vicar
              </button>
            )}
          </div>
        </div>

        {isReturned && activeLog?.vicar_feedback_notes && (
          <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-r-xl text-xs mt-2 font-medium">
            <span className="block font-black text-red-700 uppercase text-[8px] tracking-wider mb-0.5">Vicar instructions note:</span>
            <p className="italic text-slate-900 font-bold font-sans">"{activeLog.vicar_feedback_notes}"</p>
          </div>
        )}
      </div>

      {/* 🏛️ UPGRADED ENTRY FORM DIALOG MODAL LAYERS */}
      {logFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setLogFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Log Weekly Metric Parameters</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACK Nairobi Returns Core Engine</p>
            </div>

            <form onSubmit={handleFormSubmission} className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Reporting Period Cluster</label>
                <input type="text" required className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>

              <div className="border-t border-slate-100/70 pt-2.5">
                <span className="block text-[9px] font-black text-blue-700 uppercase tracking-wider mb-2">👥 Attendance Demographics Matrix</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Adult Men</label>
                    <input type="number" required min="0" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" value={breakdownMen} onChange={e => setBreakdownMen(e.target.value)} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Adult Ladies</label>
                    <input type="number" required min="0" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" value={breakdownWomen} onChange={e => setBreakdownWomen(e.target.value)} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Youth Members</label>
                    <input type="number" required min="0" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" value={breakdownYouth} onChange={e => setBreakdownYouth(e.target.value)} />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Sunday School</label>
                    <input type="number" required min="0" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" value={breakdownChildren} onChange={e => setBreakdownChildren(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Sacraments Run</label>
                  <input type="number" required min="0" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" value={sacramentalCount} onChange={e => setSacramentalCount(e.target.value)} />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Offertory (KES)</label>
                  <input type="number" required min="0" step="0.01" className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none font-mono" value={grossCollections} onChange={e => setGrossCollections(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2.5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Total Tithes (KES)</label>
                  <input type="number" required min="0" step="0.01" className="bg-transparent w-full text-xs font-black text-emerald-700 focus:outline-none font-mono font-bold" value={titheAmount} onChange={e => setTitheAmount(e.target.value)} />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Thanksgiving (KES)</label>
                  <input type="number" required min="0" step="0.01" className="bg-transparent w-full text-xs font-black text-purple-700 focus:outline-none font-mono font-bold" value={thanksgivingAmount} onChange={e => setThanksgivingAmount(e.target.value)} />
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-xl grid grid-cols-2 gap-2 font-mono text-[10px] mt-1.5 shadow-md">
                <div>
                  <span className="block text-[7px] text-slate-400 font-bold uppercase">Worshipers sum:</span>
                  <span className="text-xs font-black text-green-400">
                    {(parseInt(breakdownMen,10)||0)+(parseInt(breakdownWomen,10)||0)+(parseInt(breakdownYouth,10)||0)+(parseInt(breakdownChildren,10)||0)}
                  </span>
                </div>
                <div>
                  <span className="block text-[7px] text-slate-400 font-bold uppercase">Collections sum:</span>
                  <span className="text-xs font-black text-blue-400">
                    KES {((parseFloat(titheAmount)||0)+(parseFloat(thanksgivingAmount)||0)+(parseFloat(grossCollections)||0)).toLocaleString(undefined,{minimumFractionDigits:2})}
                  </span>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300">
                {submitting ? 'Uploading Parameters...' : 'Save Weekly Entry Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {welfareFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setWelfareFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-4 h-4" 
/></button>
            <h3 className="text-sm font-black text-slate-900 uppercase mb-4">Record Local Welfare & Mutual Aid</h3>
            <form onSubmit={(e) => { e.preventDefault(); /* Trigger n8n welfare schema route */; setWelfareFormOpen(false); }} className="space-y-3">
              <input type="text" placeholder="Member Name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              <input type="text" placeholder="Sub-Zone / Purpose" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              <input type="number" placeholder="Amount (KES)" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none" />
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider">Commit Welfare 
Record</button>
            </form>
          </div>
        </div>
      )}

      {memberFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setMemberFormOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-4 h-4" 
/></button>
            <h3 className="text-sm font-black text-slate-900 uppercase mb-4">Enroll New Congregation Member</h3>
            {/* Form components mapping name, telephone number, demographic category tags */}
            <p className="text-slate-400 py-4 italic">Roster registration fields linked to Supabase profile indexes...</p>
            <button onClick={() => setMemberFormOpen(false)} className="w-full bg-blue-600 text-white font-black py-2 rounded-xl uppercase">Close Portal Registry</button>
          </div>
        </div>
      )}

      {monthlyReturnOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setMonthlyReturnOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-4 h-4" 
/></button>
            <h3 className="text-sm font-black text-slate-900 uppercase mb-2">Compile Statutory Monthly Returns</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-4">Aggregates all weeks for Diocesan Remittance processing</p>
            <button 
              onClick={async () => {
                /* Fire payload context directly to target n8n month-end consolidation loop */
                setMonthlyReturnOpen(false);
              }} 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest shadow-md"
            >
              Compile & Disseminate Monthly Sheet
            </button>
          </div>
        </div>
      )}

      {householdFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setHouseholdFormOpen(false)} 
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Register Parish Household Unit</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACK Nairobi Multi-Tenant Registry</p>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);

                const householdPayload = {
                  action_intent: 'CREATE_ACK_HOUSEHOLD',
                  parish_id: session.assigned_id, // Links to ack_church_tenants(id)
                  household_name: householdName,
                  primary_contact_phone: primaryPhone,
                  physical_address: physicalAddress
                };

                try {
                  const res = await fetch('https://n8n.tenear.com/webhook/ack-register-household', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(householdPayload)
                  });
                  
                  if (res.ok) {
                    alert("Household ledger item registered successfully!");
                    setHouseholdName('');
                    setPrimaryPhone('');
                    setPhysicalAddress('');
                    setHouseholdFormOpen(false);
                  } else {
                    alert("Failed to record household entry. Verify network channels.");
                  }
                } catch (err) {
                  console.error("Database connection fault:", err);
                } finally {
                  setSubmitting(false);
                }
              }} 
              className="space-y-3.5 text-xs"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Household Identifier Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. The Juma Family Household"
                  className="bg-transparent w-full font-bold text-slate-700 focus:outline-none" 
                  value={householdName} 
                  onChange={(e) => setHouseholdName(e.target.value)} 
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Primary Contact Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="e.g. +254 700 000000"
                  className="bg-transparent w-full font-bold text-slate-700 focus:outline-none font-mono" 
                  value={primaryPhone} 
                  onChange={(e) => setPrimaryPhone(e.target.value)} 
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Physical Address / Landmark Description</label>
                <textarea 
                  rows={3}
                  placeholder="Street name, estate block number, or village landmark coordinates..."
                  className="bg-transparent w-full font-medium text-slate-700 focus:outline-none resize-none" 
                  value={physicalAddress} 
                  onChange={(e) => setPhysicalAddress(e.target.value)} 
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-3 rounded-xl uppercase tracking-widest shadow-md 
transition-all mt-2"
              >
                {submitting ? 'Writing to Ledger...' : 'Commit Household Record'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
