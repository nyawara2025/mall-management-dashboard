import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Heart, MessageCircle, Share2, 
  TrendingUp, Users, Target, MapPin, Package, Layout, Hammer, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

  const isProjectStaff = user?.department?.toLowerCase().includes('project') || 
                         user?.department?.toLowerCase().includes('development');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId, type: view === 'planned' ? 'planned' : 'all' }),
        });
        const data = await response.json();
        setProjects(data || []);
      } catch (error) { console.error("Fetch error:", error); } finally { setIsLoading(false); }
    };
    fetchProjects();
  }, [view, shopId]);

  const handleVictoryAlert = async (proj: any) => {
    // Calculates materials based on your price list
    const bricks = Math.floor(newDonor.amount / 1000);
    const ironsheets = Math.floor((newDonor.amount % 1000) / 800);
    
    await fetch('https://n8n.tenear.com/webhook/church-victory-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newDonor,
        project_name: proj.project_name,
        shop_id: shopId,
        bricks,
        ironsheets
      })
    });
    alert("Victory Alert Published! WhatsApp notification sent.");
    setShowDonorLog(null);
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><ArrowLeft size={18} /></button>
        <h3 className="text-xl font-black text-gray-800">{view === 'planned' ? 'Upcoming Projects' : 'Social Fundraiser Hub'}</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((proj) => {
          const progress = Math.min(100, Math.round((proj.funds_available / proj.estimated_cost) * 100));
          // Visual math for materials
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
                  {/* Visual Material Grid */}
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

                  {/* Staff Donor Intelligence Section */}
                  {isProjectStaff && (
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Intelligence: Log Individual Donor</h5>
                        <button onClick={() => setShowDonorLog(proj.project_id)} className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Plus size={14} /> Log Donor
                        </button>
                      </div>

                      {showDonorLog === proj.project_id && (
                        <div className="space-y-3 bg-white/5 p-4 rounded-2xl animate-in fade-in">
                          <input placeholder="Donor Name" className="w-full bg-transparent border-b border-white/20 p-2 text-sm outline-none" onChange={(e)=>setNewDonor({...newDonor, name: e.target.value})} />
                          <input type="number" placeholder="Amount (KES)" className="w-full bg-transparent border-b border-white/20 p-2 text-sm outline-none" onChange={(e)=>setNewDonor({...newDonor, amount: parseInt(e.target.value)})} />
                          <button onClick={() => handleVictoryAlert(proj)} className="w-full py-3 bg-emerald-600 rounded-xl text-xs font-black uppercase">Publish Victory Alert</button>
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
