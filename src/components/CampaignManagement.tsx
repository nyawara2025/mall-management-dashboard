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
  name: string;
  message: string;
  zone: string;
  shop_id?: string;
  mall_id?: string;
  created_at: string;
  is_active: boolean;
  scan_count?: number;
  engagement_rate?: number;
}

export default function CampaignManagement() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
  const [analytics, setAnalytics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalScans: 0,
    avgEngagement: 0
  });

  // Fetch campaigns for the user's shop
  useEffect(() => {
    if (user?.shop_id) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      console.log('Fetching campaigns for shop_id:', user?.shop_id); // Debug shop_id
      
      const response = await fetch(`https://n8n.tenear.com/webhook/manage-campaigns-get?shop_id=${user?.shop_id}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetch campaigns response:', data); // Debug logging
      console.log('Full API response structure:', JSON.stringify(data, null, 2)); // Show full response
      console.log('Is success:', data.success); // Debug success flag
      if (data.success) {
        console.log('Campaigns data:', data.campaigns); // Debug the campaigns array
        console.log('Campaigns array length:', data.campaigns?.length || 0);
        console.log('All campaign details:', JSON.stringify(data.campaigns, null, 2)); // Full campaign details
        setCampaigns(data.campaigns || []);
        
        // Calculate analytics
        const total = data.campaigns?.length || 0;
        const active = data.campaigns?.filter((c: Campaign) => c.is_active).length || 0;
        const totalScans = data.campaigns?.reduce((sum: number, c: Campaign) => sum + (c.scan_count || 0), 0) || 0;
        const avgEngagement = total > 0 ? (totalScans / total).toFixed(1) : 0;

        setAnalytics({
          totalCampaigns: total,
          activeCampaigns: active,
          totalScans,
          avgEngagement: parseFloat(avgEngagement as string)
        });
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Campaign creation response:', data); // Debug logging
      console.log('Full creation response:', JSON.stringify(data, null, 2)); // Show full response
      console.log('User shop_id:', user?.shop_id); // Debug shop_id
      console.log('Campaign data sent:', JSON.stringify(campaignData, null, 2)); // Debug what was sent
      console.log('Is creation success:', data.success); // Debug success flag
      if (data.campaign) {
        console.log('Created campaign details:', JSON.stringify(data.campaign, null, 2)); // Show created campaign
      }
      
      if (data.success) {
        setShowCreateForm(false);
        setCreateForm({ name: '', message: '', zone: '', shop_id: user?.shop_id || '' });
        
        // Add a small delay to ensure database is updated
        setTimeout(() => {
          fetchCampaigns(); // Refresh campaigns list
        }, 500);
        
        // Show success message with defensive checking
        const campaignName = data.campaign?.name || createForm.name || 'New Campaign';
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
        successAlert.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Campaign "${campaignName}" created successfully! QR code generated.
          </div>
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 5000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      // Show error message with more details
      const errorMsg = error instanceof Error ? error.message : 'Please try again';
      const errorDetail = `Error creating campaign: ${errorMsg}`;
      const errorAlert = document.createElement('div');
      errorAlert.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      errorAlert.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          ${errorDetail}
        </div>
      `;
      document.body.appendChild(errorAlert);
      setTimeout(() => errorAlert.remove(), 5000);
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
      name: campaign.name,
      message: campaign.message,
      zone: campaign.zone,
      is_active: campaign.is_active
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

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify(campaignData)
      });

      const data = await response.json();

      if (data.success) {
        setShowEditForm(false);
        setSelectedCampaign(null);
        setTimeout(() => {
          fetchCampaigns(); // Refresh campaigns list
        }, 500);
        
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
        successAlert.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Campaign "${editForm.name}" updated successfully!
          </div>
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 5000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      // Show error message
      const errorAlert = document.createElement('div');
      errorAlert.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      errorAlert.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          Error updating campaign. Please try again.
        </div>
      `;
      document.body.appendChild(errorAlert);
      setTimeout(() => errorAlert.remove(), 5000);
    }
  };

  // Handle Delete Campaign
  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
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

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify(deleteData)
      });

      const data = await response.json();

      if (data.success) {
        setTimeout(() => {
          fetchCampaigns(); // Refresh campaigns list
        }, 500);
        
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
        successAlert.innerHTML = `
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Campaign "${campaign.name}" deleted successfully!
          </div>
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 5000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      // Show error message
      const errorAlert = document.createElement('div');
      errorAlert.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      errorAlert.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          Error deleting campaign. Please try again.
        </div>
      `;
      document.body.appendChild(errorAlert);
      setTimeout(() => errorAlert.remove(), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{analytics.totalCampaigns}</p>
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
                <p className="text-2xl font-bold">{analytics.activeCampaigns}</p>
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
                <p className="text-2xl font-bold">{analytics.totalScans}</p>
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
                <p className="text-2xl font-bold">{analytics.avgEngagement}</p>
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
                    {selectedCampaign.shop_id || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedCampaign.created_at ? new Date(selectedCampaign.created_at).toLocaleDateString() : 'Unknown'}
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
                      <h3 className="text-lg font-semibold">{campaign.name || 'Unnamed Campaign'}</h3>
                      <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                        {campaign.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.message || 'No message provided'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Unknown date'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {campaign.zone || 'Unknown zone'}
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
