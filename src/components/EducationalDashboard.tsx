import React, { useState, useRef } from 'react';
import { BookOpen, Send, Plus, Trash2, LayoutGrid, Type, Megaphone, Bell, Users, CheckCircle, Clock, Paperclip, Bus, MessageCircle, GraduationCap, ClipboardCheck, CreditCard, RefreshCw, Image as ImageIcon, X } from 'lucide-react';

interface Activity {
  activity_name: string;
  description: string;
}

interface SubjectEntry {
  subject: string;
  title: string;
  activities: Activity[];
}

export const EducationalDashboard = ({ shopId }: { shopId: number }) => {
  const [loading, setLoading] = useState(false);
  const [bulletinLoading, setBulletinLoading] = useState(false);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  
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

  // --- Homework State ---
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { subject: '', title: '', activities: [{ activity_name: '', description: '' }] }
  ]);

  // --- Bulletin State (Enhanced with Files) ---
  const [bulletin, setBulletin] = useState({ title: '', content: '' });
  const [bulletinFile, setBulletinFile] = useState<{name: string, data: string} | null>(null);
  const [bulletinImage, setBulletinImage] = useState<{name: string, data: string} | null>(null);

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

  // --- Subject & Activity Management (Keep existing functions) ---
  const addSubject = () => setSubjects([...subjects, { subject: '', title: '', activities: [{ activity_name: '', description: '' }] }]);
  const removeSubject = (sIdx: number) => setSubjects(subjects.filter((_, i) => i !== sIdx));
  const updateSubject = (sIdx: number, field: keyof Omit<SubjectEntry, 'activities'>, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx][field] = value;
    setSubjects(newSubjects);
  };
  const addActivity = (sIdx: number) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx].activities.push({ activity_name: '', description: '' });
    setSubjects(newSubjects);
  };
  const updateActivity = (sIdx: number, aIdx: number, field: keyof Activity, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx].activities[aIdx][field] = value;
    setSubjects(newSubjects);
  };
  const removeActivity = (sIdx: number, aIdx: number) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx].activities = newSubjects[sIdx].activities.filter((_, i) => i !== aIdx);
    setSubjects(newSubjects);
  };

  // --- Submit Handlers ---
  const handlePostHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/upload-school-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: dueDate, shop_id: shopId, payload: subjects }),
      });
      if (response.ok) {
        alert("Daily Agenda posted!");
        setSubjects([{ subject: '', title: '', activities: [{ activity_name: '', description: '' }] }]);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
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
          attachment_doc: bulletinFile, // Base64 Document
          attachment_img: bulletinImage, // Base64 Image
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
      // Replace with your actual fees fetching logic/webhook
      const response = await fetch('https://n8n.tenear.com/webhook/school-fees-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId }),
      });
      if (response.ok) alert("Fees data refreshed!");
    } catch (error) {
      console.error("Failed to fetch fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerWhatsAppAlert = async (type: string) => {
    try {
      // Replace with your actual WhatsApp alert logic/webhook
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

  // Add this handler inside your component logic
  const handleGeneralAction = (action: string) => {
    alert(`${action} module coming soon!`);
  };

  const handleRegisterStudent = async (studentData: any) => {
    setLoading(true);
    try {
      const response = await fetch('https://tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          ...studentData, // Name, Grade, Parent Contact, etc.
          registration_date: new Date().toISOString()
        }),
      });
      if (response.ok) {
        alert("Student registered and synced to Supabase!");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
 
      {/* --- Metrics Header Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Homework Card (Existing) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <BookOpen className="text-blue-600" size={28} /> Enter today's homework
              </h3>
              <p className="text-gray-500">Fill the subject details below</p>
            </div>
            <input type="date" className="p-3 border-2 border-blue-50 rounded-2xl font-bold text-blue-600" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          <form onSubmit={handlePostHomework} className="space-y-6">
            {subjects.map((s, sIdx) => (
              <div key={sIdx} className="relative p-6 rounded-2xl border-2 border-gray-50 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mr-4">
                    <div className="relative">
                      <LayoutGrid className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl font-bold" placeholder="Subject" value={s.subject} onChange={e => updateSubject(sIdx, 'subject', e.target.value)} required />
                    </div>
                    <div className="relative">
                      <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl" placeholder="Topic" value={s.title} onChange={e => updateSubject(sIdx, 'title', e.target.value)} required />
                    </div>
                  </div>
                  {subjects.length > 1 && (
                    <button type="button" onClick={() => removeSubject(sIdx)} className="p-2 text-red-400"><Trash2 size={20} /></button>
                  )}
                </div>

                <div className="ml-4 space-y-3 border-l-4 border-blue-50 pl-6 py-2">
                  {s.activities.map((a, aIdx) => (
                    <div key={aIdx} className="group relative bg-blue-50/30 p-4 rounded-xl">
                      <input className="w-full p-2 mb-2 bg-white border rounded-lg text-sm font-bold" placeholder="Item (e.g. Textbook)" value={a.activity_name} onChange={e => updateActivity(sIdx, aIdx, 'activity_name', e.target.value)} required />
                      <textarea className="w-full p-2 bg-white border rounded-lg text-sm text-gray-600" placeholder="Specific details..." rows={2} value={a.description} onChange={e => updateActivity(sIdx, aIdx, 'description', e.target.value)} required />
                    </div>
                  ))}
                  <button type="button" onClick={() => addActivity(sIdx)} className="mt-2 text-blue-600 text-xs font-bold uppercase flex items-center gap-1"><Plus size={14} /> Add Task</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addSubject} className="w-full py-3 border-2 border-blue-600 border-dashed rounded-2xl text-blue-600 font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Add Another Subject
            </button>
            <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50">
              {loading ? 'Posting...' : <><Send size={20} /> Post Daily Agenda</>}
            </button>
          </form>
        </div>

        {/* Examination Management Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <ClipboardCheck className="text-indigo-600" size={28} /> Examinations
              </h3>
              <p className="text-gray-500">Manage schedules & publish results</p>
            </div>
            <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">
              View Calendar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Item: Input Marks */}
            <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-indigo-200 transition-all cursor-pointer group">
              <GraduationCap className="text-gray-400 group-hover:text-indigo-500 mb-3" size={32} />
              <h4 className="font-bold text-gray-800">Input Exam Marks</h4>
              <p className="text-xs text-gray-400">Record scores for midterm/finals</p>
            </div>
            {/* Action Item: Generate Reports */}
            <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-indigo-200 transition-all cursor-pointer group">
              <Send className="text-gray-400 group-hover:text-indigo-500 mb-3" size={32} />
              <h4 className="font-bold text-gray-800">Generate Report Cards</h4>
              <p className="text-xs text-gray-400">PDF generation for all students</p>
            </div>
          </div>
        </div>

        {/* Student Registration & Management Card */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
                <Users className="text-emerald-600" size={28} /> Students
              </h3>
              <p className="text-gray-500">Registration & Records</p>
            </div>
            <button 
              onClick={() => handleGeneralAction('Student List')}
              className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Action: Add New Student */}
            <div 
              onClick={() => handleGeneralAction('Add Student')}
              className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer group flex items-start gap-4"
            >
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <Plus className="text-emerald-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Register Student</h4>
                <p className="text-xs text-gray-400">Enroll new learners to system</p>
              </div>
            </div>

            {/* Action: Bulk Management */}
            <div 
              onClick={() => handleGeneralAction('Student Database')}
              className="p-5 border-2 border-dashed border-gray-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer group flex items-start gap-4"
            >
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
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
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

            {/* File Upload Section */}
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
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <div className="mb-6">
            <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
              <Bus className="text-orange-500" size={28} /> Transport
            </h3>
            <p className="text-gray-500">Monitor routes & notify parents</p>
          </div>

          <div className="space-y-4">
            {/* Toggle for School Owned vs 3rd Party */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm">School Fleet</button>
              <button className="flex-1 py-2 text-xs font-bold text-gray-500">Vendors</button>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-orange-700 uppercase">Active Route: North Wing</span>
                <span className="animate-pulse flex h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Driver: John Doe • 14 Students</p>
      
              <button 
                onClick={() => triggerWhatsAppAlert('route_start')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle size={18} /> Send WhatsApp Alert
              </button>
            </div>
          </div>
        </div> 
        {/* School Fees Management Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-fit">
          <div className="mb-6">
            <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
              <CreditCard className="text-emerald-600" size={28} /> Fees Tracker
            </h3>
            <p className="text-gray-500">Collection & Arrears</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Total Collected</p>
                <p className="text-2xl font-black text-gray-800">$42,500</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase text-red-400">Outstanding</p>
                <p className="text-lg font-bold text-red-500">$12,400</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[74%]"></div>
            </div>

            <button 
              onClick={() => handleFetchFees()}
              className="w-full border-2 border-emerald-600 text-emerald-600 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Sync Supabase Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
