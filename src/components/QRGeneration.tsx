import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import { QrCode, Download, Eye, Settings, Calendar, MapPin, Building, Users, Target } from 'lucide-react';

/**
 * QR Generation Component - Database Schema Compliant
 * 
 * Integrates with qr_locations and qr_checkins tables:
 * - qr_locations.qr_code_data = qr_checkins.location_id
 * - Proper mall_name and zone_name population
 * - Multi-mall support (China Square, Langata, NHC)
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
  qrType: 'claim' | 'checkin';
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

interface Campaign {
  id: number;
  campaign_id: string;
  name: string;
  message: string;
  active: boolean;
  mall_id: number;
  shop_id: number;
  created_at: string;
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
  qrCodeData: string; // Must match qr_checkins.location_id
}

const VISITOR_TYPES = [
  { id: 'first_time_visitor', name: 'First Time Visitor', icon: '👋', color: 'bg-blue-100 text-blue-800' },
  { id: 'loyal_customer', name: 'Loyal Customer', icon: '💎', color: 'bg-purple-100 text-purple-800' },
  { id: 'tourist', name: 'Tourist/Explorer', icon: '🗺️', color: 'bg-green-100 text-green-800' },
  { id: 'family_group', name: 'Family Group', icon: '👨‍👩‍👧‍👦', color: 'bg-orange-100 text-orange-800' },
  { id: 'business_visitor', name: 'Business Visitor', icon: '💼', color: 'bg-gray-100 text-gray-800' },
  { id: 'social_visitor', name: 'Social Visitor', icon: '👥', color: 'bg-pink-100 text-pink-800' }
];

const QR_TYPES = [
  { id: 'claim', name: 'Offer Claims', description: 'QR codes for claiming promotional offers and discounts' },
  { id: 'checkin', name: 'Zone Check-ins', description: 'QR codes for tracking visitor movement across mall zones' }
];

const QR_SIZES = [
  { id: 'small', name: 'Small (5cm)', description: 'Business cards, small signage' },
  { id: 'medium', name: 'Medium (10cm)', description: 'Standard placement, flyers' },
  { id: 'large', name: 'Large (15cm)', description: 'Posters, main displays' }
];

// Dynamic campaigns fetched from database

// Updated MALL_LOCATIONS with proper mall_name values
const MALL_LOCATIONS: MallLocation[] = [
  // China Square Mall (mall_id: 3)
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_spatial_barbershop', location_name: 'Spatial Barbershop & Spa', zone: 'Spatial_Barbershop', shop_id: '3', description: 'Premium barbershop and spa services' },
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_main_entrance', location_name: 'China Square Main Entrance', zone: 'Main_Entrance', shop_id: '3', description: 'Primary mall entrance' },
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_food_court', location_name: 'China Square Food Court', zone: 'Food_Court', shop_id: '3', description: 'Central dining area' },
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_electronics', location_name: 'China Square Electronics', zone: 'Electronics', shop_id: '3', description: 'Electronics and tech zone' },
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_fashion', location_name: 'China Square Fashion', zone: 'Fashion', shop_id: '3', description: 'Clothing and fashion district' },
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_general_shopping', location_name: 'China Square General Shopping', zone: 'General_Shopping', shop_id: '3', description: 'General retail and shopping' },
  { mall_id: '3', mall_name: 'China Square Mall', location_id: 'china_square_uchumi_choma', location_name: 'Uchumi Choma Zone & Carwash', zone: 'Uchumi_Choma_Carwash', shop_id: '3', description: 'Grill and carwash facility' },

  // Langata Mall (mall_id: 6)
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_kika_wines', location_name: 'Kika Wines & Spirits', zone: 'Kika_Wines', shop_id: '6', description: 'Premium wine and spirits store' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_parking_area', location_name: 'Parking Area', zone: 'Parking_Area', shop_id: '6', description: 'Main parking facility' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_upstairs_shops', location_name: 'Upstairs Shops', zone: 'Upstairs_Shops', shop_id: '6', description: 'Upper level retail' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_ground_floor', location_name: 'Ground Floor Shops', zone: 'Ground_Floor', shop_id: '6', description: 'Ground level retail area' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_cleanshelf', location_name: 'Cleanshelf Supermarket', zone: 'Cleanshelf_Supermarket', shop_id: '6', description: 'Main grocery store' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_aquarius_bar', location_name: 'Aquarius Bar', zone: 'Aquarius_Bar', shop_id: '6', description: 'Premium bar and lounge' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_maboko_road', location_name: 'Maboko Road', zone: 'Maboko_Road', shop_id: '6', description: 'Roadside retail area' },
  { mall_id: '6', mall_name: 'Langata Mall', location_id: 'langata_gym', location_name: 'The Gym', zone: 'The_Gym', shop_id: '6', description: 'Fitness center' },

  // NHC Mall (mall_id: 7)
  { mall_id: '7', mall_name: 'NHC Mall', location_id: 'nhc_maliet_salon', location_name: 'Maliet Salon & Spa', zone: 'Maliet_Salon', shop_id: '9', description: 'Beauty salon and spa services' },
  { mall_id: '7', mall_name: 'NHC Mall', location_id: 'nhc_front_parking', location_name: 'Front Parking Area & Entrance', zone: 'Front_Parking_Entrance', shop_id: '9', description: 'Main entrance and parking' },
  { mall_id: '7', mall_name: 'NHC Mall', location_id: 'nhc_mezzanine', location_name: 'Mezzanine Floor', zone: 'Mezzanine_Floor', shop_id: '9', description: 'Upper level area' },
  { mall_id: '7', mall_name: 'NHC Mall', location_id: 'nhc_ground_floor', location_name: 'Ground Floor', zone: 'Ground_Floor', shop_id: '9', description: 'Main retail floor' },
  { mall_id: '7', mall_name: 'NHC Mall', location_id: 'nhc_residential', location_name: 'Residential Area', zone: 'Residential_Area', shop_id: '9', description: 'Residential services zone' },
  { mall_id: '7', mall_name: 'NHC Mall', location_id: 'nhc_estate', location_name: 'NHC Estate', zone: 'NHC_Estate', shop_id: '9', description: 'Estate management services' }
];

export default function QRGeneration() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [preloadedCampaign, setPreloadedCampaign] = useState<any>(null);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  
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
    generateCount: 1,
    qrType: 'claim'
  });

  // Authentication check - ensure user is logged in and has required permissions
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access QR code generation</p>
      </div>
    );
  }

  // Check if user has shop/mall assignments
  if (!user.shop_id || !user.mall_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Shop/Mall permissions required</p>
          <p className="text-gray-500">Please contact administrator to assign shop and mall permissions to your account.</p>
        </div>
      </div>
    );
  }

  // Check for preloaded campaign data from Campaign Management
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignParam = urlParams.get('campaign');
    
    if (campaignParam) {
      try {
        const campaign = JSON.parse(decodeURIComponent(campaignParam));
        setPreloadedCampaign(campaign);
        
        // Pre-populate form with campaign data
        setFormData(prev => ({
          ...prev,
          mallId: campaign.mallId || (user?.mall_id?.toString() || '6'),  // Use user's mall_id, fallback to 6
          mallName: campaign.mallName || 'Langata Mall',  // Default to Sandra's mall
          locationId: campaign.locationId || 'langata_kika_wines',
          locationName: campaign.locationName || 'Kika Wines & Spirits',
          zone: campaign.zone || 'Kika_Wines',
          shopId: campaign.shopId || (user?.shop_id?.toString() || '6'),  // Use user's shop_id, fallback to 6
          campaignName: campaign.campaignName || campaign.campaign_id,
          visitorTypes: ['first_time_visitor', 'loyal_customer'] // Default visitor types
        }));
        
        setStep(2); // Skip location selection, go to settings
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  }, []);

  // Fetch campaigns from adcampaigns table
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoadingCampaigns(true);
      try {
        console.log('🔍 Fetching campaigns from adcampaigns table...');
        
        const { data, error } = await supabase
          .from('adcampaigns')
          .select(`
            id,
            campaign_id,
            name,
            message,
            active,
            mall_id,
            shop_id,
            created_at
          `)
          .eq('active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching campaigns from adcampaigns:', error);
          setAvailableCampaigns([]);
        } else {
          setAvailableCampaigns(data || []);
          console.log('✅ Fetched campaigns from adcampaigns:', data?.length || 0);
          if (data && data.length > 0) {
            console.log('📋 Sample campaigns:', JSON.stringify(data.slice(0, 2), null, 2));
          }
        }
      } catch (error) {
        console.error('❌ Exception fetching campaigns:', error);
        setAvailableCampaigns([]);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, []);

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

  const handleVisitorTypeToggle = (visitorType: string) => {
    setFormData(prev => ({
      ...prev,
      visitorTypes: prev.visitorTypes.includes(visitorType)
        ? prev.visitorTypes.filter(t => t !== visitorType)
        : [...prev.visitorTypes, visitorType]
    }));
  };

  // Database Schema Compliant QR Generation
  const generateQRCodes = async () => {
    // Validate campaign selection
    if (!formData.campaignName) {
      alert('Please select a campaign from the dropdown.');
      return;
    }
    
    // Check if selected campaign exists in available campaigns
    const selectedCampaign = availableCampaigns.find(c => c.campaign_id === formData.campaignName);
    if (!selectedCampaign && availableCampaigns.length > 0) {
      alert('Please select a valid campaign from the available options.');
      return;
    }
    
    if (formData.visitorTypes.length === 0) {
      alert('Please select at least one visitor type.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Initializing QR generation...');
    
    const baseUrl = window.location.origin;
    const newQRs: GeneratedQR[] = [];

    try {
      // For each visitor type, generate QR codes
      for (const visitorType of formData.visitorTypes) {
        for (let i = 0; i < formData.generateCount; i++) {
          setGenerationProgress(`Generating QR for ${visitorType} (${i + 1}/${formData.generateCount})...`);

          // Generate unique qr_code_data for database tracking
          const qrCodeData = `${formData.locationId}_${formData.campaignName}_${visitorType}_${Date.now()}_${i}`;
          
          // CRITICAL: QR codes point to n8n webhooks to ensure visitor claims
          // and check-ins are properly captured in the visitor_claims table
          // for analytics and metrics tracking
          
          // Create QR URL pointing to n8n webhooks for data capture
          // This ensures visitor claims are stored in the visitor_claims table
          let qrUrl;
          
          if (formData.qrType === 'claim') {
            // Offer Claims QR - point to n8n webhook for data capture
            const claimData = {
              location: `${formData.locationId}_${visitorType}_${i}`,
              zone: formData.zone,
              mall_id: formData.mallId,
              shop_id: formData.shopId,
              visitor_type: visitorType,
              campaign_id: formData.campaignName,
              campaign_name: formData.campaignName.substring(0, 30),
              timestamp: Date.now()
            };
            
            const encodedData = btoa(JSON.stringify(claimData));
            qrUrl = `https://n8n.tenear.com/webhook/claim-offer?d=${encodeURIComponent(encodedData)}`;
          } else {
            // Zone Check-in QR - point to n8n webhook for visitor check-ins
            const checkinData = {
              location: `${formData.locationId}_${visitorType}_${i}`,
              zone: formData.zone,
              mall_id: formData.mallId,
              shop_id: formData.shopId,
              visitor_type: visitorType,
              checkin_type: 'general',
              timestamp: Date.now()
            };
            
            const encodedData = btoa(JSON.stringify(checkinData));
            qrUrl = `https://n8n.tenear.com/webhook/visitor-checkins?d=${encodeURIComponent(encodedData)}`;
          }
          
        // Debug: Log the QR data capture information
        console.log(`🔗 QR Generated:`, {
          type: formData.qrType,
          url: qrUrl,
          user_shop_id: user.shop_id,
          user_mall_id: user.mall_id,
          will_capture_data: true,
          webhook_endpoint: formData.qrType === 'claim' ? '/webhook/claim-offer' : '/webhook/visitor-checkins'
        });

        // Test QR URL format (first QR only)
        if (i === 0 && visitorType === formData.visitorTypes[0]) {
          console.log(`🧪 Test QR URL: ${qrUrl}`);
          console.log(`🧪 Data will be captured in visitor_claims table via n8n webhook`);
        }
          
          // Generate QR code image
          const qrSize = formData.qrSize === 'small' ? '200x200' : formData.qrSize === 'medium' ? '400x400' : '600x600';
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(qrUrl)}&format=png&qzone=4`;

          const qrData: GeneratedQR = {
            id: `${visitorType}_${i}`,
            url: qrUrl,
            imageUrl: qrImageUrl,
            locationName: formData.locationName,
            mallName: formData.mallName,
            campaignName: formData.campaignName,
            visitorType,
            timestamp: new Date().toISOString(),
            qrCodeData: qrCodeData // Unique indentifier for Data tracking
          };

          newQRs.push(qrData);

          // Store location in qr_locations table (Database Schema Compliant)
          await storeLocationInDatabase(qrData);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setGeneratedQRs(newQRs);
      setGenerationProgress('QR codes generated successfully!');
      setTimeout(() => setGenerationProgress(''), 2000);
      setStep(4);

    } catch (error) {
      console.error('Error generating QR codes:', error);
      setGenerationProgress('Error generating QR codes. Please try again.');
      setTimeout(() => setGenerationProgress(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Store location in qr_locations table (Database Schema Compliant)
  const storeLocationInDatabase = async (qrData: GeneratedQR) => {
    try {
      const locationData = {
        location_name: qrData.locationName,
        zone_name: formData.zone,
        location_description: `${qrData.campaignName} - ${qrData.visitorType.replace(/_/g, ' ')}`,
        mall_name: formData.mallName,
        location_type: 'shop_checkin',
        floor_level: 1, // Default, can be customized
        operating_hours: '24/7',
        qr_code_data: qrData.qrCodeData, // This must match qr_checkins.location_id
        checkin_benefits: {
          campaign: qrData.campaignName,
          visitor_type: qrData.visitorType,
          benefits: 'Welcome offers, loyalty points, exclusive deals'
        },
        language_preference: 'en',
        expected_daily_checkins: 50,
        active: true
      };

      const { error } = await supabase
        .from('qr_locations')
        .insert([locationData]);

      if (error) {
        console.error('Error storing location in database:', error);
        // Don't throw error - continue with QR generation
      }
    } catch (error) {
      console.error('Database storage error:', error);
      // Don't throw error - continue with QR generation
    }
  };

  // Step indicators
  const stepIndicators = [
    { number: 1, title: 'Location', icon: MapPin, completed: step > 1 },
    { number: 2, title: 'Settings', icon: Settings, completed: step > 2 },
    { number: 3, title: 'Preview', icon: Eye, completed: step > 3 },
    { number: 4, title: 'Download', icon: Download, completed: step > 4 }
  ];

  // Step 1: Location Selection
  const renderLocationSelection = () => {
    // If we have a preloaded campaign, show campaign confirmation
    if (preloadedCampaign) {
      const location = MALL_LOCATIONS.find(l => l.location_id === formData.locationId);
      
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
            {isLoadingCampaigns ? (
              <option disabled>Loading campaigns...</option>
            ) : availableCampaigns.length > 0 ? (
              availableCampaigns.map((campaign) => (
                <option key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.name} (Campaign ID: {campaign.campaign_id})
                </option>
              ))
            ) : (
              <option disabled>No campaigns available</option>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Type
            </label>
            <select
              value={formData.qrType}
              onChange={(e) => setFormData(prev => ({ ...prev, qrType: e.target.value as 'claim' | 'checkin' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QR_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {QR_TYPES.find(t => t.id === formData.qrType)?.description}
            </p>
          </div>
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
    </div>
  );

  // Step 3: Preview
  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview QR Codes</h2>
        <p className="text-gray-600">Review your QR codes before generation</p>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Location:</span>
            <p className="font-medium text-gray-900">{formData.locationName}</p>
            <p className="text-sm text-gray-600">{formData.mallName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Campaign:</span>
            <p className="font-medium text-gray-900">{formData.campaignName}</p>
            <p className="text-sm text-gray-600">{formData.visitorTypes.length} visitor types</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Settings:</span>
            <p className="font-medium text-gray-900">{QR_TYPES.find(t => t.id === formData.qrType)?.name}</p>
            <p className="text-sm text-gray-600">{formData.qrSize} size</p>
            <p className="text-sm text-gray-600">{formData.generateCount} QR code{formData.generateCount > 1 ? 's' : ''} per type</p>
          </div>
        </div>
      </div>

      {/* Visitor Types Preview */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">🎯 Target Visitor Types</h4>
        <div className="flex flex-wrap gap-2">
          {formData.visitorTypes.map(typeId => {
            const type = VISITOR_TYPES.find(t => t.id === typeId);
            return (
              <span key={typeId} className={`px-3 py-1 rounded-full text-sm font-medium ${type?.color}`}>
                {type?.icon} {type?.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Expected Output */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">📱 Expected Output</h4>
        <p className="text-gray-700 mb-2">
          Total QR codes to generate: <span className="font-bold text-blue-600">{formData.visitorTypes.length * formData.generateCount}</span>
        </p>
        {(() => {
          const selectedCampaign = availableCampaigns.find(c => c.campaign_id === formData.campaignName);
          return (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Each QR code will be unique and configured for <span className="font-semibold">{formData.locationName}</span> with campaign:</p>
              {selectedCampaign ? (
                <div className="bg-white rounded border p-3 mt-2">
                  <p className="font-semibold text-blue-600">{selectedCampaign.name}</p>
                  <p className="text-xs text-gray-500">Campaign ID: {selectedCampaign.campaign_id}</p>
                  {selectedCampaign.message && (
                    <p className="text-xs text-gray-600 mt-1">{selectedCampaign.message}</p>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="font-semibold text-blue-600">{formData.campaignName}</p>
                  <p className="text-xs text-gray-500">{formData.locationName}</p>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );

  // Step 4: Download
  const renderDownload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your QR Codes are Ready!</h2>
        <p className="text-gray-600">Download and distribute to your mall visitors</p>
      </div>

      {generatedQRs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No QR codes generated yet. Please go back and generate them.</p>
          <button
            onClick={() => setStep(3)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Preview
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">Generation Complete!</h3>
            </div>
            <p className="text-green-700">
              Successfully generated <span className="font-bold">{generatedQRs.length}</span> QR codes for {formData.locationName}.
            </p>
          </div>

          {/* QR Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedQRs.map((qr) => (
              <div key={qr.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <img src={qr.imageUrl} alt={`QR Code for ${qr.visitorType}`} className="mx-auto mb-3 w-32 h-32" />
                  <h4 className="font-semibold text-gray-900">{qr.locationName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{qr.mallName}</p>
                  <p className="text-xs text-blue-600 font-medium">{qr.visitorType.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 mt-2 truncate max-w-full" title={qr.url}>
                    {qr.url}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qr.imageUrl;
                      link.download = `${qr.locationName}_${qr.visitorType}_${Date.now()}.png`;
                      link.click();
                    }}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qr.url);
                      alert('URL copied to clipboard!');
                    }}
                    className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h4>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  // Download all QR codes
                  generatedQRs.forEach((qr, index) => {
                    setTimeout(() => {
                      const link = document.createElement('a');
                      link.href = qr.imageUrl;
                      link.download = `${qr.locationName}_${qr.visitorType}_${Date.now()}_${index}.png`;
                      link.click();
                    }, index * 500); // Stagger downloads
                  });
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              
              <button
                onClick={() => {
                  // Copy all URLs
                  const urls = generatedQRs.map(qr => qr.url).join('\n');
                  navigator.clipboard.writeText(urls);
                  alert('All URLs copied to clipboard!');
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy All URLs
              </button>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">📱 Usage Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Print QR codes on weather-resistant material (plastic or vinyl)</li>
              <li>• Recommended size: {QR_SIZES.find(s => s.id === formData.qrSize)?.description}</li>
              <li>• Place at eye level (1.2m - 1.5m) in high-traffic areas</li>
              <li>• Each QR code is unique and tracks visitor engagement</li>
              <li>• Monitor analytics in your dashboard to track visitor check-ins</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generation</h1>
        <p className="text-gray-600">Create professional QR codes for your mall visitors</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {stepIndicators.map((stepIndicator) => {
            const IconComponent = stepIndicator.icon;
            const isActive = step === stepIndicator.number;
            const isCompleted = stepIndicator.completed;
            
            return (
              <div key={stepIndicator.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepIndicator.title}
                </span>
                {stepIndicator.number < 4 && (
                  <div className={`ml-4 w-16 h-0.5 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {step === 1 && renderLocationSelection()}
        {step === 2 && renderCampaignSettings()}
        {step === 3 && renderPreview()}
        {step === 4 && renderDownload()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : window.location.href = '/'}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {step > 1 ? 'Previous' : 'Back to Dashboard'}
        </button>

        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !formData.locationId}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Next Step
          </button>
        )}

        {step === 3 && (
          <button
            onClick={generateQRCodes}
            disabled={isGenerating || !formData.campaignName || formData.visitorTypes.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Codes'}
            <QrCode className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Generation Progress */}
      {isGenerating && generationProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">{generationProgress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
