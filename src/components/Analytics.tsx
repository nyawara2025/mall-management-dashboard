// Campaign Analytics with n8n Metrics API (connects to QR check-ins)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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

// n8n Metrics API endpoint - CORRECT WEBHOOK URL
const METRICS_API_URL = 'https://n8n.tenear.com/webhook/dashboard-metrics';

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

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'success' | 'error'>('connecting');

  // Load metrics from n8n API
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiStatus('connecting');
      
      console.log('Fetching metrics from:', METRICS_API_URL);
      
      const response = await fetch(METRICS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: MetricsData = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
      setApiStatus('success');
      
      console.log('Metrics loaded successfully:', data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

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
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'success': return 'Connected';
      case 'error': return 'Connection Failed';
      default: return 'Connecting...';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="mx-auto h-8 w-8 mb-2" />
        <p>No analytics data available</p>
        <p className="text-sm mt-1">Check if n8n workflow is active at {METRICS_API_URL}</p>
        <p className="text-xs mt-1 text-gray-400">Status: {getStatusText()}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time visitor engagement and QR check-in metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {formatTime(lastUpdated)}
            </p>
          )}
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'success' ? 'bg-green-500' : 
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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_checkins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              QR code scans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.unique_visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Different people
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Visitors</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vip_visitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Premium customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_zones}</div>
            <p className="text-xs text-muted-foreground">
              High traffic areas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Contacts</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.phone_contacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              SMS-ready visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Last 2 Hours</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_last_2_hours.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Zone Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Performance</CardTitle>
            <CardDescription>
              Check-ins by mall zone
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.zone_performance && metrics.zone_performance.length > 0 ? (
              <div className="space-y-3">
                {metrics.zone_performance.map((zone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{zone.zone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {zone.checkins} ({zone.percentage}%)
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${zone.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <MapPin className="mx-auto h-6 w-6 mb-2" />
                <p className="text-sm">No zone data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Methods</CardTitle>
            <CardDescription>
              How visitors are engaging
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.engagement_methods && metrics.engagement_methods.length > 0 ? (
              <div className="space-y-3">
                {metrics.engagement_methods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{method.method}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {method.count} ({method.percentage}%)
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Target className="mx-auto h-6 w-6 mb-2" />
                <p className="text-sm">No engagement data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest QR check-ins and visitor interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recent_activity && metrics.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {metrics.recent_activity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">{activity.zone}</p>
                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto h-8 w-8 mb-2" />
              <p>No recent activity</p>
              <p className="text-sm">QR scans will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
