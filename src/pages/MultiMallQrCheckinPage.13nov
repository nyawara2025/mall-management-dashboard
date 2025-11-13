import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, User, Building, Package } from 'lucide-react';

interface QRCheckInData {
  location: string;
  zone: string;
  type: string;
  mall: string;
  shop: string;
  visitor_type: string;
  timestamp: string;
}

interface CheckInResult {
  success: boolean;
  message: string;
  mall_name?: string;
  shop_name?: string;
  visitor_type?: string;
  zone_name?: string;
  timestamp?: string;
  error?: string;
}

const MALL_NAMES: Record<string, string> = {
  '3': 'China Square Mall',
  '6': 'Langata Mall', 
  '7': 'NHC Mall'
};

const SHOP_NAMES: Record<string, string> = {
  '3': 'Spatial Barbershop & Spa',
  '6': 'Kika Wines & Spirits',
  '9': 'Maliet Salon & Spa'
};

const VISITOR_TYPES: Record<string, string> = {
  'first_time_visitor': 'First Time Visitor',
  'loyal_customer': 'Loyal Customer',
  'tourist': 'Tourist/Explorer',
  'family_group': 'Family Group',
  'business_visitor': 'Business Visitor',
  'social_visitor': 'Social Visitor'
};

export default function QrCheckinPage() {
  const [searchParams] = useSearchParams();
  const [checkInData, setCheckInData] = useState<QRCheckInData | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');

  useEffect(() => {
    parseQRData();
  }, []);

  const parseQRData = () => {
    const location = searchParams.get('location');
    const zone = searchParams.get('zone');
    const type = searchParams.get('type');
    const mall = searchParams.get('mall');
    const shop = searchParams.get('shop');
    const visitor_type = searchParams.get('visitor_type');
    const timestamp = searchParams.get('timestamp');

    if (location && zone && type && mall && shop) {
      setCheckInData({
        location,
        zone,
        type,
        mall,
        shop,
        visitor_type: visitor_type || 'first_time_visitor',
        timestamp: timestamp || new Date().toISOString()
      });
    } else {
      setCheckInResult({
        success: false,
        message: 'Invalid QR code data. Missing required parameters.',
        error: 'Missing location, zone, type, mall, or shop parameters.'
      });
    }
  };

  const processCheckIn = async () => {
    if (!checkInData) return;

    setIsProcessing(true);
    setProcessingStage('Sending to N8N workflow...');

    try {
      // Call N8N webhook for check-in processing using GET request
      const webhookUrl = 'https://n8n.tenear.com/webhook/china-square-qr-checkin';
      
      const params = new URLSearchParams({
        location: checkInData.location,
        zone: checkInData.zone,
        type: checkInData.type,
        mall: checkInData.mall,
        shop: checkInData.shop,
        visitor_type: checkInData.visitor_type,
        timestamp: checkInData.timestamp
      });

      setProcessingStage('Processing your check-in...');

      const response = await fetch(`${webhookUrl}?${params.toString()}`, {
        method: 'GET'
      });

      setProcessingStage('Recording in database...');

      // Create local check-in record as backup
      const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const localResult: CheckInResult = {
        success: response.ok,
        message: response.ok 
          ? 'Check-in successful! Welcome to our mall!'
          : 'Check-in failed. Please try again or contact staff.',
        mall_name: MALL_NAMES[checkInData.mall] || `Mall ID: ${checkInData.mall}`,
        shop_name: SHOP_NAMES[checkInData.shop] || `Shop ID: ${checkInData.shop}`,
        zone_name: checkInData.zone,
        visitor_type: VISITOR_TYPES[checkInData.visitor_type] || checkInData.visitor_type,
        timestamp: new Date().toLocaleString(),
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };

      setCheckInResult(localResult);

    } catch (error) {
      console.error('Check-in error:', error);
      setCheckInResult({
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Auto-process check-in when data is loaded
  useEffect(() => {
    if (checkInData && !checkInResult && !isProcessing) {
      processCheckIn();
    }
  }, [checkInData]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Check-in</h2>
          <p className="text-gray-600">{processingStage}</p>
        </div>
      </div>
    );
  }

  if (checkInResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            {checkInResult.success ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {checkInResult.success ? 'Welcome!' : 'Check-in Failed'}
            </h2>
            
            <p className="text-gray-600">
              {checkInResult.message}
            </p>
          </div>

          {checkInResult.success && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{checkInResult.mall_name}</p>
                    <p className="text-xs text-gray-500">Mall Location</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{checkInResult.shop_name}</p>
                    <p className="text-xs text-gray-500">{checkInResult.zone_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{checkInResult.visitor_type}</p>
                    <p className="text-xs text-gray-500">Visitor Type</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{checkInResult.timestamp}</p>
                    <p className="text-xs text-gray-500">Check-in Time</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 text-center">
                  🎉 Enjoy your visit! Your check-in has been recorded.
                </p>
              </div>
            </div>
          )}

          {checkInResult.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {checkInResult.error}
              </p>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Scan Another QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Loading QR code data...</p>
      </div>
    </div>
  );
}
