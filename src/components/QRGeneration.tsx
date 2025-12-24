import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/auth';
import { QrCode, Download, Eye, Settings, MapPin, Building } from 'lucide-react';

/**
 * QR Generation Component - FULLY DYNAMIC DATA ARCHITECTURE
 * 
 * Key Features:
 * - No hardcoded static data - all malls and zones fetched dynamically from APIs
 * - Zone selection dropdown visible and functional in campaign settings
 * - Supports ALL malls including mall 100 (not limited to static mall list)
 * - Proper webhook integration for zone data
 * 
 * This component generates QR codes compatible with n8n webhook system
 */

interface BusinessInfo {
  mallId: number;
  mallName: string;
  mallSlug: string;
  shopId: number;
  shopName: string;
  shopSlug: string;
  zoneName?: string;
  timestamp: number;
}

interface MallZone {
  id: number;
  mall_id: number;
  zone_name: string;
  zone_description?: string;
  zone_type?: string;
  floor_level?: number;
  zone_color?: string;
  zone_icon?: string;
  operating_hours?: string;
  active?: boolean;
  created_at?: string;
}

interface Mall {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  address?: string;
  active?: boolean;
  created_at?: string;
}

interface BusinessInfoCache {
  [key: string]: BusinessInfo;
}

const BUSINESS_INFO_WEBHOOK = 'https://n8n.tenear.com/webhook/get-business-info';

let businessInfoCache: BusinessInfoCache = {};
let isBusinessInfoLoading = false;

interface QRGenerationData {
  mallId: string;
  mallName: string;
  locationId: string;
  locationName: string;
  zone: string;
  zoneName: string;
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
  useWebhookFormat: boolean;
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
  campaign_reference_id?: number;
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
  qrCodeData: string;
  format: 'webhook' | 'legacy';
}

const VISITOR_TYPES = [
  { id: 'first_time_visitor', name: 'First Time Visitor', icon: '👋', color: 'bg-blue-100 text-blue-800', code: 'FTV' },
  { id: 'loyal_customer', name: 'Loyal Customer', icon: '💎', color: 'bg-purple-100 text-purple-800', code: 'LC' },
  { id: 'tourist', name: 'Tourist/Explorer', icon: '🗺️', color: 'bg-green-100 text-green-800', code: 'TR' },
  { id: 'family_group', name: 'Family Group', icon: '👨‍👩‍👧‍👦', color: 'bg-orange-100 text-orange-800', code: 'FG' },
  { id: 'business_visitor', name: 'Business Visitor', icon: '💼', color: 'bg-gray-100 text-gray-800', code: 'BV' },
  { id: 'social_visitor', name: 'Social Visitor', icon: '👥', color: 'bg-pink-100 text-pink-800', code: 'SV' }
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

interface QRGenerationProps {
  preselectedCampaign?: any;
  onClose?: () => void;
  onQRGenerated?: (campaignId: string) => void;
}

export default function QRGeneration({ preselectedCampaign, onClose, onQRGenerated }: QRGenerationProps = {}) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [preloadedCampaign, setPreloadedCampaign] = useState<any>(null);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo[]>([]);
  const [isBusinessInfoLoading, setIsBusinessInfoLoading] = useState(false);
  const [businessInfoError, setBusinessInfoError] = useState<string | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);
  
  const [availableMalls, setAvailableMalls] = useState<Mall[]>([]);
  const [isLoadingMalls, setIsLoadingMalls] = useState(false);
  const [mallsError, setMallsError] = useState<string | null>(null);
  
  const [availableZones, setAvailableZones] = useState<MallZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [zonesError, setZonesError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<QRGenerationData>({
    mallId: '',
    mallName: '',
    locationId: '',
    locationName: '',
    zone: '',
    zoneName: '',
    shopId: '',
    campaignName: '',
    visitorTypes: [],
    duration: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    qrSize: 'medium',
    generateCount: 1,
    qrType: 'claim',
    useWebhookFormat: true
  });

  /**
   * Fetch malls dynamically from the API
   * This allows ALL malls (including mall 100) to be available for QR generation
   */
  const fetchMalls = async (): Promise<void> => {
    if (isLoadingMalls) return;
    
    setIsLoadingMalls(true);
    setMallsError(null);
    
    try {
      console.log('Fetching malls dynamically...');
      
      const userMallShop = AuthService.getCurrentUserMallAndShop();
      const token = localStorage.getItem('geofence_auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await import('../services/auth').then(module => module.MallApiService.fetchMalls(token));
      
      console.log('MallApiService response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch malls from API');
      }
      
      const fetchedMalls = response.data || [];
      console.log('Fetched malls from service:', fetchedMalls.length);
      
      if (fetchedMalls.length === 0) {
        setMallsError('No malls available for your account');
        setAvailableMalls([]);
        setIsLoadingMalls(false);
        return;
      }
      
      const transformedMalls: Mall[] = fetchedMalls.map((mall: any, index: number) => {
        const mallId = mall.id ?? mall.mall_id ?? mall.value ?? index + 1;
        const mallName = mall.name ?? mall.mall_name ?? mall.label ?? `Mall ${mallId}`;
        
        return {
          id: Number(mallId),
          name: mallName,
          latitude: mall.latitude ?? mall.lat,
          longitude: mall.longitude ?? mall.lng,
          address: mall.address ?? mall.location,
          active: mall.active ?? true,
          created_at: mall.created_at ?? mall.createdAt
        };
      });
      
      console.log('Transformed malls:', transformedMalls);
      setAvailableMalls(transformedMalls);
      
      const userMallId = userMallShop.mall_id;
      let selectedMall: Mall | undefined;
      
      if (userMallId && transformedMalls.length > 0) {
        selectedMall = transformedMalls.find(m => m.id === userMallId);
        
        if (!selectedMall) {
          console.log(`User mall ID ${userMallId} not in API response. Available IDs:`, transformedMalls.map(m => m.id));
          selectedMall = transformedMalls[0];
        }
      } else if (transformedMalls.length > 0) {
        selectedMall = transformedMalls[0];
      }
      
      if (selectedMall) {
        console.log('Auto-selecting mall:', selectedMall.name);
        handleMallSelection(selectedMall);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching malls:', error);
      setMallsError(`Failed to fetch malls: ${errorMessage}`);
      setAvailableMalls([]);
    } finally {
      setIsLoadingMalls(false);
    }
  };

  /**
   * Fetch zones from n8n webhook for dynamic zone selection
   */
  const fetchZones = async (mallId?: number): Promise<void> => {
    if (isLoadingZones) return;
    
    setIsLoadingZones(true);
    setZonesError(null);
    
    try {
      console.log('Fetching zones from n8n webhook...');
      
      const userMallShop = AuthService.getCurrentUserMallAndShop();
      const resolvedMallId = mallId || userMallShop.mall_id;
      
      console.log('Calling n8n webhook with mall_id:', resolvedMallId);
      
      const response = await fetch('https://n8n.tenear.com/webhook/get-zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mall_id: resolvedMallId.toString(),
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('N8N webhook response:', responseData);
      
      let zonesData;
      if (Array.isArray(responseData)) {
        zonesData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        zonesData = responseData.data;
      } else {
        console.error('Unexpected n8n response format:', responseData);
        throw new Error('Invalid response format from n8n webhook');
      }
      
      const transformedZones = zonesData.map((zone: any) => {
        const zoneId = zone.id || zone.zone_id || zone.zoneId;
        const zoneName = zone.name || zone.zone_name || zone.zoneName;
        const mallId = zone.mall_id || zone.mallId;
        const createdAt = zone.created_at || zone.createdAt || new Date().toISOString();
        
        if (!zoneName) {
          console.warn('Zone missing name:', zone);
          return null;
        }
        
        return {
          id: zoneId || Math.random(),
          mall_id: mallId || resolvedMallId,
          zone_name: zoneName,
          zone_description: zone.zone_description || zone.description,
          zone_type: zone.zone_type || zone.type,
          floor_level: zone.floor_level || zone.floor,
          zone_color: zone.zone_color || zone.color,
          zone_icon: zone.zone_icon || zone.icon,
          operating_hours: zone.operating_hours || zone.hours,
          active: zone.active !== undefined ? zone.active : true,
          created_at: createdAt
        };
      }).filter((zone: any) => zone !== null);
      
      console.log('Fetched zones from n8n:', transformedZones.length);
      setAvailableZones(transformedZones);
      
      if (transformedZones.length > 0) {
        console.log('Sample zones:', JSON.stringify(transformedZones.slice(0, 3), null, 2));
      } else {
        console.warn('No zones returned from n8n webhook');
        setZonesError('No zones found for this mall');
      }
      
    } catch (error) {
      console.error('Exception fetching zones from n8n:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setZonesError(`Failed to fetch zones from n8n webhook: ${errorMessage}`);
      setAvailableZones([]);
    } finally {
      setIsLoadingZones(false);
    }
  };

  const getZoneName = (zoneIdentifier: string): string => {
    if (!availableZones || availableZones.length === 0) {
      return zoneIdentifier.replace(/_/g, ' ');
    }
    
    const zone = availableZones.find(z => {
      const zoneNameNormalized = z.zone_name.toLowerCase().replace(/\s+/g, '_');
      const identifierNormalized = zoneIdentifier.toLowerCase();
      
      return zoneNameNormalized === identifierNormalized ||
             z.zone_name === zoneIdentifier ||
             z.zone_name.toLowerCase() === zoneIdentifier.toLowerCase() ||
             (z.zone_name.includes(zoneIdentifier) || zoneIdentifier.includes(z.zone_name));
    });
    
    return zone?.zone_name || zoneIdentifier.replace(/_/g, ' ');
  };

  const testWebhookConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing webhook connectivity...');
      const response = await fetch(BUSINESS_INFO_WEBHOOK, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.warn('Webhook connectivity test failed:', error);
      return false;
    }
  };

  const fetchBusinessInfo = async (): Promise<void> => {
    if (isBusinessInfoLoading) return;
    
    setIsBusinessInfoLoading(true);
    setBusinessInfoError(null);
    
    try {
      const isConnected = await testWebhookConnection();
      if (!isConnected) {
        console.warn('Webhook not reachable, using fallback business data');
        throw new Error('Webhook service unavailable');
      }
    } catch (connectivityError) {
      console.warn('Skipping connectivity test due to CORS, proceeding with webhook call');
    }
    
    try {
      console.log('Fetching business info from webhook:', BUSINESS_INFO_WEBHOOK);
      
      const userMallShop = AuthService.getCurrentUserMallAndShop();
      const mallId = userMallShop.mall_id;
      const shopId = userMallShop.shop_id;
      
      const webhookUrl = new URL(BUSINESS_INFO_WEBHOOK);
      webhookUrl.searchParams.append('mall_id', mallId.toString());
      webhookUrl.searchParams.append('shop_id', shopId.toString());
      
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && currentUser.mall_name) {
        webhookUrl.searchParams.append('mall_name', currentUser.mall_name || '');
      }
      if (currentUser && currentUser.shop_name) {
        webhookUrl.searchParams.append('shop_name', currentUser.shop_name || '');
      }
      
      console.log('Webhook request:', { url: webhookUrl.toString(), mallId, shopId });
      
      const response = await fetch(webhookUrl.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let data: any;
      let responseText: string = '';
      
      try {
        responseText = await response.text();
        setWebhookResponse(responseText);
        console.log('Raw webhook response:', responseText);
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from webhook');
        }
        
        data = JSON.parse(responseText);
        console.log('Parsed webhook response:', data);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error(`Webhook returned malformed JSON`);
      }
      
      const businessInfoList: BusinessInfo[] = [];
      
      if (data && typeof data === 'object') {
        const info: BusinessInfo = {
          mallId: parseInt(data.mall_id) || mallId,
          mallName: data.mall_name || `Mall ${mallId}`,
          mallSlug: generateMallSlug(data.mall_name || `Mall ${mallId}`),
          shopId: parseInt(data.shop_id) || shopId,
          shopName: data.shop_name || `Shop ${shopId}`,
          shopSlug: generateShopSlug(data.shop_name || `Shop ${shopId}`),
          zoneName: data.zone_name,
          timestamp: Date.now()
        };
        businessInfoList.push(info);
      } else if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const info: BusinessInfo = {
            mallId: parseInt(item.mall_id) || mallId,
            mallName: item.mall_name || `Mall ${mallId}`,
            mallSlug: generateMallSlug(item.mall_name || `Mall ${mallId}`),
            shopId: parseInt(item.shop_id) || shopId,
            shopName: item.shop_name || `Shop ${shopId}`,
            shopSlug: generateShopSlug(item.shop_name || `Shop ${shopId}`),
            zoneName: item.zone_name,
            timestamp: Date.now()
          };
          businessInfoList.push(info);
        });
      }
      
      if (businessInfoList.length === 0) {
        throw new Error('No business information available from webhook');
      }
      
      setBusinessInfo(businessInfoList);
      console.log('Business info loaded successfully:', businessInfoList);
      
      businessInfoCache = {
        ...businessInfoCache,
        [`${mallId}_${shopId}`]: businessInfoList[0]
      };
      
    } catch (error) {
      console.error('Error fetching business info from webhook:', error);
      setBusinessInfoError(error instanceof Error ? error.message : 'Unknown error');
      setBusinessInfo([]);
    } finally {
      setIsBusinessInfoLoading(false);
    }
  };

  const generateMallSlug = (mallName: string): string => {
    return mallName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
  };

  const generateShopSlug = (shopName: string): string => {
    return shopName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
  };

  useEffect(() => {
    if (user?.mall_id && user?.shop_id) {
      fetchBusinessInfo();
      fetchMalls();
      fetchZones();
    }
  }, [user]);

  useEffect(() => {
    if (step === 2 && availableZones.length === 0 && user?.mall_id) {
      console.log('Auto-fetching zones for Step 2, mall_id:', user.mall_id);
      fetchZones(user.mall_id);
    }
  }, [step, availableZones.length, user?.mall_id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access QR code generation</p>
      </div>
    );
  }

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

  const handleMallSelection = (mall: Mall) => {
    console.log('Handling mall selection:', mall);
    
    const userMallShop = AuthService.getCurrentUserMallAndShop();
    const userShopId = userMallShop.shop_id.toString();
    
    setFormData(prev => ({
      ...prev,
      mallId: mall.id.toString(),
      mallName: mall.name,
      locationId: '',
      locationName: '',
      zone: '',
      zoneName: '',
      shopId: userShopId
    }));
    
    fetchZones(mall.id);
    setStep(2);
  };

  const handleZoneSelection = (zone: MallZone) => {
    const userMallShop = AuthService.getCurrentUserMallAndShop();
    const userShopId = userMallShop.shop_id.toString();
    
    setFormData(prev => ({
      ...prev,
      locationId: `zone_${zone.id}`,
      locationName: zone.zone_name,
      zone: zone.id.toString(),
      zoneName: zone.zone_name,
      shopId: userShopId
    }));
  };

  const handleVisitorTypeToggle = (visitorType: string) => {
    setFormData(prev => ({
      ...prev,
      visitorTypes: prev.visitorTypes.includes(visitorType)
        ? prev.visitorTypes.filter(t => t !== visitorType)
        : [...prev.visitorTypes, visitorType]
    }));
  };

  const generateWebhookFormatQR = (visitorType: string, finalMallId: string, finalShopId: string, timestamp: number, campaignReferenceId?: string) => {
    const qrData = {
      l: finalMallId,
      s: finalShopId,
      z: formData.locationId.replace(/[^a-zA-Z0-9]/g, ''),
      zn: formData.zoneName || '',
      t: VISITOR_TYPES.find(vt => vt.id === visitorType)?.code || 'FTV',
      ct: formData.qrType === 'checkin' ? 1 : 2,
      c: campaignReferenceId || '',
      ts: timestamp,
      v: 2
    };

    const encodedData = btoa(JSON.stringify(qrData));
    
    const baseUrl = formData.qrType === 'checkin' 
      ? 'https://tenearcheckins.pages.dev'
      : 'https://tenearoffers.pages.dev';
    
    const qrUrl = `${baseUrl}?d=${encodedData}`;
    
    console.log('Webhook QR Generated:', {
      format: 'webhook',
      qrType: formData.qrType,
      baseUrl: baseUrl,
      data: qrData,
      encoded: encodedData,
      url: qrUrl,
      zoneName: formData.zoneName
    });
    
    return { qrUrl, format: 'webhook' as const };
  };

  const generateLegacyFormatQR = (visitorType: string, finalShopId: string) => {
    const baseUrl = formData.qrType === 'checkin' ? 'https://tenearcheckins.pages.dev' : 'https://tenearoffers.pages.dev';
    const params = new URLSearchParams({
      s: finalShopId,
      v: visitorType,
      c: formData.campaignName || 'default',
      l: formData.locationName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'main',
      z: formData.zone.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'zone1',
      zn: formData.zoneName || '',
      t: formData.qrType === 'checkin' ? '1' : '2'
    });
    
    const qrUrl = `${baseUrl}/q?${params.toString()}`;
    
    console.log('Legacy QR Generated:', {
      format: 'legacy',
      url: qrUrl,
      params: Object.fromEntries(params),
      zoneName: formData.zoneName
    });
    
    return { qrUrl, format: 'legacy' as const };
  };

  const generateQRCodes = async () => {
    if (!formData.campaignName) {
      alert('Please select a campaign from the dropdown.');
      return;
    }
    
    const selectedCampaign = availableCampaigns.find(c => c.campaign_id === formData.campaignName);
    if (!selectedCampaign && availableCampaigns.length > 0) {
      alert('Please select a valid campaign from the available options.');
      return;
    }
    
    const campaignReferenceId = selectedCampaign?.id?.toString() || selectedCampaign?.campaign_reference_id?.toString() || '';
    console.log('Campaign Reference ID for QR:', campaignReferenceId);
    
    if (formData.visitorTypes.length === 0) {
      alert('Please select at least one visitor type.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Initializing QR generation...');
    
    const newQRs: GeneratedQR[] = [];

    try {
      const userMallShop = AuthService.getCurrentUserMallAndShop();
      const resolvedMallId = userMallShop.mall_id.toString();
      const resolvedShopId = userMallShop.shop_id.toString();
      
      const finalMallId = formData.mallId || resolvedMallId;
      const finalShopId = formData.shopId || resolvedShopId;
      
      console.log('Final QR Parameters:', {
        mallId: finalMallId,
        shopId: finalShopId,
        resolved: { mallId: resolvedMallId, shopId: resolvedShopId },
        formData: { mallId: formData.mallId, shopId: formData.shopId },
        zoneName: formData.zoneName,
        format: formData.useWebhookFormat ? 'webhook' : 'legacy'
      });

      for (const visitorType of formData.visitorTypes) {
        for (let i = 0; i < formData.generateCount; i++) {
          setGenerationProgress(`Generating QR for ${visitorType} (${i + 1}/${formData.generateCount})...`);

          const timestamp = Date.now();
          let qrUrl: string;
          let format: 'webhook' | 'legacy';

          if (formData.useWebhookFormat) {
            const result = generateWebhookFormatQR(visitorType, finalMallId, finalShopId, timestamp, campaignReferenceId);
            qrUrl = result.qrUrl;
            format = result.format;
          } else {
            const result = generateLegacyFormatQR(visitorType, finalShopId);
            qrUrl = result.qrUrl;
            format = result.format;
          }
          
          const qrSize = formData.qrSize === 'small' ? '400x400' : formData.qrSize === 'medium' ? '600x600' : '800x800';
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(qrUrl)}&format=png&qzone=8&margin=20&color=000000&bgcolor=FFFFFF`;

          const qrCodeData = `${formData.locationId}_${formData.campaignName}_${visitorType}_${timestamp}_${i}`;

          const qrData: GeneratedQR = {
            id: `${visitorType}_${i}`,
            url: qrUrl,
            imageUrl: qrImageUrl,
            locationName: formData.locationName,
            mallName: formData.mallName,
            campaignName: formData.campaignName,
            visitorType,
            timestamp: new Date().toISOString(),
            qrCodeData,
            format
          };

          newQRs.push(qrData);

          await storeLocationInDatabase(qrData);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setGeneratedQRs(newQRs);
      setGenerationProgress('QR codes generated successfully!');
      setTimeout(() => setGenerationProgress(''), 2000);
      setStep(4);
      
      if (onQRGenerated && formData.campaignName) {
        onQRGenerated(formData.campaignName);
      }

    } catch (error) {
      console.error('Error generating QR codes:', error);
      setGenerationProgress('Error generating QR codes. Please try again.');
      setTimeout(() => setGenerationProgress(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const storeLocationInDatabase = async (qrData: GeneratedQR) => {
    try {
      const locationData = {
        location_name: qrData.locationName,
        zone_name: formData.zoneName || formData.zone,
        location_description: `${qrData.campaignName} - ${qrData.visitorType.replace(/_/g, ' ')}`,
        mall_name: formData.mallName,
        location_type: 'shop_checkin',
        floor_level: 1,
        operating_hours: '24/7',
        qr_code_data: qrData.qrCodeData,
        checkin_benefits: {
          campaign: qrData.campaignName,
          visitor_type: qrData.visitorType,
          benefits: 'Welcome offers, loyalty points, exclusive deals',
          format: qrData.format,
          zone_name: formData.zoneName || ''
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
      }
    } catch (error) {
      console.error('Database storage error:', error);
    }
  };

  const stepIndicators = [
    { number: 1, title: 'Location', icon: MapPin, completed: step > 1 },
    { number: 2, title: 'Settings', icon: Settings, completed: step > 2 },
    { number: 3, title: 'Preview', icon: Eye, completed: step > 3 },
    { number: 4, title: 'Download', icon: Download, completed: step > 4 }
  ];

  const renderLocationSelection = () => {
    if (isLoadingMalls || isLoadingZones || isBusinessInfoLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dynamic Data</h2>
            <p className="text-gray-600">Fetching mall and zone information from database...</p>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              {isLoadingMalls ? 'Fetching malls...' : isLoadingZones ? 'Fetching zones...' : 'Fetching business information...'}
            </span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Enhanced Zone Capture Active</h3>
            <p className="text-xs text-blue-600">
              This QR generation system fetches zone names from your database 
              and includes them in n8n webhooks for zone-specific analytics.
            </p>
          </div>
        </div>
      );
    }
    
    if (mallsError || zonesError || businessInfoError) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Building className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Loading Failed</h2>
            <p className="text-gray-600">Required data unavailable - check database and webhook</p>
          </div>
          
          <div className="space-y-4">
            {mallsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Mall Data Error</h3>
                <p className="text-sm text-red-700">{mallsError}</p>
              </div>
            )}
            
            {zonesError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Zone Data Error</h3>
                <p className="text-sm text-yellow-700">{zonesError}</p>
              </div>
            )}
            
            {businessInfoError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Webhook Integration Error</h3>
                <p className="text-sm text-red-700">{businessInfoError}</p>
              </div>
            )}
          </div>
          
          <div className="text-center space-x-4">
            <button
              onClick={async () => {
                setMallsError(null);
                setZonesError(null);
                setBusinessInfoError(null);
                await Promise.all([fetchMalls(), fetchZones(), fetchBusinessInfo()]);
              }}
              disabled={isLoadingMalls || isLoadingZones || isBusinessInfoLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Retry Data Fetch
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Mall Location</h2>
          <p className="text-gray-600">Choose the mall and zone where visitors will check in</p>
        </div>

        {availableMalls.length > 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Available Malls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select a Mall</label>
                <select
                  value={formData.mallId}
                  onChange={(e) => {
                    const selectedMall = availableMalls.find(m => m.id.toString() === e.target.value);
                    if (selectedMall) handleMallSelection(selectedMall);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a mall...</option>
                  {availableMalls.map((mall) => (
                    <option key={mall.id} value={mall.id.toString()}>{mall.name}</option>
                  ))}
                </select>
              </div>
              
              {formData.mallId && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Available Zones/Locations</h4>
                  {isLoadingZones ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading zones...</span>
                    </div>
                  ) : availableZones.length > 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-green-800 mb-3">Available Zones</h5>
                      <div className="grid gap-3">
                        {availableZones.map((zone) => (
                          <div 
                            key={zone.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              formData.locationId === `zone_${zone.id}`
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => handleZoneSelection(zone)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{zone.zone_name}</h5>
                                <p className="text-sm text-gray-600">{zone.zone_description || 'No description'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    {zone.zone_type || 'General'}
                                  </span>
                                </div>
                              </div>
                              <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-green-600 mt-3">
                        Zone names fetched from database - will be included in n8n webhooks
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No zones available for this mall</p>
                      <p className="text-sm mt-1">Click "Load Zones" to try fetching again</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No malls available for your account.</p>
            <p className="text-sm mt-2">Please contact administrator to assign mall access to your account.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCampaignSettings = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Settings</h2>
        <p className="text-gray-600">Configure your QR campaign parameters</p>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Format</h3>
          <div className="space-y-3">
            <div 
              onClick={() => setFormData(prev => ({ ...prev, useWebhookFormat: true }))}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                formData.useWebhookFormat
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.useWebhookFormat
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}>
                  {formData.useWebhookFormat && (
                    <div className="w-full h-full rounded-full bg-green-500 scale-50"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Webhook Format (Recommended)</p>
                  <p className="text-sm text-gray-600">
                    New format with dynamic business names and zone capture. Integrates with n8n webhooks for real-time data.
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    <p className="text-xs text-green-600">Shows real business names</p>
                    <p className="text-xs text-green-600">Captures zone names for analytics</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => setFormData(prev => ({ ...prev, useWebhookFormat: false }))}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                !formData.useWebhookFormat
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  !formData.useWebhookFormat
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}>
                  {!formData.useWebhookFormat && (
                    <div className="w-full h-full rounded-full bg-orange-500 scale-50"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Legacy Format (Backward Compatibility)</p>
                  <p className="text-sm text-gray-600">
                    Original format for existing QR codes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {formData.mallName && formData.locationName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Selected Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Mall:</span>
                <p className="font-medium text-gray-900">{formData.mallName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Zone/Location:</span>
                <p className="font-medium text-gray-900">{formData.locationName}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-800">Zone Selection</h3>
            {availableZones.length === 0 && (
              <button
                onClick={() => fetchZones(formData.mallId ? parseInt(formData.mallId) : undefined)}
                disabled={isLoadingZones}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoadingZones ? 'Loading...' : 'Load Zones'}
              </button>
            )}
          </div>
          
          {availableZones.length > 0 ? (
            <>
              <p className="text-sm text-blue-600 mb-3">
                Choose the specific zone where visitors will check in. This will be included in n8n webhooks for zone analytics.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Zones ({availableZones.length} zones found)
                </label>
                <select
                  value={formData.zoneName || ''}
                  onChange={(e) => {
                    const selectedZoneName = e.target.value;
                    const selectedZone = availableZones.find(z => z.zone_name === selectedZoneName);
                    console.log('Zone selected:', selectedZoneName, selectedZone);
                    setFormData(prev => ({
                      ...prev,
                      zoneName: selectedZoneName,
                      zone: selectedZone ? selectedZone.id.toString() : prev.zone
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a zone...</option>
                  {availableZones.map((zone) => (
                    <option key={zone.id} value={zone.zone_name}>
                      {zone.zone_name} (ID: {zone.id})
                    </option>
                  ))}
                </select>
                {formData.zoneName && (
                  <p className="text-xs text-green-600 mt-2">
                    Selected zone: <span className="font-semibold">{formData.zoneName}</span> (Zone ID: {formData.zone})
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-2">No zones loaded from database</p>
              <p className="text-xs text-gray-500">
                {zonesError ? `Error: ${zonesError}` : 'Click "Load Zones" to fetch available zones for your mall'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Target Visitor Types</label>
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
                  <span className="text-xs text-gray-500">({type.code})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Type</label>
            <select
              value={formData.qrType}
              onChange={(e) => setFormData(prev => ({ ...prev, qrType: e.target.value as 'claim' | 'checkin' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Size</label>
            <select
              value={formData.qrSize}
              onChange={(e) => setFormData(prev => ({ ...prev, qrSize: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {QR_SIZES.map(size => (
                <option key={size.id} value={size.id}>{size.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generate Count</label>
            <select
              value={formData.generateCount}
              onChange={(e) => setFormData(prev => ({ ...prev, generateCount: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
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

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview QR Codes</h2>
        <p className="text-gray-600">Review your QR codes before generation</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Location:</span>
            <p className="font-medium text-gray-900">{formData.locationName || formData.mallName}</p>
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
        
        {formData.zoneName && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Zone for Analytics:</span>
            <p className="font-medium text-green-600">{formData.zoneName}</p>
            <p className="text-xs text-green-600">Will be sent to n8n webhooks for zone-specific metrics</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Target Visitor Types</h4>
        <div className="flex flex-wrap gap-2">
          {formData.visitorTypes.map(typeId => {
            const type = VISITOR_TYPES.find(t => t.id === typeId);
            return (
              <span key={typeId} className={`px-3 py-1 rounded-full text-sm font-medium ${type?.color}`}>
                {type?.icon} {type?.name} ({type?.code})
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Visitor Preview</h4>
        <p className="text-gray-700 mb-4">
          Total QR codes to generate: <span className="font-bold text-blue-600">{formData.visitorTypes.length * formData.generateCount}</span>
        </p>
        
        <div className="bg-white rounded border p-4">
          <h5 className="font-semibold text-gray-900 mb-3">What your visitors will see:</h5>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-900">{formData.locationName || formData.mallName}</p>
              <p className="text-sm text-gray-600">{formData.mallName}</p>
            </div>
            
            {formData.zoneName && (
              <div className="p-3 bg-green-100 rounded">
                <p className="text-sm text-green-600">Zone (for Analytics)</p>
                <p className="font-semibold text-green-900">{formData.zoneName}</p>
                <p className="text-xs text-green-600">Sent to n8n webhooks for zone-specific metrics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Preview
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">Generation Complete!</h3>
            </div>
            <p className="text-green-700">
              Successfully generated <span className="font-bold">{generatedQRs.length}</span> QR codes for {formData.locationName || formData.mallName}.
            </p>
            <p className="text-sm text-green-600 mt-2">
              QR codes use {formData.useWebhookFormat ? 'webhook' : 'legacy'} format with {formData.zoneName ? 'zone name capture' : 'basic zone info'}
            </p>
            {formData.zoneName && (
              <p className="text-sm text-green-600">
                Zone: {formData.zoneName} (included in n8n webhooks)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedQRs.map((qr) => (
              <div key={qr.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      qr.format === 'webhook' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {qr.format === 'webhook' ? 'Webhook' : 'Legacy'}
                    </span>
                    <span className="text-xs text-gray-500">{qr.visitorType.replace(/_/g, ' ')}</span>
                  </div>
                  <img src={qr.imageUrl} alt={`QR Code for ${qr.visitorType}`} className="mx-auto mb-3 w-48 h-48" />
                  <h4 className="font-semibold text-gray-900">{qr.locationName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{qr.mallName}</p>
                  {formData.zoneName && (
                    <p className="text-sm text-green-600 font-medium mb-2">Zone: {formData.zoneName}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qr.imageUrl;
                    link.download = `${qr.locationName}_${qr.visitorType}_${qr.format}_${Date.now()}.png`;
                    link.click();
                  }}
                  className="w-full mt-4 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Download PNG
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoadingCampaigns(true);
      try {
        console.log('Fetching campaigns from adcampaigns table...');
        
        const userMallShop = AuthService.getCurrentUserMallAndShop();
        console.log('Using AuthService for campaign filtering:', userMallShop);
        
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
          .eq('mall_id', userMallShop.mall_id)
          .eq('shop_id', userMallShop.shop_id)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching campaigns from adcampaigns:', error);
          setAvailableCampaigns([]);
        } else {
          setAvailableCampaigns(data || []);
          console.log('Fetched campaigns from adcampaigns:', data?.length || 0);
        }
      } catch (error) {
        console.error('Exception fetching campaigns:', error);
        setAvailableCampaigns([]);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generation</h1>
        <p className="text-gray-600">Create professional QR codes with zone capture for your mall visitors</p>
      </div>

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

      <div className="mb-8">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {step === 1 && renderLocationSelection()}
        {step === 2 && renderCampaignSettings()}
        {step === 3 && renderPreview()}
        {step === 4 && renderDownload()}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else if (onClose) {
              onClose();
            } else {
              window.location.href = '/';
            }
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {step > 1 ? 'Previous' : 'Back to Dashboard'}
        </button>

        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !formData.locationId && !formData.mallId}
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
