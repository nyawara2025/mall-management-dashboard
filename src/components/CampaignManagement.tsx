import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusCircle, 
  QrCode, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  MapPin
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../lib/supabase';

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
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);

  useEffect(() => {
    if (user?.shop_id) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      // Simple fetch from Supabase
      const { data, error } = await supabase
        .from('adcampaigns')
        .select('*')
        .eq('shop_id', user?.shop_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setCampaigns([]);
        return;
      }

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
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodes = async (campaign: Campaign) => {
    setQrLoading(true);
    try {
      // Create QR code data for 3 locations
      const qrCodes = [
        {
          id: 'entrance',
          name: 'Shop Entrance',
          description: 'Main entrance QR code for campaign access',
          url: `${window.location.origin}/qr/checkin?campaign=${campaign.id}&location=entrance&shop_id=${user?.shop_id}`,
        },
        {
          id: 'checkout',
          name: 'Checkout Counter', 
          description: 'Checkout counter QR code for last-minute offers',
          url: `${window.location.origin}/qr/checkin?campaign=${campaign.id}&location=checkout&shop_id=${user?.shop_id}`,
        },
        {
          id: 'display',
          name: 'Product Display',
          description: 'Product display area QR code',
          url: `${window.location.origin}/qr/checkin?campaign=${campaign.id}&location=display&shop_id=${user?.shop_id}`,
        }
      ];

      const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';
      
      setQrData({
        campaign: {
          id: campaign.id,
          name: campaign.title || campaign.name,
          description: campaign.description || campaign.message,
          zone: campaign.location || campaign.zone
        },
        qrCodes: qrCodes.map(qr => ({
          ...qr,
          qrCodeUrl: `${qrCodeUrl}${encodeURIComponent(qr.url)}`
        }))
      });
      
      setSelectedCampaign(campaign);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Failed to generate QR codes. Please try again.');
    } finally {
      setQrLoading(false);
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
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                      <span className={`px-2 py-1 text-xs rounded-full ${campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {campaign.isActive ? "Active" : "Inactive"}
                      </span>
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
                      title="Edit Campaign"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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

      {/* QR Code Modal */}
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
                  Generated: {new Date().toLocaleString()}
                </p>
              </div>

              {/* QR Codes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {qrData.qrCodes.map((qr: any) => (
                  <div key={qr.id} className="border rounded-lg p-4 text-center">
                    <h4 className="font-medium mb-2">{qr.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{qr.description}</p>
                    
                    {qr.qrCodeUrl && (
                      <div className="mb-4">
                        <img 
                          src={qr.qrCodeUrl} 
                          alt={`QR Code for ${qr.name}`}
                          className="w-48 h-48 mx-auto border"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 break-all">
                        {qr.url}
                      </p>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
