import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionService } from '../services/transactionService';
import { 
  Inbox, 
  Phone, 
  Mail, 
  Search, 
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Calendar,
  ExternalLink,
  Plus,
  MoreVertical
} from 'lucide-react';

interface CustomerInquiry {
  id: string;
  shop_id: number;
  customer_name?: string;  // May be empty if not provided by N8N
  customer_phone?: string; // May be empty if not provided by N8N
  customer_email?: string; // May be empty if not provided by N8N
  customer_message?: string; // May be empty if not provided by N8N
  product_name?: string;
  interaction_type: string;
  created_at?: string; // May be undefined if N8N doesn't provide timestamp
  campaign?: string;
  method?: string;
  status: 'new' | 'contacted' | 'resolved';
}

interface CustomerInquiriesProps {
  onBack?: () => void;
}

export function CustomerInquiries({ onBack }: CustomerInquiriesProps) {
  const { user, token } = useAuth();
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch customer inquiries via N8N webhook
  const fetchInquiries = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    if (user.role !== 'shop_admin' && user.role !== 'mall_admin' && user.role !== 'super_admin') {
      setError('User does not have permission to view customer inquiries');
      return;
    }
    
    if (!user.shop_id) {
      setError('User does not have a valid shop_id assigned');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const shopId = user.shop_id; // Get the shop_id directly from user object
      console.log('🎯 User object:', {
        user_id: user.id,
        username: user.username,
        role: user.role,
        shop_id: user.shop_id,
        mall_id: user.mall_id,
        shop_access: user.shop_access,
        mall_access: user.mall_access
      });
      console.log('🎯 Fetching inquiries for shop via N8N webhook:', shopId);
      console.log('🎯 Expected vs Actual: Shop', shopId, 'should return multiple records, checking why only 1 is shown');

      // Validate shop_id
      if (!shopId) {
        throw new Error(`Invalid shop_id: ${shopId}. User shop_id is ${user.shop_id}`);
      }

      // Get user token for authentication
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build date filters
      const dateFilters: any = {};
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilters.dateFrom = today.toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilters.dateFrom = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilters.dateFrom = monthAgo.toISOString();
          break;
        default:
          // No date filter
          break;
      }

      // Call N8N webhook to get transactions
      const response = await transactionService.getTransactions(
        shopId, 
        token, 
        {
          ...dateFilters,
          limit: 100
        }
      );

      console.log('📡 N8N Response:', response);
      console.log('🔍 Response structure analysis:', {
        responseType: typeof response,
        hasSuccess: 'success' in response,
        hasData: 'data' in response,
        responseData: response.data,
        responseDataType: typeof response.data,
        responseDataIsArray: Array.isArray(response.data),
        responseDataDataIsArray: Array.isArray(response.data?.data)
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch inquiries');
      }

      // Transform the response data to match our interface
      // N8N returns the data directly as an array like: [{id:1,...}, {id:2,...}, ...]
      let inquiriesData: any[] = [];
      
      console.log('🔍 Analyzing response.data structure:', response.data);
      
      // Direct array from N8N (like the format you showed)
      if (Array.isArray(response.data)) {
        inquiriesData = response.data;
        console.log('✅ Found direct array in response.data');
      }
      // Nested array (response.data.data)
      else if (response.data && Array.isArray(response.data.data)) {
        inquiriesData = response.data.data;
        console.log('✅ Found nested array in response.data.data');
      }
      // Single object that needs to be wrapped in array
      else if (response.data && typeof response.data === 'object' && response.data.id) {
        inquiriesData = [response.data];
        console.log('✅ Found single object, wrapped in array');
      }
      // Response might be the array directly
      else if (Array.isArray(response)) {
        inquiriesData = response;
        console.log('✅ Found array directly in response');
      }
      else {
        console.log('⚠️ Unable to extract array data. Full response:', JSON.stringify(response, null, 2));
        console.log('⚠️ Response.data type:', typeof response.data);
        console.log('⚠️ Response.data keys:', Object.keys(response.data || {}));
        inquiriesData = [];
      }
      
      console.log('🎯 Extracted inquiries data:', inquiriesData.length, 'items');
      console.log('🎯 Sample inquiry data:', inquiriesData[0]);
      console.log('🎯 All inquiry IDs:', inquiriesData.map(item => item.id));
      console.log('🎯 Raw N8N data structure check:', {
        totalRecords: inquiriesData.length,
        sampleRecords: inquiriesData.slice(0, 3).map(item => ({
          id: item.id,
          shop_id: item.shop_id,
          timestamp: item.timestamp,
          method: item.method,
          // Show what fields are missing
          hasCustomerName: !!item.customer_name,
          hasCustomerPhone: !!item.customer_phone,
          hasCustomerEmail: !!item.customer_email,
          hasCustomerMessage: !!item.customer_message,
          hasCreatedAt: !!item.created_at
        }))
      });
      
      // Handle empty data gracefully
      if (inquiriesData.length === 0) {
        console.log('⚠️ No inquiries data found, setting empty array');
        setInquiries([]);
        return;
      }
      
      // Warn if we expect more records but got fewer
      if (inquiriesData.length === 1) {
        console.log('⚠️ WARNING: Only 1 record found but expected multiple records for shop', shopId);
        console.log('⚠️ This might indicate:');
        console.log('  1. N8N query is filtering to only latest record');
        console.log('  2. N8N workflow is returning only first record');
        console.log('  3. Database query has LIMIT 1 or similar restriction');
      }
      
      console.log('🚀 Starting to process', inquiriesData.length, 'inquiries...');
      
      const inquiriesWithStatus = inquiriesData.map((inquiry: any, index: number) => {
        console.log(`🎯 Processing inquiry ${index + 1}:`, inquiry.id, inquiry.interaction_type);
        
        // Use only real N8N data - no mock/fallback values
        return {
          ...inquiry,
          status: getStatusFromInteraction(inquiry),
          id: inquiry.id?.toString() || 'missing-id',
          // Map N8N timestamp to created_at if available
          created_at: inquiry.timestamp || inquiry.created_at || inquiry.date,
          // Show real customer data or empty if not available
          customer_name: inquiry.customer_name || inquiry.name || inquiry.user_name || '',
          customer_phone: inquiry.customer_phone || inquiry.phone || inquiry.phone_number || '',
          customer_email: inquiry.customer_email || inquiry.email || inquiry.user_email || '',
          customer_message: inquiry.customer_message || inquiry.message || inquiry.content || inquiry.body || '',
          product_name: inquiry.product_name || inquiry.product || undefined
        };
      });
      
      console.log('✅ Successfully processed inquiries:', inquiriesWithStatus.length);
      console.log('✅ Processed inquiry IDs:', inquiriesWithStatus.map(item => item.id));
      console.log('✅ Setting state with inquiries array...');
      
      setInquiries(inquiriesWithStatus);
      console.log('✅ State update completed. Check if inquiries array is updated.');

    } catch (err) {
      console.error('🎯 Error fetching inquiries via N8N webhook:', err);
      setError('Failed to load customer inquiries. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
  };

  const getStatusFromInteraction = (inquiry: any) => {
    // Map interaction types to status
    switch (inquiry.interaction_type) {
      case 'inquiry_submission': return 'contacted';
      case 'inquiry_intent': return 'new';
      default: return 'new';
    }
  };

  // Load inquiries when component mounts or filters change
  useEffect(() => {
    fetchInquiries();
  }, [user, dateFilter]);

  // Filter inquiries based on search term and status
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === '' || 
      (inquiry.customer_name && inquiry.customer_name.trim() && inquiry.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.customer_message && inquiry.customer_message.trim() && inquiry.customer_message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.product_name && inquiry.product_name.trim() && inquiry.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length,
    today: inquiries.filter(i => {
      if (!i.created_at) return false;
      const inquiryDate = new Date(i.created_at);
      const today = new Date();
      return inquiryDate.toDateString() === today.toDateString();
    }).length
  };

  const handleCallCustomer = (phone: string | undefined) => {
    if (!phone) {
      console.log('⚠️ No phone number available');
      return;
    }
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailCustomer = (email: string | undefined) => {
    if (!email) {
      console.log('⚠️ No email address available');
      return;
    }
    window.open(`mailto:${email}`, '_self');
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, newStatus: 'new' | 'contacted' | 'resolved') => {
    console.log('🔄 Starting status update for inquiry:', inquiryId, 'to status:', newStatus);
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('🔄 Calling transactionService.updateTransaction...');
      const response = await transactionService.updateTransaction(
        inquiryId,
        { status: newStatus },
        token
      );

      console.log('🔄 Update response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update inquiry status');
      }

      console.log('🔄 Updating local state...');
      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      );
      
      console.log('✅ Status update completed successfully');
    } catch (err) {
      console.error('❌ Error updating inquiry status:', err);
      setError('Failed to update inquiry status. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'contacted':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        return 'Date not available';
      }
      
      // Handle different date formats
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('⚠️ Invalid date format:', dateString);
        return 'Invalid date format';
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.log('⚠️ Date formatting error:', error, 'for date:', dateString);
      return 'Date formatting error';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-bg">
        {/* Header */}
        <header className="bg-white border-b border-border-subtle">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Customer Inquiries
                </h1>
                <p className="text-text-secondary mt-1">
                  Manage customer questions and follow-ups
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-text-secondary">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading customer inquiries...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="bg-white border-b border-border-subtle">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Customer Inquiries
              </h1>
              <p className="text-text-secondary mt-1">
                Manage customer questions and follow-ups from your shop
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Error State */}
        {error && (
          <div className="bg-error/10 border border-error/20 rounded-md p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-error mb-1">Error Loading Inquiries</h3>
                <p className="text-error text-sm">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 text-error underline hover:no-underline text-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Inquiries</p>
                <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <Inbox className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">New</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.new}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Contacted</p>
                <p className="text-3xl font-bold text-blue-600">{stats.contacted}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Today</p>
                <p className="text-3xl font-bold text-purple-600">{stats.today}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-border-subtle p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search customer name, message, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="sm:w-48">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="bg-white rounded-lg border border-border-subtle">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No inquiries found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Customer inquiries will appear here when visitors ask questions about your products.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Customer Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {(inquiry.customer_name && inquiry.customer_name.trim()) || `Customer ID: ${inquiry.id}`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {(inquiry.customer_phone && inquiry.customer_phone.trim()) && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {inquiry.customer_phone}
                              </span>
                            )}
                            {(inquiry.customer_email && inquiry.customer_email.trim()) && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {inquiry.customer_email}
                              </span>
                            )}
                            {(!inquiry.customer_phone || !inquiry.customer_phone.trim()) && (!inquiry.customer_email || !inquiry.customer_email.trim()) && (
                              <span className="text-gray-400">No contact info provided</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Inquiry Message */}
                      {(inquiry.customer_message && inquiry.customer_message.trim()) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Customer Message:</p>
                              <p className="text-gray-700">{inquiry.customer_message}</p>
                              {(inquiry.product_name && inquiry.product_name.trim()) && (
                                <p className="text-sm text-blue-600 mt-2">
                                  Product: {inquiry.product_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {(!inquiry.customer_message || !inquiry.customer_message.trim()) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">No Message Provided</p>
                              <p className="text-gray-400 text-sm italic">Customer message not available in N8N data</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        {inquiry.created_at ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(inquiry.created_at)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3 h-3" />
                            Date not available
                          </span>
                        )}
                        <span>
                          Shop ID: {inquiry.shop_id}
                        </span>
                        {inquiry.campaign && (
                          <span>
                            Campaign: {inquiry.campaign}
                          </span>
                        )}
                        {inquiry.method && (
                          <span>
                            Via: {inquiry.method}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-3 ml-4">
                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        {inquiry.status}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {(inquiry.customer_phone && inquiry.customer_phone.trim()) && (
                          <button
                            onClick={() => {
                              console.log('📞 Call button clicked for phone:', inquiry.customer_phone);
                              handleCallCustomer(inquiry.customer_phone);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </button>
                        )}
                        
                        {(inquiry.customer_email && inquiry.customer_email.trim()) && (
                          <button
                            onClick={() => {
                              console.log('📧 Email button clicked for email:', inquiry.customer_email);
                              handleEmailCustomer(inquiry.customer_email);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </button>
                        )}
                        
                        {(!inquiry.customer_phone || !inquiry.customer_phone.trim()) && (!inquiry.customer_email || !inquiry.customer_email.trim()) && (
                          <button
                            onClick={() => {
                              console.log('⚠️ No contact info available for inquiry:', inquiry.id);
                              alert('No contact information available for this customer.');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-400 text-white text-xs font-medium rounded-md cursor-not-allowed"
                            disabled
                          >
                            <Phone className="w-3 h-3" />
                            No Contact
                          </button>
                        )}

                        <div className="flex flex-col gap-1">
                          {inquiry.status === 'new' && (
                            <button 
                              onClick={() => {
                                console.log('🔄 Mark Contacted clicked for inquiry:', inquiry.id);
                                handleUpdateInquiryStatus(inquiry.id, 'contacted');
                              }}
                              className="flex items-center gap-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              Mark Contacted
                            </button>
                          )}
                          {inquiry.status === 'contacted' && (
                            <button 
                              onClick={() => {
                                console.log('🔄 Mark Resolved clicked for inquiry:', inquiry.id);
                                handleUpdateInquiryStatus(inquiry.id, 'resolved');
                              }}
                              className="flex items-center gap-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              Mark Resolved
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              console.log('📋 More options clicked for inquiry:', inquiry.id);
                              alert(`More options for inquiry ${inquiry.id}\n\nFeatures coming soon:\n- View full conversation\n- Add notes\n- Assign to team member\n- Export data`);
                            }}
                            className="flex items-center gap-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            <MoreVertical className="w-3 h-3" />
                            More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
