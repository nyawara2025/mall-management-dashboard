import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
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
  shop_id?: number;
  mall_id?: number;
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
    zone: user?.mall_id === 3 ? 'china-square' : user?.mall_id === 6 ? 'langata' : user?.mall_id === 7 ? 'nhc' : 'china-square',
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Zone to mall_id mapping
  const getMallIdFromZone = (zone: string): number => {
    const zoneMap: { [key: string]: number } = {
      'china-square': 3,
      'china square': 3,
      'langata': 6,
      'nhc': 7,
      'china_square': 3,
      'china_square_mall': 3,
      'langata_mall': 6,
      'nhc_mall': 7
    };
    
    const normalizedZone = zone.toLowerCase().trim();
    const mappedId = zoneMap[normalizedZone] || user?.mall_id || 3; // Default to China Square (3) if not found
    
    console.log(`🗺️ Zone mapping debug: "${zone}" -> mall_id: ${mappedId}`);
    return mappedId;
  };

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
      
      console.log('🔍 Fetching campaigns for shop_id:', user?.shop_id); // Debug shop_id
      
      // Try both API endpoints and response structures
      const endpoints = [
        `https://n8n.tenear.com/webhook/manage-campaigns-get?shop_id=${user?.shop_id}`,
        `https://n8n.tenear.com/webhook/manage-campaigns-get?user_id=${user?.shop_id}`,
        `https://n8n.tenear.com/webhook/manage-campaigns-get?mall_id=${user?.mall_id}`
      ];

      let data: any = null;
      let lastError: any = null;

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`🚀 Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, { headers });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log(`✅ Response from ${endpoint}:`, responseData);
          
          // Store the response to analyze structure
          data = responseData;
          break;
        } catch (error) {
          console.log(`❌ Failed endpoint ${endpoint}:`, error);
          lastError = error;
          continue;
        }
      }

      if (!data) {
        console.error('All endpoints failed, using fallback to Supabase');
        return await fetchFromSupabase();
      }

      console.log('📋 Full API response structure:', JSON.stringify(data, null, 2));
      console.log('🔍 Response type:', typeof data, 'Keys:', Object.keys(data || {}));

      // Try multiple response structure patterns
      let campaignsArray: Campaign[] = [];
      
      if (data.success && data.campaigns) {
        campaignsArray = data.campaigns;
      } else if (Array.isArray(data)) {
        campaignsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        campaignsArray = data.data;
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        campaignsArray = data.campaigns;
      } else {
        console.warn('⚠️ Unexpected API response structure:', data);
        return await fetchFromSupabase();
      }
      
      console.log('📊 Campaigns array found:', campaignsArray.length, 'items');
      console.log('📄 Sample campaigns:', JSON.stringify(campaignsArray.slice(0, 2), null, 2));
      
      // Enhanced client-side filtering: Only show campaigns for user's shop
      const allCampaigns = campaignsArray || [];
      const filteredCampaigns = allCampaigns.filter((campaign: Campaign) => {
        // Check multiple possible field names
        const campaignShopId = campaign.shopId || campaign.shop_id || null;
        const campaignMallId = campaign.mallId || campaign.mall_id || null;
        
        const matchesShop = campaignShopId === user?.shop_id;
        const matchesMall = campaignMallId === user?.mall_id;
        
        console.log(`🔍 Campaign ${campaign.id || campaign.title}: shopId=${campaignShopId} vs userShopId=${user?.shop_id}, mallId=${campaignMallId} vs userMallId=${user?.mall_id}`);
        
        // SECURITY FIX: Only return campaigns from user's own shop
        return matchesShop;
      });
      
      console.log(`🔢 Total campaigns fetched: ${allCampaigns.length}`);
      console.log(`✅ Filtered campaigns (${user?.username} only): ${filteredCampaigns.length}`);
      console.log('🏷️ Campaign titles:', filteredCampaigns.map((c: Campaign) => c.title || c.name || 'No title'));
      
      setCampaigns(filteredCampaigns);
      
      // Calculate analytics from filtered data
      const total = filteredCampaigns.length;
      const active = filteredCampaigns.filter((c: Campaign) => 
        c.isActive !== undefined ? c.isActive : c.is_active !== undefined ? c.is_active : true
      ).length;
      const totalScans = filteredCampaigns.reduce((sum: number, c: Campaign) => sum + (c.scan_count || 0), 0);
      const avgEngagement = total > 0 ? (totalScans / total).toFixed(1) : 0;

      setAnalytics({
        totalCampaigns: total,
        activeCampaigns: active,
        totalScans,
        avgEngagement: parseFloat(avgEngagement as string)
      });
      
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      // Fallback to Supabase query
      await fetchFromSupabase();
    } finally {
      setLoading(false);
    }
  };

  // Fallback method using Supabase direct query
  const fetchFromSupabase = async () => {
    try {
      console.log('🔄 Fallback: Fetching from Supabase directly...');
      
      const { data, error } = await supabase
        .from('adcampaigns')
        .select('*')
        .or(`shop_id.eq.${user?.shop_id},mall_id.eq.${user?.mall_id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      console.log('📊 Supabase response:', data);
      
      if (data) {
        const mappedCampaigns: Campaign[] = data.map((campaign: any) => ({
          id: campaign.id.toString(),
          title: campaign.name,
          description: campaign.message,
          location: campaign.zone || 'Unknown',
          shopId: campaign.shop_id,
          mallId: campaign.mall_id,
          createdDate: campaign.created_at,
          isActive: campaign.is_active !== false,
          name: campaign.name,
          message: campaign.message,
          zone: campaign.zone,
          created_at: campaign.created_at,
          is_active: campaign.is_active,
          scan_count: campaign.scan_count || 0,
          engagement_rate: campaign.engagement_rate || 0
        }));

        setCampaigns(mappedCampaigns);
        
        // Calculate analytics
        const total = mappedCampaigns.length;
        const active = mappedCampaigns.filter(c => c.isActive).length;
        const totalScans = mappedCampaigns.reduce((sum, c) => sum + (c.scan_count || 0), 0);
        const avgEngagement = total > 0 ? (totalScans / total).toFixed(1) : 0;

        setAnalytics({
          totalCampaigns: total,
          activeCampaigns: active,
          totalScans,
          avgEngagement: parseFloat(avgEngagement as string)
        });
      }
    } catch (error) {
      console.error('❌ Fallback fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const mappedMallId = getMallIdFromZone(createForm.zone);
      console.log('🎯 Campaign creation debug:', {
        zone: createForm.zone,
        mappedMallId: mappedMallId,
        userMallId: user?.mall_id,
        userShopId: user?.shop_id,
        userName: user?.username
      });
      
      const campaignData = {
        name: createForm.name,           // POST webhook expects 'name'
        message: createForm.message,     // POST webhook expects 'message' 
        zone: createForm.zone,           // POST webhook expects 'zone'
        shop_id: user?.shop_id,
        mall_id: mappedMallId,           // Map zone to correct mall_id
        created_by: user?.username
      };

      console.log('📤 Sending campaign data:', campaignData);

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers,
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // SAFE JSON PARSING: Handle empty or non-JSON responses
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : { success: true };
      
      console.log('📥 Campaign creation response:', data);
      console.log('🏷️ User shop_id:', user?.shop_id);
      console.log('📊 Campaign data sent:', JSON.stringify(campaignData, null, 2));
      console.log('✅ Creation success:', data.success);
      
      if (data.success) {
        // Refresh campaigns list
        await fetchCampaigns();
        // Reset form
        setCreateForm({
          name: '',
          message: '',
          zone: user?.mall_id === 3 ? 'china-square' : user?.mall_id === 6 ? 'langata' : user?.mall_id === 7 ? 'nhc' : 'china-square',
          shop_id: user?.shop_id || ''
        });
        setShowCreateForm(false);
        alert('Campaign created successfully!');
      } else {
        // Database fallback
        console.log('🔄 n8n webhook failed, trying database creation...');
        await createCampaignInDatabase(campaignData);
        // Force refresh after database creation
        await fetchCampaigns();
        setShowCreateForm(false);
        alert('Campaign created successfully!');
      }
    } catch (error) {
      console.error('❌ Campaign creation error:', error);
      
      // Try database fallback
      try {
        const campaignData = {
          name: createForm.name,
          message: createForm.message,
          zone: createForm.zone,
          shop_id: user?.shop_id,
          mall_id: getMallIdFromZone(createForm.zone), // Use mapped mall_id
          created_by: user?.username
        };
        await createCampaignInDatabase(campaignData);
        // Force refresh after database creation fallback
        await fetchCampaigns();
        setShowCreateForm(false);
      } catch (fallbackError) {
        console.error('❌ Database fallback also failed:', fallbackError);
        alert('Failed to create campaign. Please try again.');
      }
    }
  };

  // Database fallback campaign creation
  const createCampaignInDatabase = async (campaignData: any) => {
    console.log('🗄️ Creating campaign in database with data:', campaignData);
    
    const { data, error } = await supabase
      .from('adcampaigns')
      .insert([{
        name: campaignData.name,
        message: campaignData.message,
        zone: campaignData.zone,
        shop_id: campaignData.shop_id,
        mall_id: campaignData.mall_id,
        created_by: campaignData.created_by,
        is_active: true
      }])
      .select();

    if (error) {
      console.error('❌ Database insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Database campaign created:', data);
    
    // Refresh campaigns list
    await fetchCampaigns();
    setCreateForm({
      name: '',
      message: '',
      zone: user?.mall_id === 3 ? 'china-square' : user?.mall_id === 6 ? 'langata' : user?.mall_id === 7 ? 'nhc' : 'china-square',
      shop_id: user?.shop_id || ''
    });
    setShowCreateForm(false);
    alert('Campaign created successfully (database fallback)!');
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    // SECURITY CHECK: Ensure user can only delete their own campaigns
    const campaignToDelete = campaigns.find(c => c.id === campaignId);
    if (campaignToDelete) {
      const campaignShopId = campaignToDelete.shopId || campaignToDelete.shop_id;
      if (campaignShopId !== user?.shop_id) {
        alert('❌ Security Error: You can only delete campaigns from your own shop!');
        console.log(`🔒 Blocked deletion: User shop_id ${user?.shop_id} tried to delete shop_id ${campaignShopId}'s campaign`);
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      // Try n8n webhook first
      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ campaign_id: campaignId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh campaigns list
        await fetchCampaigns();
        alert('Campaign deleted successfully!');
      } else {
        // Database fallback
        await deleteCampaignFromDatabase(campaignId);
        // Force refresh after database deletion
        await fetchCampaigns();
        alert('Campaign deleted successfully!');
      }
    } catch (error) {
      console.error('❌ Campaign deletion error:', error);
      
      // Try database fallback
      try {
        await deleteCampaignFromDatabase(campaignId);
        // Force refresh after database deletion
        await fetchCampaigns();
        alert('Campaign deleted successfully (database)!');
      } catch (fallbackError) {
        console.error('❌ Database fallback delete failed:', fallbackError);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  // Database fallback campaign deletion
  const deleteCampaignFromDatabase = async (campaignId: string) => {
    console.log('🗄️ Deleting campaign from database:', campaignId);
    
    const { error } = await supabase
      .from('adcampaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      console.error('❌ Database delete error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Database campaign deleted');
    
    // Refresh campaigns list
    await fetchCampaigns();
    alert('Campaign deleted successfully (database fallback)!');
  };

  const handleEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          campaign_id: selectedCampaign?.id,
          name: editForm.name,
          message: editForm.message,
          zone: editForm.zone,
          is_active: editForm.is_active
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // SAFE JSON PARSING: Handle empty or non-JSON responses
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : { success: true };
      
      if (data.success || response.ok) {
        // Force refresh campaigns list after successful update
        await fetchCampaigns();
        setShowEditForm(false);
        setSelectedCampaign(null);
        alert('Campaign updated successfully!');
      } else {
        // Database fallback
        await updateCampaignInDatabase();
        // Force refresh after database update fallback
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('❌ Campaign update error:', error);
      
      // Try database fallback
      try {
        await updateCampaignInDatabase();
        // Force refresh after database update fallback
        await fetchCampaigns();
      } catch (fallbackError) {
        console.error('❌ Database fallback update failed:', fallbackError);
        alert('Failed to update campaign. Please try again.');
      }
    }
  };

  // Database fallback campaign update
  const updateCampaignInDatabase = async () => {
    console.log('🗄️ Updating campaign in database:', selectedCampaign?.id);
    
    const { error } = await supabase
      .from('adcampaigns')
      .update({
        name: editForm.name,
        message: editForm.message,
        zone: editForm.zone,
        is_active: editForm.is_active
      })
      .eq('id', selectedCampaign?.id);

    if (error) {
      console.error('❌ Database update error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Database campaign updated');
    
    // Refresh campaigns list
    await fetchCampaigns();
    setShowEditForm(false);
    setSelectedCampaign(null);
    alert('Campaign updated successfully (database fallback)!');
  };

  const openEditForm = (campaign: Campaign) => {
    // SECURITY CHECK: Ensure user can only edit their own campaigns
    const campaignShopId = campaign.shopId || campaign.shop_id;
    if (campaignShopId !== user?.shop_id) {
      alert('❌ Security Error: You can only edit campaigns from your own shop!');
      console.log(`🔒 Blocked edit: User shop_id ${user?.shop_id} tried to edit shop_id ${campaignShopId}'s campaign`);
      return;
    }
    
    setSelectedCampaign(campaign);
    setEditForm({
      name: campaign.name || campaign.title || '',
      message: campaign.message || campaign.description || '',
      zone: campaign.zone || campaign.location || '',
      is_active: campaign.isActive !== undefined ? campaign.isActive : (campaign.is_active !== undefined ? campaign.is_active : true)
    });
    setShowEditForm(true);
  };

  const openViewModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowViewModal(true);
  };

  // QR Code Generation Functions
  const generateQRCodes = async (campaign: Campaign) => {
    setQrLoading(true);
    try {
      // Create unique QR codes for different zones/locations
      const qrCodes = [
        {
          id: 'entrance',
          name: 'Shop Entrance',
          description: 'Main entrance QR code for campaign access',
          url: `${window.location.origin}/qr/checkin?campaign=${campaign.id}&location=entrance&shop_id=${user?.shop_id}`,
          zone: campaign.location || campaign.zone
        },
        {
          id: 'checkout',
          name: 'Checkout Counter',
          description: 'Checkout counter QR code for last-minute offers',
          url: `${window.location.origin}/qr/checkin?campaign=${campaign.id}&location=checkout&shop_id=${user?.shop_id}`,
          zone: campaign.location || campaign.zone
        },
        {
          id: 'display',
          name: 'Product Display',
          description: 'Product display area QR code',
          url: `${window.location.origin}/qr/checkin?campaign=${campaign.id}&location=display&shop_id=${user?.shop_id}`,
          zone: campaign.location || campaign.zone
        }
      ];

      // Generate QR code data for each location
      const qrCodeData = await Promise.all(
        qrCodes.map(async (qr) => {
          try {
            // Use a simple QR code generation approach
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr.url)}`;
            return {
              ...qr,
              qrCodeUrl,
              generatedAt: new Date().toISOString()
            };
          } catch (error) {
            console.error('QR generation error for', qr.id, error);
            return {
              ...qr,
              qrCodeUrl: null,
              error: 'Failed to generate QR code',
              generatedAt: new Date().toISOString()
            };
          }
        })
      );

      setQrData({
        campaign: {
          id: campaign.id,
          name: campaign.title || campaign.name,
          description: campaign.description || campaign.message,
          zone: campaign.location || campaign.zone
        },
        qrCodes: qrCodeData,
        generatedAt: new Date().toISOString()
      });
      
      setShowQRModal(true);
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Failed to generate QR codes. Please try again.');
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQRCode = (qrCode: any) => {
    if (qrCode.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCode.qrCodeUrl;
      link.download = `${qrCode.id}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printQRCodes = () => {
    if (!qrData) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCodesHtml = qrData.qrCodes.map((qr: any) => `
        <div style="margin: 20px; text-align: center; page-break-inside: avoid;">
          <h3>${qr.name}</h3>
          <p>${qr.description}</p>
          <img src="${qr.qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
          <p style="font-size: 12px; margin-top: 10px;">Campaign: ${qrData.campaign.name}</p>
          <p style="font-size: 12px;">Zone: ${qrData.campaign.zone}</p>
        </div>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>QR Codes - ${qrData.campaign.name}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>QR Codes for ${qrData.campaign.name}</h1>
              <p>${qrData.campaign.description}</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            ${qrCodesHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Manage your marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalScans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgEngagement}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>
            {campaigns.length === 0 
              ? "No campaigns found. Create your first campaign to get started." 
              : `Showing ${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first campaign to start engaging with customers</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{campaign.title || campaign.name}</h3>
                      <Badge variant={campaign.isActive ? "default" : "secondary"}>
                        {campaign.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{campaign.description || campaign.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {campaign.location || campaign.zone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.createdDate || campaign.created_at || '').toLocaleDateString()}
                      </span>
                      {campaign.scan_count !== undefined && (
                        <span>Scans: {campaign.scan_count}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewModal(campaign)}
                      title="View Campaign"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateQRCodes(campaign)}
                      disabled={qrLoading}
                      title="Generate QR Codes"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(campaign)}
                      title="Edit Campaign"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <Input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={createForm.message}
                  onChange={(e) => setCreateForm({...createForm, message: e.target.value})}
                  placeholder="Enter campaign message"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Zone</label>
                <select
                  value={createForm.zone}
                  onChange={(e) => setCreateForm({...createForm, zone: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="china-square">China Square Mall</option>
                  <option value="langata">Langata Mall</option>
                  <option value="nhc">NHC Mall</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditForm && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Campaign</h2>
            <form onSubmit={handleEditCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({...editForm, message: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Zone</label>
                <Input
                  type="text"
                  value={editForm.zone}
                  onChange={(e) => setEditForm({...editForm, zone: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Campaign Modal */}
      {showViewModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{selectedCampaign.title || selectedCampaign.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900">{selectedCampaign.description || selectedCampaign.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zone</label>
                <p className="text-sm text-gray-900">{selectedCampaign.location || selectedCampaign.zone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Badge variant={selectedCampaign.isActive ? "default" : "secondary"}>
                  {selectedCampaign.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCampaign.createdDate || selectedCampaign.created_at || '').toLocaleDateString()}
                </p>
              </div>
              {selectedCampaign.scan_count !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Scans</label>
                  <p className="text-sm text-gray-900">{selectedCampaign.scan_count}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generation Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">QR Codes for {qrData.campaign.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQRModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Campaign Details</h3>
                <p className="text-sm text-gray-600 mb-2">{qrData.campaign.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Zone:</strong> {qrData.campaign.zone}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Generated: {new Date(qrData.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* QR Codes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {qrData.qrCodes.map((qr: any) => (
                  <div key={qr.id} className="border rounded-lg p-4 text-center">
                    <h4 className="font-medium mb-2">{qr.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{qr.description}</p>
                    
                    {qr.qrCodeUrl ? (
                      <div className="mb-4">
                        <img 
                          src={qr.qrCodeUrl} 
                          alt={`QR Code for ${qr.name}`}
                          className="w-48 h-48 mx-auto border"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                        <p className="text-gray-500 text-sm">QR Generation Failed</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {qr.qrCodeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(qr)}
                          className="w-full"
                        >
                          Download QR Code
                        </Button>
                      )}
                      <p className="text-xs text-gray-500 break-all">
                        {qr.url}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t">
                <Button onClick={printQRCodes} className="flex items-center gap-2">
                  🖨️ Print All QR Codes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Download all QR codes as individual files
                    qrData.qrCodes.forEach((qr: any) => {
                      if (qr.qrCodeUrl) {
                        setTimeout(() => downloadQRCode(qr), 100);
                      }
                    });
                  }}
                >
                  📥 Download All
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Installation Instructions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Entrance:</strong> Place at main shop entrance for immediate campaign access</li>
                  <li>• <strong>Checkout:</strong> Position near payment counter for impulse offers</li>
                  <li>• <strong>Display:</strong> Install at product display areas for targeted engagement</li>
                  <li>• <strong>Size:</strong> Print at least 10x10cm for easy scanning</li>
                  <li>• <strong>Position:</strong> Ensure good lighting and clear visibility</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowQRModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Loading State */}
      {qrLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating QR codes...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignManagement;
