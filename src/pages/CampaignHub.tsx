import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Calendar, Award, Share2 } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

export function CampaignHub() {
  // Use a state-based initializer for searchParams to ensure stability
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const shopId = searchParams.get('shop_id');
  const target = searchParams.get('target') || 'manifesto';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Unified Hub Initialization
  useEffect(() => {
    async function initHub() {
      console.log("--- Campaign Hub Mounting ---");
      console.log("Detected ShopID:", shopId);
      console.log("Detected Target:", target);

      if (!shopId) {
        console.error("Initialization aborted: No shop_id found in URL.");
        setIsLoading(false);
        return;
      }

      try {
        // A. Track Initial View
        console.log("Sending track_campaign_view to n8n...");
        fetch("https://n8n.tenear.com/webhook/political-campaign-interactions", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'track_campaign_view', 
            shop_id: shopId, 
            target: target,
            business_category: 'political' 
          })
        }).then(() => console.log("n8n: Tracking webhook fired successfully."));

        // B. Fetch Candidate Metadata
        console.log("Fetching candidate metadata from n8n...");
        const response = await fetch("https://n8n.tenear.com/webhook/get-political-campaign-material", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_metadata', shop_id: shopId, target: target })
        });
        
        const result = await response.json();
        console.log("n8n metadata raw result:", result);

        // n8n returns an array [{...}], so we extract the first object
        const data = Array.isArray(result) ? result[0] : result;
        
        if (data) {
          console.log("Success: Candidate data mapped for", data.name);
          setCandidateData(data);
        } else {
          console.warn("Metadata request succeeded but returned no data.");
        }
      } catch (e) {
        console.error("Hub initialization failed:", e);
      } finally {
        setIsLoading(false);
      }
    }

    initHub();
  }, [shopId, target]);

  // 2. Define Campaign Sections
  const sections = [
    {
    id: 'manifesto',
    title: candidateData?.pillar_title || "Official Manifesto",
    desc: candidateData?.policy_details || "Accessing campaign vision...",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600"
    },
    {
    id: 'feedback',
    title: "Critique / Feedback",
    desc: "Share your thoughts directly with the candidate's team.",
    icon: MessageSquare,
    color: "bg-red-100 text-red-600"
    },
    {
    id: 'townhall',
    title: "Town Hall",
    desc: "Join our next virtual meeting and view the schedule.",
    icon: Calendar,
    color: "bg-green-100 text-green-600"
    },
    {
    id: 'volunteer',
    title: "Volunteer",
    desc: "Join the movement and support the 2027 vision.",
    icon: Award,
    color: "bg-orange-100 text-orange-600"
    }
  ];

  // 3. Action Handlers
  const handleAction = async (type: string, sectionId: string) => {
    console.log(`Action triggered: ${type} on section ${sectionId}`);
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
          <p className="text-blue-600 font-bold text-sm mt-1 uppercase tracking-widest leading-none mt-2">{candidateData.name}</p>
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
                <p className="text-sm text-gray-500 mt-2 leading-tight whitespace-pre-line">
                    {section.desc}
                </p>
              </div>
            </div>
            
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

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFeedbackSubmit}
        candidateName={candidateData?.name || "the Candidate"}
      />

      <div className="mt-8 mb-4 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Powered by TeNEAR Space</p>
      </div>
    </div>
  );
}
