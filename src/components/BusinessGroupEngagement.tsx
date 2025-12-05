import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  MessageSquare, 
  Users, 
  Target, 
  TrendingUp, 
  Plus, 
  Send, 
  Eye,
  MousePointer,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  BarChart3,
  Activity
} from 'lucide-react';

interface BusinessGroup {
  name: string;
  link: string;
  memberCount: number;
}

interface BusinessCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  created_at: string;
  total_groups: number;
  total_members: number;
  expected_views: number;
  actual_views?: number;
  responses?: number;
  conversions?: number;
  response_rate?: number;
  conversion_rate?: number;
  message: string;
  cta_type: string;
}

interface BusinessGroupEngagementProps {
  mallId?: number;
  shopId?: number;
  onClose?: () => void;
  onViewChange?: (view: string) => void;
}

export const BusinessGroupEngagement: React.FC<BusinessGroupEngagementProps> = ({
  mallId,
  shopId,
  onClose,
  onViewChange
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'analytics'>('create');
  const [campaigns, setCampaigns] = useState<BusinessCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [groups, setGroups] = useState<BusinessGroup[]>([]);
  const [ctaType, setCtaType] = useState('visit-shop');
  const [trackingId, setTrackingId] = useState('');

  // Load existing campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_campaigns')
        .select('*')
        .eq('campaign_type', 'business_group')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGroup = () => {
    setGroups([...groups, { name: '', link: '', memberCount: 0 }]);
  };

  const updateGroup = (index: number, field: keyof BusinessGroup, value: string | number) => {
    const updatedGroups = [...groups];
    updatedGroups[index] = { ...updatedGroups[index], [field]: value };
    setGroups(updatedGroups);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const generateTrackingId = () => {
    const id = 'BG_' + Date.now();
    setTrackingId(id);
  };

  const createCampaign = async () => {
    if (!campaignName || !campaignMessage || groups.length === 0) {
      alert('Please fill all required fields and add at least one group');
      return;
    }

    setCreating(true);
    try {
      const campaignData = {
        campaign_name: campaignName,
        campaign_type: 'business_group',
        groups: groups,
        message: campaignMessage,
        cta_type: ctaType,
        tracking_id: trackingId || 'BG_' + Date.now(),
        mall_id: mallId,
        shop_id: shopId,
        timestamp: new Date().toISOString()
      };

      // Call your existing webhook
      const response = await fetch('/webhook/business-group-engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      alert(`✅ Campaign "${campaignName}" created successfully!`);
      
      // Reset form
      setCampaignName('');
      setCampaignMessage('');
      setGroups([]);
      setCtaType('visit-shop');
      setTrackingId('');
      
      // Reload campaigns
      loadCampaigns();
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Business Group Engagement</h2>
        </div>
        <button
          onClick={() => onViewChange?.('dashboard')}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Campaign
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Campaign Analytics
          </button>
        </nav>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Setup Form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Setup</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., New Product Launch - December 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Message *
                  </label>
                  <textarea
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    rows={4}
                    placeholder="Your message to group members..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call-to-Action
                  </label>
                  <select
                    value={ctaType}
                    onChange={(e) => setCtaType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="visit-shop">Visit Our Shop</option>
                    <option value="call-us">Call Us</option>
                    <option value="whatsapp-us">WhatsApp Us</option>
                    <option value="website">Visit Website</option>
                    <option value="product-demo">Request Product Demo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Unique campaign ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={generateTrackingId}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Groups */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Business Groups</h3>
              
              {groups.map((group, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Group {index + 1}</h4>
                    <button
                      onClick={() => removeGroup(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Group name (e.g., Real Estate Nairobi Group)"
                      value={group.name}
                      onChange={(e) => updateGroup(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp group invite link"
                      value={group.link}
                      onChange={(e) => updateGroup(index, 'link', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Member count"
                      value={group.memberCount || ''}
                      onChange={(e) => updateGroup(index, 'memberCount', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={addGroup}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Group</span>
              </button>
            </div>
          </div>

          {/* Preview & Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Preview</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{campaignName || 'Campaign Name'}</h4>
                <p className="text-gray-600 text-sm mb-2">
                  {campaignMessage || 'Your campaign message will appear here...'}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {groups.reduce((sum, group) => sum + group.memberCount, 0)} members
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {groups.length} groups
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Expected Reach</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {groups.reduce((sum, group) => sum + group.memberCount, 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Est. Views</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(groups.reduce((sum, group) => sum + group.memberCount, 0) * 0.7).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={createCampaign}
                disabled={creating || !campaignName || !campaignMessage || groups.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{creating ? 'Creating...' : 'Launch Campaign'}</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                After creating, you'll receive manual instructions to send messages to each group
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            <button
              onClick={loadCampaigns}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-600">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h3>
              <p className="text-gray-500">Create your first business group campaign to see analytics</p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{campaign.total_groups}</p>
                      <p className="text-sm text-gray-500">Groups</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{campaign.total_members}</p>
                      <p className="text-sm text-gray-500">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{campaign.responses || 0}</p>
                      <p className="text-sm text-gray-500">Responses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{campaign.conversions || 0}</p>
                      <p className="text-sm text-gray-500">Conversions</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessGroupEngagement;
