import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  CalendarDays, 
  GraduationCap, 
  Megaphone, 
  FileText, 
  ExternalLink,
  Loader2,
  Lock,
  LogOut,
  CreditCard,
  Smartphone,
  ArrowLeft,
  Receipt
} from 'lucide-react';

import { TeacherDashboard } from './teacherdashboard';
import { DriverPortal } from './DriverPortal'; // 🚚 Import DriverPortal component


interface SchoolData {
  id?: string;
  admission_no?: string;
  school_name: string;
  homework: any[];
  bulletin: any[];
  fee_statement?: any[];
}

export const PublicSchoolHub = ({ shopId, user: initialUser }: { shopId: number; user?: any }) => {
  const [data, setData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('parent_token'));

  // NEW: Controls what overlay or sub-page is active
  const [activePortalView, setActivePortalView] = useState<'grid' | 'homework' | 'fees' | 'bulletins' | 'teacher-dashboard' | 'driver-portal'>('grid');     

  // 👇 ADD THIS LOCAL STATE VARIABLE HERE
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);


  // Fee Payment Form Processing States
  const [amount, setAmount] = useState('');
  const [feeCategory, setFeeCategory] = useState('Tuition Fees');
  const [paymentMethod, setPaymentMethod] = useState<'push' | 'manual'>('push');
  const [manualRefCode, setManualRefCode] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isPublicView = urlParams.get('view') === 'public';
  const urlShopId = urlParams.get('shop_id');
  const resolvedShopId = urlShopId ? parseInt(urlShopId, 10) : shopId;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/authenticate-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          shop_id: resolvedShopId // <-- FIX: Guarantees 87 is passed to authentication node
        }),
      });
      

      if (!response.ok) throw new Error('Authentication network request failed.');
      const authResult = await response.json();

      if (authResult.success) {
        // Extract the user data payload returned from the single authentication table
        const userData = authResult.user;

        if (userData?.educational_role === 'teacher') {
          // --- TEACHER ROUTING ---
          localStorage.setItem('teacher_token', authResult.token);
       
          // Hydrate tenant school data so parent-level checks pass
          setData(prevData => ({
            ...prevData,
            school_name: prevData?.school_name || "School Portal",
            homework: [],
            bulletin: []
          }));
 
          setCurrentUser({
            id: userData.id,
            name: userData.full_name || 'Teacher',
            assigned_class: userData.assigned_class || 'General',
            email: userData.email,
            educational_role: 'teacher'
          });
        
          // Force screen transitions
          setIsAuthenticated(true); // Sets authorization state to true 
          setActivePortalView('teacher-dashboard');

        } else if (userData?.educational_role === 'driver') {
          // --- 🚚 NEW: DRIVER ROUTING ---
          localStorage.setItem('driver_token', authResult.token);
       
          // Hydrate generic tenant context structure for the view engine
          setData(prevData => ({
            ...prevData,
            school_name: prevData?.school_name || "Driver Console",
            homework: [],
            bulletin: []
          }));
 
          setCurrentUser({
            id: userData.id,
            name: userData.full_name || 'Driver',
            assigned_route_id: userData.assigned_route_id || '', // Link to specific route tracking row
            email: userData.email,
            educational_role: 'driver',
            shop_id: resolvedShopId
          });
        
          // Force driver panel UI screen transition
          setIsAuthenticated(true); 
          setActivePortalView('driver-portal');

        } else {
          // --- PARENT ROUTING ---
          localStorage.setItem('parent_token', authResult.token);
          setData(authResult.data); // Hydrates original parent context dashboard structures
          setIsAuthenticated(true);
          setActivePortalView('grid');
        }
      } else {
        setAuthError(authResult.message || 'Invalid email or password.');
      }
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };
           

  const handleLogout = () => {
    localStorage.removeItem('parent_token');
    localStorage.removeItem('teacher_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActivePortalView('grid');
    setData(null);
  };

  useEffect(() => {
    if (!isAuthenticated && !isPublicView) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('parent_token');
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-data', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            shop_id: resolvedShopId, // <-- FIX: Uses the reactive parsed ID parameter variable
            is_public: isPublicView 
          }),
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        const result = await response.json();
        const finalData = Array.isArray(result) ? result : result;
        setData(finalData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, isPublicView, resolvedShopId]); // <-- FIX: Listens properly to re-fetch when tenant URL changes



  // 2. CRITICAL CHANGE: PLACE THE PUBLIC VIEW CHECK ABOVE THE AUTHENTICATION GUARD
  if (isPublicView) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-200">
        
        {/* DYNAMIC HEADER */}
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl">
          <h2 className="text-3xl font-black tracking-tight">
            {data?.school_name || 'Loading Institution Details...'}
          </h2>
          <p className="text-indigo-100 text-sm mt-1">Welcome to our Public Information Hub</p>
        </div>

        {/* DYNAMIC BULLETIN ENGINE LOOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-sm font-bold text-gray-400 animate-pulse uppercase">
              Fetching public board entries...
            </div>
          ) : data?.bulletin && data.bulletin.length > 0 ? (
            data.bulletin.map((item: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.content}</p>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-white p-8 rounded-2xl border border-gray-100 text-center opacity-50">
              <p className="text-xs italic text-gray-400">No public updates or notice entries published at this time.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 mb-2">School Portal</h2>
          <p className="text-slate-500 text-center text-sm mb-8">Please sign in to access school records.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOADING VIEW
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Loading Student Portal...</p>
      </div>
    );
  }


  // 👇 INSERT NEW TEACHER ROUTE HERE (Right before standard data check)
  if (activePortalView === 'teacher-dashboard') {
    return (
      <TeacherDashboard 
        shopId={shopId} 
        onBack={handleLogout}
        schoolName={data?.school_name || "Institution Space"} // 👈 ADD THIS PROPLINE 
        teacherUser={{
          id: currentUser?.id || 'unknown',
          name: currentUser?.name || 'Teacher',
          assigned_class: currentUser?.assigned_class || 'General',
          email: currentUser?.email || '',
        }}
      />
    );
  }

  // 🚚 NEW DRIVER ROUTE: Intercepts and renders the full console cleanly
  if (activePortalView === 'driver-portal') {
    return (
      <DriverPortal 
        user={currentUser} 
        shopId={shopId} 
        onLogout={handleLogout} 
      />
    );
  }

  if (!data) return <div className="p-20 text-center text-slate-500">No data found for this school.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HERO HEADER */}
        <header className="text-center mb-12 relative">
          <button 
            type="button"
            onClick={handleLogout}
            className="absolute right-0 top-0 p-3 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <LogOut size={18} /> Logout
          </button>
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {data?.school_name || 'School Dashboard'}
          </h1>
          <div className="inline-block mt-2 px-4 py-1 bg-white rounded-full border border-slate-200">
            <p className="text-blue-600 font-bold tracking-widest uppercase text-[10px]">
              TeNEAR Education Space
            </p>
          </div>
        </header>

        {/* --- DYNAMIC STAKEHOLDER WORKSPACE ROUTER --- */}
        
        {/* VIEW 1: THE REPLICA MATRIX GRID MENU */}
        {activePortalView === 'grid' && (
          <div className="max-w-md mx-auto space-y-6 text-center animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-4">
              
              {/* Card 1: Homework */}
              <button 
                type="button"
                onClick={() => setActivePortalView('homework')}
                className="bg-blue-50/40 hover:bg-blue-100/60 border border-blue-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all aspect-square text-center group shadow-sm"
              >
                <div className="p-4 bg-white rounded-2xl text-blue-600 shadow-sm group-hover:scale-105 transition-transform"><BookOpen size={24} /></div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-tight">Assignments &<br/>Homework</span>
              </button>

              {/* Card 2: Bulletins */}
              <button 
                type="button"
                onClick={() => setActivePortalView('bulletins')}
                className="bg-purple-50/40 hover:bg-purple-100/60 border border-purple-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all aspect-square text-center group shadow-sm"
              >
                <div className="p-4 bg-white rounded-2xl text-purple-600 shadow-sm group-hover:scale-105 transition-transform"><Megaphone size={24} /></div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-tight">Bulletins &<br/>Notices</span>
              </button>

              {/* Card 3: Fees Tracker Terminal */}
              <button 
                type="button"
                onClick={() => setActivePortalView('fees')}
                className="bg-emerald-50/40 hover:bg-emerald-100/60 border border-emerald-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all aspect-square text-center group shadow-sm"
              >
                <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm group-hover:scale-105 transition-transform"><CreditCard size={24} /></div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-tight">Fees &<br/>Payments</span>
              </button>

              {/* Card 4: Attendance Placeholder */}
              <button 
                type="button"
                onClick={() => alert("Daily roll tracking records coming soon!")}
                className="bg-orange-50/40 hover:bg-orange-100/60 border border-orange-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all aspect-square text-center group shadow-sm"
              >
                <div className="p-4 bg-white rounded-2xl text-orange-600 shadow-sm group-hover:scale-105 transition-transform"><CalendarDays size={24} /></div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-tight">Attendance<br/>Records</span>
              </button>

              {/* Card 5: Transport Placeholder */}
              <button 
                type="button"
                onClick={() => alert("Bus shuttle route tracking coming soon!")}
                className="bg-amber-50/40 hover:bg-amber-100/60 border border-amber-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all aspect-square text-center group shadow-sm"
              >
                <div className="p-4 bg-white rounded-2xl text-amber-600 shadow-sm group-hover:scale-105 transition-transform"><FileText size={24} /></div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-tight">Transport &<br/>Shuttles</span>
              </button>

              {/* Card 6: Report Cards Placeholder */}
              <button 
                type="button"
                onClick={() => alert("Academic examination statements coming soon!")}
                className="bg-indigo-50/40 hover:bg-indigo-100/60 border border-indigo-100 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all aspect-square text-center group shadow-sm"
              >
                <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm group-hover:scale-105 transition-transform"><GraduationCap size={24} /></div>
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-tight">Exams &<br/>Report Cards</span>
              </button>

            </div>
          </div>
        )}

        {/* VIEW 2: SUB PANEL - ACTIVE FEES & PAYMENTS BLOCK */}
        {activePortalView === 'fees' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-in fade-in duration-200">
            <div className="col-span-1 md:col-span-3">
              <button 
                type="button" 
                onClick={() => setActivePortalView('grid')}
                className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1.5"
              >
                &larr; Back to Dashboard Menu
              </button>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Remit Tuition Fees</h3>
                <p className="text-xs text-slate-400 mt-0.5">Specify an account payload contribution amount to initialize payment.</p>
              </div>

              <div className="relative">
                <span className="absolute left-5 top-5 text-gray-400 font-bold">KES</span>
                <input 
                  type="number" 
                  placeholder="Amount" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 p-5 pl-16 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                <button type="button" onClick={() => setPaymentMethod('push')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${paymentMethod === 'push' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}><Smartphone size={14} className="inline mr-1" /> STK PUSH</button>
                <button type="button" onClick={() => setPaymentMethod('manual')} className={`flex-1 py-2.5 rounded-lg text-xs font-black transition-all ${paymentMethod === 'manual' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}><CreditCard size={14} className="inline mr-1" /> MANUAL RECEIPT</button>
              </div>

              {paymentMethod === 'manual' && (
                <input type="text" placeholder="ENTER TRANSACTION CODE" value={manualRefCode} onChange={e => setManualRefCode(e.target.value)} className="w-full bg-slate-50 p-4 border rounded-xl font-mono font-bold uppercase text-center tracking-widest text-xs" required />
              )}

              <button 
                type="button" 
                disabled={paymentLoading || !amount}
                onClick={async () => {
                  setPaymentLoading(true);
                  try {
                    await fetch('https://n8n.tenear.com/webhook/post-to-school-fees', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        amount: amount,
                        payment_type: paymentMethod,
                        reference_code: manualRefCode,
                        shop_id: shopId,
                        // CRITICAL FIX: Explicitly send the true primary database keys & fields
                        student_id: data?.id || null, // Forwards their actual Supabase UUID character string
                        admission_no: data?.admission_no || null,
                        school_term: "Term 2" // Passes current active calendar term directly
                      }),
                    });
                    alert("Fee parameters synchronized successfully.");
                    setAmount(''); setManualRefCode('');
                  } catch (e) { console.error(e); } finally { setPaymentLoading(false); }
                }}
                className="w-full bg-blue-600 text-white font-black py-4.5 rounded-2xl text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-100 transition-all disabled:opacity-40"
              >
                {paymentLoading ? 'Processing Verification...' : 'Authorize Fee Remittance'}
              </button>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-fit space-y-5">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Statement Summary</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Live Ledger Accounting</p>
              </div>

              {/* FINANCIAL METRICS CALCULATION CARDS */}
              {data?.fee_statement && data.fee_statement.length > 0 ? (() => {
  
                // 1. CASH REMITTANCES / PAYMENTS RECEIVED
                // Explicitly sums payments by parsing string decimals directly into true numeric floats
                const totalPaid = data.fee_statement
                  .filter((row: any) => {
                    const type = String(row.transaction_type || '').toLowerCase().trim();
                    return type === 'push' || type === 'manual' || type === 'payment' || type === 'credit';
                  })
                  .reduce((sum: number, row: any) => {
                    const parsedAmount = parseFloat(String(row.amount || '0'));
                    return sum + (isNaN(parsedAmount) ? 0 : Math.abs(parsedAmount));
                  }, 0);

                // 2. INVOICES / BILLING CARDS
                // Explicitly sums invoices with identical defensive float casting rules
                const totalInvoiced = data.fee_statement
                  .filter((row: any) => {
                    const type = String(row.transaction_type || '').toLowerCase().trim();
                    if (type === 'push' || type === 'manual' || type === 'payment' || type === 'credit') {
                      return false;
                    }
                    return type === 'invoice' || type === 'debit';
                  })
                  .reduce((sum: number, row: any) => {
                    const parsedAmount = parseFloat(String(row.amount || '0'));
                    return sum + (isNaN(parsedAmount) ? 0 : Math.abs(parsedAmount));
                  }, 0);

                const netBalance = totalInvoiced - totalPaid;

                return (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Outstanding Running Balance Badge */}
                    <div className={`p-4 rounded-2xl border text-left ${netBalance > 0 ? 'bg-red-50/40 border-red-100/60' : 'bg-emerald-50/40 border-emerald-100/60'}`}>
                      <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Net Outstanding Balance</span>
                      <span className={`text-xl font-black ${netBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        KES {netBalance.toLocaleString()}
                      </span>
                    </div>

                    {/* Mini Breakdown Flex Row grid layout */}
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[8px] font-black text-gray-400 block uppercase">Total Billed</span>
                        <span className="text-xs font-black text-slate-700">KES {totalInvoiced.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[8px] font-black text-gray-400 block uppercase">Total Remitted</span>
                        <span className="text-xs font-black text-slate-700">KES {totalPaid.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* SCROLLING ITEMIZED HISTORICAL LEDGER GRID */}
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Transaction Logs</span>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {[...data.fee_statement]
                          .sort((a, b) => {
                            const timeB = new Date(b.transaction_date || b.created_at || 0).getTime();
                            const timeA = new Date(a.transaction_date || a.created_at || 0).getTime();
                            return timeB - timeA;
                          })
                          .map((row: any, idx: number) => {
                            const type = String(row.transaction_type || '').toLowerCase().trim();
    
                            // Strict conditional assessment: It is only an invoice if it matches these exact strings
                            const isInvoice = type === 'invoice' || type === 'debit';
    
                            const rawDate = row.transaction_date || row.created_at;
                            const cleanDateString = rawDate && typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate;
                            const parsedDate = cleanDateString ? new Date(cleanDateString) : null;

                            return (
                              <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center text-xs shadow-sm hover:bg-slate-50/50 transition-colors">
                                <div className="text-left">
                                  <p className="font-black text-slate-800 leading-tight">
                                    {row.fee_category || row.description || 'Tuition Fee'}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                                    {parsedDate && !isNaN(parsedDate.getTime()) 
                                      ? parsedDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                      : 'Active Term'}
                                    {row.reference_number && ` • Ref: ${row.reference_number}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-black ${isInvoice ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {isInvoice ? '-' : '+'} KES {Math.abs(Number(row.amount || 0)).toLocaleString()}
                                  </p>
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${isInvoice ? 'bg-red-50 text-red-600 border border-red-100/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100/40'}`}>
                                    {isInvoice ? 'Debit' : 'Credit'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}


                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed text-center">
                  <p className="text-xs italic text-gray-400 max-w-[180px] mx-auto leading-relaxed">
                    No payment data lines ledger recorded this term.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* VIEW 3: SUB PANEL - ASSIGNMENTS & HOMEWORK LAYOUT */}
        {activePortalView === 'homework' && (
          <div className="max-w-2xl mx-auto space-y-4 text-left animate-in fade-in duration-200">
            <div className="mb-2">
              <button 
                type="button" 
                onClick={() => setActivePortalView('grid')} 
                className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1.5"
              >
                &larr; Back to Menu
              </button>
            </div>
            {data?.homework && data.homework.length > 0 ? (
              data.homework.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100 uppercase">
                    {item.subject}
                  </span>
                  <h4 className="font-black text-slate-800 text-base mt-2 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-bold">Due Threshold: {item.date}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-xs italic text-gray-400">No active assignment tasks published today.</p>
            )}
          </div>
        )}

        {/* VIEW 4: SUB PANEL - BULLETINS & BOARD NOTICES */}
        {activePortalView === 'bulletins' && (
          <div className="max-w-2xl mx-auto space-y-4 text-left animate-in fade-in duration-200">
            <div className="mb-2">
              <button 
                type="button" 
                onClick={() => setActivePortalView('grid')} 
                className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1.5"
              >
                &larr; Back to Menu
              </button>
            </div>
            {data?.bulletin && data.bulletin.length > 0 ? (
              data.bulletin.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-800 text-sm mb-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.content}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-xs italic text-gray-400">No notice board announcements published this month.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
