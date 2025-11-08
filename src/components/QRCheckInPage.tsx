import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, MapPin, Calendar, Star } from 'lucide-react';

interface QRCheckInPageProps {
  campaignId: string;
  location: string;
  shopId?: string | null;
}

export default function QRCheckInPage({ campaignId, location, shopId }: QRCheckInPageProps) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignAndCheckIn();
  }, [campaignId, location, shopId]);

  const fetchCampaignAndCheckIn = async () => {
    try {
      setLoading(true);
      
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('adcampaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaignData) {
        console.error('Campaign not found:', campaignError);
        setCampaign(null);
        return;
      }

      setCampaign(campaignData);

      // Create visitor check-in record
      const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: checkInData, error: checkInError } = await supabase
        .from('qr_checkins')
        .insert([{
          campaign_id: campaignId,
          visitor_id: visitorId,
          location: location,
          shop_id: shopId || campaignData.shop_id,
          mall_id: campaignData.mall_id,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        }])
        .select()
        .single();

      if (checkInError) {
        console.error('Check-in error:', checkInError);
      } else {
        setTrackingId(checkInData.id);
        setCheckedIn(true);
        
        // Update campaign scan count
        await supabase
          .from('adcampaigns')
          .update({ 
            scan_count: (campaignData.scan_count || 0) + 1 
          })
          .eq('id', campaignId);
      }
    } catch (error) {
      console.error('Error processing QR check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationDisplayName = (loc: string) => {
    const locationMap: { [key: string]: string } = {
      'entrance': 'Shop Entrance',
      'checkout': 'Checkout Counter',
      'display': 'Product Display'
    };
    return locationMap[loc] || loc;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your check-in...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600">This QR code appears to be invalid or the campaign is no longer active.</p>
        </div>
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <div className="text-green-500 mb-6">
            <CheckCircle className="w-20 h-20 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-in Successful!</h1>
          <p className="text-gray-600 mb-6">Thank you for scanning the QR code at Kika Wines & Spirits.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">{campaign.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{campaign.message}</p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Location: {getLocationDisplayName(location)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Time: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
              <Star className="w-5 h-5" />
              <span className="font-medium">Special Offer</span>
            </div>
            <p className="text-sm text-blue-600">
              Show this check-in confirmation to enjoy exclusive discounts and promotions at Kika Wines & Spirits!
            </p>
          </div>
          
          {trackingId && (
            <p className="text-xs text-gray-400 mt-4">
              Check-in ID: {trackingId}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">QR Code Check-in</h1>
        <p className="text-gray-600 mb-6">We encountered an issue processing your check-in. Please try again.</p>
        
        <button
          onClick={fetchCampaignAndCheckIn}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
