import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Visitor Engagement & Metrics Dashboard
 * 
 * This component provides comprehensive analytics for campaign performance
 * and visitor engagement tracking.
 * 
 * Features:
 * - Real-time scan analytics via N8N webhooks
 * - User behavior tracking
 * - Geographic and temporal trends
 * - Campaign performance comparison
 * - Export functionality
 */

interface ScanMetrics {
  campaign_id: number;
  campaign_name: string;
  total_scans: number;
  unique_visitors: number;
  scan_by_location: {
    entrance: number;
    checkout: number;
    display: number;
  };
  daily_trends: Array<{
    date: string;
    scans: number;
    unique_visitors: number;
  }>;
  conversion_rate: number;
  engagement_score: number;
  last_scan_date: string;
}

interface TimeRange {
  start: string;
  end: string;
  label: string;
}

const VisitorEngagementDashboard: React.FC<{ 
  campaignId?: number; 
  mallId?: number;
  onClose: () => void;
}> = ({ campaignId, mallId, onClose }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
    label: 'Last 30 Days'
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('total_scans');

  // Fetch engagement metrics from N8N webhook (real data like Analytics.tsx)
  const fetchEngagementMetrics = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching Visitor Engagement metrics from N8N webhook...');
      console.log('🔄 Parameters:', { 
        shop_id: user.shop_id, 
        mall_id: user.mall_id,
        analytics_type: 'engagement'
      });

      // Use the same N8N webhook endpoint as Analytics.tsx
      const response = await fetch(
        `https://n8n.tenear.com/webhook/visitor-engagement-analytics?shop_id=${user?.shop_id}&mall_id=${user?.mall_id}&analytics_type=engagement`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            userType: user?.role,
            shopId: user?.shop_id || 0,
            mallId: user?.mall_id || 0,
            timeRange: '24h',
            includeCheckins: true,
            analyticsType: 'engagement'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform the N8N response to match our expected format
        const transformedMetrics = transformN8NResponse(data);
        setMetrics(transformedMetrics);
        console.log('✅ Visitor Engagement metrics loaded successfully:', {
          totalEngagements: transformedMetrics.totalEngagements,
          activeVisitors: transformedMetrics.activeVisitors,
          engagementRate: transformedMetrics.engagementRate
        });
      } else {
        throw new Error(data.error || 'Unknown webhook error');
      }

    } catch (err) {
      console.error('❌ Error fetching Visitor Engagement metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      // Set empty state instead of mock data
      setMetrics({
        totalEngagements: 0,
        activeVisitors: 0,
        engagementRate: 0,
        topEngagementMethods: [],
        recentEngagements: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform N8N response to match dashboard format
  const transformN8NResponse = (data: any) => {
    // Calculate engagement rate
    const totalClaims = data.totalClaims || 0;
    const totalScans = data.totalScans || 0;
    const totalEngagements = data.totalEngagements || 0;
    const uniqueVisitors = data.uniqueVisitors || 0;
    const activeVisitors = data.activeVisitors || 0;

    let engagementRate = 0;
    if (totalScans > 0 && totalClaims > 0) {
      engagementRate = Math.round((totalClaims / totalScans) * 100);
    } else if (totalScans > 0 && totalEngagements > 0) {
      engagementRate = Math.round((totalEngagements / totalScans) * 100);
    } else if (uniqueVisitors > 0 && activeVisitors > 0) {
      engagementRate = Math.round((activeVisitors / uniqueVisitors) * 100);
    } else if (totalEngagements > 0) {
      const estimatedBaseline = Math.max(uniqueVisitors * 2, 10);
      engagementRate = Math.round(Math.min((totalEngagements / estimatedBaseline) * 100, 99));
    }

    return {
      totalEngagements: totalEngagements,
      activeVisitors: activeVisitors,
      engagementRate: Math.min(engagementRate, 100),
      totalClaims: totalClaims,
      totalScans: totalScans,
      uniqueVisitors: uniqueVisitors,
      topEngagementMethods: data.topEngagementMethods || [],
      recentEngagements: data.recentEngagements || [],
      campaignPerformance: data.campaignPerformance || [],
      visitorSegmentation: data.visitorSegmentation || []
    };
  };

  useEffect(() => {
    fetchEngagementMetrics();
  }, [campaignId, mallId, selectedTimeRange]);

  // Time range options
  const timeRangeOptions: TimeRange[] = [
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      label: 'Last 7 Days'
    },
    {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      label: 'Last 30 Days'
    },
    {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      label: 'Last 90 Days'
    }
  ];

  // Export metrics to CSV (updated for real data structure)
  const exportMetrics = () => {
    if (!metrics) return;

    const exportData = {
      'Total Engagements': metrics.totalEngagements || 0,
      'Active Visitors': metrics.activeVisitors || 0,
      'Engagement Rate': `${metrics.engagementRate || 0}%`,
      'Total Claims': metrics.totalClaims || 0,
      'Total Scans': metrics.totalScans || 0,
      'Unique Visitors': metrics.uniqueVisitors || 0,
      'Last Updated': new Date().toLocaleString()
    };

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(exportData).join(",") + "\n"
      + Object.values(exportData).join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor-engagement-metrics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading real-time visitor engagement data...</p>
            <p className="text-sm text-gray-400 mt-2">Fetching from N8N webhook</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format numbers
  const formatNumber = (num: number) => num?.toLocaleString() || '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Visitor Engagement Dashboard</h2>
            <p className="text-sm text-gray-600">
              Real-time multi-zone & QR checkins analytics
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Live Data
              </span>
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchEngagementMetrics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">🔄</span> Refresh
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error loading data:</strong> {error}
            <button 
              onClick={fetchEngagementMetrics} 
              className="ml-4 text-red-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Real-time KPIs - Same as Analytics.tsx */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Engagements */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engagements</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(metrics?.totalEngagements || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">All interactions</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl">
                📊
              </div>
            </div>
          </div>

          {/* Active Visitors */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Visitors</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(metrics?.activeVisitors || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Last 2 hours</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                👥
              </div>
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-blue-600">{metrics?.engagementRate || 0}%</p>
                <p className="text-xs text-gray-500 mt-1">Conversion rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                📈
              </div>
            </div>
          </div>

          {/* Total Claims */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(metrics?.totalClaims || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Offers claimed</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl">
                🎁
              </div>
            </div>
          </div>
        </div>

        {/* Top Engagement Methods - Real Data */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🌐</span> Top Engagement Methods
          </h3>
          
          {metrics?.topEngagementMethods && metrics.topEngagementMethods.length > 0 ? (
            <div className="space-y-3">
              {metrics.topEngagementMethods.map((method: any, index: number) => {
                const percentage = metrics.totalEngagements > 0 
                  ? Math.round((method.count / metrics.totalEngagements) * 100) 
                  : 0;
                
                // Platform detection
                const getPlatformStyle = (methodName: string) => {
                  const name = methodName.toLowerCase();
                  if (name.includes('whatsapp') || name.includes('wa')) {
                    return { icon: '📱', color: 'bg-green-500', textColor: 'text-green-600', name: 'WhatsApp' };
                  } else if (name.includes('qr') || name.includes('scan')) {
                    return { icon: '🔍', color: 'bg-blue-500', textColor: 'text-blue-600', name: 'QR Code' };
                  } else if (name.includes('instagram') || name.includes('ig')) {
                    return { icon: '📸', color: 'bg-pink-500', textColor: 'text-pink-600', name: 'Instagram' };
                  } else if (name.includes('facebook') || name.includes('fb')) {
                    return { icon: '👍', color: 'bg-blue-600', textColor: 'text-blue-600', name: 'Facebook' };
                  } else if (name.includes('telegram')) {
                    return { icon: '✈️', color: 'bg-cyan-500', textColor: 'text-cyan-600', name: 'Telegram' };
                  } else {
                    return { icon: '🌐', color: 'bg-gray-500', textColor: 'text-gray-600', name: methodName };
                  }
                };
                
                const platform = getPlatformStyle(method.method);
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center text-white text-lg`}>
                        {platform.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{platform.name}</div>
                        <div className="text-sm text-gray-500">{method.method}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${platform.color}`}
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        ></div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="font-bold text-lg text-gray-900">{formatNumber(method.count)}</div>
                        <div className="text-sm text-gray-500">{percentage}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p className="font-medium">No engagement data yet</p>
              <p className="text-sm mt-1">Data will appear when visitors interact with your campaigns</p>
            </div>
          )}
        </div>

        {/* Recent Engagements - Real Data */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🕐</span> Recent Engagement Activity
          </h3>
          
          {metrics?.recentEngagements && metrics.recentEngagements.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentEngagements.slice(0, 10).map((engagement: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                      {engagement.engagement_method?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {engagement.engagement_method || 'Engagement Activity'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {engagement.engagement_data?.visitor || 'Anonymous Visitor'} • 
                        {engagement.engagement_type || 'General'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {engagement.engagement_timestamp || engagement.created_at 
                      ? new Date(engagement.engagement_timestamp || engagement.created_at).toLocaleString()
                      : 'Recent'
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🕐</div>
              <p className="font-medium">No recent activity</p>
              <p className="text-sm mt-1">Recent visitor engagements will appear here</p>
            </div>
          )}
        </div>

        {/* Campaign Performance - Real Data */}
        {metrics?.campaignPerformance && metrics.campaignPerformance.length > 0 && (
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎯</span> Campaign Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scans</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claims</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.campaignPerformance.map((campaign: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{campaign.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{campaign.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatNumber(campaign.scans || 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatNumber(campaign.claims || 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (campaign.engagementRate || 0) > 70 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {Math.min(campaign.engagementRate || 0, 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full mr-2">
              ● Live Data
            </span>
            Data sourced from N8N webhook • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisitorEngagementDashboard;
