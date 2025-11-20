import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Edit3, 
  Trash2, 
  Plus,
  ArrowLeft,
  Eye,
  Copy,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface MessageTemplate {
  id: string;
  name: string;
  type: 'success_receipt' | 'pending_receipt' | 'failed_receipt';
  channel: 'sms' | 'email' | 'both';
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
  usage_count: number;
  active: boolean;
}

interface DeliveryRecord {
  id: string;
  transaction_id: string;
  customer_phone: string;
  customer_name: string;
  message_type: string;
  channel: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  error_message?: string;
}

interface AnalyticsData {
  total_sent: number;
  delivery_rate: number;
  open_rate: number;
  response_time_avg: number;
  channel_performance: {
    sms: { sent: number; delivered: number; rate: number };
    email: { sent: number; delivered: number; rate: number };
  };
  template_usage: { [key: string]: number };
}

export default function PaymentReceiptMessaging({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'deliveries' | 'analytics'>('templates');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const SUPABASE_URL = 'https://ufrrlfcxuovxgizxuowh.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcnJsZmN4dW92eGdpenh1b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2Mzc2NDgsImV4cCI6MjA2OTIxMzY0OH0.MfwxLihZ6htvufjYv3RLfKwKsazjD_TnVEcV1IDZeQg';
  const N8N_RECEIPT_WEBHOOK = 'https://n8n.tenear.com/webhook/send-payment-receipt';

  // Default templates
  const defaultTemplates: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>[] = [
    {
      name: 'Payment Success Receipt',
      type: 'success_receipt',
      channel: 'both',
      content: `🎉 PAYMENT RECEIVED - {{shop_name}}

📱 Transaction ID: {{transaction_id}}
💰 Amount: KES {{amount}}
🧾 Reference: {{reference_code}}
📅 Date: {{timestamp}}
🏪 Shop: {{shop_name}}

Thank you for your payment! For support, contact us.

#TeNEARTech #MPESA #PaymentConfirmed`,
      variables: ['transaction_id', 'amount', 'customer_name', 'reference_code', 'shop_name', 'timestamp'],
      active: true
    },
    {
      name: 'Payment Pending Receipt',
      type: 'pending_receipt',
      channel: 'sms',
      content: `⏳ PAYMENT PENDING - {{shop_name}}

📱 Transaction ID: {{transaction_id}}
💰 Amount: KES {{amount}}
📅 Time: {{timestamp}}
🏪 Shop: {{shop_name}}

Your payment is being processed. You'll receive confirmation shortly.

#TeNEARTech #MPESA #Processing`,
      variables: ['transaction_id', 'amount', 'shop_name', 'timestamp'],
      active: true
    },
    {
      name: 'Payment Failed Receipt',
      type: 'failed_receipt',
      channel: 'sms',
      content: `❌ PAYMENT FAILED - {{shop_name}}

📱 Transaction ID: {{transaction_id}}
💰 Amount: KES {{amount}}
📅 Time: {{timestamp}}
🏪 Shop: {{shop_name}}

Payment could not be completed. Please try again or contact support.

#TeNEARTech #MPESA #Failed`,
      variables: ['transaction_id', 'amount', 'shop_name', 'timestamp'],
      active: true
    }
  ];

  const fetchTemplates = useCallback(async () => {
    try {
      // For now, use local storage or default templates
      // In production, you'd fetch from a templates table
      const savedTemplates = localStorage.getItem('payment_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      } else {
        setTemplates(defaultTemplates.map((template, index) => ({
          ...template,
          id: `template-${index + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 0
        })));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  const fetchDeliveries = useCallback(async () => {
    try {
      // Fetch from payment_transactions table to get delivery history
      const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_transactions?select=*&shop_id=eq.55&order=created_at.desc&limit=100`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const deliveryRecords: DeliveryRecord[] = data.map((transaction: any) => ({
          id: transaction.id,
          transaction_id: transaction.transaction_id || transaction.id,
          customer_phone: transaction.phone_number,
          customer_name: transaction.customer_name || 'Customer',
          message_type: transaction.status === 'completed' ? 'success_receipt' : 
                       transaction.status === 'pending' ? 'pending_receipt' : 'failed_receipt',
          channel: 'sms',
          status: transaction.receipt_sent ? 'delivered' : 'pending',
          sent_at: transaction.receipt_sent_at || transaction.created_at,
          delivered_at: transaction.receipt_sent_at
        }));
        setDeliveries(deliveryRecords);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const totalSent = deliveries.filter(d => d.status === 'delivered').length;
    const totalDelivered = deliveries.filter(d => d.status === 'delivered').length;
    const smsDelivered = deliveries.filter(d => d.channel === 'sms' && d.status === 'delivered').length;
    const emailDelivered = deliveries.filter(d => d.channel === 'email' && d.status === 'delivered').length;

    setAnalytics({
      total_sent: totalSent,
      delivery_rate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      open_rate: 75, // Mock data - would track from actual opens
      response_time_avg: 2.3, // Mock data in hours
      channel_performance: {
        sms: {
          sent: deliveries.filter(d => d.channel === 'sms').length,
          delivered: smsDelivered,
          rate: smsDelivered > 0 ? (smsDelivered / deliveries.filter(d => d.channel === 'sms').length) * 100 : 0
        },
        email: {
          sent: deliveries.filter(d => d.channel === 'email').length,
          delivered: emailDelivered,
          rate: emailDelivered > 0 ? (emailDelivered / deliveries.filter(d => d.channel === 'email').length) * 100 : 0
        }
      },
      template_usage: templates.reduce((acc, template) => {
        acc[template.name] = template.usage_count;
        return acc;
      }, {} as { [key: string]: number })
    });
  }, [deliveries, templates]);

  const saveTemplates = (updatedTemplates: MessageTemplate[]) => {
    localStorage.setItem('payment_templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
  };

  const duplicateTemplate = (template: MessageTemplate) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0
    };
    saveTemplates([...templates, newTemplate]);
  };

  const testTemplate = async (template: MessageTemplate) => {
    const testData = {
      transaction_id: 'TEST-' + Date.now(),
      phone_number: '+254700000000',
      amount: 1000,
      customer_name: 'Test Customer',
      reference_code: 'TEST123',
      shop_name: 'TeNEAR Tech',
      payment_method: 'MPESA',
      status: 'completed',
      date: new Date().toISOString()
    };

    try {
      const response = await fetch(N8N_RECEIPT_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testData,
          template_override: template.content
        }),
      });

      if (response.ok) {
        alert('Test message sent successfully!');
      } else {
        alert('Failed to send test message.');
      }
    } catch (error) {
      console.error('Error testing template:', error);
      alert('Error sending test message.');
    }
  };

  const sendBulkTest = async () => {
    const activeTemplates = templates.filter(t => t.active);
    if (activeTemplates.length === 0) {
      alert('No active templates to test.');
      return;
    }

    for (const template of activeTemplates) {
      await testTemplate(template);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
    
    alert('Bulk test completed for all active templates!');
  };

  useEffect(() => {
    fetchTemplates();
    fetchDeliveries();
    setLoading(false);
  }, [fetchTemplates, fetchDeliveries]);

  useEffect(() => {
    if (deliveries.length > 0) {
      fetchAnalytics();
    }
  }, [deliveries, fetchAnalytics]);

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const TemplateForm = ({ template, onSave, onCancel }: {
    template?: MessageTemplate;
    onSave: (template: MessageTemplate) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<MessageTemplate>(template || {
      id: `template-${Date.now()}`,
      name: '',
      type: 'success_receipt',
      channel: 'both',
      content: '',
      variables: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
      active: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.content) {
        alert('Please fill in all required fields.');
        return;
      }

      // Extract variables from content
      const variableMatches = formData.content.match(/\{\{(\w+)\}\}/g);
      const variables = variableMatches ? [...new Set(variableMatches.map(match => match.slice(2, -2)))] : [];

      onSave({
        ...formData,
        variables,
        updated_at: new Date().toISOString()
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {template ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="success_receipt">Success Receipt</option>
                    <option value="pending_receipt">Pending Receipt</option>
                    <option value="failed_receipt">Failed Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sms">SMS Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">SMS + Email</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Active Template
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your message content here. Use {{variable_name}} for dynamic content."
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Available variables: {'{'}transaction_id{'}'}, {'{'}amount{'}'}, {'{'}customer_name{'}'}, {'{'}phone_number{'}'}, {'{'}reference_code{'}'}, {'{'}shop_name{'}'}, {'{'}timestamp{'}'}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {template ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading message templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Payment Receipt Messaging
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={sendBulkTest}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Test All Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deliveries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Deliveries ({deliveries.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Message Templates</h2>
              <button
                onClick={() => setShowNewTemplateForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </button>
            </div>

            <div className="grid gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.type === 'success_receipt' ? 'bg-green-100 text-green-800' :
                          template.type === 'pending_receipt' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.type.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.channel === 'both' ? 'bg-purple-100 text-purple-800' :
                          template.channel === 'sms' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {template.channel.toUpperCase()}
                        </span>
                        {template.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-4">
                        <p>Used {template.usage_count} times • Last updated {new Date(template.updated_at).toLocaleDateString()}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {template.content}
                        </pre>
                      </div>

                      {template.variables.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Variables:</p>
                          <div className="flex flex-wrap gap-2">
                            {template.variables.map((variable) => (
                              <span key={variable} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {`{${variable}}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => testTemplate(template)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Test Template"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateTemplate(template)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Duplicate Template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {filteredDeliveries.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No delivery records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {delivery.transaction_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  {delivery.channel === 'sms' ? (
                                    <Phone className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <Mail className="w-4 h-4 text-gray-600" />
                                  )}
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {delivery.customer_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {delivery.customer_phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.message_type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.channel.toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                              {getStatusIcon(delivery.status)}
                              <span className="ml-1 capitalize">{delivery.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(delivery.sent_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Messaging Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.total_sent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.delivery_rate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.open_rate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.response_time_avg}h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">SMS</span>
                      <span className="text-sm text-gray-500">
                        {analytics.channel_performance.sms.delivered}/{analytics.channel_performance.sms.sent}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${analytics.channel_performance.sms.rate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{analytics.channel_performance.sms.rate.toFixed(1)}% delivery rate</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Email</span>
                      <span className="text-sm text-gray-500">
                        {analytics.channel_performance.email.delivered}/{analytics.channel_performance.email.sent}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${analytics.channel_performance.email.rate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{analytics.channel_performance.email.rate.toFixed(1)}% delivery rate</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Usage</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.template_usage).map(([templateName, count]) => (
                    <div key={templateName} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 truncate">{templateName}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Form Modal */}
        {(showNewTemplateForm || editingTemplate) && (
          <TemplateForm
            template={editingTemplate || undefined}
            onSave={(template) => {
              if (editingTemplate) {
                const updatedTemplates = templates.map(t => t.id === template.id ? template : t);
                saveTemplates(updatedTemplates);
                setEditingTemplate(null);
              } else {
                saveTemplates([...templates, template]);
                setShowNewTemplateForm(false);
              }
            }}
            onCancel={() => {
              setShowNewTemplateForm(false);
              setEditingTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
