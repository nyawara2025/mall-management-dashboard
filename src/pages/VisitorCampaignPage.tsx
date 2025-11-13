import React, { useState, useEffect } from 'react';
import { CheckCircle, Gift, MapPin, User, Calendar, Star, ArrowRight, ExternalLink } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  description: string;
  benefits: string;
  shop_name: string;
  shop_id: string;
  mall_id: number;
  scan_count: number;
  created_at: string;
}

interface VisitorCampaignPageProps {
  checkInData: {
    location: string;
    zone: string;
    mall: string;
    shop: string;
    visitor_type: string;
    timestamp: string;
  };
  onBackToCheckIn: () => void;
}

const MALL_NAMES: Record<string, string> = {
  '3': 'China Square Mall',
  '6': 'Langata Mall', 
  '7': 'NHC Mall'
};

const SHOP_NAMES: Record<string, string> = {
  '3': 'Spatial Barbershop & Spa',
  '6': 'Kika Wines & Spirits',
  '9': 'Maliet Salon & Spa'
};

const VISITOR_TYPES: Record<string, string> = {
  'first_time_visitor': 'First Time Visitor',
  'loyal_customer': 'Loyal Customer',
  'tourist': 'Tourist/Explorer',
  'family_group': 'Family Group',
  'business_visitor': 'Business Visitor',
  'social_visitor': 'Social Visitor'
};

export default function VisitorCampaignPage({ checkInData, onBackToCheckIn }: VisitorCampaignPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [checkInData.mall, checkInData.shop]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      // Call N8N webhook to get campaigns
      const webhookUrl = 'https://n8n.tenear.com/webhook/get-campaigns';
      
      const params = new URLSearchParams({
        mall_id: checkInData.mall,
        shop_id: checkInData.shop,
        visitor_type: checkInData.visitor_type
      });

      console.log('🎯 Fetching campaigns for:', { 
        mall_id: checkInData.mall, 
        shop_id: checkInData.shop,
        visitor_type: checkInData.visitor_type
      });

      // Create timeout promise (8 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Campaign fetch timeout')), 8000)
      );

      const fetchPromise = fetch(`${webhookUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (response.ok) {
        const campaignsData = await response.json();
        console.log('✅ Campaigns fetched:', campaignsData);
        setCampaigns(campaignsData.campaigns || []);
      } else {
        throw new Error(`Failed to fetch campaigns: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      // Provide mock campaigns for demonstration
      setMockCampaigns();
    } finally {
      setLoading(false);
    }
  };

  const setMockCampaigns = () => {
    const mockCampaigns: Campaign[] = [
      {
        id: 1,
        name: 'Welcome Special Offer',
        description: `Welcome to ${SHOP_NAMES[checkInData.shop]}! Enjoy our special welcome offer for ${VISITOR_TYPES[checkInData.visitor_type].toLowerCase()}s.`,
        benefits: '• 20% off your first service\n• Free consultation\n• Welcome gift package',
        shop_name: SHOP_NAMES[checkInData.shop],
        shop_id: checkInData.shop,
        mall_id: parseInt(checkInData.mall),
        scan_count: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Loyalty Rewards Program',
        description: 'Join our exclusive loyalty program and unlock amazing rewards for your future visits.',
        benefits: '• Points for every visit\n• Birthday special discounts\n• Priority booking\n• Exclusive member events',
        shop_name: SHOP_NAMES[checkInData.shop],
        shop_id: checkInData.shop,
        mall_id: parseInt(checkInData.mall),
        scan_count: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Social Media Special',
        description: 'Follow us on social media and get instant discounts on your next visit.',
        benefits: '• 15% off for followers\n• Instagram-worthy moments\n• Share and win prizes\n• Exclusive social media offers',
        shop_name: SHOP_NAMES[checkInData.shop],
        shop_id: checkInData.shop,
        mall_id: parseInt(checkInData.mall),
        scan_count: 0,
        created_at: new Date().toISOString()
      }
    ];
    setCampaigns(mockCampaigns);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Campaigns</h2>
          <p className="text-gray-600">Finding the best offers for you...</p>
        </div>
      </div>
    );
  }

  if (selectedCampaign) {
    return <CampaignDetailView 
      campaign={selectedCampaign} 
      onBack={() => setSelectedCampaign(null)}
      onBackToCheckIn={onBackToCheckIn}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToCheckIn}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              Back to Check-in
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Campaigns</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Welcome!</h2>
              <p className="text-purple-100">Check-in successful at {MALL_NAMES[checkInData.mall]}</p>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{SHOP_NAMES[checkInData.shop]}</span>
            </div>
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2" />
              <span>{VISITOR_TYPES[checkInData.visitor_type]}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(checkInData.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Exclusive Offers</h3>
          <p className="text-gray-600 text-sm">Personalized campaigns just for you</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Campaigns Yet</h4>
            <p className="text-gray-600">Check back soon for exciting offers!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onClick={() => setSelectedCampaign(campaign)}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={fetchCampaigns}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🔄 Refresh Campaigns
          </button>
          
          <button
            onClick={onBackToCheckIn}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

// Campaign Card Component
function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-1">{campaign.name}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
          </div>
          <Gift className="h-6 w-6 text-purple-600 ml-2" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{campaign.scan_count} people interested</span>
          </div>
          <ArrowRight className="h-5 w-5 text-purple-600" />
        </div>
      </div>
    </div>
  );
}

// Campaign Detail View Component
function CampaignDetailView({ 
  campaign, 
  onBack, 
  onBackToCheckIn 
}: { 
  campaign: Campaign; 
  onBack: () => void; 
  onBackToCheckIn: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              Back
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Campaign Details</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="bg-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Gift className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{campaign.name}</h2>
            <p className="text-gray-600">{campaign.description}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Benefits & Offers</h4>
              <div className="text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                {campaign.benefits}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Shop</div>
                <div className="font-semibold">{campaign.shop_name}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Interested</div>
                <div className="font-semibold">{campaign.scan_count} people</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              🎯 Redeem Offer
            </button>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              <ExternalLink className="h-4 w-4 inline mr-2" />
              Learn More
            </button>
            
            <button
              onClick={onBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ← Back to Campaigns
            </button>
            
            <button
              onClick={onBackToCheckIn}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ← Back to Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
