import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface SuccessData {
  message?: string;
  zone?: string;
  location?: string;
  campaign?: string;
  mallName?: string;
  shopName?: string;
  visitorType?: string;
  timestamp?: string;
  offerCode?: string;
  offerTitle?: string;
}

const QRSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [successData, setSuccessData] = useState<SuccessData>({});

  useEffect(() => {
    // Get data from URL parameters
    const message = searchParams.get('message') || 'Check-in Successful!';
    const zone = searchParams.get('zone') || '';
    const location = searchParams.get('location') || '';
    const campaign = searchParams.get('campaign') || '';
    const mallName = searchParams.get('mall_name') || 'NHC Mall';
    const shopName = searchParams.get('shop_name') || '';
    const visitorType = searchParams.get('visitor_type') || '';
    const offerCode = searchParams.get('offer_code') || '';
    const offerTitle = searchParams.get('offer_title') || '';
    const timestamp = searchParams.get('timestamp') || new Date().toLocaleString();

    setSuccessData({
      message,
      zone,
      location,
      campaign,
      mallName,
      shopName,
      visitorType,
      offerCode,
      offerTitle,
      timestamp
    });
  }, [searchParams]);

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'entrance':
        return '🚪';
      case 'checkout':
        return '🛒';
      case 'display':
        return '🛍️';
      default:
        return '📍';
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'entrance':
        return 'from-green-400 to-green-600';
      case 'checkout':
        return 'from-blue-400 to-blue-600';
      case 'display':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getZoneName = (zone: string) => {
    const zoneMap: { [key: string]: string } = {
      'entrance': 'Mall Entrance',
      'checkout': 'Checkout Counter',
      'display': 'Product Display',
      'food-court': 'Food Court',
      'rest-areas': 'Rest Areas',
      'entertainment': 'Entertainment Zone'
    };
    return zoneMap[zone] || zone.charAt(0).toUpperCase() + zone.slice(1);
  };

  const getVisitorTypeMessage = (visitorType: string) => {
    switch (visitorType) {
      case 'family':
        return '👨‍👩‍👧‍👦 Welcome Families!';
      case 'business':
        return '👔 Welcome Business Visitors!';
      case 'tourist':
        return '🧳 Welcome Tourists!';
      case 'regular':
        return '👋 Welcome Back!';
      default:
        return '🎉 Welcome!';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full overflow-hidden">
        {/* Header with Mall Branding */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 -m-8 mb-6">
            <div className="text-3xl font-bold mb-2">{successData.mallName}</div>
            <div className="text-blue-100 text-sm">Mall Management System</div>
          </div>
        </div>

        {/* Success Animation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <div className="text-green-500 text-4xl animate-bounce">✅</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Check-in Successful!</h1>
          <p className="text-gray-600">{successData.message}</p>
        </div>

        {/* Zone Information */}
        {successData.zone && (
          <div className={`bg-gradient-to-r ${getZoneColor(successData.zone)} rounded-xl p-4 mb-6 text-white`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{getZoneIcon(successData.zone)}</span>
              <div>
                <p className="text-sm opacity-90">Location Zone</p>
                <p className="text-lg font-bold">{getZoneName(successData.zone)}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">{successData.location}</p>
          </div>
        )}

        {/* Campaign Information */}
        {successData.campaign && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Campaign</p>
            <p className="font-semibold text-gray-800">{successData.campaign}</p>
          </div>
        )}

        {/* Shop Information */}
        {successData.shopName && (
          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-indigo-500 mb-1">Shop</p>
            <p className="font-semibold text-indigo-800">{successData.shopName}</p>
          </div>
        )}

        {/* Visitor Type Message */}
        {successData.visitorType && (
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-700">
              {getVisitorTypeMessage(successData.visitorType)}
            </p>
          </div>
        )}

        {/* Offer Information */}
        {successData.offerCode && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6 border border-yellow-200">
            <div className="text-center">
              <p className="text-sm text-orange-600 mb-1">🎁 Exclusive Offer Available!</p>
              <p className="font-bold text-orange-800">{successData.offerTitle}</p>
              <p className="text-lg font-mono text-orange-600 bg-white rounded px-2 py-1 mt-2">
                {successData.offerCode}
              </p>
            </div>
          </div>
        )}

        {/* Visitor Stats */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Check-in Time</span>
            <span className="font-medium text-gray-700">{successData.timestamp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
          >
            Return to Dashboard
          </button>
          
          <button
            onClick={() => window.print()}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Print Receipt
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by TeNEAR Mall Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRSuccessPage;
