import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Heart, MessageCircle, Share2, 
  TrendingUp, Users, Target, MapPin, Package, Layout, Hammer, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChurchBrickBuilder from './ChurchBrickBuilder';

interface ProjectsRendererProps {
  view: 'planned' | 'fundraising';
  onBack: () => void;
  shopId: number;
}

export const ProjectsRenderer = ({ view, onBack, shopId }: ProjectsRendererProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDonorLog, setShowDonorLog] = useState<string | null>(null);
  const [newDonor, setNewDonor] = useState({ name: '', amount: 0, type: 'Brick' });
 
  const [isActuallyStaff, setIsActuallyStaff] = useState(false);
 
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
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: shopId,
            user_id: user?.id // Pass this so n8n can do the lookup
          }),
        });

        const data = await response.json();
        setProjects(data.projects || []);
        setIsActuallyStaff(data.isStaff || false);
      } catch (error) { 
        console.error("Fetch error:", error); 
      } finally { 
        setIsLoading(false); 
      }
    };

    fetchProjects();
  }, [view, shopId, user?.department]);

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
          project_name: proj.project_name,
          shop_id: shopId,
          bricks_equivalent: bricks,
          ironsheets_equivalent: ironsheets,
          user_department: user?.department,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert(`Praise God! Victory Alert Published for ${bricks} bricks.`);
        setShowDonorLog(null);
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
          const totalSheets = Math.floor((proj.funds_available % 1000) / 800);

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

              {view === 'fundraising' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex flex-col items-center">
                      <Layout className="text-orange-600 mb-2" size={24} />
                      <p className="text-[10px] font-black text-orange-400 uppercase">Bricks Sowed</p>
                      <p className="text-xl font-black text-orange-700">{totalBricks.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center">
                      <Package className="text-blue-600 mb-2" size={24} />
                      <p className="text-[10px] font-black text-blue-400 uppercase">Ironsheets Funded</p>
                      <p className="text-xl font-black text-blue-700">{totalSheets.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Calculate total bricks based on estimated cost (1000 per brick) */}
                  <ChurchBrickBuilder 
                    estimatedCost={proj.estimated_cost}
                    fundsAvailable={proj.funds_available}
                    donorLogs={proj.donor_logs || []}
                    isStaff={!!isProjectStaff} // The '!!' fixes the 'boolean | undefined' error
                  />

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex gap-4">
                      <button className="text-gray-300 hover:text-red-500 transition"><Heart size={20} /></button>
                      <button className="text-gray-300 hover:text-blue-500 transition" onClick={() => handleShare(proj)}><Share2 size={20} /></button>
                    </div>
                  </div>

                  {/* Staff-Only: Donor Intelligence Log & Display */}
                  {(isProjectStaff || isActuallyStaff) && (
                    <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white animate-in zoom-in">
                      <div className="flex justify-between items-center mb-6">
                        <h5 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Donor Intelligence Log</h5>
                        <button 
                          onClick={() => setShowDonorLog(showDonorLog === proj.project_id ? null : proj.project_id)} 
                          className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-blue-700 transition"
                        >
                          <Plus size={14} /> Log New Donor
                        </button>
                      </div>

                      {/* Explicit Mapping for Existing Donors */}
                      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {proj.donor_logs?.length > 0 ? (
                          proj.donor_logs.map((log: any, idx: number) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-white">{log.name}</p>
                                <p className="text-[10px] text-blue-300 italic">"{log.message}"</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-blue-400">KES {log.amount.toLocaleString()}</p>
                                <p className="text-[9px] uppercase tracking-tighter text-gray-500">{log.type}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl">
                            <Users size={20} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-[10px] text-gray-500 uppercase">No donor data synced</p>
                          </div>
                        )}
                      </div>

                      {/* Toggleable Form to Add New Donor */}
                      {showDonorLog === proj.project_id && (
                        <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-blue-500/30 animate-in slide-in-from-top-2">
                          <input 
                            placeholder="Donor Name" 
                            className="w-full bg-transparent border-b border-white/20 p-2 text-sm outline-none focus:border-blue-400 transition" 
                            onChange={(e) => setNewDonor({...newDonor, name: e.target.value})} 
                          />
                          <input 
                            type="number" 
                            placeholder="Amount (KES)" 
                            className="w-full bg-transparent border-b border-white/20 p-2 text-sm outline-none focus:border-blue-400 transition" 
                            onChange={(e) => setNewDonor({...newDonor, amount: parseInt(e.target.value) || 0})} 
                          />
                          <button 
                            onClick={() => handleVictoryAlert(proj)}
                            className="w-full bg-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition"
                          >
                            Publish Victory Alert
                          </button>
                        </div>
                

                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

