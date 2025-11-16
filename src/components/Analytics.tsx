// Campaign Analytics with n8n Metrics API + Supabase Fallback
// PRESERVES all existing mall filtering logic
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock,
  Eye,
  Smartphone,
  BarChart3,
  Target,
  QrCode,
  Heart,
  Share2,
  Phone,
  Activity,
  PieChart,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// n8n Metrics API endpoint - PRIMARY SOURCE
const METRICS_API_URL = 'https://n8n.tenear.com/webhook/dashboard-metrics';

// Mall and Shop data for dynamic titles (PRESERVED)
const MALL_DATA = {
  3: { name: "China Square Langata Mall" },
  6: { name: "Langata Mall" },
  7: { name: "NHC Mall" }
};

const SHOP_DATA = {
  3: { name: "Spatial Barbershop", mall_id: 3 },
  4: { name: "Mall Cafe", mall_id: 3 },
  8: { name: "Cleanshelf SuperMarket", mall_id: 6 },
  6: { name: "Kika Wines & Spirits", mall_id: 6 },
  7: { name: "The Phone Shop", mall_id: 6 },
  9: { name: "Maliet Salon", mall_id: 7 },
  10: {name: "Gravity CBC Resource Centre", mall_id: 7 },
  11: {name: "Hydramist Drinking Water Services", mall_id: 7 }
};

// Helper function to get dynamic titles (PRESERVED)
const getAnalyticsTitle = (user: any) => {
  if (user?.shop_id && user?.mall_id) {
    const shop = SHOP_DATA[user.shop_id as keyof typeof SHOP_DATA];
    const mall = MALL_DATA[user.mall_id as keyof typeof MALL_DATA];
    if (shop && mall) {
      return `Analytics for ${shop.name} at ${mall.name}`;
    }
  } else if (user?.mall_id) {
    const mall = MALL_DATA[user.mall_id as keyof typeof MALL_DATA];
    if (mall) {
      return `Analytics for ${mall.name}`;
    }
  }
  return "Analytics Dashboard";
};

const getAnalyticsSubtitle = (user: any) => {
  if (user?.shop_id && user?.mall_id) {
    const shop = SHOP_DATA[user.shop_id as keyof typeof SHOP_DATA];
    const mall = MALL_DATA[user.mall_id as keyof typeof MALL_DATA];
    if (shop && mall) {
      return `📊 Campaign Analytics: ${shop.name} only | QR Analytics: All ${mall.name} visitors (for targeting insights)`;
    }
  } else if (user?.mall_id) {
    const mall = MALL_DATA[user.mall_id as keyof typeof MALL_DATA];
    if (mall) {
      return `📊 Campaign Analytics: All ${mall.name} campaigns | QR Analytics: All ${mall.name} visitors (for targeting insights)`;
    }
  }
  return '📊 Campaign Analytics: All campaigns | QR Analytics: All visitors (for targeting insights)';
};

// n8n Metrics interface (PRESERVED for compatibility)
interface MetricsData {
  total_checkins: number;
  unique_visitors: number;
  vip_visitors: number;
  active_zones: number;
  phone_contacts: number;
  active_last_2_hours: number;
  zone_performance: Array<{zone: string, checkins: number, percentage: number}>;
  engagement_methods: Array<{method: string, count: number, percentage: number}>;
  recent_activity: Array<{timestamp: string, zone: string, type: string}>;
}

// Original campaign metrics interface (PRESERVED)
interface CampaignMetrics {
  id: string;
  name: string;
  scans: number;
  claims: number;
  engagementRate: number;
  clicks: {
    claim: number;
    share: number;
    call: number;
    directions: number;
    like: number;
  };
  performance: {
    clickThroughRate: number;
    conversionRate: number;
    popularActions: string[];
  };
  recentActivity: Array<{
    timestamp: string;
    action: string;
    userType: string;
    details?: string;
  }>;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'success' | 'error' | 'fallback'>('connecting');
  const [dataSource, setDataSource] = useState<'n8n' | 'supabase'>('n8n');

  // Load metrics from n8n API with fallback to Supabase
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiStatus('connecting');
      
      console.log('Fetching metrics from n8n API:', METRICS_API_URL);
      
      const response = await fetch(METRICS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log('API Response text:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from n8n API');
      }
      
      let data: MetricsData;
      try {
        const rawData = JSON.parse(text);
        
        // FIXED: Extract data from the nested structure (today_metrics, not summary)
        const rawMetrics = rawData.today_metrics || {};
        const zoneMetrics = rawData.zone_metrics || [];
        
        console.log('Raw metrics extracted:', rawMetrics);
        console.log('Zone metrics extracted:', zoneMetrics);
        
        // Transform n8n response to expected format with proper data extraction
        data = {
          total_checkins: parseInt(rawMetrics.total_visits) || 0,
          unique_visitors: parseInt(rawMetrics.unique_visitors) || 0,
          vip_visitors: parseInt(rawMetrics.vip_visits) || 0,
          active_zones: parseInt(rawMetrics.zones_active) || 0,
          phone_contacts: parseInt(rawMetrics.phone_contacts) || 0,
          active_last_2_hours: parseInt(rawMetrics.active_last_2_hours) || 0,
          zone_performance: zoneMetrics.map((zone: any) => ({
            zone: zone.qr_zone || 'Unknown Zone',
            checkins: parseInt(zone.total_visits) || 0,
            percentage: 0
          })),
          engagement_methods: [
            { method: 'SMS', count: parseInt(rawMetrics.phone_contacts) || 0, percentage: rawData.summary?.avg_sms_rate || 0 },
            { method: 'Email', count: parseInt(rawMetrics.email_contacts) || 0, percentage: 0 }
          ],
          recent_activity: []
        };
        
        console.log('Processed metrics data:', data);
        
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.log('Raw response:', text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}...`);
      }
      
      setMetrics(data);
      setLastUpdated(new Date());
      setApiStatus('success');
      setDataSource('n8n');
      
      console.log('Metrics loaded successfully from n8n:', data);
      
    } catch (err) {
      console.error('Failed to load n8n metrics:', err);
      
      // Fallback to Supabase if n8n fails
      console.log('Falling back to Supabase...');
      setApiStatus('error');
      
      try {
        await loadSupabaseMetrics();
      } catch (supabaseError) {
        console.error('Supabase fallback also failed:', supabaseError);
        setError(`Both n8n API and Supabase failed. Please check your connections.`);
        setApiStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Load metrics from Supabase (PRESERVED original functionality)
  const loadSupabaseMetrics = async () => {
    try {
      setDataSource('supabase');
      
      // Load campaign metrics from Supabase (ORIGINAL FUNCTIONALITY PRESERVED)
      let query = supabase
        .from('qr_campaigns')
        .select(`
          *,
          qr_offers(
            id,
            name,
            claim_count,
            clicks,
            created_at
          )
        `);
      
      // Mall filtering logic (PRESERVED)
      if (user?.shop_id) {
        // Filter campaigns for specific shop
        query = query.eq('shop_id', user.shop_id);
      } else if (user?.mall_id) {
        // Filter campaigns for specific mall
        query = query.eq('mall_id', user.mall_id);
      }
      
      const { data: campaigns, error: campaignsError } = await query;
      
      if (campaignsError) {
        throw campaignsError;
      }
      
      // Process campaign metrics (PRESERVED original logic)
      const processedMetrics: CampaignMetrics[] = campaigns?.map((campaign: any) => {
        const offers = campaign.qr_offers || [];
        const totalScans = offers.reduce((sum: number, offer: any) => sum + (offer.clicks || 0), 0);
        const totalClaims = offers.reduce((sum: number, offer: any) => sum + (offer.claim_count || 0), 0);
        
        return {
          id: campaign.id,
          name: campaign.name,
          scans: totalScans,
          claims: totalClaims,
          engagementRate: totalScans > 0 ? (totalClaims / totalScans) * 100 : 0,
          clicks: {
            claim: offers.reduce((sum: number, offer: any) => sum + (offer.clicks?.claim || 0), 0),
            share: offers.reduce((sum: number, offer: any) => sum + (offer.clicks?.share || 0), 0),
            call: offers.reduce((sum: number, offer: any) => sum + (offer.clicks?.call || 0), 0),
            directions: offers.reduce((sum: number, offer: any) => sum + (offer.clicks?.directions || 0), 0),
            like: offers.reduce((sum: number, offer: any) => sum + (offer.clicks?.like || 0), 0),
          },
          performance: {
            clickThroughRate: totalScans > 0 ? (totalClaims / totalScans) * 100 : 0,
            conversionRate: totalScans > 0 ? (totalClaims / totalScans) * 100 : 0,
            popularActions: ['Claim', 'Call', 'Directions'].slice(0, 3),
          },
          recentActivity: offers.slice(0, 3).map((offer: any) => ({
            timestamp: offer.created_at,
            action: 'Campaign Viewed',
            userType: 'Visitor',
            details: offer.name
          }))
        };
      }) || [];
      
      setCampaignMetrics(processedMetrics);
      
      // Create mock n8n-style data for compatibility
      const totalScans = processedMetrics.reduce((sum, m) => sum + m.scans, 0);
      const mockMetrics: MetricsData = {
        total_checkins: totalScans || 0,
        unique_visitors: campaigns?.length || 0,
        vip_visitors: Math.floor((campaigns?.length || 0) * 0.2),
        active_zones: campaigns?.length || 0,
        phone_contacts: 0,
        active_last_2_hours: Math.floor((campaigns?.length || 0) * 0.3),
        zone_performance: campaigns?.map((c: any) => ({
          zone: SHOP_DATA[c.shop_id as keyof typeof SHOP_DATA]?.name || 'Unknown',
          checkins: c.qr_offers?.length || 0,
          percentage: 100
        })) || [],
        engagement_methods: [
          { method: 'QR Scan', count: totalScans || 0, percentage: 100 }
        ],
        recent_activity: processedMetrics.flatMap(m => m.recentActivity.map(a => ({
          timestamp: a.timestamp,
          zone: a.details || 'Campaign',
          type: a.action
        }))) || []
      };
      
      setMetrics(mockMetrics);
      setLastUpdated(new Date());
      setApiStatus('fallback');
      
      console.log('Fallback Supabase metrics loaded:', mockMetrics);
      
    } catch (err) {
      console.error('Supabase fallback failed:', err);
      throw err;
    }
  };

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, [user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'success': return 'text-green-500';
      case 'fallback': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'success': return 'Live n8n Data';
      case 'fallback': return 'Cached Data';
      case 'error': return 'Data Unavailable';
      default: return 'Connecting...';
    }
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Live</Badge>;
      case 'fallback': return <Badge className="bg-yellow-100 text-yellow-800">Fallback</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Loading</Badge>;
    }
  };

  if (loading && !metrics && !campaignMetrics.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics && !campaignMetrics.length) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-red-800 font-medium">Analytics Error</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <p className="text-red-600 text-sm mt-1">WebHook URL: {METRICS_API_URL}</p>
          <Button 
            onClick={loadMetrics} 
            className="mt-3"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const title = getAnalyticsTitle(user);
  const subtitle = getAnalyticsSubtitle(user);

  return (
    <div className="space-y-6">
      {/* Header with Preserved Mall Filtering Logic */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {getStatusBadge()}
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {formatTime(lastUpdated)}
            </p>
          )}
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'success' ? 'bg-green-500' : 
              apiStatus === 'fallback' ? 'bg-yellow-500' :
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards - Show QR Analytics if available, otherwise show campaign data */}
      {metrics ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dataSource === 'n8n' ? 'Total Check-ins' : 'Total Campaigns'}
                </CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_checkins.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dataSource === 'n8n' ? 'QR code scans' : 'Campaign views'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dataSource === 'n8n' ? 'Unique Visitors' : 'Campaigns'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.unique_visitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dataSource === 'n8n' ? 'Different people' : 'Active campaigns'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dataSource === 'n8n' ? 'VIP Visitors' : 'Top Campaign'}
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.vip_visitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dataSource === 'n8n' ? 'Premium customers' : 'Best performer'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dataSource === 'n8n' ? 'Active Zones' : 'Mall Coverage'}
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.active_zones}</div>
                <p className="text-xs text-muted-foreground">
                  {dataSource === 'n8n' ? 'High traffic areas' : 'Shops covered'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Analytics Table (PRESERVED Original Functionality) */}
          {campaignMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Individual campaign metrics with mall filtering applied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignMetrics.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant="outline">
                          {campaign.engagementRate.toFixed(1)}% engagement
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Scans:</span>
                          <div className="font-medium">{campaign.scans}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Claims:</span>
                          <div className="font-medium">{campaign.claims}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">CTR:</span>
                          <div className="font-medium">{campaign.performance.clickThroughRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Conversion:</span>
                          <div className="font-medium">{campaign.performance.conversionRate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {metrics.recent_activity && metrics.recent_activity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest {dataSource === 'n8n' ? 'QR check-ins' : 'campaign interactions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.zone || 'Campaign'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type || 'Interaction'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Activity className="mx-auto h-8 w-8 mb-2" />
          <p>No analytics data available</p>
          <p className="text-sm mt-1">Try refreshing or check your connections</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
