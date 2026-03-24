import React, { useEffect, useState } from 'react';
import { Globe, Camera, Save, Loader2, X, MapPin, Megaphone, UserCircle, BarChart3, Share2, Users, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 
import { CampaignLinkGenerator } from './CampaignLinkGenerator';

interface PoliticalDashboardProps {
  onViewChange: (view: string) => void;
}

// --- PROJECT MODAL ---
function ProjectModal({ isOpen, onClose, shopId }: { isOpen: boolean, onClose: () => void, shopId: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState({ title: '', description: '', type: 'planned', location: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', project.title);
    formData.append('description', project.description);
    formData.append('type', project.type);
    formData.append('location', project.location);
    formData.append('shop_id', shopId?.toString() || '');
    if (file) formData.append('file', file);

    try {
      const res = await fetch('https://n8n.tenear.com', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert("Project saved successfully!");
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Add Campaign Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           {/* ... existing project form fields ... */}
           <input
            required
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none"
            placeholder="Project Name"
            value={project.title}
            onChange={(e) => setProject({ ...project, title: e.target.value })}
          />
          <textarea
            required
            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none"
            placeholder="Description..."
            value={project.description}
            onChange={(e) => setProject({ ...project, description: e.target.value })}
          />
          <button type="submit" disabled={isUploading} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg">
            {isUploading ? "Saving..." : "Publish Project"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- NEW: BRANDING MODAL ---
function BrandingModal({ isOpen, onClose, shopId, initialName }: { isOpen: boolean, onClose: () => void, shopId: any, initialName: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState(initialName);
  const [photo, setPhoto] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData();
    if (photo) formData.append('photo', photo);
    formData.append('name', name);
    formData.append('shop_id', shopId?.toString() ?? "");

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/upload-metadata', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert("Branding updated successfully!");
        onClose();
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Candidate Branding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Aspirant Name</label>
            <input
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Profile Photo</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition-all">
              <Camera className="text-gray-400 mb-2" size={32} />
              <span className="text-sm font-bold text-gray-500">
                {photo ? photo.name : "Click to upload photo"}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button type="submit" disabled={isUploading} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl flex justify-center items-center gap-2">
            {isUploading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD ---
export function PoliticalDashboard({ onViewChange }: PoliticalDashboardProps) {
  const { user } = useAuth();
  const shopId = user?.shop_id; 
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', photo_url: '' });

  const quickActions = [
    { id: 'projects', title: 'Manage Projects', icon: MapPin, desc: 'Update work' },
    { id: 'manifestos', title: 'Manage Manifestos', icon: Megaphone, desc: 'Update policy' },
    { id: 'branding', title: 'Candidate Branding', icon: UserCircle, desc: 'Profile photo' },
    { id: 'qr-generation', title: 'Rally QR Codes', icon: Share2, desc: 'Check-in' },
  ];

  const fetchMetadata = async () => {
    try {
      const response = await fetch('https://n8n.tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_metadata', shop_id: shopId })
      });
      const result = await response.json();
      const data = Array.isArray(result) ? result[0] : result;
      if (data) setProfile({ name: data.full_name, photo_url: data.photo_url });
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (shopId) fetchMetadata(); }, [shopId]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.id === 'projects') setIsProjectModalOpen(true);
              if (action.id === 'branding') setIsBrandingModalOpen(true);
              if (action.id === 'manifestos') onViewChange('manifestos');
              if (action.id === 'qr-generation') onViewChange('qr-generation');
            }}
            className="p-6 bg-white border rounded-2xl text-left hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
              <action.icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mt-4">{action.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
          </button>
        ))}
      </div>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} shopId={shopId} />
      
      <BrandingModal 
        isOpen={isBrandingModalOpen} 
        onClose={() => setIsBrandingModalOpen(false)} 
        shopId={shopId} 
        initialName={profile.name} 
      />
    </div>
  );
}
