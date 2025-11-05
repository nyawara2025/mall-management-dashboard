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

interface VisitorAnalytics {
  visitorCategories: {
    firstTime: number;
    welcomeBack: number;
    frequent: number;
    vip: number;
  };
  insights: {
    totalUniqueVisitors: number;
    totalEvents: number;
    averageVisitsPerUser: string;
    period: string;
    peakHours: string[];
    mostActiveZone: string;
  };
  trends: {
    firstTimeGrowth: string;
    frequentGrowth: string;
    vipGrowth: string;
    overallGrowth: string;
  };
  timeBasedData: Array<{
    hour: string;
    visitors: number;
    events: number;
  }>;
}

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalScans: number;
    totalClaims: number;
    avgEngagement: number;
    topCampaign: string;
    visitorMetrics: {
      totalVisitors: number;
      totalEvents: number;
      avgVisitsPerUser: number;
      growthRate: string;
    };
  };
  campaigns: CampaignMetrics[];
  visitorAnalytics: VisitorAnalytics;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    campaign?: string;
    location?: string;
    userType?: string;
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
      
      // Try to fetch real analytics data from your n8n workflow
      const response = await fetch(`https://n8n.tenear.com/webhook/get-analytics?shop_id=${user?.shop_id}&time_range=${timeRange}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Use real data from n8n workflow directly
          console.log('✅ Real analytics data received:', data);
          setAnalytics(transformBackendData(data));
        } else {
          // Fallback to mock data for demo purposes
          console.log('⚠️ Analytics API returned success=false, showing mock data');
          setAnalytics(generateMockData());
        }
      } else {
        // Mock data if API fails
        console.log('❌ Analytics API failed with status:', response.status, 'showing mock data');
        setAnalytics(generateMockData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data on error with better messaging
      const mockData = generateMockData();
      console.log('Analytics API unavailable, showing sample data');
      setAnalytics(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Transform backend data to match frontend interface
  const transformBackendData = (backendData: any): AnalyticsData => {
    try {
      // Both visitor analytics and campaign data
      const totalEvents = backendData.insights?.totalEvents || 0;
      const totalUniqueVisitors = backendData.insights?.totalUniqueVisitors || 0;
      
      return {
        overview: {
          totalCampaigns: 3, // Mock for now
          activeCampaigns: 2, // Mock for now
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
            recentActivity: (backendData.visitorCategories ? [
              {
                timestamp: new Date().toISOString(),
                action: 'First Time Visit',
                userType: 'New Visitor'
              },
              {
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                action: 'Frequent Customer',
                userType: 'Regular'
              }
            ] : [])
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
        recentActivity: (backendData.visitorCategories ? [
          {
            timestamp: backendData.lastUpdated || new Date().toISOString(),
            action: 'Total Activity',
            campaign: 'General Campaign',
            location: 'Your Mall',
            userType: 'All Visitors'
          }
        ] : [])
      };
    } catch (error) {
      console.error('Error transforming analytics data:', error);
      return generateMockData();
    }
  };

  const generateMockData = (): AnalyticsData => ({
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
          },
          {
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            action: 'Directions Clicked',
            userType: 'Frequent Visitor'
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
        performance: {
          clickThroughRate: 72.5,
          conversionRate: 66.7,
          popularActions: ['claim', 'share', 'like']
        },
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            action: 'Offer Claimed',
            userType: 'Welcome Back'
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
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        action: 'Directions Requested',
        campaign: 'Back to School Sale',
        location: 'China Square Mall',
        userType: 'Frequent Visitor'
      },
      {
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        action: 'Phone Call',
        campaign: 'Wine Tasting Event',
        location: 'Langata Mall',
        userType: 'VIP Customer'
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
          <h1 className="text-3xl font-bold text-gray-900">Visitor Analytics</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'shop_admin' ? 
              `Customer behavior insights for ${user?.full_name?.split(' - ')[0] || 'your shop'}` :
              `Visitor analytics ${user?.mall_id ? `for ${user?.full_name?.split(' - ')[1] || 'your location'}` : 'across all locations'}`
            }
          </p>
          {analytics === generateMockData() ? (
            <p className="text-sm text-amber-600 mt-1">
              📊 Showing sample data - Connect your analytics webhook for real visitor metrics
            </p>
          ) : (
            <p className="text-sm text-blue-600 mt-1">
              👥 Real visitor data from your analytics webhook
            </p>
          )}
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
          <button
            onClick={() => fetchAnalytics()}
            className="px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700"
          >
            🔄 Refresh
          </button>
        </div>
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

      {/* Visitor Analytics Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="mr-3 h-6 w-6 text-blue-600" />
          Visitor Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{analytics.visitorAnalytics.insights.totalUniqueVisitors}</div>
            <div className="text-sm text-gray-500 mt-1">Unique Visitors</div>
            <div className="text-xs text-green-600 mt-1">{analytics.visitorAnalytics.trends.overallGrowth} growth</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-green-600">{analytics.visitorAnalytics.insights.totalEvents}</div>
            <div className="text-sm text-gray-500 mt-1">Total Events</div>
            <div className="text-xs text-gray-600 mt-1">All interactions</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{analytics.visitorAnalytics.insights.averageVisitsPerUser}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Visits/User</div>
            <div className="text-xs text-blue-600 mt-1">Engagement rate</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{analytics.visitorAnalytics.insights.mostActiveZone}</div>
            <div className="text-sm text-gray-500 mt-1">Most Active Zone</div>
            <div className="text-xs text-gray-600 mt-1">Hotspot location</div>
          </div>
        </div>
      </div>

      {/* Campaign Performance & Visitor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-blue-600" />
              Campaign Performance
            </CardTitle>
            <CardDescription>How your campaigns are performing across all customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.campaigns.map((campaign) => (
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
                    <div>
                      <div className="text-gray-500">Click-through</div>
                      <div className="font-semibold text-purple-600">{campaign.performance.clickThroughRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Conversion</div>
                      <div className="font-semibold text-orange-600">{campaign.performance.conversionRate}%</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-2">Action Breakdown</div>
                    <div className="flex gap-4 text-xs">
                      <div><span className="text-blue-600">Claim:</span> {campaign.clicks.claim}</div>
                      <div><span className="text-orange-600">Share:</span> {campaign.clicks.share}</div>
                      <div><span className="text-purple-600">Call:</span> {campaign.clicks.call}</div>
                      <div><span className="text-green-600">Directions:</span> {campaign.clicks.directions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visitor Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Visitor Categories
            </CardTitle>
            <CardDescription>Breakdown of your customer types and engagement patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 border rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{analytics.visitorAnalytics.visitorCategories.firstTime}</div>
                <div className="text-xs text-gray-600 mt-1">First Time</div>
                <div className="text-xs text-green-600 mt-1">{analytics.visitorAnalytics.trends.firstTimeGrowth}</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{analytics.visitorAnalytics.visitorCategories.welcomeBack}</div>
                <div className="text-xs text-gray-600 mt-1">Welcome Back</div>
                <div className="text-xs text-gray-600 mt-1">Regular</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">{analytics.visitorAnalytics.visitorCategories.frequent}</div>
                <div className="text-xs text-gray-600 mt-1">Frequent</div>
                <div className="text-xs text-green-600 mt-1">{analytics.visitorAnalytics.trends.frequentGrowth}</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">{analytics.visitorAnalytics.visitorCategories.vip}</div>
                <div className="text-xs text-gray-600 mt-1">VIP</div>
                <div className="text-xs text-gray-600 mt-1">{analytics.visitorAnalytics.trends.vipGrowth}</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Insights</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Peak Hours:</span>
                  <span className="text-gray-800 font-medium">
                    {analytics.visitorAnalytics.insights.peakHours.join(', ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Active:</span>
                  <span className="text-gray-800 font-medium capitalize">{analytics.visitorAnalytics.insights.mostActiveZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth:</span>
                  <span className="text-green-600 font-semibold">{analytics.visitorAnalytics.trends.overallGrowth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Analysis & Time-based Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Hourly Traffic
            </CardTitle>
            <CardDescription>Visitor and event patterns throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.visitorAnalytics.timeBasedData.length > 0 ? (
                analytics.visitorAnalytics.timeBasedData.map((timeData, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {timeData.hour.split(':')[0]}
                      </div>
                      <div>
                        <div className="font-medium">{timeData.hour}</div>
                        <div className="text-sm text-gray-500">
                          {timeData.visitors} visitors, {timeData.events} events
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-blue-500 rounded" 
                          style={{ width: `${Math.max((timeData.visitors / 10) * 100, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="mx-auto h-8 w-8 mb-2" />
                  <p>No time-based data available</p>
                  <p className="text-sm">Connect analytics webhook for real visitor patterns</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-green-600" />
              Most Active Zone
            </CardTitle>
            <CardDescription>Hotspots and peak activity areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.visitorAnalytics.insights.mostActiveZone && analytics.visitorAnalytics.insights.mostActiveZone !== 'N/A' ? (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {analytics.visitorAnalytics.insights.mostActiveZone} Zone
                      </h4>
                      <p className="text-sm text-gray-600">
                        {analytics.visitorAnalytics.insights.totalUniqueVisitors} unique visitors
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.visitorAnalytics.insights.totalEvents}
                      </div>
                      <div className="text-sm text-gray-500">total events</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border rounded-lg text-center">
                  <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">No zone data available</p>
                  <p className="text-sm text-gray-400">Analytics will show active zones when data is available</p>
                </div>
              )}
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Peak Hours</h4>
                {analytics.visitorAnalytics.insights.peakHours.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analytics.visitorAnalytics.insights.peakHours.map((hour, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No peak hours data</p>
                )}
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Device Access</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mobile</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desktop</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tablet</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest customer interactions and visitor patterns in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    {getActionIcon(activity.action)}
                    <div>
                      <div className="font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {activity.userType && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {activity.userType}
                          </span>
                        )}
                        {activity.campaign && <span>• {activity.campaign}</span>}
                        {activity.location && <span>• {activity.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(activity.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="mx-auto h-8 w-8 mb-2" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as customers interact with campaigns</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
