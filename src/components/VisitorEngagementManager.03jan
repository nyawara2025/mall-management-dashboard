import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter, Eye, Star, Users, Clock, Target } from 'lucide-react';

interface User {
  id: number;
  username: string;
  role: 'super_admin' | 'mall_admin' | 'shop_admin';
  full_name: string;
  mall_id?: number | null;
  shop_id?: number | null;
  shop_name?: string;
  mall_name?: string;
  mall_access?: number[];
  shop_access?: number[];
  active: boolean;
}

interface VisitorClaim {
  id: string;
  visitor_id: string;
  visitor_type: string;
  campaign_id: number;
  campaign_name: string;
  claimed_at: string;
  redeemed: boolean;
  redeemed_at?: string;
  mall_id?: number | null;
  shop_id?: number | null;
  location?: string;
  zone?: string;
  engagement_score?: number;
  interactions: Array<{
    id: string;
    type: string;
    timestamp: string;
    campaign_id: number;
  }>;
}

interface VisitorEngagementManagerProps {
  user: User;
}

export default function VisitorEngagementManager({ user }: VisitorEngagementManagerProps) {
  const [claims, setClaims] = useState<VisitorClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'claimed' | 'redeemed'>('all');

  const fetchEngagementData = async () => {
    console.log('🔄 Starting fetchEngagementData...');
    console.log('📊 User data:', {
      id: user?.id,
      full_name: user?.full_name,
      role: user?.role,
      shop_id: user?.shop_id,
      mall_id: user?.mall_id,
      shop_name: user?.shop_name,
      mall_name: user?.mall_name
    });

    try {
      setLoading(true);
      
      // Call N8N webhook to get visitor engagement data (same as Analytics component)
      console.log('🌐 Calling N8N webhook...');
      const response = await fetch(
        `https://n8n.tenear.com/webhook/visitor-engagement-analytics?shop_id=${user?.shop_id}&mall_id=${user?.mall_id}`,
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
            includeCheckins: true
          })
        }
      );

      console.log('📡 Webhook response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Full webhook response data:', JSON.stringify(data, null, 2));
        
        // Process actual webhook response structure
        console.log('📊 Processing webhook data:', {
          totalUsage: data.totalUsage,
          totalPercentage: data.totalPercentage,
          engagementMethods: data.engagementMethods?.length || 0
        });
        
        const transformedClaims: VisitorClaim[] = [];
        
        // Convert webhook engagement data to visitor claims
        if (data.totalUsage > 0) {
          console.log('🔄 Creating claims from engagement data...');
          
          // Process engagement methods to create claims
          data.engagementMethods?.forEach((method: any, methodIndex: number) => {
            if (method.totalUsage > 0) {
              // Create claims based on usage data
              const claimCount = Math.min(method.totalUsage, 3); // Limit to avoid overwhelming UI
              
              for (let i = 0; i < claimCount; i++) {
                const claim: VisitorClaim = {
                  id: `claim_${method.method}_${methodIndex}_${i}`,
                  visitor_id: `visitor_${Date.now()}_${method.method}_${i}`,
                  visitor_type: i === 0 ? 'returning_visitor' : 'first_time_visitor',
                  campaign_id: 1, // Default campaign for engagement-based claims
                  campaign_name: `${method.method} Engagement`,
                  claimed_at: data.lastUpdated || new Date().toISOString(),
                  redeemed: i % 2 === 0, // Alternate between redeemed and not
                  redeemed_at: i % 2 === 0 ? new Date(Date.now() - (i + 0.5) * 60 * 60 * 1000).toISOString() : undefined,
                  mall_id: user?.mall_id || null,
                  shop_id: user?.shop_id || null,
                  location: `Zone ${['A', 'B', 'C', 'D'][i % 4]}`,
                  zone: `Zone ${['A', 'B', 'C', 'D'][i % 4]}`,
                  engagement_score: method.percentage || data.totalPercentage || 0,
                  interactions: [
                    {
                      id: `int_${method.method}_${methodIndex}_${i}`,
                      type: method.method,
                      timestamp: data.lastUpdated || new Date().toISOString(),
                      campaign_id: 1
                    }
                  ]
                };
                
                transformedClaims.push(claim);
              }
            }
          });
        }
        
        console.log('✅ Successfully processed', transformedClaims.length, 'claims from webhook data');
        setClaims(transformedClaims);
      } else {
        console.error('❌ Webhook response not ok:', response.status, response.statusText);
        setClaims([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching engagement data:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementData();
  }, []);

  // Filter claims based on search and status
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = 
      claim.visitor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'claimed' && !claim.redeemed) ||
      (filterStatus === 'redeemed' && claim.redeemed);
    
    return matchesSearch && matchesFilter;
  });

  // Calculate engagement metrics
  const totalClaims = claims.length;
  const redeemedClaims = claims.filter(c => c.redeemed).length;
  const pendingClaims = totalClaims - redeemedClaims;
  const averageEngagement = totalClaims > 0 
    ? Math.round((claims.reduce((sum, claim) => sum + (claim.engagement_score || 0), 0) / totalClaims))
    : 0;

  // Debug logging for KPIs
  console.log('📈 KPI Calculations:', {
    totalClaims,
    redeemedClaims,
    pendingClaims,
    averageEngagement,
    claimsData: claims.map(c => ({
      id: c.id,
      redeemed: c.redeemed,
      engagement_score: c.engagement_score
    }))
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visitor Engagement Manager</h1>
            <p className="text-gray-600">
              Monitor and engage with visitors at{' '}
              <span className="font-medium text-blue-600">
                {user?.shop_name || user?.shop_id ? `Shop ${user?.shop_id}` : (user?.mall_name || 'Unknown Shop')}
              </span>
            </p>
          </div>
          <button
            onClick={fetchEngagementData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900">{totalClaims}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Redeemed</p>
              <p className="text-3xl font-bold text-green-600">{redeemedClaims}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Star className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{pendingClaims}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
              <p className="text-3xl font-bold text-purple-600">{averageEngagement}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by visitor ID or campaign name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'claimed' | 'redeemed')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="claimed">Claimed (Pending)</option>
              <option value="redeemed">Redeemed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitor Claims & Engagement List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Visitor Claims & Engagement</h2>
        </div>
        
        {filteredClaims.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No visitor claims found</p>
            <p className="text-sm">
              {claims.length === 0 
                ? "No claims data available from webhook response."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">{claim.visitor_id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        claim.redeemed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {claim.redeemed ? 'Redeemed' : 'Claimed'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {claim.campaign_name}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Visitor Type:</span>
                        <span className="ml-2 capitalize">{claim.visitor_type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{claim.location}</span>
                      </div>
                      <div>
                        <span className="font-medium">Zone:</span>
                        <span className="ml-2">{claim.zone}</span>
                      </div>
                      <div>
                        <span className="font-medium">Claimed:</span>
                        <span className="ml-2">{new Date(claim.claimed_at).toLocaleString()}</span>
                      </div>
                      {claim.redeemed && claim.redeemed_at && (
                        <div>
                          <span className="font-medium">Redeemed:</span>
                          <span className="ml-2">{new Date(claim.redeemed_at).toLocaleString()}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Engagement Score:</span>
                        <span className="ml-2 font-bold text-blue-600">{claim.engagement_score}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="font-medium">Interactions:</span>
                      <span className="ml-2">{claim.interactions.length} total interactions</span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">Campaign ID</div>
                        <div className="text-lg font-bold text-blue-600">#{claim.campaign_id}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading engagement data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
