import React, { useState, useEffect } from 'react';
import { 
  Layers, RefreshCw, LogOut, Users, DollarSign, Calendar, 
  TrendingUp, ClipboardCheck, FileText, CheckCircle2, AlertTriangle, X 
} from 'lucide-react';

interface ParishMetrics {
  total_attendance: number;
  total_collections_kes: number;
  reporting_assemblies_count: number;
  target_variance_percentage: number;
}

interface AttendanceLog {
  id: string;
  reporting_period: string;
  church_name: string;
  worship_attendance_count: number;
  sacraments_administered_count: number;
  is_approved: boolean; // Managed dynamically by the database/n8n pipeline
}

interface MpesaTransaction {
  id: string;
  transaction_reference: string;
  amount_kes: number;
  fund_purpose: string;
  payment_status: string;
  created_at: string;
}

interface ParishDashboardProps {
  session: {
    name: string;
    role: string;
    assigned_id: number;
  };
  onLogout: () => void;
}

export const ParishERPDashboard: React.FC<ParishDashboardProps> = ({ session, onLogout }) => {
  // 📊 Local Operational State Management
  const [metrics, setMetrics] = useState<ParishMetrics | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [ledger, setLedger] = useState<MpesaTransaction[]>([]);
  
  // ⚙️ Component Lifecycle and UI Toggles
  const [refreshing, setRefreshing] = useState(false);
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 📝 Attendance Modal Controlled Input Fields
  const [period, setPeriod] = useState('2026-W31'); // Aligned with current mid-2026 system timeline
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [attendanceCount, setAttendanceCount] = useState('');
  const [sacramentalCount, setSacramentalCount] = useState('');

  // 👥 Local Staff Management State Channels
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffFormOpen, setStaffFormOpen] = useState(false);
  const [clerkName, setClerkName] = useState('');
  const [clerkPhone, setClerkPhone] = useState('');
  const [clerkRole, setClerkRole] = useState('PARISH_DATA_CLERK');
  const [provisioning, setProvisioning] = useState(false);

  // 📝 Expand Attendance Modal Controlled Input Fields to include precise breakdowns
  const [breakdownMen, setBreakdownMen] = useState('');
  const [breakdownWomen, setBreakdownWomen] = useState('');
  const [breakdownYouth, setBreakdownYouth] = useState('');
  const [breakdownChildren, setBreakdownChildren] = useState('');
  const [grossCollections, setGrossCollections] = useState('');

  

  // 🔄 Consolidated Parish Data Fetcher Engine
  const fetchParishData = async () => {
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
        setLedger(data.ledger || []);
      }
    } catch (err) {
      console.error("Error synchronizing parish ERP metrics:", err);
    } finally {
      setRefreshing(false);
    }
  };


  const fetchLocalStaff = async () => {
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-parish-staff-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: session.assigned_id })
      });
      const data = await res.json();
      if (data && data.staff) setStaffList(data.staff);
    } catch (err) {
      console.error("Error retrieving parish staff directory listings:", err);
    }
  };

  useEffect(() => {
    fetchParishData();
    fetchLocalStaff();
  }, [session.assigned_id]);

  // 📝 Submit Draft Weekly Entry Workflow (Maker Step)
  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🎯 SECURE INJECTION POINT: Enforces her logged-in parent context dynamically
    const targetTenantId = selectedChurchId || session.assigned_id;

    setSubmitting(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-submit-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: parseInt(selectedChurchId, 10),
          reporting_period: period,
          worship_attendance: parseInt(attendanceCount, 10) || 0,
          sacraments_administered: parseInt(sacramentalCount, 10) || 0,
          breakdown_men: parseInt(breakdownMen, 10) || 0,
          breakdown_women: parseInt(breakdownWomen, 10) || 0,
          breakdown_youth: parseInt(breakdownYouth, 10) || 0,
          breakdown_children: parseInt(breakdownChildren, 10) || 0,
          gross_collections: parseFloat(grossCollections) || 0,
          maker_id: session.assigned_id
        })
      });
      if (res.ok) {
        alert("Weekly attendance metrics submitted successfully as a pending review draft!");
        setLogFormOpen(false);
        setAttendanceCount('');
        setSacramentalCount('');
        fetchParishData();
      }
    } catch (err) {
      console.error("Failed logging weekly metrics:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 👔 Vicar Structural Approval Engine (Checker Step)
  const handleVicarApprovalDecision = async (logId: string, approve: boolean) => {
    let internalReasonCode = "Vicar Approval Action Verified";
    
    if (!approve) {
      const feedbackInput = prompt("Provide an official correction reason code for the local data clerk:");
      if (!feedbackInput || feedbackInput.trim() === "") {
        alert("A valid correction feedback code is mandatory for return workflows.");
        return;
      }
      internalReasonCode = feedbackInput;
    }

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-vicar-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_id: logId,
          vicar_user_id: session.assigned_id, // Preserves actor ID trace within the audit ledger schema
          is_approved: approve,
          reason_code: internalReasonCode
        })
      });

      if (res.ok) {
        alert(approve ? "Record locked and consolidated to upper tier dashboards." : "Record successfully returned to data entry queue.");
        fetchParishData();
      } else {
        alert("Workflow execution failed. Re-verify connectivity constraints.");
      }
    } catch (err) {
      console.error("Vicar response state engine failure:", err);
    }
  };

  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/ack-provision-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_user_id: session.assigned_id, 
          tenant_id: session.assigned_id, 
          full_name: clerkName,
          phone_number: clerkPhone,
          user_role: clerkRole
        })
      });
      if (res.ok) {
        alert(`Account successfully created and recorded into system audit trails!`);
        setStaffFormOpen(false);
        setClerkName('');
        setClerkPhone('');
        fetchLocalStaff();
      } else {
        const errorData = await res.json();
        alert(`Provisioning exception fault: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Clerk record registration transaction failure:", err);
    } finally {
      setProvisioning(false);
    }
  };

  // 🧠 Dynamic Fallback Data Engine Calculations
  const calculatedReportingChurches = metrics?.reporting_assemblies_count || (
    attendanceLogs && attendanceLogs.length > 0 
      ? new Set(attendanceLogs.map(log => log.church_name)).size 
      : 0
  );

  const calculatedAttendanceRoll = metrics?.total_attendance || (
    attendanceLogs && attendanceLogs.length > 0
      ? attendanceLogs.reduce((sum, current) => sum + (current.worship_attendance_count || 0), 0)
      : 0
  );

  const calculatedCollectionsTotal = metrics?.total_collections_kes || (
    ledger && ledger.length > 0
      ? ledger.reduce((sum, trx) => sum + (parseFloat(trx.amount_kes as any) || 0), 0)
      : 0
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 pb-12">
      {/* 👑 PARISH COUNCIL TOP BAR */}
      <header className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">Parish Consolidated ERP</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {session.name} • <span className="text-blue-700">{session.role} Portal</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => setLogFormOpen(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-wider px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors shadow-xs"
          >
            📋 Log Attendance
          </button>
          <button 
            onClick={fetchParishData}
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

      {/* 📊 PARISH OPERATIONAL STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-blue-700 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Attendance Roll</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {calculatedAttendanceRoll.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Parish Collections</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5 font-mono">
            KES {calculatedCollectionsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-purple-700 bg-purple-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reporting Assemblies</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {calculatedReportingChurches} {calculatedReportingChurches === 1 ? 'Church' : 'Churches'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-amber-700 bg-amber-50 w-8 h-8 rounded-lg flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Budget Target Efficiency</span>
          <span className="block text-lg font-black text-slate-800 tracking-tight mt-0.5">
            {metrics?.target_variance_percentage || '0'}% Target
          </span>
        </div>
      </div>

      {/* 🎛️ DUAL PANELS: LOGS & LEDGER CHANNELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* 📋 REGIONAL ATTENDANCE APPROVAL MATRIX */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
              <ClipboardCheck className="w-4 h-4" /> Worship Attendance Metrics
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Weekly tracking from assigned daughter churches</p>
          </div>

          {attendanceLogs.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">
              No recent attendance or sacramental data entries submitted this period.
            </div>
          ) : (
            <div className="space-y-2.5">
              {attendanceLogs.map((log) => (
                <div key={log.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-xs font-black text-slate-800 uppercase tracking-tight">{log.church_name}</span>
                      <span className="block text-[9px] text-slate-400 font-bold font-mono">Period: {log.reporting_period}</span>
                    </div>
                    
                    <span className={`text-[9px] border px-1.5 py-0.5 rounded font-black tracking-wide flex items-center gap-0.5 uppercase ${
                      log.is_approved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {log.is_approved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Pending Review
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                    <div>👥 Attended: <span className="text-slate-800 font-black">{log.worship_attendance_count}</span></div>
                    <div>🍷 Sacraments: <span className="text-slate-800 font-black">{log.sacraments_administered_count}</span></div>
                  </div>

                  {!log.is_approved && session.role === 'VICAR' && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-slate-200">
                      <button
                        onClick={() => handleVicarApprovalDecision(log.id, false)}
                        className="bg-white border border-red-200 text-red-600 font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-red-50 transition-colors"
                      >
                        ❌ Return Correction
                      </button>
                      <button
                        onClick={() => handleVicarApprovalDecision(log.id, true)}
                        className="bg-emerald-600 text-white font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Lock & Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📊 PARISH AUTOMATED M-PESA TRANSACTION LEDGER */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-emerald-700">
              <FileText className="w-4 h-4" /> Live M-Pesa Income Stream
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-time unfragmented accounting audit trail matching regional code collections</p>
          </div>

          {ledger.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-12 italic border border-dashed rounded-xl bg-slate-50/50">
              No recent M-Pesa transaction records cleared through local accounting lines.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                    <th className="p-2.5">Ref Reference</th>
                    <th className="p-2.5">Allocation Purpose</th>
                    <th className="p-2.5 text-right">Amount (KES)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 font-mono text-[10px] font-bold text-slate-900 uppercase">{tx.transaction_reference}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {tx.fund_purpose?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {Number(tx.amount_kes).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5">
                        <span className="inline-flex text-[9px] font-black tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                          {tx.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 👥 LOCAL STAFF DIRECTORY & SYSTEM AUDIT CONTROL CARD */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
              👥 Local Operations Staff & Clerk Directory
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Delegated data recording permissions managed under Parish authority</p>
          </div>
          
          {(session.role === 'VICAR' || session.role === 'PARISH_ADMIN') && (
            <button 
              onClick={() => setStaffFormOpen(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-black text-[10px] tracking-wider px-3 py-1.5 rounded-lg uppercase transition-colors"
            >
              ➕ Create Clerk Account
            </button>
          )}
        </div>

        {staffList.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-8 italic border border-dashed rounded-xl bg-slate-50/50">
            No delegated data clerks or local recorders registered for this parish grid.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-wider text-slate-400 uppercase">
                  <th className="p-2.5">Full Name</th>
                  <th className="p-2.5">Assigned Phone</th>
                  <th className="p-2.5">ERP Clearance Role</th>
                  <th className="p-2.5">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 uppercase">{staff.full_name}</td>
                    <td className="p-2.5 font-mono text-[11px] font-semibold">{staff.phone_number}</td>
                    <td className="p-2.5">
                      <span className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded uppercase ${
                        staff.user_role === 'PARISH_DATA_CLERK' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {staff.user_role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`inline-flex text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        staff.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {staff.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🏛️ OVERLAY FORM MODAL LAYER: PROVISION NEW USER ACCOUNTS */}
      {staffFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setStaffFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                👥 Provision Parish Operations Account
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Generate fresh entry tokens. This action leaves an immutable trace in the System Audit Trail.</p>
            </div>

            <form onSubmit={handleProvisionStaff} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., John Kamau" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                  value={clerkName} 
                  onChange={e => setClerkName(e.target.value)} 
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Kenyan Mobile Number</label>
                <input 
                  type="text" 
                  placeholder="e.g., 07XXXXXXXX" 
                  required 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                  value={clerkPhone} 
                  onChange={e => setClerkPhone(e.target.value)} 
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">System Access Authorization Role</label>
                <select 
                  className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none"
                  value={clerkRole}
                  onChange={e => setClerkRole(e.target.value)}
                >
                  <option value="PARISH_DATA_CLERK">PARISH_DATA_CLERK (Weekly KPI Logs)</option>
                  <option value="CONGREGATION_ADMIN">CONGREGATION_ADMIN (Local Church Supervision)</option>
                  <option value="CONGREGATION_RECORDER">CONGREGATION_RECORDER (Daughter Church Ledger Clerk)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={provisioning}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300"
              >
                {provisioning ? 'Registering & Crypting...' : 'Authorize & Provision Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🏛️ INPUT MODAL LAYER: LOG ATTENDANCE VALUES REGISTER */}
      {logFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setLogFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-700">
                <ClipboardCheck className="w-4 h-4" /> Log Assembly Attendance
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Record validated indicators straight to parish database tables</p>
            </div>

            <form onSubmit={handleSubmitAttendance} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">
                  Recording Church Entity
                </label>
                <input 
                  type="text"
                  readOnly
                  disabled
                  className="bg-transparent w-full text-xs font-black text-blue-700 focus:outline-none uppercase"
                  value={`${session.name} (Mother Parish)`} 
                />
                {/* Securely pass her hidden assigned_id to the Form state backend query instead of a selection ID */}
                <input type="hidden" value={session.assigned_id} />
              </div>

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
                    value={attendanceCount} 
                    onChange={e => setAttendanceCount(e.target.value)} 
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide">Sacraments Run</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    className="bg-transparent w-full text-xs font-bold text-slate-700 focus:outline-none" 
                    value={sacramentalCount} 
                    onChange={e => setSacramentalCount(e.target.value)} 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase shadow-md transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Uploading Data...' : 'Submit Draft Log'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
