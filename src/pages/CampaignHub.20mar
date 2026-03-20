import React, { useState } from 'react'; // Added useState
import { BookOpen, MessageSquare, Calendar, Award, MessageCircle } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal'; // Import your new modal

export function CampaignHub() {
  const queryParams = new URLSearchParams(window.location.search);
  const shopId = queryParams.get('shop_id');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Updated Actions to include a "Critique" type
  
  const actions = [
    {
    title: "Manifesto",
    desc: "Read our vision for the future",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    action: () => console.log("Open Manifesto")
    },
    {
    title: "Critique / Feedback",
    desc: "Share your thoughts directly",
    icon: MessageSquare,
    color: "bg-red-100 text-red-600",
    action: () => setIsModalOpen(true)
    },
    {
    title: "Town Hall",
    desc: "Join our next virtual meeting",
    icon: Calendar,
    color: "bg-green-100 text-green-600",
    action: () => console.log("Open Town Hall")
    },
    {
    title: "Volunteer",
    desc: "Join the movement today",
    icon: Award,
    color: "bg-orange-100 text-orange-600",
    action: () => console.log("Open Volunteer")
    }
  ];



  const handleFeedbackSubmit = async (feedbackText: string) => {
    try {
      await fetch('https://n8n.tenear.com/webhook/political-campaign-interactions', {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header and Profile Info... */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        {actions.map((item, idx) => (
          <button 
            key={idx}
            onClick={item.action}
            className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition text-left"
          >
            <div className={`p-3 rounded-lg mr-4 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* The Modal Component */}
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFeedbackSubmit}
        candidateName="Hon. Dr. James Wambura Nyikal"
      />
    </div>
  );
}
