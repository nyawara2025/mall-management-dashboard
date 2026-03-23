import React, { useState, useEffect } from 'react';
import { BookOpen, MessageCircle } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

export function CampaignHub() {
  const queryParams = new URLSearchParams(window.location.search);
  const shopId = queryParams.get('shop_id');
  const target = queryParams.get('target') || 'manifesto';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ai' | 'critique'>('ai');
  const [candidateData, setCandidateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    async function initHub() {
      if (!shopId) return;
      try {
        fetch("https://n8n.tenear.com/webhook/political-campaign-interactions", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'track_campaign_view', 
            shop_id: shopId, 
            target: target,
            business_category: 'political' 
          })
        });

        const response = await fetch("https://n8n.tenear.com/webhook/get-political-campaign-material", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_metadata', shop_id: shopId, target: target })
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const result = await response.json();
        
        // n8n often sends an array [ {...} ]. This ensures we get the object.
        const actualData = Array.isArray(result) ? result[0] : result;
        
        if (actualData) {
          setCandidateData(actualData);
        }

      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    initHub();
  }, [shopId, target]);

  const handleAction = async (actionType: string, sectionId: string, url?: string) => {
    try {
      await fetch('https://n8n.tenear.com/webhook/get-political-campaign-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType === 'link' ? 'fetch_manifesto' : actionType,
          target: sectionId,
          shop_id: shopId,
          business_category: 'political'
        })
      });
    } catch (e) {
      console.error("Interaction log failed", e);
    }

    if (actionType === 'link') {
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert("The manifesto document is currently being updated. Please try again in a moment.");
      }
    } else if (actionType === 'ai' || actionType === 'critique') {
      setModalMode(actionType === 'ai' ? 'ai' : 'critique');
      setAiResponse(null); // Reset response when opening
      setIsModalOpen(true);
    } else if (actionType === 'share') {
      const shareText = `🗳️ Check out the official Campaign Hub for ${candidateData?.name || 'our candidate'}!\n\n📜 ${candidateData?.pillar_title || 'Manifesto'}\n🔗 ${window.location.href}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleFeedbackSubmit = async (text: string, phone: string) => {
    const isAI = modalMode === 'ai';
    const endpoint = isAI 
      ? "https://n8n.tenear.com/webhook/political-AI" 
      : "https://n8n.tenear.com/webhook/get-political-campaign-material";

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isAI ? 'query_rag' : 'critique', 
          shop_id: shopId,
          content: text,
          voter_phone: phone,
          business_category: 'political',
          candidate_name: candidateData?.name
        })
      });

      if (isAI && response.ok) {
        const data = await response.json();
        // Handle n8n returning an array or single object
        const result = Array.isArray(data) ? data[0] : data;
      
        if (result && result.output) {
          setAiResponse(result.output);
          // Note: We do NOT call setIsModalOpen(false) here so the user can read the response
        } else {
          alert("AI responded, but no content was found.");
          setIsModalOpen(false);
        }
      } else if (!isAI) {
        alert("Feedback sent successfully!");
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error("Submission failed", e);
      setIsModalOpen(false);
    }
  };

  const manifestoSection = {
    id: 'manifesto',
    title: candidateData?.pillar_title || "Official Manifesto",
    desc: candidateData?.policy_details || "Accessing vision...",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    actions: [
      { label: 'Read', type: 'link', url: candidateData?.manifesto_pdf_url || '#' },
      { label: 'Query', type: 'ai' },
      { label: 'Share', type: 'share' }
    ]
  };

  const critiqueSection = {
    id: 'critique',
    title: "Critique / Feedback",
    desc: "Share your thoughts directly with the aspirant's team.",
    icon: MessageCircle,
    color: "bg-red-100 text-red-600",
    actions: [
      { label: 'Feedback', type: 'critique' }
    ]
  };

  const sections = [manifestoSection, critiqueSection];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Header Profile Section */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center mb-6 mt-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto border-4 border-white shadow-md">
          {candidateData?.photo_url ? (
            <img src={candidateData.photo_url} alt="Candidate" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xl">{isLoading ? "..." : "TE"}</div>
          )}
        </div>
        <h1 className="text-3xl font-black text-gray-900 mt-4 tracking-tight leading-none">Campaign 2027</h1>
        {candidateData?.name && (
          <p className="text-blue-600 font-bold text-sm mt-3 uppercase tracking-widest">{candidateData.name}</p>
        )}
      </div>

      {/* Content Cards */}
      <div className="w-full max-w-md space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 flex items-start">
              <div className={`p-3 rounded-xl mr-4 ${section.color}`}>
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-none">{section.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-tight whitespace-pre-line">{section.desc}</p>
              </div>
            </div>
            
            <div className="flex border-t border-gray-50 bg-gray-50/50">
              {section.actions.map((btn, bIdx) => (
                <React.Fragment key={`${section.id}-btn-${bIdx}`}>
                  <button 
                    onClick={() => handleAction(btn.type, section.id, (btn as any).url)}
                    className="flex-1 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    {btn.label}
                  </button>
                  {bIdx < section.actions.length - 1 && <div className="w-px bg-gray-200 my-3" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setAiResponse(null); }} 
        onSubmit={handleFeedbackSubmit}
        candidateName={candidateData?.name || "the Candidate"}
        mode={modalMode}
        aiResponse={aiResponse}
      />

      <div className="mt-8 mb-4 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-mono">Powered by TeNEAR Space</p>
      </div>
    </div>
  );
}

