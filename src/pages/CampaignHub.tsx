import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Calendar, Award, Share2, MessageCircle, HelpCircle } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

export function CampaignHub() {
  const queryParams = new URLSearchParams(window.location.search);
  const shopId = queryParams.get('shop_id');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Candidate Metadata (Photo & Name)
  useEffect(() => {
    async function loadMetadata() {
      try {
        const response = await fetch("https://n8n.tenear.com/webhook/get-political-campaign-material", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_metadata', shop_id: shopId, target: 'manifesto' })
        });
        const result = await response.json();
        // Handle n8n array response safely
        const data = Array.isArray(result) ? result[0] : result;
        setCandidateData(data);
      } catch (e) {
        console.error("Failed to load candidate metadata", e);
      } finally {
        setIsLoading(false);
      }
    }
    if (shopId) loadMetadata();
  }, [shopId]);

  // 2. Define Campaign Sections with proper IDs for TypeScript
  const sections = [
    {
      id: 'manifesto',
      title: "Manifesto",
      desc: "Read our vision for the future",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 'feedback',
      title: "Critique / Feedback",
      desc: "Share your thoughts directly",
      icon: MessageSquare,
      color: "bg-red-100 text-red-600"
    },
    {
      id: 'townhall',
      title: "Town Hall",
      desc: "Join our next virtual meeting",
      icon: Calendar,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 'volunteer',
      title: "Volunteer",
      desc: "Join the movement today",
      icon: Award,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  // 3. Action Handlers
  const handleAction = async (type: string, sectionId: string) => {
    // Log to n8n for analytics
    try {
      await fetch('https://n8n.tenear.com/webhook/political-campaign-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type,
          target: sectionId,
          shop_id: shopId,
          business_category: 'political'
        })
      });
    } catch (e) {
      console.error("Analytics log failed", e);
    }

    // Trigger the Modal for 'query' or the 'feedback' section
    if (type === 'query' || sectionId === 'feedback') {
      setIsModalOpen(true);
    }
  };

  const handleFeedbackSubmit = async (feedbackText: string) => {
    try {
      await fetch('https://n8n.tenear.com/webhook/get-political-campaign-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          shop_id: shopId,
          feedback: feedbackText,
          business_category: 'political'
        })
      });
      alert("Feedback received! Thank you for engaging.");
    } catch (error) {
      console.error("Feedback failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Profile Header */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-6 mt-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto border-4 border-white shadow-md">
            {candidateData?.photo_url ? (
              <img src={candidateData.photo_url} alt="Candidate" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">
                {isLoading ? "..." : "TE"}
              </div>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mt-4 tracking-tight">Campaign 2027</h1>
        <p className="text-gray-500 font-medium">Official Campaign Hub</p>
        {candidateData?.name && (
          <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-widest">{candidateData.name}</p>
        )}
      </div>

      {/* Action Cards */}
      <div className="w-full max-w-md space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 flex items-start">
              <div className={`p-3 rounded-xl mr-4 ${section.color}`}>
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-none">{section.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-tight">{section.desc}</p>
              </div>
            </div>
            
            {/* Sub-Actions Footer */}
            <div className="flex border-t border-gray-50 bg-gray-50/50">
              <button 
                onClick={() => handleAction('query', section.id)}
                className="flex-1 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                Query
              </button>
              <div className="w-px bg-gray-200 my-3"></div>
              <button 
                onClick={() => handleAction('book', section.id)}
                className="flex-1 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Book
              </button>
              <div className="w-px bg-gray-200 my-3"></div>
              <button 
                onClick={() => handleAction('share', section.id)}
                className="flex-1 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-3 h-3" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* The Feedback Modal */}
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFeedbackSubmit}
        candidateName={candidateData?.name || "Hon. Dr. James Wambura Nyikal"}
      />

      <div className="mt-8 mb-4 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Powered by TeNEAR Space</p>
      </div>
    </div>
  );
}
