import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Target,
  RefreshCw,
  Loader2,
  PieChart,
  Activity
} from 'lucide-react';
import { whatsappTemplateService, TemplateStats } from '../services/WhatsAppTemplateService';

interface TemplateAnalyticsProps {
  shopId: number;
}

const TemplateAnalytics: React.FC<TemplateAnalyticsProps> = ({ shopId }) => {
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const templateStats = await whatsappTemplateService.getTemplateStats(shopId);
      setStats(templateStats);
    } catch (err) {
      console.error('Failed to fetch template stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [shopId]);

  const getEngagementMethodColor = (method: string) => {
    switch (method) {
      case 'ws': return 'bg-green-100 text-green-800';
      case 'sms': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-purple-100 text-purple-800';
      case 'push': return 'bg-orange-100 text-orange-800';
      case 'qr_code': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotional': return 'bg-red-100 text-red-800';
      case 'informative': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'exclusive': return 'bg-purple-100 text-purple-800';
      case 'welcome': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">Error loading analytics</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Create some templates to see analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const totalTemplates = stats.total_templates;
  const activeTemplates = stats.active_templates;
  const inactiveTemplates = totalTemplates - activeTemplates;
  const activePercentage = totalTemplates > 0 ? Math.round((activeTemplates / totalTemplates) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Template Analytics
          </h2>
          <p className="text-gray-600 mt-1">
            Performance insights for your WhatsApp templates
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-3xl font-bold text-gray-900">{totalTemplates}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-3xl font-bold text-green-600">{activeTemplates}</p>
                <p className="text-xs text-gray-500">{activePercentage}% of total</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Templates</p>
                <p className="text-3xl font-bold text-gray-600">{inactiveTemplates}</p>
                <p className="text-xs text-gray-500">{100 - activePercentage}% of total</p>
              </div>
              <Target className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Created</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(stats.last_created)}
                </p>
                <p className="text-xs text-gray-500">Template activity</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Types Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Template Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.template_types).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No template types data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.template_types).map(([type, count]) => {
                const percentage = totalTemplates > 0 ? Math.round((count / totalTemplates) * 100) : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTypeColor(type)}>
                        {type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} templates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Methods Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Engagement Methods Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.engagement_methods).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No engagement methods data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.engagement_methods).map(([method, count]) => {
                const percentage = totalTemplates > 0 ? Math.round((count / totalTemplates) * 100) : 0;
                const methodLabel = method === 'ws' ? 'WhatsApp' : method.replace('_', ' ').toUpperCase();
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getEngagementMethodColor(method)}>
                        {methodLabel}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} templates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Shop Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.shop_performance.map((shop) => {
              const shopActivePercentage = shop.template_count > 0 ? 
                Math.round((shop.active_count / shop.template_count) * 100) : 0;
              
              return (
                <div key={shop.shop_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{shop.shop_name}</h4>
                      <p className="text-sm text-gray-600">Shop ID: {shop.shop_id}</p>
                    </div>
                    <Badge variant={shop.active_count > 0 ? 'default' : 'secondary'}>
                      {shop.active_count} Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Templates:</span>
                      <span className="font-medium ml-2">{shop.template_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Active Rate:</span>
                      <span className="font-medium ml-2">{shopActivePercentage}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${shopActivePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeTemplates === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>No active templates:</strong> Activate some templates to start engaging with visitors.
                </p>
              </div>
            )}
            
            {activePercentage < 50 && activeTemplates > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Low activation rate:</strong> Only {activePercentage}% of your templates are active. Consider activating more templates for better visitor engagement.
                </p>
              </div>
            )}
            
            {Object.keys(stats.template_types).length < 3 && totalTemplates > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Diversify template types:</strong> Create templates for different message types (promotional, informative, urgent) to improve engagement.
                </p>
              </div>
            )}
            
            {stats.engagement_methods.ws === 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Add WhatsApp templates:</strong> WhatsApp is a powerful engagement channel. Create WhatsApp templates to reach more visitors.
                </p>
              </div>
            )}
            
            {totalTemplates === 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong>Get started:</strong> Create your first template to begin engaging with your visitors through personalized messages.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateAnalytics;
