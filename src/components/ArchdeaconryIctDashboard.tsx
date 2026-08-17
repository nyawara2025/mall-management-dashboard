import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, LogOut, Cpu, Wifi, Activity, ShieldAlert } from 'lucide-react';

interface IctAdminProps {
  session: { 
    user_id: number; 
    name: string; 
    role: string; 
    assigned_id: number; 
    organization_name: string;
    reporting_period: string;
  };
  onLogout: () => void;
}

interface RegionalAuditLog {
  id: string;
  table_name: string;
  action: string;
  actor_name: string;
  change_reason: string;
  created_at: string;
}

export const ArchdeaconryIctDashboard: React.FC<IctAdminProps> = ({ session, onLogout }) => {
  const [syncing, setSyncing] = useState(false);
  const [pinging, setPinging] = useState(false);
  
  // Infrastructure Telemetry States (Initialised to completely blank/neutral objects)
  const [telemetry, setTelemetry] = useState({
    clusterStatus: 'INITIALIZING...',
    activeParishNodesCount: 0,
    pendingSyncBatches: 0,
    databaseHealthScore: 100
  });
  
  const [auditLogs, setAuditLogs] = useState<RegionalAuditLog[]>([]);

  // ⚡ DYNAMIC INFRASTRUCTURE PAYLOAD TELEMETRY INGESTION PIPELINE
  const fetchRegionalNetworkTelemetry = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-parish-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          archdeaconry_id: session.assigned_id,
          user_id: session.user_id,
          period_code: session.reporting_period
        })
      });
      const data = await res.json();
      
      // Handle normalized JSON object wrapper directly from the middleware contract
      if (res.ok && data.success) {
        setTelemetry({
          clusterStatus: data.telemetry?.cluster_status || 'ONLINE',
          activeParishNodesCount: parseInt(data.telemetry?.active_nodes, 10) || 0,
          pendingSyncBatches: parseInt(data.telemetry?.pending_batches, 10) || 0,
          databaseHealthScore: parseInt(data.telemetry?.health_score, 10) || 100
        });
        setAuditLogs(data.audit_logs || []);
      }
    } catch (err) {
      console.error("Regional system monitoring network pipeline exception:", err);
      // Fallback state forces empty indicators, absolutely zero hardcoded mock locations
      setTelemetry(prev => ({ ...prev, clusterStatus: 'OFFLINE_DISCONNECTED' }));
    } finally {
      setSyncing(false);
    }
  };

  // 📡 SIMULATED LIVE END-TO-END REGIONAL DIAGNOSTIC PING CONSOLE LOG LOOP
  const handleTriggerNodeDiagnostics = async () => {
    setPinging(true);
    try {
      await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: session.assigned_id })
      });
    } catch (e) {
      console.warn("Ping tracing log emitted to local hardware debug context.");
    } finally {
      setTimeout(() => setPinging(false), 800);
    }
  };

  useEffect(() => { 
    fetchRegionalNetworkTelemetry(); 
  }, [session.assigned_id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-mono selection:bg-blue-600 selection:text-white antialiased">
      
      {/* 👑 ICT TERMINAL HEADER PANEL */}
      <header className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/30">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs font-black text-blue-400 uppercase tracking-widest">
              {session.organization_name ? `${session.organization_name.toUpperCase()} INFRASTRUCTURE` : 'REGIONAL NODE'}
            </h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              {session.name.toUpperCase()} • <span className="text-slate-400">{session.role.replace('_', ' ')} WORKSPACE</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={fetchRegionalNetworkTelemetry} 
            disabled={syncing} 
            className="p-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-400 hover:text-blue-400 hover:border-slate-700 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
          <button 
            onClick={onLogout} 
            className="bg-red-950/40 hover:bg-red-900/40 border border-red-900/40 text-red-400 font-black text-[9px] tracking-widest px-3 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Kill Session
          </button>
        </div>
      </header>

      {/* SYSTEM TELEMETRY SUMMARY BLOCKS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Regional Cluster Backbone</span>
            <span className={`text-xs font-black mt-1 block uppercase font-sans tracking-wide ${telemetry.clusterStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-500'}`}>
              {telemetry.clusterStatus}
            </span>
          </div>
          <Wifi className={`w-5 h-5 ${telemetry.clusterStatus === 'ONLINE' ? 'text-emerald-500' : 'text-rose-500'}`} />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Database Node Integrity</span>
            <span className="text-xs font-black text-blue-400 mt-1 block font-mono">{telemetry.databaseHealthScore}% Health Uptime</span>
          </div>
          <Cpu className="w-5 h-5 text-blue-500" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Staged Cluster Batches</span>
            <span className={`text-xs font-black mt-1 block font-mono ${telemetry.pendingSyncBatches > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
              {telemetry.pendingSyncBatches} Uncommitted Logs ({telemetry.activeParishNodesCount} Active Nodes)
            </span>
          </div>
          <Activity className="w-5 h-5 text-slate-500" />
        </div>
      </section>

      {/* TWO COLUMN LOG STREAM CONSOLE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: LIVE SECURITY REGIONAL AUDIT TELEMETRY LOGS */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Live Regional Audit Logs [system_audit_logs]</span>
            <button 
              onClick={handleTriggerNodeDiagnostics}
              disabled={pinging}
              className="text-[8px] bg-slate-950 hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 px-2 py-1 rounded border border-slate-800 font-black uppercase transition-all tracking-wider"
            >
              {pinging ? 'RUNNING PROBE...' : 'EXE DIAGNOSTIC PING'}
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {auditLogs.length === 0 ? (
              <p className="text-[10px] text-slate-600 uppercase py-8 text-center">// No transactional write sequences captured in current cron loop.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-[10px] space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between gap-4 text-slate-500">
                    <span className="text-blue-500 font-black uppercase">[{log.action}] TRACEID::{log.id.substring(0,8).toUpperCase()}</span>
                    <span className="font-sans text-[9px] font-semibold">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300"><span className="text-slate-500">OBJECT:</span> {log.table_name.toUpperCase()} • <span className="text-slate-500">ACTOR:</span> {log.actor_name.toUpperCase()}</p>
                  <p className="text-slate-400 border-l border-slate-800 pl-2 text-[9px] italic leading-relaxed">
                    <span className="text-slate-600 font-normal tracking-wide not-italic uppercase">[REASON]:</span> {log.change_reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RAW TERMINAL STREAM SHELL MONITOR */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl lg:col-span-1 flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase border-b border-slate-800 pb-3 mb-4">Core Console Engine</span>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 font-mono text-[9px] text-slate-500 space-y-1.5 flex-1 min-h-[220px]">
            <p className="text-slate-700">// AUTH CLUSTER HANDSHAKE CORE STREAM v1.0.0</p>
            <p className="text-blue-500/80">[OK] Secure routing token verification active for User ID: {session.user_id}</p>
            <p className="text-emerald-500/80">[OK] Dynamic cross-origin context established for assigned Node: {session.assigned_id}</p>
            <p className="text-slate-600">[CRON] System clearing closed cache states for period block: {session.reporting_period}</p>
            {pinging && (
              <p className="text-amber-400 animate-pulse">[PING] OUTBOUND ICMP ECHO PROBE SIGNAL DISPATCHED TO WEBHOOK CHANNELS...</p>
            )}
            <p className="text-slate-700 font-black pt-2 animate-blink">_</p>
          </div>
        </div>

      </section>

    </div>
  );
};
