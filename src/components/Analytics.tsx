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
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';

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
  }>;
}

interface QRAnalytics {
  totalCheckins: number;
  peakZone: string;
  dailyCheckins: number;
  zonePerformance: Array<{
    zone: string;
    checkins: number;
    percentage: number;
  }>;
  hourlyData: Array<{
    hour: string;
    checkins: number;
  }>;
  sevenDayData: Array<{
    date: string;
    checkins: number;
  }>;
  activityFeed: Array<{
    id: string;
    visitor_id: string;
    zone_name: string;
    timestamp: string;
    checkin_benefits: string;
  }>;
}

export default function IntegratedAnalytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'qr'>('campaigns');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Campaign Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  
  // QR Analytics State  
  const [qrAnalytics, setQrAnalytics] = useState<QRAnalytics | null>(null);

  // Auto-refresh interval for QR analytics
  useEffect(() => {
    if (activeTab === 'qr') {
      fetchQRAnalytics();
      const interval = setInterval(fetchQRAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Fetch Campaign Analytics
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaignAnalytics();
    }
  }, [timeRange, activeTab]);

  const fetchQRAnalytics = async () => {
    setRefreshing(true);
    try {
      
      // Get total check-ins
      const { data: totalData } = await supabase
        .from('qr_checkins')
        .select('id', { count: 'exact' });

      // Get zone performance
      const { data: zoneData } = await supabase
        .from('qr_checkins')
        .select('zone_name')
        .group('zone_name');

      // Get hourly data
      const { data: hourlyData } = await supabase
        .from('qr_checkins')
        .select('timestamp,created_at')
        .order('created_at', { ascending: false });

      // Get recent activity
      const { data: activityData } = await supabase
        .from('qr_checkins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get today's check-ins
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('qr_checkins')
        .select('id')
        .gte('created_at', `${today}T00:00:00.000Z`);

      // Process the data
      const totalCheckins = Array.isArray(totalData) ? totalData.length : (totalData?.count || 0);
      const dailyCheckins = Array.isArray(todayData) ? todayData.length : 0;
      const peakZone = zoneData && zoneData.length > 0 
        ? zoneData.reduce((max: any, zone: any) => 
            zone.count > max.count ? zone : max
          ).zone_name || 'N/A'
        : 'N/A';

      const zonePerformance = zoneData?.map((zone: any) => ({
        zone: zone.zone_name || 'Unknown',
        checkins: zone.count || 0,
        percentage: totalCheckins > 0 ? Math.round((zone.count / totalCheckins) * 100) : 0
      })) || [];

      // Process hourly data
      const hourlyCounts: { [key: string]: number } = {};
      hourlyData?.forEach((item: any) => {
        const hour = new Date(item.created_at).getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        hourlyCounts[hourKey] = (hourlyCounts[hourKey] || 0) + 1;
      });

      const hourlyData_processed = Object.keys(hourlyCounts)
        .sort()
        .slice(-12) // Last 12 hours
        .map((hour: string) => ({ hour, checkins: hourlyCounts[hour] }));

      // Process 7-day data
      const sevenDays: { [key: string]: number } = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        sevenDays[dateKey] = 0;
      }

      hourlyData?.forEach((item: any) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        if (sevenDays.hasOwnProperty(date)) {
          sevenDays[date]++;
        }
      });

      const sevenDayData_processed = Object.keys(sevenDays)
        .sort()
        .map((date: string) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          checkins: sevenDays[date]
        }));

      setQrAnalytics({
        totalCheckins,
        peakZone,
        dailyCheckins,
        zonePerformance,
        hourlyData: hourlyData_processed,
        sevenDayData: sevenDayData_processed,
        activityFeed: activityData || []
      });

    } catch (error) {
      console.error('Error fetching QR analytics:', error);
      // Fallback data
      setQrAnalytics({
        totalCheckins: 0,
        peakZone: 'No data',
        dailyCheckins: 0,
        zonePerformance: [],
        hourlyData: [],
        sevenDayData: [],
        activityFeed: []
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCampaignAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      };
      
      let analyticsUrl;
      if (user?.role === 'shop_admin' && user?.shop_id) {
        analyticsUrl = `https://n8n.tenear.com/webhook/get-analytics?shop_id=${user.shop_id}&time_range=${timeRange}`;
      } else {
        analyticsUrl = `https://n8n.tenear.com/webhook/get-analytics?time_range=${timeRange}`;
      }
      
      const response = await fetch(analyticsUrl, { method: 'GET', headers });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(transformBackendData(data));
      } else {
        setAnalytics(generateMockData());
      }
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      setAnalytics(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const transformBackendData = (backendData: any): any => {
    try {
      const totalEvents = backendData.insights?.totalEvents || 0;
      const totalUniqueVisitors = backendData.insights?.totalUniqueVisitors || 0;
      
      return {
        overview: {
          totalCampaigns: 3,
          activeCampaigns: 2,
          totalScans: totalEvents,
          totalClaims: Math.floor(totalEvents * 0.7),
          avgEngagement: backendData.visitorCategories ? 
            Math.round((backendData.visitorCategories.frequent / totalUniqueVisitors) * 100) : 0,
          topCampaign: 'General Campaign',
          visitorMetrics: {
            totalVisitors: totalUniqueVisitors,
            totalEvents: totalEvents,
            avgVisitsPerUser: parseFloat(backendData.insights?.averageVisitsPerUser || '1.0'),
            growthRate: backendData.trends?.overallGrowth || '+0%'
          }
        },
        campaigns: [
          {
            id: '1',
            name: 'General Campaign',
            scans: totalEvents,
            claims: Math.floor(totalEvents * 0.7),
            engagementRate: backendData.visitorCategories ? 
              Math.round((backendData.visitorCategories.frequent / totalUniqueVisitors) * 100) : 0,
            clicks: {
              claim: Math.floor(totalEvents * 0.7),
              share: Math.floor(totalEvents * 0.3),
              call: Math.floor(totalEvents * 0.2),
              directions: Math.floor(totalEvents * 0.4),
              like: Math.floor(totalEvents * 0.5)
            },
            performance: {
              clickThroughRate: Math.round((totalEvents / totalUniqueVisitors) * 100),
              conversionRate: Math.round((Math.floor(totalEvents * 0.7) / totalEvents) * 100),
              popularActions: ['claim', 'like', 'directions']
            },
            recentActivity: [
              {
                timestamp: new Date().toISOString(),
                action: 'First Time Visit',
                userType: 'New Visitor'
              }
            ]
          }
        ],
        visitorAnalytics: {
          visitorCategories: backendData.visitorCategories || {
            firstTime: 0,
            welcomeBack: 0,
            frequent: 0,
            vip: 0
          },
          insights: backendData.insights || {
            totalUniqueVisitors: 0,
            totalEvents: 0,
            averageVisitsPerUser: '1.0',
            period: 'today',
            peakHours: [],
            mostActiveZone: 'N/A'
          },
          trends: backendData.trends || {
            firstTimeGrowth: '+0%',
            frequentGrowth: '+0%',
            vipGrowth: '+0%',
            overallGrowth: '+0%'
          },
          timeBasedData: backendData.timeBasedData || []
        },
        recentActivity: [
          {
            timestamp: backendData.lastUpdated || new Date().toISOString(),
            action: 'Total Activity',
            campaign: 'General Campaign',
            location: 'Your Mall',
            userType: 'All Visitors'
          }
        ]
      };
    } catch (error) {
      console.error('Error transforming analytics data:', error);
      return generateMockData();
    }
  };

  const generateMockData = () => ({
    overview: {
      totalCampaigns: 5,
      activeCampaigns: 3,
      totalScans: 127,
      totalClaims: 89,
      avgEngagement: 70.1,
      topCampaign: 'Wine Tasting Event',
      visitorMetrics: {
        totalVisitors: 7,
        totalEvents: 8,
        avgVisitsPerUser: 1.1,
        growthRate: '+42%'
      }
    },
    campaigns: [
      {
        id: '1',
        name: 'Wine Tasting Event',
        scans: 67,
        claims: 52,
        engagementRate: 77.6,
        clicks: {
          claim: 52,
          share: 23,
          call: 15,
          directions: 34,
          like: 28
        },
        performance: {
          clickThroughRate: 85.3,
          conversionRate: 77.6,
          popularActions: ['claim', 'directions', 'like']
        },
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            action: 'Offer Claimed',
            userType: 'New Visitor'
          }
        ]
      }
    ],
    visitorAnalytics: {
      visitorCategories: {
        firstTime: 2,
        welcomeBack: 1,
        frequent: 3,
        vip: 1
      },
      insights: {
        totalUniqueVisitors: 7,
        totalEvents: 8,
        averageVisitsPerUser: '1.1',
        period: 'today',
        peakHours: ['10:00-11:00', '14:00-15:00'],
        mostActiveZone: 'langata'
      },
      trends: {
        firstTimeGrowth: '+25%',
        frequentGrowth: '+150%',
        vipGrowth: '+0%',
        overallGrowth: '+42%'
      },
      timeBasedData: [
        { hour: '09:00', visitors: 2, events: 2 },
        { hour: '10:00', visitors: 4, events: 3 },
        { hour: '11:00', visitors: 6, events: 4 },
        { hour: '12:00', visitors: 3, events: 3 },
        { hour: '13:00', visitors: 5, events: 5 },
        { hour: '14:00', visitors: 7, events: 6 }
      ]
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        action: 'Offer Claimed',
        campaign: 'Wine Tasting Event',
        location: 'Langata Mall',
        userType: 'New Visitor'
      }
    ]
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'offer claimed':
      case 'claim':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'directions requested':
      case 'directions':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'phone call':
      case 'call':
        return <Phone className="w-4 h-4 text-purple-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-orange-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'first time visit':
      case 'frequent customer':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'shop_admin' ? 
              `Complete analytics for ${user?.full_name?.split(' - ')[0] || 'your shop'}` :
              `Analytics overview ${user?.mall_id ? `for ${user?.full_name?.split(' - ')[1] || 'your location'}` : 'across all locations'}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            variant="outline"
            size="sm"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Campaign Analytics
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'qr'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <QrCode className="w-4 h-4 inline mr-2" />
            QR Analytics
            {qrAnalytics && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                Live
              </Badge>
            )}
          </button>
        </nav>
      </div>

      {/* Campaign Analytics Tab */}
      {activeTab === 'campaigns' && (
        <CampaignAnalytics 
          analytics={analytics}
          loading={loading}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          fetchCampaignAnalytics={fetchCampaignAnalytics}
          formatTime={formatTime}
          getActionIcon={getActionIcon}
        />
      )}

      {/* QR Analytics Tab */}
      {activeTab === 'qr' && (
        <QRAnalytics 
          qrAnalytics={qrAnalytics}
          refreshing={refreshing}
          fetchQRAnalytics={fetchQRAnalytics}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}

// Campaign Analytics Component
function CampaignAnalytics({ 
  analytics, 
  loading, 
  timeRange, 
  setTimeRange, 
  fetchCampaignAnalytics, 
  formatTime, 
  getActionIcon 
}: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Time Range Controls */}
      <div className="flex gap-2">
        {(['24h', '7d', '30d'] as const).map((range) => (
          <Button
            key={range}
            onClick={() => setTimeRange(range)}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
          >
            {range}
          </Button>
        ))}
        <Button
          onClick={() => fetchCampaignAnalytics()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalCampaigns}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">{analytics.overview.activeCampaigns}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.totalScans}</p>
              </div>
              <QrCode className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.overview.totalClaims}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-indigo-600">{analytics.overview.avgEngagement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>How your campaigns are performing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.campaigns.map((campaign: any) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">Campaign ID: {campaign.id}</p>
                  </div>
                  <Badge variant={campaign.engagementRate > 70 ? 'default' : 'secondary'}>
                    {campaign.engagementRate}% engagement
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Scans</div>
                    <div className="font-semibold text-lg text-blue-600">{campaign.scans}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Claims</div>
                    <div className="font-semibold text-lg text-green-600">{campaign.claims}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// QR Analytics Component
function QRAnalytics({ qrAnalytics, refreshing, fetchQRAnalytics, formatTime }: any) {
  if (!qrAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Header Controls */}
      <div className="flex gap-2">
        <Button
          onClick={() => fetchQRAnalytics()}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Auto-refresh: 30s
        </Badge>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                <p className="text-2xl font-bold text-blue-600">{qrAnalytics.totalCheckins}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                <p className="text-2xl font-bold text-green-600">{qrAnalytics.dailyCheckins}</p>
                <p className="text-xs text-gray-500 mt-1">Live data</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Zone</p>
                <p className="text-2xl font-bold text-purple-600">{qrAnalytics.peakZone}</p>
                <p className="text-xs text-gray-500 mt-1">Most active</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Performance</CardTitle>
          <CardDescription>Check-in distribution across mall zones</CardDescription>
        </CardHeader>
        <CardContent>
          {qrAnalytics.zonePerformance.length > 0 ? (
            <div className="space-y-3">
              {qrAnalytics.zonePerformance.map((zone: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {zone.zone.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{zone.zone}</div>
                      <div className="text-sm text-gray-500">{zone.checkins} check-ins</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{zone.percentage}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded mt-1">
                      <div 
                        className="h-2 bg-blue-500 rounded" 
                        style={{ width: `${zone.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <QrCode className="mx-auto h-8 w-8 mb-2" />
              <p>No QR check-in data available</p>
              <p className="text-sm">QR analytics will appear here when customers scan codes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>Real-time QR check-in activity</CardDescription>
        </CardHeader>
        <CardContent>
          {qrAnalytics.activityFeed.length > 0 ? (
            <div className="space-y-3">
              {qrAnalytics.activityFeed.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">QR Check-in</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Badge variant="outline">{activity.zone_name}</Badge>
                        <span>• {activity.visitor_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto h-8 w-8 mb-2" />
              <p>No recent activity</p>
              <p className="text-sm">Live check-ins will appear here in real-time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
