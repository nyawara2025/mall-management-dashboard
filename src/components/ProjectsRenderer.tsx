import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Heart, MessageCircle, Share2, 
  TrendingUp, Users, Target, MapPin, Package, Layout, Hammer, Plus,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChurchBrickBuilder from './ChurchBrickBuilder';
import confetti from 'canvas-confetti';

import html2canvas from 'html2canvas';
import { useRef } from 'react';

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

  const campaignRef = useRef<HTMLDivElement>(null);

  const [base64Background, setBase64Background] = useState<string | null>(null);

  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState(''); // Stores comma-separated numbers
  const [isSending, setIsSending] = useState(false);

  const [campaignFilename, setCampaignFilename] = useState<string>('');

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
  const fundRaiserPosterUrl = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/StBarnabasFinal04May.png";
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

  useEffect(() => {
    if (selectedProject?.graphic_url) {
      fetch(selectedProject.graphic_url)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => setBase64Background(reader.result as string);
          reader.readAsDataURL(blob);
        });
    }
  }, [selectedProject]);

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

  const handleShare = async (project: any) => {
    const publicHubUrl = `https://sbo-0qa.pages.dev${shopId}&view=give&project_id=${project.project_id}`;
    
    const shareData = {
      title: `Support: ${project.project_name}`,
      text: `Praise God! Join us at ACK St. Barnabas as we raise funds for ${project.project_name}. Every contribution counts!`,
      url: publicHubUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} \n\nSupport here: ${shareData.url}`);
        alert("Link copied! You can now paste it to share.");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };


  const handleFinalSend = async () => {
    setIsSending(true);
  
    // 1. Clean the input string into an array of numbers
    const numbersArray = phoneNumbers
      .split(',')
      .map(num => num.trim())
      .filter(num => num.length >= 10);

    try {
      // 2. Loop through and trigger n8n for each recipient
      // Note: You can also update n8n to accept an array to do this in one hit
      for (const number of numbersArray) {

        // Format number to ensure it starts with 254
        const formattedNumber = number.startsWith('0') 
          ? '254' + number.slice(1) 
          : number;

        await fetch('https://n8n.tenear.com/webhook/send-to-donor2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: number,
            member_name: userData?.first_name,
            campaign_img: campaignFilename, // The filename from your Supabase upload
            shop_id: 68
          })
        });
      }
    
      alert(`Successfully shared with ${numbersArray.length} friends!`);
      setIsRecipientModalOpen(false);
      setIsCampaignMode(false);
    } catch (err) {
      alert("There was an issue sending. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!campaignPhoto) return alert("Please upload your family portrait first!");
    if (!campaignRef.current) return;
   

     try {
       // 1. Capture the full graphic (Base + Portrait + Hashtag)
       const canvas = await html2canvas(campaignRef.current, {
         useCORS: true,
         scale: 1.5, // Perfect balance for WhatsApp
       });
    
       const compositeImage = canvas.toDataURL('image/jpeg', 0.8);

       // 2. Send to your n8n 'Heavy Lifter'

       const fileName = `challenge_${userData?.first_name || 'member'}_${Date.now()}.jpg`;
       setCampaignFilename(fileName);

       // 3. Send the image to n8n to be saved in Supabase
       // We send it now so the image is "ready" before the member even finishes typing numbers

       const response = await fetch('https://n8n.tenear.com/webhook/share-with-donor', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           shop_id: shopId,
           member_name: userData?.first_name || 'Member',
           image_data: compositeImage,
           file_name: fileName, // Tell n8n what to name the file in Supabase
           target_url: `https://sbo-0qa.pages.dev{shopId}&view=give&m_id=${userData?.id}`
         })
       });

       if (response.ok) {
         // 4. INSTEAD OF CLOSING: Open the Recipients Modal
         setIsRecipientModalOpen(true); 
       } else {
         throw new Error("Failed to prep image");
       }
     } catch (err) {
       console.error("Workflow Error:", err);
       alert("Could not generate poster. Please try again.");
     }
  };
    

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

      {isCampaignMode && selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 max-w-xl w-full space-y-6 shadow-2xl overflow-hidden relative">
            
            {/* NEW TOP SECTION: Official Logo replacing the "Campaign Poster" text */}
            <div className="flex flex-col items-center justify-center pt-2 pb-4">
               <img 
                 src="https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church-logos/StBarnanasGoldenFinal27apr.jpeg" 
                 className="w-5 h-5 drop-shadow-md mb-2" 
                 alt="St. Barnabas Official Seal" 
               />
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">100 Day Challenge</p>
            </div>

            {/* DYNAMIC CANVAS PREVIEW */}
            <div ref={campaignRef} className="relative w-full aspect-[1.91/1] bg-gray-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              {/* Layer 1: Base Graphic */}
              <img 
                src={base64Background || "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/StBarnabasFinal04May.png"} 
                className="w-full h-full object-cover" 
                alt="Background" 
              />

              {/* Layer 2: Interactive Member Photo Placeholder */}
              <label className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[18%] aspect-square rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white flex items-center justify-center cursor-pointer group z-50 hover:scale-105 transition-transform">
                {campaignPhoto ? (
                  <img src={campaignPhoto} className="w-full h-full object-cover" alt="Member" />
                ) : (
                  <div className="text-center">
                    <Camera size={20} className="text-blue-600 mx-auto" />
                    <span className="text-[7px] font-black block text-blue-600 uppercase">ADD PHOTO</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
              </label>
            </div>

            {/* NEW: Clean Info Section (Below the image) */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
              <div className="flex justify-between items-center text-center">
                <div className="flex-1">
                  <p className="text-[8px] font-black text-blue-400 uppercase">Paybill</p>
                  <p className="text-sm font-black text-gray-700">247247</p>
                </div>
                <div className="h-8 w-[1px] bg-blue-100"></div>
                <div className="flex-1">
                  <p className="text-[8px] font-black text-blue-400 uppercase">Account No.</p>
                  <p className="text-sm font-black text-blue-600 uppercase">
                    341009#{userData?.first_name || 'MEMBER'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsCampaignMode(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs">BACK</button>
              
              <button 
                onClick={() => setIsRecipientModalOpen(true)} 
                className="flex-1 py-4 bg-blue-600 ...">
                <Share2 size={16} /> SHARE TO WHATSAPP
              </button>

            </div>
          </div>
        </div>
      )}   
  
      {isRecipientModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Share2 className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-800">Send to Friends</h3>
              <p className="text-xs text-gray-500 font-medium">Enter M-Pesa numbers separated by commas.</p>
            </div>

            <textarea
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 font-bold text-gray-900 text-sm focus:border-blue-400 outline-none transition-all h-32"
              placeholder="0712345678, 0722000000..."
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setIsRecipientModalOpen(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-black text-xs"
              >
                CANCEL
              </button>
              <button 
                onClick={handleFinalSend}
                disabled={!phoneNumbers || isSending}
                className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 className="animate-spin" size={16} /> : "SEND NOW"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
