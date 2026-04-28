import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Heart, MessageCircle, Share2, 
  TrendingUp, Users, Target, MapPin, Package, Layout, Hammer, Camera, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChurchBrickBuilder from './ChurchBrickBuilder';
import confetti from 'canvas-confetti';

interface ProjectsRendererProps {
  view: 'planned' | 'fundraising';
  onBack: () => void;
  shopId: number;
  userData?: any;
}


export const ProjectsRenderer = ({ view, onBack, shopId, userData }: ProjectsRendererProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDonorLog, setShowDonorLog] = useState<string | null>(null);

  const fundRaiserPosterUrl = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/StBarnabasFundRaiser27apr2026.png"
 
  const [isActuallyStaff, setIsActuallyStaff] = useState(false);

  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [campaignPhoto, setCampaignPhoto] = useState<string | null>(null);
  const [selectedGraphic, setSelectedGraphic] = useState(fundRaiserPosterUrl); // Default to the main poster

  const [newDonor, setNewDonor] = useState({ 
    name: '', 
    amount: 0, 
    type: 'MPESA', // Default type
    message: ''    // Added message field
  });
 
  // Logic to identify staff - Loice has "project" in her DB record
  const isProjectStaff = user?.department?.toLowerCase().includes('project') || 
                         user?.department?.toLowerCase().includes('development');

  // Inject Custom Scrollbar CSS for the Staff Panel
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.5); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.8); }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // 1. Grab ID with userData as the priority (since it works in Meetings)
        const storedUser = localStorage.getItem('geofence_user_data');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        
        // Priority: Prop > Context > LocalStorage
        const userId = userData?.id || user?.id || parsedUser?.id;
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: shopId,
            user_id: userId,
            type: view === 'planned' ? 'planned' : 'all'
          }),
        });

        const data = await response.json();
        
        // 2. Handle the object response { isStaff: bool, projects: [] }
        const projectsArray = Array.isArray(data.projects) ? data.projects : [data.projects];
        setProjects(projectsArray || []);
        
        if (data.isStaff) {
          setIsActuallyStaff(true);
        }
      } catch (error) { 
        console.error("Fetch error:", error); 
      } finally { 
        setIsLoading(false); 
      }
    };

    fetchProjects();
  }, [view, shopId, user?.id]); // 3. Re-run if user ID finally loads

  const handleGenerateCampaign = async () => {
    if (!campaignPhoto) {
      alert("Please upload your family/couple portrait first!");
      return;
    }

    // This URL carries the "State" of the member's choices to the public page
    // We encode the graphic URL and the specific project name so the public page knows what to show
    const encodedGraphic = encodeURIComponent(selectedGraphic);
    const shareUrl = `https://sbo-0qapages.dev{shopId}&view=give&project_id=${selectedProject.project_id}&member_name=${encodeURIComponent(userData?.first_name || 'A Church Member')}&custom_photo=${encodeURIComponent(campaignPhoto)}&graphic=${encodedGraphic}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support our Church Project: ${selectedProject.project_name}`,
          text: `Praise God! Join me in supporting ${selectedProject.project_name}. Here is our progress!`,
          url: shareUrl,
        });
      } catch (err) { console.log("Share failed", err); }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert("Campaign link copied! You can now paste it into WhatsApp.");
    }
  };

  const handleVictoryAlert = async (proj: any) => {
    const bricks = Math.floor(newDonor.amount / 1000);
    const ironsheets = Math.floor((newDonor.amount % 1000) / 800);
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-victory-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_name: newDonor.name,
          amount: newDonor.amount,
          donation_type: newDonor.type, // Sending the type
          message: newDonor.message,    // Sending the message
          project_name: proj.project_name,
          project_id: proj.project_id,   // Sending ID for Supabase logging
          shop_id: shopId,
          bricks_equivalent: bricks,
          ironsheets_equivalent: ironsheets,
          user_department: user?.department,
          verified_by: (user as any)?.first_name || 'Church Staff',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {

        // Trigger the celebration!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#3b82f6', '#ffffff'] // Church & Construction colors
        });

        alert(`Praise God! Victory Alert Published for ${bricks} bricks.`);
        setShowDonorLog(null);
        // Reset form
        setNewDonor({ name: '', amount: 0, type: 'MPESA', message: '' });
      }
    } catch (error) {
      console.error("Alert failed:", error);
      alert("Network error sending alert.");
    }
  };

  const handleShare = async (project: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🔥 Support: ${project.project_name}`,
          text: `Praise God! Join us in building ${project.project_name}. Every brick counts!`,
          url: window.location.href,
        });
      } catch (err) { console.log("Share failed", err); }
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-black text-gray-800">
          {view === 'planned' ? 'Upcoming Projects' : 'Social Fundraiser Hub'}
        </h3>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((proj) => {
          const progress = Math.min(100, Math.round((proj.funds_available / proj.estimated_cost) * 100));

          return (
            <div key={proj.project_id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-3xl font-black text-gray-900 leading-tight">{proj.project_name}</h4>
                  <p className="text-[10px] text-gray-400 font-black flex items-center gap-1 uppercase tracking-widest">
                    <MapPin size={12} className="text-blue-500" /> {proj.location || 'Church Grounds'}
                  </p>
                </div>
                <span className="text-4xl font-black text-blue-600">{progress}%</span>
              </div>

              {/* Project Progress Bar and Stats would be here... */}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                {/* NEW: Campaign Builder Trigger */}
                <button 
                  onClick={() => {
                    setSelectedProject(proj);
                    setIsCampaignMode(true);
                  }}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                  <Plus size={18} /> Create Personal Campaign
                </button>
              
                <button 
                  onClick={() => handleShare(proj)}
                  className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-gray-200 transition-all"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW: CAMPAIGN BUILDER MODAL */}
      {isCampaignMode && selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900">Personalize Your Campaign</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">For: {selectedProject.project_name}</p>
            </div>

            {/* 1. Portrait Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Upload Family/Couple Portrait</label>
              <label className="block relative cursor-pointer group">
                <div className="w-full h-44 bg-blue-50 rounded-[2rem] border-2 border-dashed border-blue-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                  {campaignPhoto ? (
                    <img src={campaignPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera className="text-blue-500 mb-2 mx-auto" size={32} />
                      <span className="text-[10px] font-black text-blue-400 uppercase">Tap to Select Photo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCampaignPhoto(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
            </div>

            {/* 2. Graphic Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Select Church Graphic</label>
              <div className="grid grid-cols-3 gap-3">
                {[fundRaiserPosterUrl, /* add other graphic URLs here */].map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedGraphic(url)}
                    className={`relative rounded-2xl overflow-hidden border-4 transition-all ${selectedGraphic === url ? 'border-blue-600 scale-95' : 'border-transparent opacity-50'}`}
                  >
                    <img src={url} className="w-full h-16 object-cover" alt="Graphic Option" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsCampaignMode(false)} 
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase"
              >
                CANCEL
              </button>
              <button 
                onClick={handleGenerateCampaign}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> SHARE TO WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
 }
