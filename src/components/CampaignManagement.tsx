import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  PlusCircle, 
  TrendingUp, 
  QrCode, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  MessageSquare,
  MapPin
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { createAuthHeaders } from '../services/auth';

interface Campaign {
  id: string;
  title: string;
  description: string;
  location: string;
  shopId?: number;
  mallId?: number;
  createdDate: string;
  isActive: boolean;
  scan_count?: number;
  engagement_rate?: number;
  // Legacy fields for compatibility
  name?: string;
  message?: string;
  zone?: string;
  created_at?: string;
  is_active?: boolean;
}

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalScans: number;
    totalClaims: number;
    avgEngagement: number;
  };
}

export default function CampaignManagement() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    message: '',
    zone: '',
    shop_id: user?.shop_id || ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    message: '',
    zone: '',
    is_active: true
  });

  // Fetch campaigns for the user's shop
  useEffect(() => {
    if (user?.shop_id) {
      fetchCampaigns();
      fetchAnalytics();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      console.log('Fetching campaigns for shop_id:', user?.shop_id);
      
      const response = await fetch(`https://n8n.tenear.com/webhook/manage-campaigns-get?shop_id=${user?.shop_id}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Campaigns fetched:', data.campaigns?.length || 0, 'campaigns');
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const response = await fetch(`https://n8n.tenear.com/webhook/get-analytics?shop_id=${user?.shop_id}&time_range=7d`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Analytics fetched:', data);
        
        if (data.overview) {
          setAnalytics(data);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const campaignData = {
        name: createForm.name,
        message: createForm.message,
        zone: createForm.zone,
        shop_id: user?.shop_id,
        mall_id: user?.mall_id,
        created_by: user?.username
      };

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(campaignData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateForm(false);
        setCreateForm({ name: '', message: '', zone: '', shop_id: user?.shop_id || '' });
        
        // Enhanced refresh with verification
        setTimeout(() => {
          fetchCampaigns();
          fetchAnalytics(); // Refresh analytics too
        }, 1000);
        
        showSuccessMessage(`Campaign "${data.campaign?.name || createForm.name}" created successfully!`);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      showErrorMessage(`Error creating campaign: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };

  const generateQRCode = (campaignId: string) => {
    const qrUrl = `https://mall-management-dashboard.pages.dev/campaign/${campaignId}`;
    const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Scan QR Code</h3>
        <div class="text-center mb-4">
          <img src="${qrData}" alt="QR Code" class="mx-auto mb-2" />
          <p class="text-sm text-gray-600">${qrUrl}</p>
        </div>
        <div class="flex gap-2">
          <a href="${qrData}" download="campaign-${campaignId}.png" class="flex-1 bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600">
            Download QR
          </a>
          <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // Handle View Campaign
  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowViewModal(true);
  };

  // Handle Edit Campaign
  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditForm({
      name: campaign.title || campaign.name || '',
      message: campaign.description || campaign.message || '',
      zone: campaign.location || campaign.zone || '',
      is_active: campaign.isActive !== undefined ? campaign.isActive : (campaign.is_active !== undefined ? campaign.is_active : true)
    });
    setShowEditForm(true);
  };

  // Handle Update Campaign
  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const campaignData = {
        id: selectedCampaign.id,
        name: editForm.name,
        message: editForm.message,
        zone: editForm.zone,
        is_active: editForm.is_active,
        updated_by: user?.username
      };

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(campaignData)
      });

      const data = await response.json();

      if (data.success) {
        setShowEditForm(false);
        setSelectedCampaign(null);
        
        // Enhanced refresh with verification
        setTimeout(() => {
          fetchCampaigns();
          fetchAnalytics();
        }, 1000);
        
        showSuccessMessage(`Campaign "${editForm.name}" updated successfully!`);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      showErrorMessage('Error updating campaign. Please try again.');
    }
  };

  // Enhanced Delete Campaign with verification
  const handleDeleteCampaign = async (campaign: Campaign) => {
    const campaignName = campaign.title || campaign.name || 'Unknown Campaign';
    if (!window.confirm(`Are you sure you want to delete "${campaignName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const deleteData = {
        id: campaign.id,
        action: 'delete',
        deleted_by: user?.username
      };

      console.log('🗑️ Attempting to delete campaign:', campaign.id);
      console.log('🗑️ Delete data:', deleteData);

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(deleteData)
      });

      const data = await response.json();
      console.log('🗑️ Delete response:', data);

      if (data.success) {
        console.log('✅ Delete operation reported success, verifying...');
        
        // Enhanced verification: Wait and check if campaign was actually removed
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Fetch fresh data to verify deletion
        const currentCampaigns = await fetchCampaignsWithVerification();
        const campaignStillExists = currentCampaigns.some(c => c.id === campaign.id);
        
        if (campaignStillExists) {
          console.warn('⚠️ Campaign still exists after deletion - webhook may not be working properly');
          showErrorMessage('Delete operation may have failed. Please check your n8n webhook configuration.');
        } else {
          console.log('✅ Deletion verified - campaign removed from database');
          showSuccessMessage(`Campaign "${campaignName}" deleted successfully!`);
        }
      } else {
        const errorMessage = data.error || 'Unknown error';
        console.error('❌ Delete failed:', errorMessage);
        
        // Provide specific error messages
        if (errorMessage.includes('webhook') || errorMessage.includes('connection')) {
          showErrorMessage('Delete functionality not available. Please contact system administrator.');
        } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
          showErrorMessage('You do not have permission to delete this campaign.');
        } else {
          showErrorMessage(`Delete failed: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('❌ Error during delete operation:', error);
      showErrorMessage('Error deleting campaign. Please check your connection and try again.');
    }
  };

  // Helper function to fetch campaigns and return them (for verification)
  const fetchCampaignsWithVerification = async (): Promise<Campaign[]> => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const response = await fetch(`https://n8n.tenear.com/webhook/manage-campaigns-get?shop_id=${user?.shop_id}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns);
          return data.campaigns;
        }
      }
      return campaigns; // Return current state as fallback
    } catch (error) {
      console.error('Error during verification fetch:', error);
      return campaigns;
    }
  };

  // Success/Error message helpers
  const showSuccessMessage = (message: string) => {
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
    alert.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
  };

  const showErrorMessage = (message: string) => {
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
    alert.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use analytics data for metrics if available, fallback to campaign data
  const totalCampaigns = analytics?.overview?.totalCampaigns || campaigns.length;
  const activeCampaigns = analytics?.overview?.activeCampaigns || campaigns.filter(c => c.isActive).length;
  const totalScans = analytics?.overview?.totalScans || 0;
  const avgEngagement = analytics?.overview?.avgEngagement || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage promotional campaigns for {user?.full_name?.split(' - ')[1] || 'your shop'}
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Create Campaign
        </Button>
      </div>

      {/* Analytics Cards - Enhanced with real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
                {analytics?.overview && (
                  <p className="text-xs text-blue-600">Real data from analytics</p>
                )}
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
                {analytics?.overview && (
                  <p className="text-xs text-green-600">Synced with analytics</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold">{totalScans}</p>
                {analytics?.overview ? (
                  <p className="text-xs text-purple-600">Real scan data</p>
                ) : (
                  <p className="text-xs text-gray-400">Connect analytics webhook</p>
                )}
              </div>
              <QrCode className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                <p className="text-2xl font-bold">{avgEngagement}%</p>
                {analytics?.overview ? (
                  <p className="text-xs text-orange-600">Real engagement rate</p>
                ) : (
                  <p className="text-xs text-gray-400">No analytics data</p>
                )}
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>
                Create a promotional campaign that customers can view by scanning QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <Input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    placeholder="e.g., Wine Tasting Event"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Message
                  </label>
                  <Textarea
                    value={createForm.message}
                    onChange={(e) => setCreateForm({...createForm, message: e.target.value})}
                    placeholder="Describe your campaign, promotion, or event..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Zone
                  </label>
                  <Input
                    type="text"
                    value={createForm.zone}
                    onChange={(e) => setCreateForm({...createForm, zone: e.target.value})}
                    placeholder="e.g., langata, china-square, nhc"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Specify the mall/area where this campaign should appear
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Campaign
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditForm && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Edit Campaign</CardTitle>
              <CardDescription>
                Update campaign details for "{selectedCampaign.name}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="e.g., Wine Tasting Event"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Message
                  </label>
                  <Textarea
                    value={editForm.message}
                    onChange={(e) => setEditForm({...editForm, message: e.target.value})}
                    placeholder="Describe your campaign, promotion, or event..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Zone
                  </label>
                  <Input
                    type="text"
                    value={editForm.zone}
                    onChange={(e) => setEditForm({...editForm, zone: e.target.value})}
                    placeholder="e.g., langata, china-square, nhc"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Specify the mall/area where this campaign should appear
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Campaign is Active
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Update Campaign
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Campaign Modal */}
      {showViewModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Campaign Details</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://mall-management-dashboard.pages.dev/campaign/${selectedCampaign.id}`, '_blank')}
                >
                  <Eye size={16} className="mr-1" />
                  View Live
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign ID
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedCampaign.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge variant={selectedCampaign.is_active ? 'default' : 'secondary'}>
                    {selectedCampaign.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <p className="text-sm text-gray-900">{selectedCampaign.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Message
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {selectedCampaign.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Zone
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedCampaign.zone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop ID
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedCampaign.shopId || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedCampaign.createdDate}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Scans
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedCampaign.scan_count || 0}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditForm(true)}
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteCampaign(selectedCampaign)}
                  className="flex-1"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowViewModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first campaign to start engaging customers</p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          (campaigns || []).map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.title || 'Unnamed Campaign'}</h3>
                      <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.description || 'No message provided'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {campaign.createdDate || 'Unknown date'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {campaign.location || 'Unknown zone'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateQRCode(campaign.id)}
                    >
                      <QrCode size={16} className="mr-1" />
                      QR Code
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCampaign(campaign)}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign)}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
