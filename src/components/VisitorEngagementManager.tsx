import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Gift, 
  CheckCircle, 
  Clock, 
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Send,
  Heart,
  Share2
} from 'lucide-react';

interface VisitorClaim {
  id: string;
  visitor_id: string;
  visitor_type: string;
  campaign_id: number;
  campaign_name: string;
  claimed_at: string;
  redeemed: boolean;
  redeemed_at?: string;
  mall_id: number;
  shop_id: number;
  location: string;
  zone: string;
  engagement_score: number;
  interactions: Interaction[];
}

interface Interaction {
  id: string;
  type: 'view' | 'click' | 'claim' | 'redeem' | 'share' | 'review';
  timestamp: string;
  campaign_id?: number;
  details?: string;
}

import { User } from '../types/auth';

interface VisitorEngagementManagerProps {
  user: User;
}

export default function VisitorEngagementManager({ user }: VisitorEngagementManagerProps) {
  const [claims, setClaims] = useState<VisitorClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'claimed' | 'redeemed' | 'pending'>('all');
  const [selectedClaim, setSelectedClaim] = useState<VisitorClaim | null>(null);
  const [engagementMessage, setEngagementMessage] = useState('');

  useEffect(() => {
    fetchEngagementData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEngagementData, 30000);
    return () => clearInterval(interval);
  }, [user.shop_id, user.mall_id]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      
      // Call N8N webhook to get visitor engagement data
      const webhookUrl = 'https://n8n.tenear.com/webhook/get-visitor-engagement';
      
      const params = new URLSearchParams({
        shop_id: (user.shop_id || 0).toString(),
        mall_id: (user.mall_id || 0).toString()
      });

      const response = await fetch(`${webhookUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims || []);
      } else {
        // Mock data for demonstration
        setMockEngagementData();
      }
      
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setMockEngagementData();
    } finally {
      setLoading(false);
    }
  };

  const setMockEngagementData = () => {
    const mockClaims: VisitorClaim[] = [
      {
        id: 'claim_001',
        visitor_id: 'visitor_1734180487000_0',
        visitor_type: 'first_time_visitor',
        campaign_id: 1,
        campaign_name: 'Welcome Special Offer',
        claimed_at: '2025-11-14T01:05:00.000Z',
        redeemed: false,
        mall_id: 3,
        shop_id: 3,
        location: 'china_square_spatial_barbershop_barbershop_special_offer_first_time_visitor',
        zone: 'Spatial_Barbershop',
        engagement_score: 95,
        interactions: [
          { id: 'int_001', type: 'view', timestamp: '2025-11-14T01:04:30.000Z', campaign_id: 1 },
          { id: 'int_002', type: 'click', timestamp: '2025-11-14T01:04:45.000Z', campaign_id: 1 },
          { id: 'int_003', type: 'claim', timestamp: '2025-11-14T01:05:00.000Z', campaign_id: 1 }
        ]
      },
      {
        id: 'claim_002',
        visitor_id: 'visitor_1734179400000_1',
        visitor_type: 'loyal_customer',
        campaign_id: 2,
        campaign_name: 'Loyalty Rewards Program',
        claimed_at: '2025-11-14T00:50:00.000Z',
        redeemed: true,
        redeemed_at: '2025-11-14T00:55:00.000Z',
        mall_id: 3,
        shop_id: 3,
        location: 'loyal_customer_checkin',
        zone: 'Spatial_Barbershop',
        engagement_score: 88,
        interactions: [
          { id: 'int_004', type: 'view', timestamp: '2025-11-14T00:49:30.000Z', campaign_id: 2 },
          { id: 'int_005', type: 'claim', timestamp: '2025-11-14T00:50:00.000Z', campaign_id: 2 },
          { id: 'int_006', type: 'redeem', timestamp: '2025-11-14T00:55:00.000Z', campaign_id: 2 },
          { id: 'int_007', type: 'review', timestamp: '2025-11-14T00:56:00.000Z', details: 'Excellent service!' }
        ]
      },
      {
        id: 'claim_003',
        visitor_id: 'visitor_1734178800000_2',
        visitor_type: 'tourist',
        campaign_id: 1,
        campaign_name: 'Welcome Special Offer',
        claimed_at: '2025-11-14T00:40:00.000Z',
        redeemed: false,
        mall_id: 3,
        shop_id: 3,
        location: 'tourist_checkin',
        zone: 'Spatial_Barbershop',
        engagement_score: 72,
        interactions: [
          { id: 'int_008', type: 'view', timestamp: '2025-11-14T00:39:30.000Z', campaign_id: 1 },
          { id: 'int_009', type: 'share', timestamp: '2025-11-14T00:39:45.000Z', campaign_id: 1 }
        ]
      }
    ];
    setClaims(mockClaims);
  };

  const sendEngagementMessage = async () => {
    if (!selectedClaim || !engagementMessage.trim()) return;

    try {
      const webhookUrl = 'https://n8n.tenear.com/webhook/send-visitor-message';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: selectedClaim.visitor_id,
          shop_id: user.shop_id || 0,
          message: engagementMessage,
          message_type: 'engagement',
          timestamp: new Date().toISOString()
        })
      });

      setEngagementMessage('');
      setSelectedClaim(null);
      
      // Refresh engagement data
      fetchEngagementData();
      
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.visitor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterType) {
      case 'claimed': return !claim.redeemed;
      case 'redeemed': return claim.redeemed;
      case 'pending': return !claim.redeemed && isRecentClaim(claim.claimed_at);
      default: return true;
    }
  });

  const isRecentClaim = (claimedAt: string) => {
    const claimTime = new Date(claimedAt);
    const now = new Date();
    const diffHours = (now.getTime() - claimTime.getTime()) / (1000 * 60 * 60);
    return diffHours < 2; // Recent if less than 2 hours old
  };

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getVisitorTypeIcon = (type: string) => {
    switch (type) {
      case 'first_time_visitor': return '👋';
      case 'loyal_customer': return '💎';
      case 'tourist': return '🧳';
      case 'family_group': return '👨‍👩‍👧‍👦';
      case 'business_visitor': return '💼';
      case 'social_visitor': return '🎉';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visitor engagement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2 text-purple-600" />
            Visitor Engagement Manager
          </h2>
          <button
            onClick={fetchEngagementData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <p className="text-gray-600">
          Monitor and engage with visitors at {user.shop_name || 'Unknown Shop'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Redeemed</p>
              <p className="text-2xl font-bold text-gray-900">
                {claims.filter(c => c.redeemed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {claims.filter(c => !c.redeemed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {claims.length > 0 ? Math.round(claims.reduce((sum, c) => sum + c.engagement_score, 0) / claims.length) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by visitor ID or campaign name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Claims</option>
              <option value="claimed">Claimed (Pending)</option>
              <option value="redeemed">Redeemed</option>
              <option value="pending">Recent (2hrs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Visitor Claims & Engagement</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredClaims.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No visitor claims found</p>
              <p className="text-sm">Claims will appear here when visitors interact with your campaigns</p>
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div key={claim.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-2xl">
                      {getVisitorTypeIcon(claim.visitor_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {claim.visitor_id}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(claim.engagement_score)}`}>
                          {claim.engagement_score}% engaged
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">{claim.campaign_name}</p>
                      
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {claim.zone}
                        </span>
                        {claim.redeemed && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Redeemed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-xs text-gray-500">
                      <p>{claim.interactions.length} interactions</p>
                      <p className="capitalize">{claim.visitor_type.replace('_', ' ')}</p>
                    </div>
                    
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Engage
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Engagement Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Engage with {selectedClaim.visitor_id}
                </h3>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Visitor Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedClaim.campaign_name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getEngagementColor(selectedClaim.engagement_score)}`}>
                    {selectedClaim.engagement_score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedClaim.visitor_type.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  Claimed: {new Date(selectedClaim.claimed_at).toLocaleString()}
                </p>
              </div>

              {/* Engagement History */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Engagement History</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedClaim.interactions.map((interaction) => (
                    <div key={interaction.id} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span className="capitalize text-gray-600">{interaction.type}</span>
                      {interaction.campaign_id && (
                        <span className="text-gray-500 ml-2">
                          - Campaign {interaction.campaign_id}
                        </span>
                      )}
                      <span className="text-gray-400 ml-auto text-xs">
                        {new Date(interaction.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Message to Visitor
                </label>
                <textarea
                  value={engagementMessage}
                  onChange={(e) => setEngagementMessage(e.target.value)}
                  placeholder="Write a personalized message to engage with this visitor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex space-x-2">
              <button
                onClick={() => setSelectedClaim(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendEngagementMessage}
                disabled={!engagementMessage.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
