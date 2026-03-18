import React from 'react';
import { BookOpen, MessageSquare, Calendar, Share2, Award } from 'lucide-react';

export function CampaignHub() {
  const queryParams = new URLSearchParams(window.location.search);
  const candidateName = "Candidate Name"; // This can be dynamic based on shop_id

  const actions =;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Candidate Profile Header */}
      <div className="text-center mb-8 mt-12">
        <div className="w-24 h-24 bg-primary-600 rounded-full mx-auto mb-4 border-4 border-white shadow-lg" />
        <h1 className="text-2xl font-bold text-gray-900">{candidateName}</h1>
        <p className="text-gray-500">2027 General Elections Hub</p>
      </div>

      {/* Grid of Interaction Icons */}
      <div className="w-full max-w-md space-y-4">
        {actions.map((action, i) => (
          <a 
            key={i} 
            href={action.link} 
            className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-transform"
          >
            <div className={`p-3 rounded-lg mr-4 ${action.color}`}>
              <action.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900">{action.title}</h3>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <button className="mt-8 flex items-center gap-2 text-primary-600 font-medium">
        <Share2 className="w-4 h-4" /> Share with Prospective Voters
      </button>
    </div>
  );
}
