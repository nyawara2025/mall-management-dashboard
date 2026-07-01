import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Send, Plus, Trash2, LayoutGrid, Type, Megaphone, Bell, Users, 
  CheckCircle, Clock, Paperclip, Bus, MessageCircle, GraduationCap, 
  ClipboardCheck, CreditCard, RefreshCw, Image as ImageIcon, X,
  Download, Printer, Search, ArrowLeft
} from 'lucide-react';

import { SchoolBranding } from './SchoolBranding';

import { useAuth } from '../contexts/AuthContext';

import { TransportMapModal } from './TransportMapModal';

interface Activity {
  activity_name: string;
  description: string;
}


// 📋 Type-safe structural mapping for administrative ledger entries
interface MarkRecord {
  id: string;
  student_name: string;
  admission_no: string;
  class_id: string;
  subject: string;
  score: number;
  term_date: string;
  created_at: string;
}

export const EducationalDashboard = ({ shopId }: { shopId: number }) => {
  const { user } = useAuth(); // 🌟 Extract the logged-in user profile payload securely
  
  // Extract parameters cleanly with defensive defaults
  const schoolName = (user as any)?.shop || "";
  const logoUrl = (user as any)?.logoUrl || "";


  const [loading, setLoading] = useState(false);
  const [bulletinLoading, setBulletinLoading] = useState(false);
  
  const [totalCollected, setTotalCollected] = useState<number>(42500); 
  const [totalOutstanding, setTotalOutstanding] = useState<number>(12400); 

  // 🛠️ REFACTORED: Tab tracking state ('dashboard' or 'admin-marks')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin-marks'>('dashboard');
 
  // --- Live Mapping Window State Trackers ---
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeTrackingRoute, setActiveTrackingRoute] = useState<any | null>(null);

  // --- Driver Tracking Mode States ---
  const [isStreamingLocation, setIsStreamingLocation] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- New Student Registration Form States ---
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regAdmissionNo, setRegAdmissionNo] = useState('');
  const [regAssignedClass, setRegAssignedClass] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regParentContact, setRegParentContact] = useState('');

    // --- Student Database Module States ---
  const [dbViewActive, setDbViewActive] = useState(false);
  const [dbStudentsList, setDbStudentsList] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  
  // Inline profile editing state references
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editClass, setEditClass] = useState('');

  // --- Expanded Inline Database Editing States ---
  const [editParentFirstName, setEditParentFirstName] = useState('');
  const [editParentLastName, setEditParentLastName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editParentEmail, setEditParentEmail] = useState('');
  const [editAssignedRouteId, setEditAssignedRouteId] = useState('');

  // --- Expanded Student Registration States ---
  const [regResidentialArea, setRegResidentialArea] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regParentType, setRegParentType] = useState('Father');
  const [regParentFirstName, setRegParentFirstName] = useState('');
  const [regParentLastName, setRegParentLastName] = useState('');
  const [regParentEmail, setRegParentEmail] = useState('');
  const [regAssignedRouteId, setRegAssignedRouteId] = useState('');

  // 🛠️ REFACTORED: Administrative Records analytics states
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const stats = [
    {
      label: "Total Students",
      value: "124",
      icon: Users,
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      label: "Homework Sent",
      value: "12",
      icon: BookOpen,
      bg: "bg-green-50",
      color: "text-green-600"
    },
    {
      label: "Submissions",
      value: "85%",
      icon: CheckCircle,
      bg: "bg-purple-50",
      color: "text-purple-600"
    },
    {
      label: "Pending Review",
      value: "8",
      icon: Clock,
      bg: "bg-orange-50",
      color: "text-orange-600"
    }
  ];

  // --- Bulletin State (Enhanced with Files) ---
  const [bulletin, setBulletin] = useState({ title: '', content: '' });
  const [bulletinFile, setBulletinFile] = useState<{name: string, data: string} | null>(null);
  const [bulletinImage, setBulletinImage] = useState<{name: string, data: string} | null>(null);

  // --- Enhanced Transport State Management ---
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [transportLoading, setTransportLoading] = useState(false);
  const [selectedActiveRoute, setSelectedActiveRoute] = useState<any | null>(null);

  // Automatically fetch transit metrics on baseline grid compilation
  useEffect(() => {
    async function fetchTransitLedger() {
      setTransportLoading(true);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/transport-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId })
        });
        if (response.ok) {
          const data = await response.json();
          setRoutesList(Array.isArray(data) ? data : []);
        }
      } catch (err) { console.error("Error fetching transit parameters:", err); }
      finally { setTransportLoading(false); }
    }
    fetchTransitLedger();
  }, [shopId]);


  const transmitCurrentGPSPosition = (routeId: string) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 📡 Clean, type-safe payload matching your n8n query structure
          await fetch('https://n8n.tenear.com/webhook/transmit-current-GPS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shop_id: shopId,
              route_id: routeId,
              latitude: position.coords.latitude,   // Raw numeric float
              longitude: position.coords.longitude // Raw numeric float
            })
          });
          console.log(`GPS Stream Sync: ${position.coords.latitude}, ${position.coords.longitude}`);
        } catch (err) {
          console.error("Telemetry upload failed:", err);
        }
      },
      (error) => {
        console.error("GPS Sensor error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleLocationStreaming = (routeId: string) => {
    if (isStreamingLocation) {
      // Turn off streaming and wipe tracking loops
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      setIsStreamingLocation(false);
      setSelectedRouteId('');
      alert("Transit tracking stream closed.");
    } else {
      if (!routeId) return alert("Please select a route target to initialize telemetry.");
      
      setIsStreamingLocation(true);
      setSelectedRouteId(routeId);
      
      // Fire an immediate transmission fix
      transmitCurrentGPSPosition(routeId);
      
      // Hook a background timer loop to broadcast every 20 seconds
      trackingIntervalRef.current = setInterval(() => {
        transmitCurrentGPSPosition(routeId);
      }, 20000);
      
      alert("Live transit link active! Keep this browser window open while driving.");
    }
  };

  // Clean up the browser timer if the component unmounts
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, []);


  // 🛠️ REFACTORED: Automated fetch effect hook tied to administrative view transition
  useEffect(() => {
    if (activeTab !== 'admin-marks') return;

    async function fetchAllCompiledMarks() {
      setMarksLoading(true);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-school-marks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId })
        });
        if (response.ok) {
          const result = await response.json();
          setMarks(Array.isArray(result) ? result : result.marks || []);
        }
      } catch (err) {
        console.error("Error fetching admin metrics ledger:", err);
      } finally {
        setMarksLoading(false);
      }
    }

    fetchAllCompiledMarks();
  }, [activeTab, shopId]);

  // Helper to convert files for the webhook
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const base64 = await convertToBase64(file);
    if (type === 'file') setBulletinFile({ name: file.name, data: base64 });
    else setBulletinImage({ name: file.name, data: base64 });
  };


  // 1. Fetch entire tenant roster list
  const fetchTenantStudentsDatabase = async () => {
    setDbLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/view-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId })
      });
      if (response.ok) {
        const data = await response.json();
        setDbStudentsList(Array.isArray(data) ? data : data.students || []);
        setDbViewActive(true);
      }
    } catch (err) {
      console.error("Database connection fault:", err);
    } finally {
      setDbLoading(false);
    }
  };

  // 2. Commit inline modifications
  const handleUpdateStudentRow = async (studentId: string) => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/update-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          student_id: studentId,
          first_name: editFirstName,
          last_name: editLastName,
          class_id: editClass,
          parent_first_name: editParentFirstName,
          parent_last_name: editParentLastName,
          parent_phone: editParentPhone,
          parent_email: editParentEmail,
          assigned_route_id: editAssignedRouteId || null
        })
      });
      if (response.ok) {
        alert("Record updated successfully!");
        setEditingStudentId(null);
        fetchTenantStudentsDatabase(); // Refresh current data layout
      }
    } catch (err) { console.error(err); }
  };

  // 3. Remove a student completely from records
  const handleDeleteStudentRow = async (studentId: string) => {
    if (!confirm("Are you sure you want to completely delete this student record? This cannot be undone.")) return;
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/delete-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, student_id: studentId })
      });
      if (response.ok) {
        alert("Record deleted from active tables.");
        fetchTenantStudentsDatabase();
      }
    } catch (err) { console.error(err); }
  };


  const handlePostBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulletinLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/upload-school-bulletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          title: bulletin.title,
          content: bulletin.content,
          attachment_doc: bulletinFile, 
          attachment_img: bulletinImage, 
          date_posted: new Date().toISOString()
        }),
      });
      if (response.ok) {
        alert("Bulletin with attachments posted!");
        setBulletin({ title: '', content: '' });
        setBulletinFile(null);
        setBulletinImage(null);
      }
    } catch (error) { console.error(error); } finally { setBulletinLoading(false); }
  };

  const handleFetchFees = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-fees-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.total_collected !== undefined) setTotalCollected(Number(data.total_collected));
        if (data.total_outstanding !== undefined) setTotalOutstanding(Number(data.total_outstanding));
        alert("Fees tracking parameters synchronized with Supabase!");
      }
    } catch (error) {
      console.error("Failed to fetch fees metrics from backend gateway:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerWhatsAppAlert = async (type: string) => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-whatsappalert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, alert_type: type }),
      });
      if (response.ok) alert(`WhatsApp ${type} alert sent!`);
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
  };

  const handleGeneralAction = (action: string) => {
    alert(`${action} module coming soon!`);
  };

  // ✅ THE UPDATED REGISTER STUDENT HANDLER BLOCK
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find the readable name of the selected route to pass down alongside the ID
    const selectedRouteObj = routesList.find(r => r.route_id === regAssignedRouteId);
    const assignedRouteName = selectedRouteObj ? selectedRouteObj.route_name : 'No Transport Assigned';

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/school-register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          first_name: regFirstName,
          last_name: regLastName,
          admission_no: regAdmissionNo,
          class_id: regAssignedClass,
          gender: regGender,
          dob: regDob,
          residential_area: regResidentialArea,
          parent_type: regParentType,
          parent_first_name: regParentFirstName,
          parent_last_name: regParentLastName,
          parent_phone: regParentContact,
          parent_email: regParentEmail,
          assigned_route_id: regAssignedRouteId || null,
          assigned_route_name: assignedRouteName,
          registration_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert("Student registered and synced to Supabase database successfully!");
        // Clear all form inputs cleanly on success resolution
        setRegFirstName('');
        setRegLastName('');
        setRegAdmissionNo('');
        setRegAssignedClass('');
        setRegParentFirstName(''); setRegParentLastName('');
        setRegGender('Male');
        setRegParentContact('');
        setIsRegisterModalOpen(false); // Close the overlay form
      } else {
        alert("Server validation failed. Please check input parameters.");
      }
    } catch (error) {
      console.error("Registration engine transmission error failed:", error);
      alert("Network transmission error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
 
      {/* 🌟 Isolated Multi-Tenant Branding Engine */}
      <SchoolBranding departmentName="Campus Operations Dashboard" />

      {/* --- Metrics Header Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 text-left">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <IconComponent size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-2xl font-black text-gray-800 mt-0.5">{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- VIEW A: OPERATIONAL DASHBOARD PANELS --- */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Examination Management Card */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
            <div className="mb-8">
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <ClipboardCheck className="text-indigo-600" size={28} /> Examinations
              </h3>
              <p className="text-gray-500">Manage schedules & publish results</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div 
                onClick={() => setActiveTab('admin-marks')}
                className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group"
              >
                <GraduationCap className="text-gray-400 group-hover:text-indigo-500 mb-3" size={32} />
                <h4 className="font-bold text-gray-800">Input & Review Exam Marks</h4>
                <p className="text-xs text-gray-400">Record and filter scores for midterm/finals</p>
              </div>
              <div 
                onClick={() => setActiveTab('admin-marks')}
                className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group"
              >
                <Send className="text-gray-400 group-hover:text-indigo-500 mb-3" size={32} />
                <h4 className="font-bold text-gray-800">Extract Performance Reports</h4>
                <p className="text-xs text-gray-400">Print matrices or export tabular logs</p>
              </div>
            </div>
          </div>

          {/* Student Registration & Management Card */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                  <Users className="text-emerald-600" size={28} /> Students
                </h3>
                <p className="text-gray-500">Registration & Records</p>
              </div>
              <button onClick={() => handleGeneralAction('Student List')} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors">View All</button>
            </div>

            <div className="flex flex-col gap-4">
              <div onClick={() => setIsRegisterModalOpen(true)} className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer group flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors"><Plus className="text-emerald-600" size={24} /></div>
                <div>
                  <h4 className="font-bold text-gray-800">Register Student</h4>
                  <p className="text-xs text-gray-400">Enroll new learners to system</p>
                </div>
              </div>

              {/* 🛠️ FIXED: Triggers active database compilation sync on row click */}
              <div onClick={fetchTenantStudentsDatabase} className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer group flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <LayoutGrid className="text-gray-400 group-hover:text-emerald-600" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Student Database</h4>
                  <p className="text-xs text-gray-400">Edit info, classes, & status</p>
                </div>
              </div>
            </div>
          </div>


          {/* Bulletin Card with File Uploads */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
            <div className="mb-8">
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <Megaphone className="text-purple-600" size={28} /> Bulletin
              </h3>
              <p className="text-gray-500">Send updates to all parents</p>
            </div>

            <form onSubmit={handlePostBulletin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bulletin Title</label>
                <input className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold" placeholder="e.g. Sports Day Update" value={bulletin.title} onChange={e => setBulletin({...bulletin, title: e.target.value})} required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Content</label>
                <textarea className="w-full p-3 bg-gray-50 border-none rounded-xl text-gray-700" placeholder="Write your announcement here..." rows={6} value={bulletin.content} onChange={e => setBulletin({...bulletin, content: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <Paperclip size={20} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-500">Add Document</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'file')} accept=".pdf,.doc,.docx" />
                </label>
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <ImageIcon size={20} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-bold text-gray-500">Add Image</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" />
                </label>
              </div>

              {/* Selected Files Preview */}
              {(bulletinFile || bulletinImage) && (
                <div className="space-y-2 p-3 bg-purple-50 rounded-xl">
                  {bulletinFile && (
                    <div className="flex justify-between items-center text-[11px] font-bold text-purple-700">
                      <span className="truncate max-w-[150px]">📄 {bulletinFile.name}</span>
                      <button type="button" onClick={() => setBulletinFile(null)}><X size={14}/></button>
                    </div>
                  )}
                  {bulletinImage && (
                    <div className="flex justify-between items-center text-[11px] font-bold text-purple-700">
                      <span className="truncate max-w-[150px]">🖼️ {bulletinImage.name}</span>
                      <button type="button" onClick={() => setBulletinImage(null)}><X size={14}/></button>
                    </div>
                  )}
                </div>
              )}

              <button disabled={bulletinLoading} className="w-full bg-purple-600 text-white p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-purple-700 transition-all disabled:opacity-50 mt-4">
                {bulletinLoading ? 'Sending...' : <><Bell size={20} /> Post Bulletin</>}
              </button>
            </form>
          </div>

          {/* Transport Management Card */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
            <div className="mb-6">
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <Bus className="text-orange-500" size={28} /> Transport Fleet Index
              </h3>
              <p className="text-gray-500">Monitor active routes & broadcast updates to parents.</p>
            </div>

            {/* --- START OF TERNARY STATEMENT --- */}
            {transportLoading ? (
              <p className="text-center py-6 text-xs font-bold text-gray-400 animate-pulse">POLLING FLEET COORDINATES...</p>
            ) : routesList.length === 0 ? (
              <p className="text-center py-6 text-xs italic text-gray-400">No transit routes configured for this station space.</p>
            ) : (
              <div className="space-y-4">
                {routesList.map((route) => (
                  <div key={route.route_id} className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-orange-700 uppercase tracking-wide">
                        {route.route_name} ({route.fleet_mode})
                      </span>
                      <span className={`flex h-2 w-2 rounded-full ${route.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    </div>
          
                    <div className="text-xs text-gray-600 space-y-0.5 font-medium">
                      <p>Driver: <span className="font-bold text-gray-800">{route.driver_name}</span></p>
                      <p>Ridership volume: <span className="font-bold text-gray-800">{route.student_count} Students</span></p>
                      {route.last_latitude && (
                        <p className="text-[10px] text-blue-600 font-mono font-bold mt-1">
                          📡 GPS Fix: {route.last_latitude}, {route.last_longitude}
                        </p>
                      )}
                    </div>
  
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        onClick={() => triggerWhatsAppAlert(route.route_id)} 
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <MessageCircle size={13} /> Notify Parents
                      </button>
            
                      <button 
                        type="button"
                        disabled={!route.last_latitude}
                        onClick={() => {
                          setActiveTrackingRoute(route);
                          setIsMapModalOpen(true);
                        }}
                        className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        📍 Track Fleet
                      </button>
                    </div>

                    <button 
                      onClick={() => triggerWhatsAppAlert(route.route_id)} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <MessageCircle size={14} /> Notify Fleet Group
                    </button>
                  </div>
                ))}
              </div>
            )} 
            {/* --- END OF TERNARY STATEMENT --- */}

            {/* 🛠️ NEW: NATIVE DRIVER TESTING PANEL (Moved cleanly outside the conditional rendering blocks) */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 bg-slate-50 p-4 rounded-2xl">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Driver Simulation Console</h4>
                <p className="text-[10px] text-slate-400 font-medium">Test real phone GPS tracking directly in your platform.</p>
              </div>

              {!isStreamingLocation && (
                <select 
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">-- Choose Route to Simulate --</option>
                  {routesList.map(r => (
                    <option key={r.route_id} value={r.route_id}>{r.route_name} ({r.driver_name})</option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => toggleLocationStreaming(selectedRouteId)}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isStreamingLocation 
                    ? 'bg-red-600 text-white animate-pulse hover:bg-red-700' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isStreamingLocation ? '⏹️ Stop Location Sharing' : '🚀 Start Phone GPS Stream'}
              </button>
            </div>

          </div>
 



          {/* School Fees Management Card */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit text-left">
            <div className="mb-6 text-left">
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <CreditCard className="text-emerald-600" size={28} /> Fees Tracker
              </h3>
              <p className="text-gray-500">Collection & Arrears</p>
            </div>

            <div className="space-y-6 text-left">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Total Collected</p>
                  <p className="text-2xl font-black text-slate-800">
                    KES {totalCollected.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase text-red-400">Outstanding</p>
                  <p className="text-2xl font-black text-red-800">
                    KES {totalOutstanding.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 📊 Dynamic Progress Bar Calculation */}
              {(() => {
                const totalSum = totalCollected + totalOutstanding;
                const percentage = totalSum > 0 ? Math.round((totalCollected / totalSum) * 100) : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold text-right">{percentage}% Collection Target Reached</p>
                  </div>
                );
              })()}

              <button 
                type="button"
                disabled={loading}
                onClick={() => handleFetchFees()}
                className="w-full border-2 border-emerald-600 text-emerald-600 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing..." : "Sync Supabase Data"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- VIEW B: ADMINISTRATIVE MARKS LEDGER SUITE --- */}
      {activeTab === 'admin-marks' && (
        <div className="space-y-6 text-left animate-in fade-in duration-200">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
            <div>
              <button onClick={() => setActiveTab('dashboard')} className="mb-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                &larr; Back to Operational Grid
              </button>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Academic Records Ledger</h2>
              <p className="text-xs text-gray-400">View, audit, and extract compiled multi-tenant exam metrics.</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                <Printer size={14} /> Print Ledger
              </button>
              <button 
                onClick={() => {
                  if (marks.length === 0) return alert("No evaluation data logs available to extract.");
                  const headers = ["Student Name", "Admission No", "Class/Stream", "Subject", "Score Metric", "Date Registered"];
                  const filteredRecords = marks.filter(item => {
                    const matchesSearch = item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.admission_no?.includes(searchTerm);
                    const matchesClass = selectedClass === 'All' || item.class_id === selectedClass;
                    const matchesSubj = selectedSubject === 'All' || item.subject === selectedSubject;
                    return matchesSearch && matchesClass && matchesSubj;
                  });
                  if (filteredRecords.length === 0) return alert("No data metrics found within current filter configurations.");
                  const rows = filteredRecords.map(m => [`"${m.student_name}"`, `"${m.admission_no}"`, `"${m.class_id}"`, `"${m.subject}"`, `"${m.score}%"`, `"${m.term_date || ''}"`]);
                  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csvContent));
                  link.setAttribute("download", `Academic_Marks_Report_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link); link.click(); document.body.removeChild(link);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-100"
              >
                <Download size={14} /> Export CSV Document
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-md">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student name or admission..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full text-xs font-bold px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-600">
                <option value="All">All Grades & Streams</option>
                {Array.from(new Set(marks.map(m => m.class_id))).filter(Boolean).map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full text-xs font-bold px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-600">
                <option value="All">All Evaluated Subjects</option>
                {Array.from(new Set(marks.map(m => m.subject))).filter(Boolean).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 📊 NEW: DYNAMIC STATISTICAL AGGREGATION PANEL */}
          {(() => {
            // Extract the exact subset matching active filters
            const filteredList = marks.filter(item => {
              const matchesSearch = item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.admission_no?.includes(searchTerm);
              const matchesClass = selectedClass === 'All' || item.class_id === selectedClass;
              const matchesSubj = selectedSubject === 'All' || item.subject === selectedSubject;
              return matchesSearch && matchesClass && matchesSubj;
            });

            const totalPapers = filteredList.length;
              
            // Calculate average score dynamically
            const meanScore = totalPapers > 0 
              ? Math.round(filteredList.reduce((sum, item) => sum + (item.score || 0), 0) / totalPapers) 
              : 0;

            // Calculate pass rate percentage based on Kenyan 50% threshold benchmarks
            const totalPassed = filteredList.filter(item => (item.score || 0) >= 50).length;
            const passRate = totalPapers > 0 ? Math.round((totalPassed / totalPapers) * 100) : 0;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-left flex flex-col justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Assessed Entries</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800">{totalPapers}</span>
                    <span className="text-xs font-bold text-slate-400">Graded Papers</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-left flex flex-col justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Mean Score Percentage</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-blue-600">{meanScore}%</span>
                    <span className="text-xs font-bold text-slate-400">Cohort Average</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-left flex flex-col justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Passing Threshold Rate</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${passRate >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>{passRate}%</span>
                    <span className="text-xs font-bold text-slate-400">Score &ge; 50%</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {marksLoading ? (
              <div className="text-center py-16 text-gray-400 text-xs font-bold animate-pulse uppercase">Compiling Academic History Matrices...</div>
            ) : marks.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-medium">No performance records recorded on the database engine.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Student Learner</th>
                      <th className="p-4">Admission No</th>
                      <th className="p-4">Grade / Stream</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4 text-center">Score Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                    {marks
                      .filter(item => {
                        const matchesSearch = item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.admission_no?.includes(searchTerm);
                        const matchesClass = selectedClass === 'All' || item.class_id === selectedClass;
                        const matchesSubj = selectedSubject === 'All' || item.subject === selectedSubject;
                        return matchesSearch && matchesClass && matchesSubj;
                      })
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-gray-900">{record.student_name}</td>
                          <td className="p-4 text-gray-400 font-mono">{record.admission_no || 'N/A'}</td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-md text-[10px] font-black uppercase">{record.class_id}</span></td>
                          <td className="p-4 text-slate-600 font-bold">{record.subject}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-block min-w-[50px] ${record.score >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {record.score}%
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
      )}

      {/* 🌍 MAP PORTAL INJECTOR: Placed outside structural views but within the main component canvas */}
      {activeTrackingRoute && (
        <TransportMapModal 
          isOpen={isMapModalOpen}
          onClose={() => {
            setIsMapModalOpen(false);
            setActiveTrackingRoute(null);
          }}
          routeName={activeTrackingRoute.route_name}
          driverName={activeTrackingRoute.driver_name}
          latitude={parseFloat(activeTrackingRoute.last_latitude || '-1.2921')}
          longitude={parseFloat(activeTrackingRoute.last_longitude || '36.8219')}
        />
      )}

      {/* 🌍 EXPANDED STUDENT ENROLMENT FORM OVERLAY MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-950 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <GraduationCap className="text-emerald-400" size={22} /> Comprehensive Student Enrolment
                </h3>
                <p className="text-xs text-slate-400">Complete student ledger fields and map fleet transit configurations.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsRegisterModalOpen(false)} 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Registration Form container */}
            <form onSubmit={handleRegisterStudent} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <h4 className="text-xs font-black uppercase text-slate-400 border-b pb-1 tracking-wider">Student Parameters</h4>
              
              {/* Row 1: Names */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">First Name</label>
                  <input type="text" required placeholder="John" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Last Name</label>
                  <input type="text" required placeholder="Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regLastName} onChange={e => setRegLastName(e.target.value)} />
                </div>
              </div>

              {/* Row 2: Admission No & Grade Stream */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Admission/ID Number</label>
                  <input type="text" required placeholder="ADM-2026" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-mono font-bold text-slate-700" value={regAdmissionNo} onChange={e => setRegAdmissionNo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Target Class Stream</label>
                  <input type="text" required placeholder="e.g. 4J" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regAssignedClass} onChange={e => setRegAssignedClass(e.target.value)} />
                </div>
              </div>

              {/* Row 3: Gender & DoB */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Gender</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regGender} onChange={e => setRegGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Date of Birth</label>
                  <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regDob} onChange={e => setRegDob(e.target.value)} />
                </div>
              </div>

              <h4 className="text-xs font-black uppercase text-slate-400 border-b pb-1 tracking-wider pt-2">Residential & Fleet Mapping</h4>

              {/* Row 4: Residential Area & Fleet Route Pull-down */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Residential Estate Area</label>
                  <input type="text" required placeholder="e.g. Highridge, Westlands" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regResidentialArea} onChange={e => setRegResidentialArea(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Assign Transit Fleet Route</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" 
                    value={regAssignedRouteId} onChange={e => setRegAssignedRouteId(e.target.value)}
                  >
                    <option value="">-- No Transport Route assigned --</option>
                    {routesList.map((route: any) => (
                      <option key={route.route_id} value={route.route_id}>
                        {route.route_name} ({route.fleet_mode || 'Bus'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-black uppercase text-slate-400 border-b pb-1 tracking-wider pt-2">Primary Guardian Parameter Settings</h4>

              {/* Row 5: Guardian Type & Names */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Relationship</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regParentType} onChange={e => setRegParentType(e.target.value)}>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">First Name</label>
                  <input type="text" required placeholder="Parent First Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regParentFirstName} onChange={e => setRegParentFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Last Name</label>
                  <input type="text" required placeholder="Parent Last Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regParentLastName} onChange={e => setRegParentLastName(e.target.value)} />
                </div>
              </div>

              {/* Row 6: Contact & Messaging */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Primary Phone Number</label>
                  <input type="tel" required placeholder="+2547XXXXXXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-mono font-bold text-slate-700" value={regParentContact} onChange={e => setRegParentContact(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-1">Email Address</label>
                  <input type="email" required placeholder="parent@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold text-slate-700" value={regParentEmail} onChange={e => setRegParentEmail(e.target.value)} />
                </div>
              </div>

              {/* Action Operations Buttons */}
              <div className="flex gap-3 pt-4 border-t mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsRegisterModalOpen(false)} 
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all uppercase tracking-wide text-[11px] text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl transition-all uppercase tracking-wide text-[11px] flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100"
                >
                  {loading ? 'Processing Enrollment...' : 'Confirm System Enrolment'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 🖥️ DYNAMIC STUDENT DATABASE COMPARTMENT PANEL VIEW */}
      {dbViewActive && (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto p-6 max-w-7xl mx-auto space-y-6 text-left animate-in fade-in duration-200">
          
          {/* Header Action Nav */}
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <LayoutGrid className="text-emerald-600" size={26} /> Student Registry Repository Engine
              </h2>
              <p className="text-xs text-slate-400">Modify live student records, monitor structural keys, and clean up historical table listings.</p>
            </div>
            <button 
              type="button"
              onClick={() => setDbViewActive(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>

          {/* Real-time search processing controller */}
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input 
              type="text" placeholder="Search learner by full name or admission identifier..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold shadow-sm"
              value={dbSearchQuery} onChange={e => setDbSearchQuery(e.target.value)}
            />
          </div>

          {/* Interactive Ledger Table Grid Layout */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            {dbLoading ? (
              <div className="text-center py-16 text-xs font-black uppercase tracking-wider text-slate-400 animate-pulse">
                Syncing Active Student Data Matrices...
              </div>
            ) : dbStudentsList.length === 0 ? (
              <div className="text-center py-16 text-xs italic text-gray-400">
                No active student records returned for this multi-tenant zone space.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-300 border-b">
                      <th className="p-4 pl-6">Admission No</th>
                      <th className="p-4">First Name</th>
                      <th className="p-4">Last Name</th>
                      <th className="p-4">Stream</th>
                      <th className="p-4 text-center">Administrative Management Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">

                  {dbStudentsList
                      .filter(item => {
                        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
                        return fullName.includes(dbSearchQuery.toLowerCase()) || item.admission_no?.toLowerCase().includes(dbSearchQuery.toLowerCase());
                      })
                      .map((student) => {
                        const isEditing = editingStudentId === student.id;
                        return (
                          <React.Fragment key={student.id}>
                            {/* Main standard ledger row line item */}
                            <tr className="hover:bg-slate-50/60 transition-colors border-b">
                              <td className="p-4 pl-6 font-mono font-bold text-emerald-600">{student.admission_no}</td>
                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="p-2 border rounded-lg bg-white font-bold max-w-[120px]" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} />
                                ) : (
                                  <span className="font-bold text-gray-900">{student.first_name}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="p-2 border rounded-lg bg-white font-bold max-w-[120px]" value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                                ) : (
                                  <span className="font-bold text-gray-900">{student.last_name}</span>
                                )}
                              </td>
                              <td className="p-4">
                                {isEditing ? (
                                  <input type="text" className="p-2 border rounded-lg bg-white font-black max-w-[80px]" value={editClass} onChange={e => setEditClass(e.target.value)} />
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 border text-slate-600 rounded-md text-[10px] font-black uppercase">{student.class || student.class_id || 'N/A'}</span>
                                )}
                              </td>
                              <td className="p-4 text-center flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button type="button" onClick={() => handleUpdateStudentRow(student.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase">Save</button>
                                    <button type="button" onClick={() => setEditingStudentId(null)} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setEditingStudentId(student.id);
                                        setEditFirstName(student.first_name || '');
                                        setEditLastName(student.last_name || '');
                                        setEditClass(student.class || student.class_id || '');
                                        setEditParentFirstName(student.parent_details?.first_name || '');
                                        setEditParentLastName(student.parent_details?.last_name || '');
                                        setEditParentPhone(student.parent_details?.phone_number || '');
                                        setEditParentEmail(student.parent_details?.email || '');
                                        setEditAssignedRouteId(student.assigned_route_id || '');
                                      }} 
                                      className="px-3 py-1.5 bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 rounded-lg text-[10px] font-bold shadow-sm"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button type="button" onClick={() => handleDeleteStudentRow(student.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"><Trash2 size={12} /> Delete</button>
                                  </>
                                )}
                              </td>
                            </tr>

                            {/* 📋 NESTED SUB-DRAWER: Displays static parent metrics or editing inputs */}
                            {(isEditing || student.parent_details?.id) && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={5} className="p-4 pl-6 border-b">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
                                    
                                    {/* Column 1: Parent Identity Settings */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">
                                        Parent Details ({isEditing ? 'Editing' : student.parent_details?.parent_type || 'Guardian'})
                                      </span>
                                      {isEditing ? (
                                        <div className="flex gap-2">
                                          <input type="text" className="p-2 border rounded-lg bg-white w-1/2 text-xs" placeholder="First Name" value={editParentFirstName} onChange={e => setEditParentFirstName(e.target.value)} />
                                          <input type="text" className="p-2 border rounded-lg bg-white w-1/2 text-xs" placeholder="Last Name" value={editParentLastName} onChange={e => setEditParentLastName(e.target.value)} />
                                        </div>
                                      ) : (
                                        <p className="font-bold text-slate-800">
                                          {student.parent_details?.first_name} {student.parent_details?.last_name || 'No Parent Attached'}
                                        </p>
                                      )}
                                    </div>

                                    {/* Column 2: Parent Contact Parameters */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Parent Communication Channel</span>
                                      {isEditing ? (
                                        <div className="space-y-1">
                                          <input type="tel" className="w-full p-2 border rounded-lg bg-white text-xs font-mono" placeholder="Phone" value={editParentPhone} onChange={e => setEditParentPhone(e.target.value)} />
                                          <input type="email" className="w-full p-2 border rounded-lg bg-white text-xs" placeholder="Email" value={editParentEmail} onChange={e => setEditParentEmail(e.target.value)} />
                                        </div>
                                      ) : (
                                        <div className="font-medium text-slate-600 space-y-0.5">
                                          <p>📞 <span className="font-mono">{student.parent_details?.phone_number || 'N/A'}</span></p>
                                          <p>✉️ {student.parent_details?.email || 'N/A'}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Column 3: Transit Route Realignment Dropdown */}
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Transit Fleet Allocation</span>
                                      {isEditing ? (
                                        <select 
                                          className="w-full p-2 border rounded-lg bg-white text-xs font-bold text-slate-700"
                                          value={editAssignedRouteId} onChange={e => setEditAssignedRouteId(e.target.value)}
                                        >
                                          <option value="">-- No Route Assigned --</option>
                                          {routesList.map((route: any) => (
                                            <option key={route.route_id || route.id} value={route.route_id || route.id}>
                                              {route.route_name}
                                            </option>
                                          ))}
                                        </select>
                                      ) : (
                                        <p className="font-black text-orange-600">
                                          🚌 {student.assigned_route_name || 'No Route Allocated'}
                                        </p>
                                      )}
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}

                      </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 🌍 MAP PORTAL INJECTOR */}
      {activeTrackingRoute && (
        <TransportMapModal 
          isOpen={isMapModalOpen}
          onClose={() => {
            setIsMapModalOpen(false);
            setActiveTrackingRoute(null);
          }}
          routeName={activeTrackingRoute.route_name}
          driverName={activeTrackingRoute.driver_name}
          latitude={parseFloat(activeTrackingRoute.last_latitude || '-1.2921')}
          longitude={parseFloat(activeTrackingRoute.last_longitude || '36.8219')}
        />
      )}

    </div>
  );
};
