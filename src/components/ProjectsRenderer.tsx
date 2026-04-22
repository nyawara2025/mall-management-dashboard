import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, Heart, MessageCircle, Share2, 
  TrendingUp, Users, Target, Info, MapPin, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  project_id: string;
  project_name: string;
  project_details: string;
  estimated_cost: number;
  funds_available: number;
  donors: string;
  location: string;
  type: string;
}

interface ProjectsRendererProps {
  view: 'planned' | 'fundraising';
  onBack: () => void;
}

export const ProjectsRenderer = ({ view, onBack }: ProjectsRendererProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Permission Check: Is this a Projects/Development Staff member?
  const isProjectStaff = user?.department?.toLowerCase().includes('project') || 
                         user?.department?.toLowerCase().includes('development');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/fetch-projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            shop_id: user?.shop_id, 
            type: view === 'planned' ? 'planned' : 'all' 
          }),
        });
        const data = await response.json();
        setProjects(data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [view, user?.shop_id]);

  const handleShare = async (project: Project) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support: ${project.project_name}`,
          text: `Help us build ${project.project_name} at our church! Current Progress: ${Math.round((project.funds_available / project.estimated_cost) * 100)}%`,
          url: window.location.href,
        });
      } catch (err) { console.log("Share failed", err); }
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* View Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-black text-gray-800">
          {view === 'planned' ? 'Upcoming Projects' : 'Social Fundraiser Hub'}
        </h3>
      </div>

      {projects.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-3xl text-center text-gray-400 font-bold">
          No active projects found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((proj) => {
            const progress = Math.min(100, Math.round((proj.funds_available / proj.estimated_cost) * 100));
            
            return (
              <div key={proj.project_id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-gray-900">{proj.project_name}</h4>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                      <MapPin size={12} /> {proj.location || 'Church Grounds'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-600">{progress}%</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{proj.project_details}</p>

                {/* Fundraising Specific View */}
                {view === 'fundraising' && (
                  <div className="space-y-6">
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                    
                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                       <div>
                         <p className="text-[10px] font-black text-blue-400 uppercase">Raised so far</p>
                         <p className="font-black text-blue-700">KES {proj.funds_available.toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-black text-blue-400 uppercase">Target Goal</p>
                         <p className="font-black text-blue-700">KES {proj.estimated_cost.toLocaleString()}</p>
                       </div>
                    </div>

                    {/* Social Interaction Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-4">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold transition">
                          <Heart size={20} /> <span className="text-xs">24</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 font-bold transition">
                          <MessageCircle size={20} /> <span className="text-xs">8 Comments</span>
                        </button>
                      </div>

                      {/* Admin-Only Details (Staff View) */}
                      {isProjectStaff && (
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleShare(proj)}
                             className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-100"
                           >
                             <Share2 size={16} /> SHARE CAMPAIGN
                           </button>
                           <button className="p-2 bg-gray-900 text-white rounded-xl hover:bg-black transition">
                             <Users size={16} />
                           </button>
                        </div>
                      )}
                    </div>

                    {/* Donor Details (Staff View Only) */}
                    {isProjectStaff && proj.donors && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Internal Donor Log</h5>
                        <p className="text-xs text-gray-600 font-medium italic">"{proj.donors}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
