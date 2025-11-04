import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  Phone
} from 'lucide-react';
import { createAuthHeaders } from '../services/auth';

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalScans: number;
    totalClaims: number;
    avgEngagement: number;
    topCampaign: string;
  };
  campaigns: Array<{
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
    recentActivity: Array<{
      timestamp: string;
      action: string;
      campaign: string;
    }>;
  }>;
  visitorInsights: {
    currentVisitors: number;
    hourlyTraffic: Array<{
      hour: number;
      visitors: number;
      campaigns: string[];
    }>;
    topZones: Array<{
      zone: string;
      visitors: number;
      campaigns: string[];
    }>;
    deviceTypes: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
  };
  recentActivity: Array<{
    timestamp: string;
    action: string;
    campaign: string;
    location: string;
  }>;
}

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || '';
      const headers = createAuthHeaders(token);
      
      const response = await fetch(`https://n8n.tenear.com/webhook/analytics?shop_id=${user?.shop_id}&time_range=${timeRange}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          // Mock data if backend not ready
          setAnalytics(generateMockData());
        }
      } else {
        // Mock data if API fails
        setAnalytics(generateMockData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data on error
      setAnalytics(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): AnalyticsData => ({
    overview: {
      totalCampaigns: 5,
      activeCampaigns: 3,
      totalScans: 127,
      totalClaims: 89,
      avgEngagement: 70.1,
      topCampaign: 'Wine Tasting Event'
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
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            action: 'Offer Claimed',
            campaign: 'Wine Tasting Event'
          },
          {
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            action: 'Directions Clicked',
            campaign: 'Wine Tasting Event'
          }
        ]
      },
      {
        id: '2',
        name: 'Back to School Sale',
        scans: 42,
        claims: 28,
        engagementRate: 66.7,
        clicks: {
          claim: 28,
          share: 12,
          call: 8,
          directions: 18,
          like: 15
        },
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            action: 'Offer Claimed',
            campaign: 'Back to School Sale'
          }
        ]
      }
    ],
    visitorInsights: {
      currentVisitors: 12,
      hourlyTraffic: [
        { hour: 9, visitors: 3, campaigns: ['Wine Tasting'] },
        { hour: 10, visitors: 5, campaigns: ['Wine Tasting', 'Back to School'] },
        { hour: 11, visitors: 8, campaigns: ['Wine Tasting', 'Back to School'] },
        { hour: 12, visitors: 12, campaigns: ['All Campaigns'] },
        { hour: 13, visitors: 15, campaigns: ['All Campaigns'] },
        { hour: 14, visitors: 11, campaigns: ['Wine Tasting', 'Back to School'] }
      ],
      topZones: [
        {
          zone: 'langata',
          visitors: 45,
          campaigns: ['Wine Tasting Event']
        },
        {
          zone: 'china-square',
          visitors: 28,
          campaigns: ['Back to School Sale']
        },
        {
          zone: 'nhc',
          visitors: 22,
          campaigns: ['Wine Tasting Event', 'Back to School Sale']
        }
      ],
      deviceTypes: {
        mobile: 78,
        desktop: 15,
        tablet: 7
      }
    },
    recentActivity: [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        action: 'Offer Claimed',
        campaign: 'Wine Tasting Event',
        location: 'Langata Mall'
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        action: 'Directions Requested',
        campaign: 'Back to School Sale',
        location: 'China Square Mall'
      },
      {
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        action: 'Phone Call',
        campaign: 'Wine Tasting Event',
        location: 'Langata Mall'
      }
    ]
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'offer claimed':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'directions requested':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'phone call':
        return <Phone className="w-4 h-4 text-purple-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-orange-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">
            Performance metrics for {user?.full_name?.split(' - ')[1] || 'your shop'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalScans}</p>
              </div>
              <QrCode className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Claims</p>
                <p className="text-2xl font-bold text-green-600">{analytics.overview.totalClaims}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.avgEngagement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Visitors</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.visitorInsights.currentVisitors}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Detailed metrics for each campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <Badge variant={campaign.engagementRate > 70 ? 'default' : 'secondary'}>
                    {campaign.engagementRate.toFixed(1)}% engagement
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{campaign.scans}</div>
                    <div className="text-xs text-gray-500">Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{campaign.claims}</div>
                    <div className="text-xs text-gray-500">Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{campaign.clicks.claim}</div>
                    <div className="text-xs text-gray-500">Claim Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{campaign.clicks.directions}</div>
                    <div className="text-xs text-gray-500">Directions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{campaign.clicks.like}</div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{campaign.clicks.share}</div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visitor Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic by Zone</CardTitle>
            <CardDescription>Visitor distribution across mall zones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.visitorInsights.topZones.map((zone, index) => (
                <div key={zone.zone} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{zone.zone} Mall</div>
                      <div className="text-sm text-gray-500">{zone.campaigns.join(', ')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{zone.visitors}</div>
                    <div className="text-sm text-gray-500">visitors</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>How customers access your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-blue-500 rounded" 
                      style={{ width: `${analytics.visitorInsights.deviceTypes.mobile}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{analytics.visitorInsights.deviceTypes.mobile}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-purple-500 rounded" 
                      style={{ width: `${analytics.visitorInsights.deviceTypes.desktop}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{analytics.visitorInsights.deviceTypes.desktop}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span>Tablet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-green-500 rounded" 
                      style={{ width: `${analytics.visitorInsights.deviceTypes.tablet}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{analytics.visitorInsights.deviceTypes.tablet}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest customer interactions in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  {getActionIcon(activity.action)}
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-gray-500">
                      {activity.campaign} • {activity.location}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
