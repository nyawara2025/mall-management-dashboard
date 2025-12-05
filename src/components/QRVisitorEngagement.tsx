import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  QrCode, 
  Users, 
  MessageSquare, 
  Mail, 
  Phone, 
  Share2,
  Plus, 
  Settings, 
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';

interface QRVisitorCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  created_at: string;
  qr_type: string;
  engagement_method: string;
  total_scans?: number;
  engaged?: number;
  responses?: number;
  conversions?: number;
  response_rate?: number;
  conversion_rate?: number;
  engagement_window_hours: number;
}

interface QRVisitorEngagementProps {
  mallId?: number;
  shopId?: number;
  onClose?: () => void;
  onViewChange?: (view: string) => void;
}

export const QRVisitorEngagement: React.FC<QRVisitorEngagementProps> = ({
  mallId,
  shopId,
  onClose,
  onViewChange
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'analytics'>('create');
  const [campaigns, setCampaigns] = useState<QRVisitorCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [qrType, setQrType] = useState('checkin');
  const [engagementMethod, setEngagementMethod] = useState('whatsapp');
  const [followupMessage, setFollowupMessage] = useState('');
  const [engagementWindow, setEngagementWindow] = useState(24);

  // Load existing campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('qr_visitor_campaigns')
        .select('*')
        .eq('campaign_type', 'qr_visitor')
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

  const generateFollowupMessage = () => {
    const templates = {
      whatsapp: `Hi! Thanks for scanning our QR code at our shop. We'd love to keep you updated with our latest offers and news. Join our WhatsApp community for exclusive updates!`,
      email: `Dear valued customer, thank you for visiting us today. We'd like to keep you informed about our latest products, special offers, and upcoming events.`,
      sms: `Hi! Thanks for visiting. We're excited to offer you exclusive deals and updates. Reply STOP to opt out.`,
      social: `Thanks for scanning our QR code! Follow us on social media for the latest updates, exclusive offers, and behind-the-scenes content.`
    };

    setFollowupMessage(templates[engagementMethod as keyof typeof templates] || templates.whatsapp);
  };

  const createCampaign = async () => {
    if (!campaignName || !followupMessage) {
      alert('Please fill all required fields');
      return;
    }

    setCreating(true);
    try {
      const campaignData = {
        campaign_name: campaignName,
        campaign_type: 'qr_visitor',
        qr_type: qrType,
        engagement_method: engagementMethod,
        followup_message: followupMessage,
        engagement_window_hours: engagementWindow,
        mall_id: mallId,
        shop_id: shopId,
        timestamp: new Date().toISOString()
      };

      // Call your existing webhook
      const response = await fetch('/webhook/qr-visitor-engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      alert(`✅ QR Visitor Campaign "${campaignName}" activated successfully!`);
      
      // Reset form
      setCampaignName('');
      setFollowupMessage('');
      setQrType('checkin');
      setEngagementMethod('whatsapp');
      setEngagementWindow(24);
      
      // Reload campaigns
      loadCampaigns();
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'whatsapp': return 'text-green-600 bg-green-50';
      case 'email': return 'text-blue-600 bg-blue-50';
      case 'sms': return 'text-purple-600 bg-purple-50';
      case 'social': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <QrCode className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">QR Visitor Engagement</h2>
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
                ? 'border-purple-500 text-purple-600'
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
                ? 'border-purple-500 text-purple-600'
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
                    placeholder="e.g., Holiday Check-in Special"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code Type
                  </label>
                  <select
                    value={qrType}
                    onChange={(e) => setQrType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="checkin">Check-in QR Code</option>
                    <option value="offer">Offer QR Code</option>
                    <option value="feedback">Feedback QR Code</option>
                    <option value="social">Social Media QR Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Method
                  </label>
                  <select
                    value={engagementMethod}
                    onChange={(e) => {
                      setEngagementMethod(e.target.value);
                      generateFollowupMessage();
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="whatsapp">WhatsApp Group Invitation</option>
                    <option value="email">Email Follow-up</option>
                    <option value="sms">SMS Campaign</option>
                    <option value="social">Social Media Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Window (hours)
                  </label>
                  <input
                    type="number"
                    value={engagementWindow}
                    onChange={(e) => setEngagementWindow(parseInt(e.target.value) || 24)}
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long after QR scan to send engagement (1-168 hours)
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Follow-up Message *
                    </label>
                    <button
                      onClick={generateFollowupMessage}
                      className="text-xs text-purple-600 hover:text-purple-800"
                    >
                      Generate Template
                    </button>
                  </div>
                  <textarea
                    value={followupMessage}
                    onChange={(e) => setFollowupMessage(e.target.value)}
                    rows={4}
                    placeholder="Message to send to QR code visitors..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Actions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Preview</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <QrCode className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">{campaignName || 'Campaign Name'}</h4>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(engagementMethod)}`}>
                    {getMethodIcon(engagementMethod)}
                    <span className="ml-1">{engagementMethod.toUpperCase()}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {qrType.toUpperCase()} • {engagementWindow}h window
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm">
                  {followupMessage || 'Your follow-up message will appear here...'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Performance</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Scan Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">Variable</p>
                  <p className="text-xs text-purple-700">QR scan dependent</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Response Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">20-30%</p>
                  <p className="text-xs text-green-700">Above average</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Notes</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">How it works:</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Automatically engages visitors who scan your QR codes</li>
                      <li>• Sends follow-up after {engagementWindow} hours based on their scan</li>
                      <li>• Tracks response rates and conversion metrics</li>
                      <li>• Works with your existing check-in and offer systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={createCampaign}
                disabled={creating || !campaignName || !followupMessage}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                <span>{creating ? 'Activating...' : 'Activate Campaign'}</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Visitors who scan your QR codes will now receive automated follow-up
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
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-600">Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h3>
              <p className="text-gray-500">Create your first QR visitor campaign to see analytics</p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-5 h-5 text-purple-600" />
                      <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(campaign.engagement_method)}`}>
                        {getMethodIcon(campaign.engagement_method)}
                        <span className="ml-1">{campaign.engagement_method.toUpperCase()}</span>
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{campaign.total_scans || 0}</p>
                      <p className="text-sm text-gray-500">Scans</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{campaign.engaged || 0}</p>
                      <p className="text-sm text-gray-500">Engaged</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{campaign.responses || 0}</p>
                      <p className="text-sm text-gray-500">Responses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{campaign.conversions || 0}</p>
                      <p className="text-sm text-gray-500">Conversions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{campaign.response_rate || 0}%</p>
                      <p className="text-sm text-gray-500">Response Rate</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    <span>{campaign.qr_type.toUpperCase()} • {campaign.engagement_window_hours}h window</span>
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

export default QRVisitorEngagement;
