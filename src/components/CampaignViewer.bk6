import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  MapPin, 
  Clock, 
  Share2, 
  Star, 
  Heart,
  ArrowLeft,
  Phone,
  Navigation
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  message: string;
  zone: string;
  shop_id?: string;
  created_at: string;
  is_active: boolean;
  shop?: {
    name: string;
    description?: string;
    phone?: string;
    location?: string;
  };
}

interface CampaignViewerProps {
  campaignId: string;
}

export default function CampaignViewer({ campaignId }: CampaignViewerProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    console.log('CampaignViewer: Component mounted with campaignId:', campaignId);
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    console.log('CampaignViewer: Fetching campaign for ID:', campaignId);
    try {
      console.log('CampaignViewer: Making API request...');
      const response = await fetch(`https://n8n.tenear.com/webhook/manage-campaigns-get`);
      console.log('CampaignViewer: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('CampaignViewer: API Response data:', data);
      
      if (data.success && data.campaigns) {
        console.log('CampaignViewer: Found campaigns array, length:', data.campaigns.length);
        console.log('CampaignViewer: Looking for campaign ID:', campaignId);
        console.log('CampaignViewer: Available campaign IDs:', data.campaigns.map((c: any) => c.id));
        
        // Find the specific campaign by ID
        const campaign = data.campaigns.find((c: any) => c.id === campaignId);
        console.log('CampaignViewer: Found campaign:', campaign);
        
        if (campaign) {
          setCampaign({
            id: campaign.id,
            name: campaign.title,
            message: campaign.description,
            zone: campaign.location,
            shop_id: campaign.shopId,
            created_at: new Date().toISOString(), // Use current time if not available
            is_active: campaign.isActive,
            shop: {
              name: campaign.locationName || 'Campaign Location',
              description: campaign.plainMessage || '',
              phone: '',
              location: campaign.locationName || campaign.location
            }
          });
          console.log('CampaignViewer: Campaign set successfully');
        } else {
          console.log('CampaignViewer: Campaign not found in array');
          setError(`Campaign "${campaignId}" not found`);
        }
      } else {
        console.log('CampaignViewer: API returned success: false or no campaigns');
        setError('Failed to load campaign');
      }
    } catch (err) {
      console.error('CampaignViewer: Error fetching campaign:', err);
      setError('Failed to load campaign');
    } finally {
      console.log('CampaignViewer: Setting loading to false');
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.name || 'Campaign',
          text: campaign?.message || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    console.log('CampaignViewer: Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
          <p className="text-xs text-gray-400 mt-2">Debug: Looking for campaign ID = {campaignId}</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    console.log('CampaignViewer: Rendering error state');
    console.log('CampaignViewer: Error:', error);
    console.log('CampaignViewer: Campaign:', campaign);
    console.log('CampaignViewer: Campaign ID:', campaignId);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || `The campaign "${campaignId}" does not exist or has expired.`}
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.history.back()}>
                <ArrowLeft size={16} className="mr-2" />
                Go Back
              </Button>
              <div className="text-xs text-gray-400 mt-4">
                Debug: Campaign ID = {campaignId}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safety fallback - always render something
  console.log('CampaignViewer: Final render with campaign:', campaign);
  
  if (!campaign) {
    console.log('CampaignViewer: Campaign is null, showing fallback');
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Debug Info</h2>
            <p className="text-gray-600 mb-4">Campaign object is null</p>
            <p className="text-xs text-gray-400">Campaign ID: {campaignId}</p>
            <p className="text-xs text-gray-400">Loading: {loading.toString()}</p>
            <p className="text-xs text-gray-400">Error: {error || 'None'}</p>
            <Button onClick={() => window.history.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="font-semibold text-gray-900">Campaign</h1>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 size={16} />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Shop Info */}
        {campaign.shop && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">{campaign.shop.name}</h2>
                <Badge variant="outline">{campaign.zone}</Badge>
              </div>
              {campaign.shop.description && (
                <p className="text-gray-600 text-sm mb-3">{campaign.shop.description}</p>
              )}
              <div className="flex gap-2">
                {campaign.shop.phone && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone size={14} className="mr-1" />
                    Call
                  </Button>
                )}
                {campaign.shop.location && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation size={14} className="mr-1" />
                    Directions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Clock size={14} />
                  <span>{getTimeAgo(campaign.created_at)}</span>
                  <MapPin size={14} className="ml-2" />
                  <span className="capitalize">{campaign.zone} Mall</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={`${liked ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              </Button>
            </div>

            {/* Campaign Message */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{campaign.message}</p>
            </div>

            {/* Campaign Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Star size={16} className="mr-2" />
                Claim Offer
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Content Based on Campaign Type */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">About This Campaign</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Campaign Type:</span>
                <span className="font-medium">Promotional</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">Ongoing</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Campaigns */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">More from {campaign.shop?.name}</h3>
            <p className="text-sm text-gray-600">
              Discover other exciting offers and events from this shop.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              View All Campaigns
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-500">
            Scanned via QR code • {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Powered by Mall Management System
          </p>
        </div>
      </div>
    </div>
  );
}
