import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { VoterDiscoveryModal } from './components/VoterDiscoveryModal';
import { CampaignHub } from './pages/CampaignHub';

export default function VoterApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');

  // If a candidate is selected, show their specific Hub
  if (shopId) {
    return (
      <>
        <button
          onClick={() => setSearchParams({})} 
          className="fixed bottom-6 left-6 z-50 bg-white shadow-xl px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 border"
        >
          ← Change Candidate
        </button>

        <CampaignHub />;
      </>
    );
  }

  // Otherwise, show the Discovery Modal
  return (
    <div className="min-h-screen bg-gray-900/10 flex items-center justify-center">
      <VoterDiscoveryModal 
        isOpen={true} 
        onClose={() => {}} // In the voter app, we keep this open
        onSelectCandidate={(id) => {
          // This updates the URL to: ?shop_id=ID&business_category=political
          // Which immediately triggers the 'if (shopId)' block above
          setSearchParams({ 
            shop_id: id, 
            business_category: 'political' 
          });
        }} 
      />
    </div>
  );
}
