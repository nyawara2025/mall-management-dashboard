import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
  MoreVertical,
  ShoppingCart,
  X,
  Image as ImageIcon,
  Package
} from 'lucide-react';

interface CustomerInquiry {
  id: string;
  shop_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_message: string;
  product_name?: string;
  product_id?: string;
  product_image?: string;
  interaction_type: string;
  created_at: string;
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
  
  // Order creation modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    product_name: '',
    product_id: '',
    product_image: '',
    quantity: 1,
    amount: 0,
    notes: '',
    order_type: 'standard',
    shipping_address: '',
    payment_method: 'cash_on_delivery'
  });

  // Fetch customer inquiries using the original transactionService approach
  const fetchInquiries = async () => {
    if (!user) return;
    
    if (user.role !== 'shop_admin' && user.role !== 'mall_admin' && user.role !== 'super_admin' && user.role !== 'shop_staff') {
      throw new Error('Access denied: Insufficient permissions');
    }
    
    if (!user.shop_id) {
      throw new Error('User shop_id not found');
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
      // N8N returns the data wrapped in a json object: {json: {customer_name: "...", ...}}
      let inquiriesData: any[] = [];
      
      console.log('🔍 Analyzing response.data structure:', response.data);
      console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
      
      // Handle N8N json wrapper format: {json: {customer_name: "...", ...}}
      if (response.data && response.data.json) {
        if (Array.isArray(response.data.json)) {
          inquiriesData = response.data.json;
          console.log('✅ Found array in response.data.json');
        } else if (response.data.json && typeof response.data.json === 'object' && response.data.json.id) {
          inquiriesData = [response.data.json];
          console.log('✅ Found single object in response.data.json, wrapped in array');
        } else {
          inquiriesData = [response.data.json];
          console.log('✅ Found object in response.data.json, wrapped in array');
        }
      }
      // Fallback: Handle direct array format (response.data = [...])
      else if (Array.isArray(response.data)) {
        inquiriesData = response.data;
        console.log('✅ Found direct array in response.data');
      }
      // Fallback: Handle nested array (response.data.data = [...])
      else if (response.data && Array.isArray(response.data.data)) {
        inquiriesData = response.data.data;
        console.log('✅ Found nested array in response.data.data');
      }
      // Fallback: Handle single object (response.data = {...})
      else if (response.data && typeof response.data === 'object' && response.data.id) {
        inquiriesData = [response.data];
        console.log('✅ Found single object in response.data, wrapped in array');
      }
      // Response might be the array directly (response = [...])
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
      console.log('🎯 First inquiry full data:', JSON.stringify(inquiriesData[0], null, 2));
      console.log('🎯 Raw N8N data structure check:', {
        totalRecords: inquiriesData.length,
        sampleRecords: inquiriesData.slice(0, 3).map(item => ({
          id: item.id,
          shop_id: item.shop_id,
          customer_name: item.customer_name,
          customer_message: item.customer_message?.substring(0, 50) + '...',
          interaction_type: item.interaction_type,
          created_at: item.created_at
        }))
      });

      // Transform data to match interface - use original working logic
      const inquiriesWithStatus = inquiriesData.map((inquiry: any, index: number) => {
        console.log(`🎯 Processing inquiry ${index + 1}:`, inquiry.id, inquiry.interaction_type);
        console.log(`🔍 Full inquiry data for debugging:`, JSON.stringify(inquiry, null, 2));
        
        // The actual customer data is nested in inquiry.json
        const actualData = inquiry.json || inquiry;
        
        console.log(`🔍 Data structure analysis for inquiry ${index + 1}:`, {
          inquiry: inquiry,
          actualData: actualData,
          hasJson: !!inquiry.json,
          directProductName: inquiry.product_name,
          nestedProductName: inquiry.json?.product_name,
          actualDataProductName: actualData.product_name
        });
        
        // Generate a unique customer identifier from available data
        const customerId = actualData.id?.toString() || `record-${index + 1}`;
        const sessionId = actualData.session_id || 'unknown';
        
        // Use real customer data from the database
        const customerName = actualData.customer_name || 
                            (sessionId !== 'unknown' ? `Customer ${sessionId}` : `Customer ${customerId}`);
        
        // Extract message content - use actual customer message
        const messageContent = actualData.customer_message || 
                              actualData.message || actualData.content || actualData.text || actualData.body ||
                              `WhatsApp inquiry about product ${actualData.product_id || 'N/A'}`;
        
        // Extract product name with comprehensive fallback logic
        // Check multiple possible locations where product name might be stored
        const extractedProductName = 
          // Try actualData first (most common)
          (actualData.product_name && actualData.product_name.trim() !== '' && actualData.product_name !== 'Product' ? actualData.product_name : null) ||
          // Try direct inquiry access 
          (inquiry.product_name && inquiry.product_name.trim() !== '' && inquiry.product_name !== 'Product' ? inquiry.product_name : null) ||
          // Try other possible field names
          (actualData.product && actualData.product.trim() !== '' && actualData.product !== 'Product' ? actualData.product : null) ||
          (actualData.product_name_from_db && actualData.product_name_from_db.trim() !== '' && actualData.product_name_from_db !== 'Product' ? actualData.product_name_from_db : null) ||
          (actualData.name && actualData.name.trim() !== '' && actualData.name !== 'Product' ? actualData.name : null) ||
          // Final fallback to product ID
          (actualData.product_id ? `Product ${actualData.product_id}` : 'Product');
        
        console.log(`🔍 Product name extraction for inquiry ${index + 1}:`, {
          inquiry: inquiry,
          actualData: actualData,
          extractedProductName: extractedProductName,
          availableFields: {
            actualData_product_name: actualData.product_name,
            inquiry_product_name: inquiry.product_name,
            actualData_product: actualData.product,
            actualData_name: actualData.name,
            actualData_id: actualData.product_id
          },
          // Check for image-related fields
          imageFields: {
            actualData_product_image: actualData.product_image,
            inquiry_product_image: inquiry.product_image,
            actualData_image: actualData.image,
            inquiry_image: inquiry.image,
            actualData_thumbnail: actualData.thumbnail,
            inquiry_thumbnail: inquiry.thumbnail,
            actualData_image_url: actualData.image_url,
            inquiry_image_url: inquiry.image_url
          },
          // Show all available keys to identify image fields
          allAvailableKeys: Object.keys(actualData).concat(Object.keys(inquiry)).filter((key, index, arr) => arr.indexOf(key) === index)
        });
        
        return {
          id: customerId,
          shop_id: actualData.shop_id || shopId,
          customer_name: customerName,
          customer_phone: actualData.customer_phone || '',
          customer_email: actualData.customer_email || '',
          customer_message: messageContent,
          product_name: extractedProductName,
          product_id: actualData.product_id || '',
          product_image: 
            // Try actualData first (most common)
            (actualData.product_image_url && actualData.product_image_url.trim() !== '' ? actualData.product_image_url : null) ||
            (actualData.product_image && actualData.product_image.trim() !== '' ? actualData.product_image : null) ||
            // Try direct inquiry access
            (inquiry.product_image_url && inquiry.product_image_url.trim() !== '' ? inquiry.product_image_url : null) ||
            (inquiry.product_image && inquiry.product_image.trim() !== '' ? inquiry.product_image : null) ||
            // Try other possible image field names
            (actualData.image && actualData.image.trim() !== '' ? actualData.image : null) ||
            (inquiry.image && inquiry.image.trim() !== '' ? inquiry.image : null) ||
            (actualData.thumbnail && actualData.thumbnail.trim() !== '' ? actualData.thumbnail : null) ||
            (inquiry.thumbnail && inquiry.thumbnail.trim() !== '' ? inquiry.thumbnail : null) ||
            (actualData.image_url && actualData.image_url.trim() !== '' ? actualData.image_url : null) ||
            (inquiry.image_url && inquiry.image_url.trim() !== '' ? inquiry.image_url : null) ||
            // Final fallback to empty string
            '',
          interaction_type: actualData.interaction_type || inquiry.interaction_type || 'message',
          created_at: actualData.created_at || new Date().toISOString(),
          campaign: actualData.campaign || inquiry.campaign,
          method: actualData.method || inquiry.method,
          status: 'new' as const
        };
      });

      console.log('🎯 Final inquiries array:', inquiriesWithStatus.length, 'items');
      console.log('🎯 All inquiry IDs:', inquiriesWithStatus.map(item => item.id));
      console.log('🎯 Final sample:', inquiriesWithStatus[0]);
      
      setInquiries(inquiriesWithStatus);

    } catch (err) {
      console.error('🎯 Error fetching inquiries:', err);
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

  // Load inquiries when component mounts or filters change
  useEffect(() => {
    fetchInquiries();
  }, [user, dateFilter]);

  // Filter inquiries based on search term and status
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === '' || 
      inquiry.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.customer_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.product_name && inquiry.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      const inquiryDate = new Date(i.created_at);
      const today = new Date();
      return inquiryDate.toDateString() === today.toDateString();
    }).length
  };

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailCustomer = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleCreateOrder = (inquiry: CustomerInquiry) => {
    setSelectedInquiry(inquiry);
    setOrderFormData({
      customer_name: inquiry.customer_name,
      customer_phone: inquiry.customer_phone,
      customer_email: inquiry.customer_email,
      product_name: inquiry.product_name || '',
      product_id: inquiry.product_id || '',
      product_image: inquiry.product_image || '',
      quantity: 1,
      amount: 0, // Set default amount, will be entered by admin
      notes: inquiry.customer_message,
      order_type: 'standard',
      shipping_address: '',
      payment_method: 'cash_on_delivery'
    });
    setIsOrderModalOpen(true);
  };

  const handleCreateOrderSubmit = async () => {
    if (!selectedInquiry) return;

    setIsCreatingOrder(true);
    
    try {
      const orderData = {
        ...orderFormData,
        shop_id: selectedInquiry.shop_id,
        inquiry_id: selectedInquiry.id,
        source: 'customer_inquiry',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('https://n8n.tenear.com/webhook/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Close modal and refresh inquiries
        setIsOrderModalOpen(false);
        setSelectedInquiry(null);
        fetchInquiries();
        
        // Show success message (you can replace this with a proper toast notification)
        alert('Order created successfully!');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedInquiry(null);
    setOrderFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      product_name: '',
      product_id: '',
      product_image: '',
      quantity: 1,
      amount: 0,
      notes: '',
      order_type: 'standard',
      shipping_address: '',
      payment_method: 'cash_on_delivery'
    });
  };

  const handleRespondToCustomer = async (inquiry: any) => {
    try {
      const response = prompt(`Respond to ${inquiry.customer_name}:\n\nCurrent message: "${inquiry.customer_message}"\n\nType your response:`);
      if (response && response.trim()) {
        console.log('📱 Sending response to customer:', response);
        
        // Update inquiry status to "contacted" and add response
        await handleUpdateInquiryStatus(inquiry.id, 'contacted');
        
        // In a real implementation, you would send this via WhatsApp API
        alert(`Response sent to ${inquiry.customer_name}!\n\nMessage: "${response}"\n\nNote: This would be sent via WhatsApp in production.`);
      }
    } catch (error) {
      console.error('❌ Error responding to customer:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleAddNotes = async (inquiry: any) => {
    try {
      const notes = prompt(`Add notes for ${inquiry.customer_name}:\n\nCurrent inquiry: "${inquiry.customer_message}"\n\nAdd your notes:`);
      if (notes && notes.trim()) {
        console.log('📝 Adding notes:', notes);
        alert(`Notes added for ${inquiry.customer_name}!\n\nNotes: "${notes}"\n\nNote: Notes would be saved to database in production.`);
      }
    } catch (error) {
      console.error('❌ Error adding notes:', error);
      alert('Failed to add notes. Please try again.');
    }
  };

  const handleAssignToTeam = async (inquiry: any) => {
    try {
      const assignee = prompt(`Assign inquiry from ${inquiry.customer_name} to team member:\n\nEnter team member name or ID:`);
      if (assignee && assignee.trim()) {
        console.log('👤 Assigning to team:', assignee);
        alert(`Inquiry assigned to ${assignee}!\n\nNote: This would be saved to database in production.`);
      }
    } catch (error) {
      console.error('❌ Error assigning to team:', error);
      alert('Failed to assign inquiry. Please try again.');
    }
  };

  const handleExportData = async (inquiry: any) => {
    try {
      console.log('📤 Exporting data for inquiry:', inquiry.id);
      const data = {
        customer_name: inquiry.customer_name,
        customer_phone: inquiry.customer_phone,
        customer_email: inquiry.customer_email,
        customer_message: inquiry.customer_message,
        product_name: inquiry.product_name,
        created_at: inquiry.created_at,
        status: inquiry.status,
        method: inquiry.method
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiry-${inquiry.id}-${inquiry.customer_name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`Data exported successfully!\n\nFile: inquiry-${inquiry.id}-${inquiry.customer_name}.json`);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating inquiry ${inquiryId} status to: ${newStatus}`);
      // In a real implementation, you would update this via API
      alert(`Inquiry status updated to "${newStatus}"!\n\nNote: This would be saved to database in production.`);
    } catch (error) {
      console.error('❌ Error updating inquiry status:', error);
      alert('Failed to update inquiry status. Please try again.');
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
    return new Date(dateString).toLocaleString();
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
                            {inquiry.customer_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {inquiry.customer_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {inquiry.customer_email}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Product Image and Inquiry Message */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          {inquiry.product_image && (
                            <div className="flex-shrink-0">
                              <img
                                src={inquiry.product_image}
                                alt={inquiry.product_name || 'Product'}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEw0MCA0MEw0MCA0MFpNNDAgNDBMMjAgMjBMNjAgMjBMNDAgNDBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik00MCA0MEw0MCA0MEw0MCA0MFpNNDAgNDBMMzAgMzBMNTAgMzBMNDAgNDBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo=';
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Customer Message:</p>
                                <p className="text-gray-700">{inquiry.customer_message}</p>
                                {inquiry.product_name && (
                                  <p className="text-sm text-blue-600 mt-2">
                                    Product: {inquiry.product_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(inquiry.created_at)}
                        </span>
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
                        {/* Create Order Button - Always first */}
                        <button
                          onClick={() => handleCreateOrder(inquiry)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Create Order
                        </button>
                        
                        {/* Contact Buttons - Show based on available info */}
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

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1">
                          {/* Instant Response for WhatsApp */}
                          {inquiry.method === 'whatsapp' && (
                            <button 
                              onClick={() => handleRespondToCustomer(inquiry)}
                              className="flex items-center gap-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              📱 Quick Reply
                            </button>
                          )}
                          
                          {/* Status Management Buttons */}
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
                          
                          {/* More Actions Dropdown */}
                          <div className="relative group">
                            <button 
                              className="flex items-center gap-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-colors"
                            >
                              <MoreVertical className="w-3 h-3" />
                              More
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              <button 
                                onClick={() => handleRespondToCustomer(inquiry)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-md"
                              >
                                💬 Respond to Customer
                              </button>
                              <button 
                                onClick={() => handleAddNotes(inquiry)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                📝 Add Notes
                              </button>
                              <button 
                                onClick={() => handleAssignToTeam(inquiry)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                👤 Assign to Team
                              </button>
                              <button 
                                onClick={() => handleExportData(inquiry)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-md"
                              >
                                📤 Export Data
                              </button>
                            </div>
                          </div>
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

      {/* Order Creation Modal */}
      {isOrderModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Order</h2>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={orderFormData.customer_name}
                      onChange={(e) => setOrderFormData({...orderFormData, customer_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={orderFormData.customer_phone}
                      onChange={(e) => setOrderFormData({...orderFormData, customer_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={orderFormData.customer_email}
                      onChange={(e) => setOrderFormData({...orderFormData, customer_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderFormData.product_image && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      <img
                        src={orderFormData.product_image}
                        alt={orderFormData.product_name}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={orderFormData.product_name}
                      onChange={(e) => setOrderFormData({...orderFormData, product_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={orderFormData.quantity}
                      onChange={(e) => setOrderFormData({...orderFormData, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={orderFormData.amount}
                      onChange={(e) => setOrderFormData({...orderFormData, amount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter amount in KES"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Type
                    </label>
                    <select
                      value={orderFormData.order_type}
                      onChange={(e) => setOrderFormData({...orderFormData, order_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="standard">Standard Order</option>
                      <option value="express">Express Delivery</option>
                      <option value="pickup">Store Pickup</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      value={orderFormData.shipping_address}
                      onChange={(e) => setOrderFormData({...orderFormData, shipping_address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter delivery address..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={orderFormData.payment_method}
                      onChange={(e) => setOrderFormData({...orderFormData, payment_method: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="cash_on_delivery">Cash on Delivery</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="mobile_payment">Mobile Payment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={orderFormData.notes}
                      onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Additional notes or special instructions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeOrderModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isCreatingOrder}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrderSubmit}
                disabled={isCreatingOrder || !orderFormData.customer_name || !orderFormData.customer_phone || !orderFormData.product_name || orderFormData.amount <= 0}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
              >
                {isCreatingOrder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Create Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
