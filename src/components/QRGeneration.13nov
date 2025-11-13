import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types/auth';
import { QrCode, Download, Eye, Settings, Calendar, MapPin, Building, Users, Target } from 'lucide-react';

/**
 * QR Generation Component
 * 
 * Features:
 * - Generate QR codes for mall locations
 * - Support multiple visitor types and campaigns
 * - Preview and download functionality
 * - Integration with existing N8N workflow
 */

interface QRGenerationData {
  mallId: string;
  mallName: string;
  locationId: string;
  locationName: string;
  zone: string;
  shopId: string;
  campaignName: string;
  visitorTypes: string[];
  duration: {
    startDate: string;
    endDate: string;
  };
  qrSize: 'small' | 'medium' | 'large';
  generateCount: number;
}

interface MallLocation {
  mall_id: string;
  mall_name: string;
  location_id: string;
  location_name: string;
  zone: string;
  shop_id: string;
  description: string;
}

interface GeneratedQR {
  id: string;
  url: string;
  imageUrl: string;
  locationName: string;
  mallName: string;
  campaignName: string;
  visitorType: string;
  timestamp: string;
}

const VISITOR_TYPES = [
  { id: 'first_time_visitor', name: 'First Time Visitor', icon: '👋', color: 'bg-blue-100 text-blue-800' },
  { id: 'loyal_customer', name: 'Loyal Customer', icon: '💎', color: 'bg-purple-100 text-purple-800' },
  { id: 'tourist', name: 'Tourist/Explorer', icon: '🗺️', color: 'bg-green-100 text-green-800' },
  { id: 'family_group', name: 'Family Group', icon: '👨‍👩‍👧‍👦', color: 'bg-orange-100 text-orange-800' },
  { id: 'business_visitor', name: 'Business Visitor', icon: '💼', color: 'bg-gray-100 text-gray-800' },
  { id: 'social_visitor', name: 'Social Visitor', icon: '👥', color: 'bg-pink-100 text-pink-800' }
];

const QR_SIZES = [
  { id: 'small', name: 'Small (5cm)', description: 'Business cards, small signage' },
  { id: 'medium', name: 'Medium (10cm)', description: 'Standard placement, flyers' },
  { id: 'large', name: 'Large (15cm)', description: 'Posters, main displays' }
];

const PREDEFINED_CAMPAIGNS = [
  { id: 'welcome_nov2025', name: 'Welcome Campaign November 2025', description: 'General visitor welcome' },
  { id: 'wine_weekend_langata', name: 'Wine Appreciation Weekend', description: 'Langata Mall wine event' },
  { id: 'barbershop_special_offer', name: 'Spatial Barbershop Special', description: 'November special offers' },
  { id: 'spa_relaxation_nhc', name: 'NHC Spa Relaxation Package', description: 'Wellness and relaxation' }
];

export default function QRGeneration() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [preloadedCampaign, setPreloadedCampaign] = useState<any>(null);
  
  const [formData, setFormData] = useState<QRGenerationData>({
    mallId: '',
    mallName: '',
    locationId: '',
    locationName: '',
    zone: '',
    shopId: '',
    campaignName: '',
    visitorTypes: [],
    duration: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    qrSize: 'medium',
    generateCount: 1
  });

  // Check for preloaded campaign data from Campaign Management
  useEffect(() => {
    const storedCampaign = localStorage.getItem('selected_campaign_for_qr');
    if (storedCampaign) {
      try {
        const campaignData = JSON.parse(storedCampaign);
        setPreloadedCampaign(campaignData);
        
        // Auto-populate form with campaign data
        const location = MALL_LOCATIONS.find(loc => 
          loc.mall_id === campaignData.mallId && loc.shop_id === campaignData.shopId
        );
        
        if (location) {
          setFormData(prev => ({
            ...prev,
            mallId: campaignData.mallId,
            mallName: location.mall_name,
            locationId: location.location_id,
            locationName: location.location_name,
            zone: location.zone,
            shopId: campaignData.shopId,
            campaignName: campaignData.campaignName
          }));
          
          // Skip location selection step if campaign is preloaded
          setStep(2);
        }
        
        // Clear stored campaign data
        localStorage.removeItem('selected_campaign_for_qr');
      } catch (error) {
        console.error('Error loading preloaded campaign data:', error);
      }
    }
  }, []);

  // Predefined mall locations (you can make these dynamic by fetching from your database)
  const MALL_LOCATIONS: MallLocation[] = [
    {
      mall_id: '3',
      mall_name: 'China Square Mall',
      location_id: 'china_square_spatial_barbershop_spa_2025',
      location_name: 'Spatial Barbershop & Spa',
      zone: 'Spatial_Barbershop',
      shop_id: '3',
      description: 'Main entrance, near information desk'
    },
    {
      mall_id: '6',
      mall_name: 'Langata Mall',
      location_id: 'langata_kika_wines_spirits_2025',
      location_name: 'Kika Wines & Spirits',
      zone: 'Kika_Wines',
      shop_id: '6',
      description: 'Front counter, main entrance'
    },
    {
      mall_id: '7',
      mall_name: 'NHC Mall',
      location_id: 'nhc_maliet_salon_spa_2025',
      location_name: 'Maliet Salon & Spa',
      zone: 'Maliet_Salon',
      shop_id: '9',
      description: 'Reception area, main entrance'
    }
  ];

  const handleMallSelection = (location: MallLocation) => {
    setFormData(prev => ({
      ...prev,
      mallId: location.mall_id,
      mallName: location.mall_name,
      locationId: location.location_id,
      locationName: location.location_name,
      zone: location.zone,
      shopId: location.shop_id
    }));
    setStep(2);
  };

  const handleVisitorTypeToggle = (visitorTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      visitorTypes: prev.visitorTypes.includes(visitorTypeId)
        ? prev.visitorTypes.filter(id => id !== visitorTypeId)
        : [...prev.visitorTypes, visitorTypeId]
    }));
  };

  const generateQRUrl = (location: MallLocation, visitorType: string, index: number = 0) => {
    const baseUrl = window.location.origin;
    const timestamp = new Date().toISOString();
    
    const params = new URLSearchParams({
      location: location.location_id,
      zone: location.zone,
      type: 'shop_checkin',
      mall: location.mall_id,
      shop: location.shop_id,
      visitor_type: visitorType,
      timestamp,
      campaign: formData.campaignName,
      index: index.toString()
    });

    return `${baseUrl}/multi-mall-qr?${params.toString()}`;
  };

  const generateQRImageUrl = (qrUrl: string, size: string) => {
    const sizeMap = { small: '150', medium: '300', large: '450' };
    return `https://api.qrserver.com/v1/create-qr-code/?size=${sizeMap[size as keyof typeof sizeMap]}x${sizeMap[size as keyof typeof sizeMap]}&data=${encodeURIComponent(qrUrl)}`;
  };

  const handleGenerateQRs = async () => {
    if (!formData.locationId || formData.visitorTypes.length === 0) {
      alert('Please select a location and at least one visitor type.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Preparing QR generation...');
    
    try {
      const selectedLocation = MALL_LOCATIONS.find(loc => loc.location_id === formData.locationId);
      if (!selectedLocation) throw new Error('Location not found');

      const qrList: GeneratedQR[] = [];
      let currentIndex = 0;

      for (const visitorType of formData.visitorTypes) {
        setGenerationProgress(`Generating QR codes for ${visitorType.replace('_', ' ')}...`);
        
        for (let i = 0; i < formData.generateCount; i++) {
          const qrUrl = generateQRUrl(selectedLocation, visitorType, i);
          const imageUrl = generateQRImageUrl(qrUrl, formData.qrSize);
          
          const qrData: GeneratedQR = {
            id: `${visitorType}_${i}_${Date.now()}`,
            url: qrUrl,
            imageUrl,
            locationName: selectedLocation.location_name,
            mallName: selectedLocation.mall_name,
            campaignName: formData.campaignName || 'General Campaign',
            visitorType,
            timestamp: new Date().toLocaleString()
          };
          
          qrList.push(qrData);
          currentIndex++;
          
          // Update progress
          const progress = Math.round((currentIndex / (formData.visitorTypes.length * formData.generateCount)) * 100);
          setGenerationProgress(`Generated ${currentIndex}/${formData.visitorTypes.length * formData.generateCount} QR codes (${progress}%)`);
        }
      }

      setGeneratedQRs(qrList);
      setStep(4);
      
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Error generating QR codes. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const downloadQRImage = (qr: GeneratedQR) => {
    const link = document.createElement('a');
    link.href = qr.imageUrl;
    link.download = `${qr.mallName.replace(/\s+/g, '_')}_${qr.locationName.replace(/\s+/g, '_')}_${qr.visitorType}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllQRs = () => {
    generatedQRs.forEach((qr, index) => {
      setTimeout(() => downloadQRImage(qr), index * 500); // Stagger downloads
    });
  };

  const copyQRUrl = (qr: GeneratedQR) => {
    navigator.clipboard.writeText(qr.url);
    alert('URL copied to clipboard!');
  };

  // Step 1: Location Selection
  const renderLocationSelection = () => {
    // If this is coming from Campaign Management, show selected campaign info
    if (preloadedCampaign) {
      const location = MALL_LOCATIONS.find(loc => 
        loc.mall_id === preloadedCampaign.mallId && loc.shop_id === preloadedCampaign.shopId
      );
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Selected</h2>
            <p className="text-gray-600">QR codes will be generated for this specific campaign</p>
          </div>

          {/* Campaign Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Campaign Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Campaign Name:</span>
                <p className="font-medium text-gray-900">{preloadedCampaign.campaignName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Shop:</span>
                <p className="font-medium text-gray-900">{preloadedCampaign.shopName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Mall:</span>
                <p className="font-medium text-gray-900">{location?.mall_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Location:</span>
                <p className="font-medium text-gray-900">{location?.location_name}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              Continue to QR Settings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    // Default location selection for standalone QR generation
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Mall Location</h2>
          <p className="text-gray-600">Choose where visitors will check in</p>
        </div>

        <div className="grid gap-4">
          {MALL_LOCATIONS.map((location) => (
            <div 
              key={location.location_id}
              onClick={() => handleMallSelection(location)}
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{location.mall_name}</h3>
                  <p className="text-blue-600 font-medium">{location.location_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{location.zone.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-600 mt-2">{location.description}</p>
                </div>
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Step 2: Campaign & Settings
  const renderCampaignSettings = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Settings</h2>
        <p className="text-gray-600">Configure your QR campaign parameters</p>
      </div>

      <div className="space-y-6">
        {/* Campaign Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name
          </label>
          <select
            value={formData.campaignName}
            onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a campaign</option>
            {PREDEFINED_CAMPAIGNS.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or enter custom campaign name"
            value={formData.campaignName}
            onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
            className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Visitor Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Visitor Types
          </label>
          <div className="grid grid-cols-2 gap-3">
            {VISITOR_TYPES.map(type => (
              <div
                key={type.id}
                onClick={() => handleVisitorTypeToggle(type.id)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  formData.visitorTypes.includes(type.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium">{type.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Duration
          </label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.duration.startDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  duration: { ...prev.duration, startDate: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={formData.duration.endDate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  duration: { ...prev.duration, endDate: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* QR Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Size
            </label>
            <select
              value={formData.qrSize}
              onChange={(e) => setFormData(prev => ({ ...prev, qrSize: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QR_SIZES.map(size => (
                <option key={size.id} value={size.id}>{size.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generate Count
            </label>
            <select
              value={formData.generateCount}
              onChange={(e) => setFormData(prev => ({ ...prev, generateCount: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 5, 10].map(count => (
                <option key={count} value={count}>{count} QR Code{count > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={formData.visitorTypes.length === 0}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview & Generate
        </button>
      </div>
    </div>
  );

  // Step 3: Preview
  const renderPreview = () => {
    const selectedLocation = MALL_LOCATIONS.find(loc => loc.location_id === formData.locationId);
    if (!selectedLocation) return null;

    const previewQRs = formData.visitorTypes.slice(0, 3); // Show first 3 for preview

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Preview</h2>
          <p className="text-gray-600">Review your QR codes before generation</p>
        </div>

        {/* Campaign Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Campaign Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Location:</span>
              <p className="font-medium">{selectedLocation.mall_name} - {selectedLocation.location_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Campaign:</span>
              <p className="font-medium">{formData.campaignName || 'General Campaign'}</p>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <p className="font-medium">{formData.duration.startDate} to {formData.duration.endDate}</p>
            </div>
            <div>
              <span className="text-gray-500">Total QR Codes:</span>
              <p className="font-medium">{formData.visitorTypes.length * formData.generateCount}</p>
            </div>
          </div>
        </div>

        {/* QR Previews */}
        <div className="grid grid-cols-3 gap-4">
          {previewQRs.map(visitorType => {
            const qrUrl = generateQRUrl(selectedLocation, visitorType);
            const imageUrl = generateQRImageUrl(qrUrl, formData.qrSize);
            const visitorTypeInfo = VISITOR_TYPES.find(vt => vt.id === visitorType);
            
            return (
              <div key={visitorType} className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="mb-3">
                  <img 
                    src={imageUrl} 
                    alt={`QR for ${visitorType}`}
                    className="w-32 h-32 mx-auto border border-gray-100"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">{visitorTypeInfo?.name}</p>
                <p className="text-xs text-gray-500">Size: {formData.qrSize}</p>
              </div>
            );
          })}
          {formData.visitorTypes.length > 3 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
              <p className="text-sm text-gray-500">
                +{formData.visitorTypes.length - 3} more
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleGenerateQRs}
            disabled={isGenerating}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate All QR Codes'}
          </button>
        </div>
      </div>
    );
  };

  // Step 4: Results
  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Codes Generated!</h2>
        <p className="text-gray-600">Your QR codes are ready for download and distribution</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={downloadAllQRs}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download All ({generatedQRs.length})</span>
        </button>
        <button
          onClick={() => {
            setStep(1);
            setGeneratedQRs([]);
            setFormData(prev => ({ ...prev, campaignName: '', visitorTypes: [] }));
          }}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          Generate New Campaign
        </button>
      </div>

      {/* Generated QR Codes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {generatedQRs.map((qr) => {
          const visitorTypeInfo = VISITOR_TYPES.find(vt => vt.id === qr.visitorType);
          return (
            <div key={qr.id} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <img 
                  src={qr.imageUrl} 
                  alt={`QR for ${qr.visitorType}`}
                  className="w-full h-32 object-contain border border-gray-100 rounded"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{visitorTypeInfo?.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{visitorTypeInfo?.name}</span>
                </div>
                <p className="text-xs text-gray-500">{qr.mallName}</p>
                <p className="text-xs text-gray-600">{qr.locationName}</p>
                <p className="text-xs text-gray-400">Generated: {qr.timestamp}</p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => downloadQRImage(qr)}
                    className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 flex items-center justify-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => copyQRUrl(qr)}
                    className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📱 Next Steps</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Download and print QR codes on weather-resistant material</li>
          <li>• Place at strategic locations: entrances, information desks, shop fronts</li>
          <li>• Monitor visitor engagement in your dashboard analytics</li>
          <li>• Track check-ins via the N8N workflow and database</li>
        </ul>
      </div>
    </div>
  );

  // Generation Progress
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Generating QR Codes</h3>
          <p className="text-gray-600">{generationProgress}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Location</span>
          <span>Settings</span>
          <span>Preview</span>
          <span>Download</span>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderLocationSelection()}
      {step === 2 && renderCampaignSettings()}
      {step === 3 && renderPreview()}
      {step === 4 && renderResults()}
    </div>
  );
}
