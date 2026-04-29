import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Heart, MessageCircle, Share2, 
  TrendingUp, Users, Target, MapPin, Package, Layout, Hammer, Plus,
  Camera
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
  const [isActuallyStaff, setIsActuallyStaff] = useState(false);

  const canvasStyles = {
    container: "relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white",
    baseGraphic: "w-full h-auto block",
    logoOverlay: "absolute top-[42%] left-[52%] w-[8%] h-auto drop-shadow-lg", // Positioned next to Kufuga Church
    memberPhotoContainer: "absolute top-[68%] left-[44.5%] w-[11%] aspect-square rounded-full overflow-hidden border-4 border-white bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-90 transition",
    mpesaBox: "absolute bottom-[4%] left-[50%] -translate-x-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-gray-200 text-center min-w-[200px]"
  };

  const onPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCampaignPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // New Campaign State
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [campaignPhoto, setCampaignPhoto] = useState<string | null>(null);
  const fundRaiserPosterUrl = "https://supabase.co";
  const [selectedGraphic, setSelectedGraphic] = useState(fundRaiserPosterUrl);

  const [newDonor, setNewDonor] = useState({ 
    name: '', 
    amount: 0, 
    type: 'MPESA', 
    message: ''    
  });

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('geofence_user_data');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const userId = userData?.id || user?.id || parsedUser?.id;

        const response = await fetch('https://n8n.tenear.com/webhook/church-donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: shopId,
            user_id: userId,
            type: view === 'planned' ? 'planned' : 'all'
          }),
        });

        const data = await response.json();
        setProjects(data.projects || []);
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
  }, [view, shopId, user?.id]);

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
          donation_type: newDonor.type,
          message: newDonor.message,
          project_name: proj.project_name,
          project_id: proj.project_id,
          shop_id: shopId,
          bricks_equivalent: bricks,
          ironsheets_equivalent: ironsheets,
          user_department: user?.department,
          verified_by: (user as any)?.first_name || 'Church Staff',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#3b82f6', '#ffffff']
        });
        alert(`Praise God! Victory Alert Published for ${bricks} bricks.`);
        setShowDonorLog(null);
        setNewDonor({ name: '', amount: 0, type: 'MPESA', message: '' });
      }
    } catch (error) {
      alert("Network error sending alert.");
    }
  };

  const handleGenerateCampaign = async () => {
    if (!campaignPhoto) return alert("Please upload your family portrait first!");
    const shareUrl = `https://pages.dev{shopId}&view=give&project_id=${selectedProject.project_id}&member_name=${encodeURIComponent(userData?.first_name || 'Member')}&custom_photo=${encodeURIComponent(campaignPhoto)}&graphic=${encodeURIComponent(selectedGraphic)}`;
    
    if (navigator.share) {
      await navigator.share({ title: `Support ${selectedProject.project_name}`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
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
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-black text-gray-800">
          {view === 'planned' ? 'Upcoming Projects' : 'Social Fundraiser Hub'}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((proj) => {
          const progress = Math.min(100, Math.round((proj.funds_available / proj.estimated_cost) * 100));
          const totalBricks = Math.floor(proj.funds_available / 1000);

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

              {/* Progress & Bricks Metrics */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex flex-col items-center">
                    <span className="text-2xl font-black text-orange-600">{totalBricks}</span>
                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Bricks Sowed</span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center">
                    <span className="text-2xl font-black text-blue-600">{progress}%</span>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Goal Status</span>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
                    <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-1000"></div>
                  </div>
                </div>
              </div>

              {/* Staff Donor Log Form */}
              {showDonorLog === proj.project_id && (
                <div className="mt-6 p-6 bg-gray-50 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                  <h5 className="font-black text-xs uppercase tracking-widest text-gray-400">Log New Donation</h5>
                  <input className="w-full p-4 bg-white rounded-2xl border-none font-bold" placeholder="Donor Name" value={newDonor.name} onChange={e => setNewDonor({...newDonor, name: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-4 bg-white rounded-2xl border-none font-bold" type="number" placeholder="Amount" value={newDonor.amount || ''} onChange={e => setNewDonor({...newDonor, amount: Number(e.target.value)})} />
                    <select className="w-full p-4 bg-white rounded-2xl border-none font-bold" value={newDonor.type} onChange={e => setNewDonor({...newDonor, type: e.target.value})}>
                      <option>MPESA</option><option>Cheque</option><option>Cash</option>
                    </select>
                  </div>
                  <button onClick={() => handleVictoryAlert(proj)} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg">PUBLISH VICTORY ALERT</button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => { setSelectedProject(proj); setIsCampaignMode(true); }}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  Create Personal Campaign
                </button>

                {isActuallyStaff && (
                  <button onClick={() => setShowDonorLog(showDonorLog === proj.project_id ? null : proj.project_id)} className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                    <Plus size={20} />
                  </button>
                )}

                <button onClick={() => handleShare(proj)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CAMPAIGN BUILDER MODAL - LAYERED DYNAMIC VERSION */}
      {isCampaignMode && selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 max-w-xl w-full space-y-6 shadow-2xl overflow-hidden">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900">Your Campaign Poster</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Tap the circle to add your photo</p>
            </div>

            {/* DYNAMIC CANVAS PREVIEW */}
            <div className="relative w-full aspect-[1.91/1] bg-gray-100 rounded-[2rem] overflow-hidden shadow-inner border border-gray-100">
              {/* Layer 1: Base Graphic */}
              <img src={fundRaiserPosterUrl} className="w-full h-full object-cover" alt="Background" />

              {/* Layer 2: Correct Gold Logo Seal (Positioned near Kufuga church) */}
              <div className="absolute top-[40%] right-[32%] w-[10%] drop-shadow-xl">
                 <img src="https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/100Challenge001.png" className="w-full h-auto" alt="Seal" />
              </div>

              {/* Layer 3: Interactive Photo Placeholder */}
              <label className="absolute top-[62%] left-[45%] w-[12%] aspect-square rounded-full border-2 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center cursor-pointer group">
                {campaignPhoto ? (
                  <img src={campaignPhoto} className="w-full h-full object-cover" alt="Member" />
                ) : (
                  <Camera size={18} className="text-blue-500 group-hover:scale-110 transition" />
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setCampaignPhoto(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>

              {/* Layer 4: M-PESA Overlay */}
              <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 flex gap-4 px-4 py-1 bg-white/90 backdrop-blur rounded-full text-[8px] font-black text-gray-800 shadow-sm border border-gray-100">
                <span>PAYBILL: 123456</span>
                <span className="text-blue-600">ACC: {userData?.first_name || 'MEMBER'}</span>
                <span className="text-orange-600">#StBarnabas100Days</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsCampaignMode(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs">BACK</button>
              <button onClick={handleGenerateCampaign} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2">
                <Share2 size={16} /> SEND TO WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
 }
