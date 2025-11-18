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
  // encodedData removed - no longer needed in ultra-minimal format
}

const QrCheckinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkinData, setCheckinData] = useState<QrCheckinData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkinResult, setCheckinResult] = useState<any>(null);

  useEffect(() => {
    // Parse QR code data from URL parameters (ultra-minimal format)
    const campaign = searchParams.get('c') || searchParams.get('campaign') || '';
    const zone = searchParams.get('z') || searchParams.get('zone') || '';
    const location = searchParams.get('l') || searchParams.get('location') || '';
    const type = searchParams.get('t') || searchParams.get('type') || 'checkin';
    const shopId = searchParams.get('s') || searchParams.get('shop_id') || '';
    const visitorType = searchParams.get('v') || searchParams.get('visitor_type') || '';
    
    console.log('🔍 QR Code Parameters:', {
      campaign, zone, location, type, shopId, visitorType,
      urlParams: Object.fromEntries(searchParams.entries())
    });

    // Require minimum parameters for processing
    if (campaign && zone && location) {
      setCheckinData({
        campaign,
        zone,
        location,
        type: type || 'checkin',
        mallId: null, // Not used in ultra-minimal format
        shopId,
        visitorType
      });
      console.log('✅ QR code data parsed successfully');
    } else {
      console.error('❌ Invalid QR code data:', { campaign, zone, location });
      setCheckinResult({ 
        error: 'Invalid QR code data', 
        details: 'Missing required parameters (campaign, zone, or location)' 
      });
    }
  }, [searchParams]);

  const handleCheckin = async () => {
    if (!checkinData) return;

    setIsProcessing(true);
    
    try {
      // Determine webhook URL and payload for n8n workflows
      const webhookUrl = checkinData.type === 'claim' 
        ? 'https://n8n.tenear.com/webhook/claim-offer' 
        : 'https://n8n.tenear.com/webhook/visitor-checkins';

      // Prepare payload for n8n workflows (optimized for both claim-offer and visitor-checkins)
      const payload = {
        // Primary identifiers
        campaign: checkinData.campaign,
        zone: checkinData.zone,
        location: checkinData.location,
        type: checkinData.type,
        
        // Optional identifiers
        shop_id: checkinData.shopId || null,
        visitor_type: checkinData.visitorType || null,
        
        // Metadata
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        
        // Source identification
        source: 'qr_code_scan',
        url: window.location.href
      };

      console.log('📡 Sending webhook to:', webhookUrl);
      console.log('📦 Payload:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Webhook Response Status:', response.status, response.statusText);
      
      // Handle network errors and failed responses
      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      // Handle both JSON responses and redirects
      let result;
      try {
        const responseText = await response.text();
        console.log('📦 Raw Response:', responseText);
        
        // Try to parse as JSON
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          // If it's not JSON, treat as redirect URL or simple text
          if (responseText.includes('redirect') || responseText.includes('location')) {
            throw new Error('Redirect detected - please contact support');
          }
          result = { message: responseText, raw_response: responseText };
        }
      } catch (parseError) {
        console.warn('Failed to parse response:', parseError);
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        result = { message: 'Response received but could not be parsed', raw_error: errorMessage };
      }

      console.log('✅ Processed Result:', result);
      
      // Display success message
      setCheckinResult({
        success: true,
        message: checkinData.type === 'claim' 
          ? 'Offer claimed successfully!' 
          : 'Check-in completed successfully!',
        data: result,
        visitor_info: {
          location: checkinData.location,
          zone: checkinData.zone,
          visitor_type: checkinData.visitorType,
          campaign: checkinData.campaign
        }
      });
    } catch (error) {
      console.error('Checkin error:', error);
      
      // Provide detailed error information for debugging
      let errorMessage = 'Failed to process your request. Please try again.';
      let errorDetails = '';
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (error instanceof TypeError && errorMsg.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server.';
        errorDetails = 'This might be due to a network issue or the server might be temporarily unavailable.';
      } else if (errorMsg.includes('Network error')) {
        errorMessage = errorMsg;
        errorDetails = 'Please check your internet connection and try again.';
      } else if (errorMsg.includes('404')) {
        errorMessage = 'Service not available.';
        errorDetails = 'The check-in service might be temporarily unavailable.';
      } else if (errorMsg.includes('CORS')) {
        errorMessage = 'Access blocked by browser.';
        errorDetails = 'This is a technical issue that needs to be fixed by the administrator.';
      }
      
      setCheckinResult({ 
        error: errorMessage,
        details: errorDetails,
        debug_info: {
          message: errorMsg,
          timestamp: new Date().toISOString()
        }
      });
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
          <p className="text-gray-600 mb-4">{checkinResult.error}</p>
          {checkinResult.details && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{checkinResult.details}</p>
            </div>
          )}
          {checkinResult.redirectHint && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">This might be due to a network redirect. Please try again.</p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => {
                setCheckinResult(null);
                window.location.reload();
              }}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading state while processing
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing...</h2>
          <p className="text-gray-600 mb-4">
            {checkinData?.type === 'claim' ? 'Processing your offer claim...' : 'Processing your check-in...'}
          </p>
          <p className="text-sm text-gray-500">Please wait a moment...</p>
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

  // Default case: No data and no error (likely missing parameters)
  if (!checkinData && !checkinResult?.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-yellow-500 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid QR Code</h2>
          <p className="text-gray-600 mb-6">
            This QR code doesn't contain the required information to process your check-in.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-2"><strong>Current URL:</strong></p>
            <p className="text-xs text-gray-700 break-all">{window.location.href}</p>
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
