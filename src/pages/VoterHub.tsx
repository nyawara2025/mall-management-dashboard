import React, { useEffect } from 'react';
import { BookOpen, MessageCircle, Calendar, Share2, Info, ArrowRight } from 'lucide-react';

// This would typically come from your Cloudflare Worker / URL params
interface VoterHubProps {
  shopId: string;
  candidateName?: string;
}

export default function VoterHub({ shopId, candidateName = "Campaign 2027" }: VoterHubProps) {
  
  const trackVoterAction = async (action: string, materialId: string) => {
    try {
      await fetch('https://n8n.tenear.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          action: action,
          material_id: materialId,
          business_category: 'political',
          timestamp: new Date().toISOString(),
          platform: 'voter_hub'
        })
      });
    } catch (e) { console.error("Tracking failed", e); }
  };

  const campaignMaterials = [
    { id: 'manifesto', title: 'Official Manifesto', icon: BookOpen, color: 'bg-blue-600', description: 'Read our vision for the constituency.' },
    { id: 'projects', title: 'Proposed Projects', icon: Info, color: 'bg-green-600', description: 'Development plans and ongoing work.' },
    { id: 'townhall', title: 'Virtual Town Hall', icon: MessageCircle, color: 'bg-orange-500', description: 'Ask questions directly to the candidate.' },
    { id: 'rally', title: 'Rally Schedule', icon: Calendar, color: 'bg-red-600', description: 'Find out when we are in your ward.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Candidate Header */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 mb-6 text-center border border-gray-100">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
           <img src="/candidate-placeholder.jpg" alt="Candidate" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{candidateName}</h1>
        <p className="text-primary-600 font-medium">Official Campaign Hub</p>
      </div>

      {/* Material Grid */}
      <div className="w-full max-w-md space-y-4">
        {campaignMaterials.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-lg text-white`}>
                <item.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-t border-gray-50 bg-gray-50/50">
              <button 
                onClick={() => trackVoterAction('query', item.id)}
                className="py-3 text-xs font-semibold text-gray-600 hover:text-primary-600 border-r border-gray-100 flex items-center justify-center gap-1"
              >
                Query
              </button>
              <button 
                onClick={() => trackVoterAction('book', item.id)}
                className="py-3 text-xs font-semibold text-gray-600 hover:text-primary-600 border-r border-gray-100 flex items-center justify-center gap-1"
              >
                Book
              </button>
              <button 
                onClick={() => trackVoterAction('share', item.id)}
                className="py-3 text-xs font-semibold text-gray-600 hover:text-primary-600 flex items-center justify-center gap-1"
              >
                <Share2 size={12} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <footer className="mt-auto py-8 text-center">
        <p className="text-xs text-gray-400">Powered by <span className="font-bold">TeNEAR Space</span></p>
      </footer>
    </div>
  );
}
