import React, { useState, useEffect } from 'react';

/**
 * Visitor Engagement & Metrics Dashboard
 * 
 * This component provides comprehensive analytics for campaign performance
 * and visitor engagement tracking.
 * 
 * Features:
 * - Real-time scan analytics
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
  const [metrics, setMetrics] = useState<ScanMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
    label: 'Last 30 Days'
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('total_scans');

  // Mock data generator for demonstration
  const generateMockMetrics = (): ScanMetrics[] => {
    return [
      {
        campaign_id: 1,
        campaign_name: 'Black Friday Sale 2024',
        total_scans: 1250,
        unique_visitors: 890,
        scan_by_location: {
          entrance: 450,
          checkout: 520,
          display: 280
        },
        daily_trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scans: Math.floor(Math.random() * 100) + 20,
          unique_visitors: Math.floor(Math.random() * 80) + 15
        })),
        conversion_rate: 0.24,
        engagement_score: 8.5,
        last_scan_date: new Date().toISOString()
      },
      {
        campaign_id: 2,
        campaign_name: 'Holiday Special Offer',
        total_scans: 890,
        unique_visitors: 620,
        scan_by_location: {
          entrance: 320,
          checkout: 380,
          display: 190
        },
        daily_trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scans: Math.floor(Math.random() * 60) + 15,
          unique_visitors: Math.floor(Math.random() * 50) + 10
        })),
        conversion_rate: 0.19,
        engagement_score: 7.2,
        last_scan_date: new Date().toISOString()
      }
    ];
  };

  // Fetch engagement metrics
  const fetchEngagementMetrics = async () => {
    try {
      setLoading(true);
      
      // Get current user for authentication
      const authToken = localStorage.getItem('geofence_auth_token');
      const userDataStr = localStorage.getItem('geofence_user_data');
      
      if (!authToken || !userDataStr) {
        throw new Error('User not authenticated');
      }

      const userData = JSON.parse(userDataStr);

      // **TODO: Replace with actual n8n webhook call**
      // const response = await fetch(`https://n8n.tenear.com/webhook/campaign-metrics-get?campaign_id=${campaignId}&mall_id=${mallId}&start_date=${selectedTimeRange.start}&end_date=${selectedTimeRange.end}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      // **Mock data for demonstration**
      console.log('🔄 Fetching engagement metrics for:', { campaignId, mallId, timeRange: selectedTimeRange });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockMetrics();
      setMetrics(mockData);
      
      console.log('✅ Engagement metrics loaded:', mockData);
      
    } catch (err) {
      console.error('❌ Error fetching engagement metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
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

  // Export metrics to CSV
  const exportMetrics = () => {
    const csvData = metrics.map(metric => ({
      'Campaign Name': metric.campaign_name,
      'Total Scans': metric.total_scans,
      'Unique Visitors': metric.unique_visitors,
      'Entrance Scans': metric.scan_by_location.entrance,
      'Checkout Scans': metric.scan_by_location.checkout,
      'Display Scans': metric.scan_by_location.display,
      'Conversion Rate': `${(metric.conversion_rate * 100).toFixed(2)}%`,
      'Engagement Score': metric.engagement_score
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0]).join(",") + "\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `engagement-metrics-${selectedTimeRange.label.replace(' ', '-')}.csv`);
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
            <p className="text-gray-600">Loading engagement metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Visitor Engagement & Metrics</h2>
            <p className="text-sm text-gray-600">
              {campaignId ? `Campaign Analytics` : `Mall Analytics`} | {selectedTimeRange.label}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportMetrics}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              📊 Export CSV
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
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={selectedTimeRange.label}
              onChange={(e) => {
                const option = timeRangeOptions.find(opt => opt.label === e.target.value);
                if (option) setSelectedTimeRange(option);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="total_scans">Total Scans</option>
              <option value="unique_visitors">Unique Visitors</option>
              <option value="conversion_rate">Conversion Rate</option>
              <option value="engagement_score">Engagement Score</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchEngagementMetrics}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{metric.campaign_name}</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Total Scans</p>
                  <p className="text-xl font-bold text-blue-600">{metric.total_scans.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unique Visitors</p>
                  <p className="text-lg font-semibold text-gray-800">{metric.unique_visitors.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Engagement Score</p>
                  <p className="text-lg font-semibold text-green-600">{metric.engagement_score}/10</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location Distribution */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Scan Location Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{metric.campaign_name}</h4>
                <div className="space-y-2">
                  <div className="bg-blue-100 p-3 rounded">
                    <p className="text-xs text-gray-600">Entrance</p>
                    <p className="text-lg font-bold text-blue-600">{metric.scan_by_location.entrance}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-xs text-gray-600">Checkout</p>
                    <p className="text-lg font-bold text-green-600">{metric.scan_by_location.checkout}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded">
                    <p className="text-xs text-gray-600">Display</p>
                    <p className="text-lg font-bold text-yellow-600">{metric.scan_by_location.display}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Scans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Visitors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.map((metric, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.campaign_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.total_scans.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.unique_visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(metric.conversion_rate * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${metric.engagement_score * 10}%` }}
                          ></div>
                        </div>
                        {metric.engagement_score}/10
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(metric.last_scan_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mock Trend Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Trends</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">📊 Chart visualization would go here</p>
              <p className="text-sm text-gray-400 mt-2">
                Showing daily scan trends for the selected time period
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Data is refreshed every 5 minutes. Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisitorEngagementDashboard;
