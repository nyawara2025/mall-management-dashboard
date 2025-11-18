import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface QrCheckinData {
  campaign: string;
  zone: string;
  location: string;
  type?: string;
  mallId?: string | null;
  shopId?: string | null;
  visitorType?: string | null;
  encodedData?: string | null;
}

const QrCheckinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkinData, setCheckinData] = useState<QrCheckinData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkinResult, setCheckinResult] = useState<any>(null);

  useEffect(() => {
    // Parse QR code data from URL parameters (supports both old and new short format)
    const campaign = searchParams.get('c') || searchParams.get('campaign');
    const zone = searchParams.get('z') || searchParams.get('zone');
    const location = searchParams.get('l') || searchParams.get('location');
    const type = searchParams.get('t') || searchParams.get('type') || 'checkin';
    const mallId = searchParams.get('m') || searchParams.get('mall_id');
    const shopId = searchParams.get('s') || searchParams.get('shop_id');
    const visitorType = searchParams.get('v') || searchParams.get('visitor_type');
    const data = searchParams.get('data');

    if (campaign && zone && location) {
      setCheckinData({
        campaign,
        zone,
        location,
        type,
        mallId,
        shopId,
        visitorType,
        encodedData: data
      });
    } else {
      setCheckinResult({ error: 'Invalid QR code data' });
    }
  }, [searchParams]);

  const handleCheckin = async () => {
    if (!checkinData) return;

    setIsProcessing(true);
    try {
      // Determine webhook URL based on type
      const webhookUrl = checkinData.type === 'claim' 
        ? 'https://n8n.tenear.com/webhook/claim-offer' 
        : 'https://n8n.tenear.com/webhook/visitor-checkins';

      // Prepare payload - decode data if available, otherwise use URL params
      let payload = {
        campaign_id: checkinData.campaign,
        zone: checkinData.zone,
        location: checkinData.location,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      };

      // If encoded data is available, add it to payload
      if (checkinData.encodedData) {
        try {
          const decodedData = JSON.parse(atob(checkinData.encodedData));
          payload = { ...payload, ...decodedData };
        } catch (e) {
          console.warn('Failed to decode QR data:', e);
        }
      }

      // Add additional parameters if available
      if (checkinData.mallId) (payload as any).mall_id = parseInt(checkinData.mallId);
      if (checkinData.shopId) (payload as any).shop_id = parseInt(checkinData.shopId);
      if (checkinData.visitorType) (payload as any).visitor_type = checkinData.visitorType;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Handle both JSON responses (legacy) and redirect responses (new hybrid approach)
      if (response.status === 302 || response.status === 301 || response.redirected) {
        // New flow: n8n sends redirect to success page
        const redirectUrl = response.headers.get('location') || response.url;
        if (redirectUrl) {
          console.log('🔄 Following redirect to:', redirectUrl);
          // Handle relative and absolute URLs
          if (redirectUrl.startsWith('/')) {
            // Relative URL - append to current domain
            window.location.href = window.location.origin + redirectUrl;
          } else {
            // Absolute URL
            window.location.href = redirectUrl;
          }
          return;
        }
      }

      // Legacy flow: n8n sends JSON response
      const result = await response.json();
      setCheckinResult(result);
    } catch (error) {
      console.error('Checkin error:', error);
      
      // Check if it's a redirect error (network-level redirect)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🔄 Possible redirect detected, attempting to handle...');
        // This might be a redirect that the fetch API couldn't follow
        // Try to extract redirect URL from error or fall back to direct navigation
        setCheckinResult({ 
          error: 'Network redirect detected. Please try again or contact support.',
          redirectHint: true
        });
      } else {
        setCheckinResult({ 
          error: 'Failed to process check-in. Please try again.' 
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getZoneName = (zone: string): string => {
    const zoneMap: { [key: string]: string } = {
      'entrance': 'Mall Entrance',
      'checkout': 'Checkout Counter',
      'display': 'Product Display'
    };
    return zoneMap[zone] || zone;
  };

  const getZoneColor = (zone: string): string => {
    const colorMap: { [key: string]: string } = {
      'entrance': 'bg-green-500',
      'checkout': 'bg-blue-500',
      'display': 'bg-purple-500'
    };
    return colorMap[zone] || 'bg-gray-500';
  };

  if (checkinResult?.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Check-in Failed</h2>
          <p className="text-gray-600 mb-6">{checkinResult.error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (checkinResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Check-in Successful!</h2>
          <p className="text-gray-600 mb-4">
            Welcome! You've successfully checked in at <strong>{getZoneName(checkinData?.zone || '')}</strong>
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold">{checkinData?.location}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {checkinData?.type === 'claim' ? 'Offer Claim' : 'QR Code Check-in'}
          </h1>
          <p className="text-gray-600">
            {checkinData?.type === 'claim' ? 'Scan successful! Ready to claim your offer?' : 'Scan successful! Ready to check in?'}
          </p>
        </div>

        {checkinData && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Campaign</p>
                <p className="font-semibold">{checkinData.campaign}</p>
              </div>
            </div>

            <div className={`p-4 ${getZoneColor(checkinData.zone)} text-white rounded-lg`}>
              <p className="text-sm opacity-90">Location Zone</p>
              <p className="text-xl font-bold">{getZoneName(checkinData.zone)}</p>
              <p className="text-sm opacity-90">{checkinData.location}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckin}
            disabled={isProcessing || !checkinData}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : (checkinData?.type === 'claim' ? 'Claim Offer' : 'Check In')}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By checking in, you consent to track your visit for campaign analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QrCheckinPage;
