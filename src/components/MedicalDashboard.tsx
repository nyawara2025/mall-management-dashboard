import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, BarChart3, Plus, Edit2, Trash2, Share2, ExternalLink, MessageSquare, ClipboardList, Reply, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  time: string;
  patient_name: string;
  service: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

interface Interaction {
  id: string;
  customer_phone: string;
  message: string;
  interaction_type: string;
  created_at: string;
}

export const MedicalDashboard = () => {
  const { token, user } = useAuth();
  
  // Dashboard State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, waitTime: '0m', views: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'inquiries' | 'services'>('appointments');
  const [services, setServices] = useState<any[]>([]);


  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyModal, setReplyModal] = useState<{isOpen: boolean, inquiryId: string | null, phone: string | null}>({ 
    isOpen: false, 
    inquiryId: null,
    phone: null
  });
  
  // Form States
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const statsCards = [
    { label: 'TOTAL PATIENTS', value: stats.total, icon: Users, color: 'text-blue-600' },
    { label: 'TODAY', value: stats.today, icon: Calendar, color: 'text-green-600' },
    { label: 'WAIT TIME', value: stats.waitTime, icon: Clock, color: 'text-orange-600' },
    { label: 'VIEWS', value: stats.views, icon: BarChart3, color: 'text-purple-600' }
  ];

  const shop_name = localStorage.getItem('shop');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    try {
      const medicalRes = await fetch('https://n8n.tenear.com/webhook/get-medical-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const medicalResult = await medicalRes.json();
      const medicalData = Array.isArray(medicalResult) ? medicalResult[0] : medicalResult;

      if (medicalData.stats) setStats(medicalData.stats);

      const formattedApts: Appointment[] = (medicalData.appointments || []).map((apt: any) => ({
        id: String(apt.id),
        time: apt.created_at ? new Date(apt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        patient_name: apt.full_name || `Patient #${apt.patient_id}`,
        service: apt.notes || 'General Service',
        status: (apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)) || 'Pending'
      }));
      setAppointments(formattedApts);

      const interactRes = await fetch('https://n8n.tenear.com/webhook/get-medical-inquiries', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ shop_id: user?.shop_id })
      });

      const rawInteractData = await interactRes.json();
      const formattedInteractions: Interaction[] = (rawInteractData || []).map((item: any) => ({
        id: String(item.id),
        customer_phone: item.customer_phone || 'No Phone',
        message: item.customer_message || 'No Message Content',
        interaction_type: item.interaction_type || 'General',
        created_at: item.created_at
      }));

      setInteractions(formattedInteractions);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetching Services via POST
  const fetchServices = async () => {
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/medical-services-management', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          action: 'fetch',
          shop_id: user?.shop_id 
        })
      });
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  // 2. Delete Handler (Multi-tenant safe)
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to remove this service?")) return;
  
    try {
      await fetch('https://n8n.tenear.com/webhook/medical-services-management', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          action: 'delete',
          service_id: serviceId,
          shop_id: user?.shop_id 
        })
      });
      fetchServices();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 3. Social Sharing Logic


  const handleShare = async (product: any) => {
    // 1. Determine the source based on device capability
    // We'll default to 'whatsapp' for the desktop window.open,
    // or 'system_share' for mobile.
    let source = "whatsapp";

    const trackShare = async (platform: string) => {
      try {
        await fetch('https://n8n.tenear.com/webhook/shop-products-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share_product',
          shop_id: user?.shop_id,
          product_id: product.product_id,
          utm_source: platform, // Added tracking source
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Failed to log share to n8n:", error);
    }
  };


  // 2. Construct URLs with the tracking parameter
  // This helps your Cloudflare Worker track clicks later too!
  const getShareUrl = (platform: string) =>
    `https://tenear.com/?shop_id=${user?.shop_id}&product_id=${product.product_id}&utm_source=${platform}`;

  const shareText = (url: string) =>
    `🤖 NEW PRODUCT ALERT!\n\n📦 ${product.product_name}\n💰 KShs ${product.base_price}\n🔗 View our online clinic\n🔗 ${user?.shop_name}: ${url}`;

  // 3. Attempt Native Share (Mobile)
  if (typeof navigator.share !== 'undefined') {
    source = "mobile_native";
    const finalUrl = getShareUrl(source);
    try {
      await navigator.share({
        title: product.product_name,
        text: shareText(finalUrl),
        url: finalUrl
      });
      await trackShare(source);
      return;
    } catch (err) {
      // If user cancels or it fails, fallback to WhatsApp
    }
  }

  // 4. Fallback for Desktop/WhatsApp
  source = "whatsapp_direct";
  const finalUrl = getShareUrl(source);
  await trackShare(source);
  window.open(`https://wa.me/?text=${encodeURIComponent(shareText(finalUrl))}`, '_blank');
};
  


  // const handleShare = (service: any) => {
    // Use your Cloudflare Pages domain here
    // const shopUrl = `https://medical-shop.pages.dev{service.id}?shop=${user?.shop_id}`;
    // const shareText = `🏥 *${service.name}*\n${service.description}\n\nBook here: ${shopUrl}`;
  
    // window.open(`https://wa.me{encodeURIComponent(shareText)}`, '_blank');
  // };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('action', 'add');
      formData.append('name', newService.name);
      formData.append('price', newService.price);
      formData.append('description', newService.description);
      formData.append('shop_id', String(user?.shop_id || ''));

      if (selectedFile) {
        formData.append('product_image', selectedFile);
      }

      const response = await fetch('https://n8n.tenear.com/webhook/add-medical-service', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewService({ name: '', price: '', description: '' });
        setSelectedFile(null);
        setImagePreview(null);
        alert("Service added and synced!");
      }
    } catch (err) { 
      console.error(err); 
      alert("Error adding service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/send-reply', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          inquiry_id: replyModal.inquiryId,
          patient_phone: replyModal.phone,
          message: replyMessage,
          shop_id: user?.shop_id
        })
      });

      if (response.ok) {
        alert("Reply sent successfully!");
        setReplyModal({ isOpen: false, inquiryId: null, phone: null });
        setReplyMessage('');
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Initializing TeNEAR Medical Space...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Title and Shop ID */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good Doctor</h1>
        <p className="text-sm text-gray-500 font-medium">
          Shop Name: <span className="text-blue-600 font-bold">{shop_name}</span>
        </p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gray-50 ${card.color}`}><card.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-200/50 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <ClipboardList className="w-4 h-4" /> APPOINTMENTS
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inquiries' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <MessageSquare className="w-4 h-4" /> PATIENT INQUIRIES
        </button>
        <button 
          onClick={() => { setActiveTab('services'); fetchServices(); }}
          className={`pb-2 px-4 ${activeTab === 'services' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Services
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {/* 1. APPOINTMENTS VIEW */}
          {activeTab === 'appointments' && (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Service Requested</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{apt.time}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{apt.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{apt.service}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 2. INQUIRIES VIEW */}
          {activeTab === 'inquiries' && (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Patient Phone</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {interactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.customer_phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.message}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setReplyModal({ isOpen: true, inquiryId: item.id, phone: item.customer_phone })}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-all"
                      >
                        <Reply className="w-3.5 h-3.5" /> REPLY
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3. SERVICES GRID VIEW */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/30">

              {/* NEW: THE "ADD NEW" INTERACTIVE CARD */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 h-full min-h-[350px] group bg-white"
              >
                <div className="p-5 bg-blue-50 rounded-full group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                  <Plus className="w-10 h-10 text-blue-600 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <span className="block font-black text-gray-400 group-hover:text-blue-600 tracking-tighter uppercase text-lg">Add New Service</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Sync to TeNEAR Sokoni</span>
                </div>
              </button>

              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden group">
                  <div className="h-48 bg-gray-100 relative">
                    <img src={service.image_url} className="w-full h-full object-cover" alt={service.name} />
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => console.log('edit')} className="p-2 bg-white rounded-full shadow-md text-blue-600"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteService(service.id)} className="p-2 bg-white rounded-full shadow-md text-red-600"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight leading-tight">{service.name}</h3>
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-sm">Ksh {service.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed">{service.description}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleShare(service)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                      >
                        <Share2 size={14} /> SHARE TO SOCIALS
                      </button>
                      <a 
                        href={`https://your-shop.pages.dev{service.id}`} 
                        target="_blank" 
                        className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                      >
                        <ExternalLink size={18} />
                      </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> {/* Closes overflow-x-auto */}
    </div> {/* Closes bg-white rounded-xl... */}

    {/* 1. Reply Modal */}
    {replyModal.isOpen && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Send Medical Reply</h3>
            <button onClick={() => setReplyModal({ isOpen: false, inquiryId: null, phone: null })} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <textarea 
            className="w-full border-2 border-gray-100 rounded-xl p-4 h-40 mb-4 outline-none font-medium"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your medical response here..."
          />
          <button 
            onClick={handleSendReply}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            Send Message via SMS
          </button>
        </div>
      </div>
    )}

    {/* 2. Add Service Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Add New Facility Service</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
          </div>
          <form onSubmit={handleAddService} className="space-y-4">
            <input 
              type="text" placeholder="Service Name" required
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all font-bold"
              value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}
            />
            <input 
              type="number" placeholder="Price (Ksh)" required
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all font-bold"
              value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})}
            />
            <textarea 
              placeholder="Service Description" required
              className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-all font-bold h-32"
              value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})}
            />
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                ) : (
                  <>
                    <ImageIcon className="text-gray-400" size={32} />
                    <span className="text-xs font-bold text-gray-500">UPLOAD SERVICE IMAGE</span>
                  </>
                )}
              </label>
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-300 transition-all"
            >
              {isSubmitting ? 'Syncing...' : 'Add Service to Shop'}
            </button>
          </form>
        </div>
      </div>
    )}
  </div> // Closes the div from line 228
);
};
