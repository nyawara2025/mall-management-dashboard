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

interface QRMetrics {
  totalCheckins: number;
  todayCheckins: number;
  peakZone: string;
  zonePerformance: Array<{
    zone: string;
    checkins: number;
    percentage: number;
  }>;
  hourlyData: Array<{
    hour: string;
    checkins: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    zone: string;
    visitorId: string;
  }>;
}

// Utility function to format time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Campaign Analytics Component
const CampaignAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);

  useEffect(() => {
    const fetchCampaignMetrics = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Call the webhook endpoint for campaign analytics
        const response = await fetch('https://n8n.tenear.com/webhook/campaign-analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            userType: user.role, // FIXED: Use user.role directly
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setMetrics(data.metrics || []);
      } catch (err) {
        console.error('Error fetching campaign metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign metrics');
        
        // Set mock data as fallback
        setMetrics([
          {
            id: '1',
            name: 'Welcome Campaign',
            scans: 1250,
            claims: 450,
            engagementRate: 36.0,
            clicks: { claim: 300, share: 150, call: 80, directions: 120, like: 200 },
            performance: { clickThroughRate: 72.0, conversionRate: 36.0, popularActions: ['Claim', 'Like', 'Share'] },
            recentActivity: [
              { timestamp: new Date().toISOString(), action: 'Claimed优惠', userType: 'Shopper' },
              { timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Shared', userType: 'Shopper' },
              { timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Called Store', userType: 'Shopper' }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignMetrics();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading campaign metrics</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const totalScans = metrics.reduce((sum, campaign) => sum + campaign.scans, 0);
  const totalClaims = metrics.reduce((sum, campaign) => sum + campaign.claims, 0);
  const avgEngagement = metrics.length > 0 ? metrics.reduce((sum, campaign) => sum + campaign.engagementRate, 0) / metrics.length : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Scans</CardTitle>
            <QrCode className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalScans.toLocaleString()}</div>
            <p className="text-xs text-blue-200">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Claims</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalClaims.toLocaleString()}</div>
            <p className="text-xs text-green-200">
              {totalScans > 0 ? ((totalClaims / totalScans) * 100).toFixed(1) : 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.length}</div>
            <p className="text-xs text-purple-200">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{avgEngagement.toFixed(1)}%</div>
            <p className="text-xs text-orange-200">
              Engagement rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card className="backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Campaign Performance</CardTitle>
          <CardDescription className="text-gray-300">
            Detailed metrics for all your active campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((campaign) => (
              <div key={campaign.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                    {campaign.engagementRate.toFixed(1)}% Engagement
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{campaign.scans}</div>
                    <div className="text-xs text-gray-300">Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{campaign.claims}</div>
                    <div className="text-xs text-gray-300">Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{campaign.performance.clickThroughRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-300">CTR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{campaign.performance.conversionRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-300">Conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{campaign.clicks.claim}</div>
                    <div className="text-xs text-gray-300">Top Action</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-400" />
                    <span className="text-xs text-gray-300">{campaign.clicks.like}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-gray-300">{campaign.clicks.share}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-gray-300">{campaign.clicks.call}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// QR Analytics Component
const QRAnalytics = ({ formatTime }: { formatTime: (timestamp: string) => string }) => {
  const [qrAnalytics, setQrAnalytics] = useState<QRMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchQRAnalytics = async () => {
    try {
      setError(null);
      
      // Using the direct fetch-based Supabase client
      const allCheckinsResult = await supabase.select('qr_checkins', '*');
      if (allCheckinsResult.error) throw allCheckinsResult.error;
      const allCheckins = allCheckinsResult.data;

      // Filter today's check-ins
      const today = new Date().toISOString().split('T')[0];
      const todayData = Array.isArray(allCheckins) ? 
        allCheckins.filter((checkin: any) => checkin.checkin_timestamp?.startsWith(today)) : [];

      // Process analytics data
      const totalData = Array.isArray(allCheckins) ? allCheckins : [];
      const totalCheckins = totalData.length;
      const todayCount = todayData.length;

      // Zone performance
      const zoneCounts: { [key: string]: number } = {};
      totalData.forEach((checkin: any) => {
        const zone = checkin.zone_name || 'Unknown';
        zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      });

      const zonePerformance = Object.entries(zoneCounts).map(([zone, count]) => ({
        zone,
        count,
        percentage: totalCheckins > 0 ? Math.round((count / totalCheckins) * 100) : 0
      }));

      // Peak zone
      const peakZone = zonePerformance.length > 0 ? 
        zonePerformance.reduce((max, current) => current.count > max.count ? current : max).zone : 
        'No Data';

      // Hourly distribution
      const hourlyCounts: { [key: string]: number } = {};
      totalData.forEach((checkin: any) => {
        if (checkin.checkin_timestamp) {
          const hour = new Date(checkin.checkin_timestamp).getHours();
          const hourKey = `${hour}:00`;
          hourlyCounts[hourKey] = (hourlyCounts[hourKey] || 0) + 1;
        }
      });

      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        count: hourlyCounts[`${i}:00`] || 0
      }));

      // Recent activity (last 10 check-ins)
      const recentActivity = totalData
        .sort((a: any, b: any) => new Date(b.checkin_timestamp).getTime() - new Date(a.checkin_timestamp).getTime())
        .slice(0, 10)
        .map((checkin: any) => ({
          timestamp: checkin.checkin_timestamp,
          zone: checkin.zone_name || 'Unknown',
          visitorId: checkin.visitor_id || 'Anonymous'
        }));

      const analytics: QRMetrics = {
        totalCheckins,
        todayCheckins: todayCount,
        peakZone,
        zonePerformance: zonePerformance.map(zp => ({
          zone: zp.zone,
          checkins: zp.count,
          percentage: zp.percentage
        })),
        hourlyData: hourlyData.map(hd => ({
          hour: hd.hour,
          checkins: hd.count
        })),
        recentActivity
      };

      setQrAnalytics(analytics);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching QR analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load QR analytics');
      
      // Set mock data as fallback
      setQrAnalytics({
        totalCheckins: 14,
        todayCheckins: 3,
        peakZone: 'Entrance',
        zonePerformance: [
          { zone: 'Entrance', checkins: 5, percentage: 36 },
          { zone: 'Food Court', checkins: 4, percentage: 29 },
          { zone: 'Electronics', checkins: 3, percentage: 21 },
          { zone: 'Fashion', checkins: 1, percentage: 7 },
          { zone: 'General', checkins: 1, percentage: 7 }
        ],
        hourlyData: Array.from({ length: 12 }, (_, i) => ({
          hour: `${i + 9}:00`,
          checkins: Math.floor(Math.random() * 5)
        })),
        recentActivity: [
          { timestamp: new Date().toISOString(), zone: 'Entrance', visitorId: 'V001' },
          { timestamp: new Date(Date.now() - 1800000).toISOString(), zone: 'Food Court', visitorId: 'V002' },
          { timestamp: new Date(Date.now() - 3600000).toISOString(), zone: 'Electronics', visitorId: 'V003' }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQRAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchQRAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQRAnalytics();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading QR analytics</p>
          <p className="text-sm text-gray-500">{error}</p>
          <Button onClick={handleRefresh} className="mt-2" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!qrAnalytics) return null;

  return (
    <div className="space-y-6">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Real-time QR Analytics</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live Data
          </div>
          <span className="text-xs text-gray-400">
            Last updated: {formatTime(lastRefresh.toISOString())}
          </span>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="sm"
            disabled={refreshing}
            className="text-gray-300 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key QR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Check-ins</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{qrAnalytics.totalCheckins.toLocaleString()}</div>
            <p className="text-xs text-blue-200">
              Since implementation
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Today's Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{qrAnalytics.todayCheckins.toLocaleString()}</div>
            <p className="text-xs text-green-200">
              Today ({new Date().toLocaleDateString()})
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Peak Zone</CardTitle>
            <MapPin className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{qrAnalytics.peakZone}</div>
            <p className="text-xs text-purple-200">
              Most popular location
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zone Performance */}
      <Card className="backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Zone Performance</CardTitle>
          <CardDescription className="text-gray-300">
            Check-in distribution across mall zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qrAnalytics.zonePerformance.map((zone: any, index: number) => (
              <div key={zone.zone} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{zone.zone}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{zone.checkins} check-ins</span>
                    <span className="text-xs text-blue-200">{zone.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${zone.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-300">
            Live check-in feed (auto-refreshes every 30 seconds)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {qrAnalytics.recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded bg-white/5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{activity.zone}</span>
                    <span className="text-xs text-gray-400">{formatTime(activity.timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-300">Visitor: {activity.visitorId}</div>
                </div>
                <Smartphone className="h-4 w-4 text-blue-400" />
              </div>
            ))}
            {qrAnalytics.recentActivity.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Analytics Component with Tabs
const Analytics = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'qr'>('campaigns');
  const [isDarkMode, setIsDarkMode] = useState(true);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-300">Comprehensive insights for your mall operations</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
          <Button
            onClick={() => setActiveTab('campaigns')}
            variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'campaigns' ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Campaign Analytics
          </Button>
          <Button
            onClick={() => setActiveTab('qr')}
            variant={activeTab === 'qr' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'qr' ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Analytics
          </Button>
        </div>

        {/* Tab Content */}
        <div className="backdrop-blur-sm bg-white/5 rounded-lg border border-white/10 p-6">
          {activeTab === 'campaigns' && <CampaignAnalytics />}
          {activeTab === 'qr' && <QRAnalytics formatTime={formatTime} />}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
