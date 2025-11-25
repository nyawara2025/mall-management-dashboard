import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';

interface ShopConfiguration {
  id: number;
  shop_id: number;
  shop_name: string;
  shop_description: string;
  primary_color?: string; // optional, may be null
  logo_url?: string; // optional, may be null
  hero_image_url?: string; // optional, may be null
  contact_info?: any; // optional, may be null
  operating_hours?: any; // optional, may be null
  social_media?: any; // optional, may be null
  created_at?: string; // optional, may be null
  updated_at?: string; // optional, may be null
}

interface CampaignTemplate {
  id: number;
  campaign_id: string;
  shop_id: number;
  visitor_type: string;
  template_content: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  campaign_id: string;
  shop_id: number;
  visitor_type: string;
  template_content: string;
  is_active: boolean;
}

const CampaignTemplateManager: React.FC = () => {
  // Get current user for filtering
  const { user } = useAuth();
  
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [shops, setShops] = useState<ShopConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    campaign_id: 'default',
    shop_id: 6, // Default to Sandra's shop
    visitor_type: 'first_visit',
    template_content: JSON.stringify({
      hero: {
        headline: '',
        subheadline: '',
        cta_text: 'Claim Offer',
        background_color: '#3B82F6'
      },
      offer: {
        title: '',
        description: '',
        benefit: '',
        validity: 'Valid for 30 days'
      },
      features: []
    }, null, 2),
    is_active: true
  });

  // n8n webhook URLs
  const WEBHOOKS = {
    templatesGet: 'https://n8n.tenear.com/webhook/templates-get',
    templatesPost: 'https://n8n.tenear.com/webhook/templates-post',
    shopConfigGet: 'https://n8n.tenear.com/webhook/shop-config-get'
  };

  // Predefined campaign types for better UX
  const CAMPAIGN_TYPES = {
    DEFAULT: 'default',
    NEW_CUSTOMER: 'new_customer',
    RETURNING_VISITOR: 'returning_visitor',
    SEASONAL: 'seasonal',
    PROMOTIONAL: 'promotional',
    LOYALTY: 'loyalty',
    WELCOME: 'welcome'
  };

  const CAMPAIGN_TYPE_DESCRIPTIONS = {
    default: 'Generic fallback template for any campaign',
    new_customer: 'First-time visitor onboarding',
    returning_visitor: 'Welcome back existing customers',
    seasonal: 'Holiday/special season campaigns',
    promotional: 'Sales and discount promotions',
    loyalty: 'VIP and loyalty program customers',
    welcome: 'General welcome message'
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Debug user data
      console.log('🔍 Current user:', user);
      console.log('🔍 User shop_id:', user?.shop_id);
      console.log('🔍 User mall_id:', user?.mall_id);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch templates from n8n webhook
      const templatesResponse = await fetch(WEBHOOKS.templatesGet, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': user.username,
          'X-User-ShopId': user.shop_id?.toString() || '6'
        },
        body: JSON.stringify({ 
          action: 'get_all',
          user_id: user.id,
          user_email: user.username,
          shop_id: user.shop_id,
          mall_id: user.mall_id
        })
      });

      if (!templatesResponse.ok) {
        throw new Error(`HTTP error! status: ${templatesResponse.status}`);
      }

      const templatesData = await templatesResponse.json();
      setTemplates(templatesData.templates || []);

      // Fetch shop configurations from n8n webhook
      const shopsResponse = await fetch(WEBHOOKS.shopConfigGet, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': user.username,
          'X-User-ShopId': user.shop_id?.toString() || '6'
        },
        body: JSON.stringify({ 
          action: 'get_all',
          user_id: user.id,
          user_email: user.username,
          shop_id: user.shop_id,
          mall_id: user.mall_id
        })
      });

      if (!shopsResponse.ok) {
        throw new Error(`HTTP error! status: ${shopsResponse.status}`);
      }

      // IMPORTANT: Parse the shops data based on actual structure from screenshot
      const shopsData = await shopsResponse.json();
      console.log('🔍 Raw shops response:', shopsData);
      
      // Convert single shop object to array, or use existing array
      const shopsArray = Array.isArray(shopsData) ? shopsData : [shopsData];
      setShops(shopsArray);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called');
    console.log('📋 Form data:', formData);
    
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!formData.campaign_id.trim()) {
        throw new Error('Campaign ID is required');
      }
      if (!formData.shop_id || formData.shop_id === 0) {
        throw new Error('Please select a shop');
      }
      if (!formData.visitor_type.trim()) {
        throw new Error('Visitor type is required');
      }

      console.log('🔍 Parsing template content JSON...');
      let parsedTemplateContent;
      try {
        parsedTemplateContent = JSON.parse(formData.template_content);
        console.log('✅ Template content parsed successfully:', parsedTemplateContent);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Invalid JSON in template content. Please check your JSON syntax.');
      }

      const templateData = {
        campaign_id: formData.campaign_id,
        visitor_type: formData.visitor_type,
        is_active: formData.is_active,
        template_content: parsedTemplateContent
      };

      console.log('📤 Prepared template data:', templateData);

      console.log('🌐 Sending request to n8n webhook:', WEBHOOKS.templatesPost);
      const response = await fetch(WEBHOOKS.templatesPost, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': user.username,
          'X-User-ShopId': user.shop_id?.toString() || '6'
        },
        body: JSON.stringify({
          action: editingTemplate ? 'update' : 'create',
          template_id: editingTemplate?.id,
          user_id: user.id,
          user_email: user.username,
          shop_id: user.shop_id,
          mall_id: user.mall_id,
          ...templateData
        })
      });

      console.log('📡 Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📦 Response data:', result);
      
      if (result.success) {
        console.log('✅ Template saved successfully, refreshing data...');
        await fetchData(); // Refresh data
        resetForm();
        setShowForm(false);
        console.log('🎉 Form reset and closed');
      } else {
        console.error('❌ Server returned error:', result.error);
        throw new Error(result.error || 'Failed to save template');
      }

    } catch (err) {
      console.error('💥 Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      console.log('📝 Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleEdit = (template: CampaignTemplate) => {
    setEditingTemplate(template);
    setFormData({
      campaign_id: template.campaign_id,
      shop_id: template.shop_id,
      visitor_type: template.visitor_type,
      template_content: JSON.stringify(template.template_content, null, 2),
      is_active: template.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(WEBHOOKS.templatesPost, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': user.username,
          'X-User-ShopId': user.shop_id?.toString() || '6'
        },
        body: JSON.stringify({
          action: 'delete',
          template_id: templateId,
          user_id: user.id,
          user_email: user.username,
          shop_id: user.shop_id,
          mall_id: user.mall_id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchData(); // Refresh data
      } else {
        throw new Error(result.error || 'Failed to delete template');
      }

    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      campaign_id: 'default',
      shop_id: user?.shop_id || 6, // Auto-select current user's shop
      visitor_type: 'first_visit',
      template_content: JSON.stringify({
        hero: {
          headline: '',
          subheadline: '',
          cta_text: 'Claim Offer',
          background_color: '#3B82F6'
        },
        offer: {
          title: '',
          description: '',
          benefit: '',
          validity: 'Valid for 30 days'
        },
        features: []
      }, null, 2),
      is_active: true
    });
  };

  const getShopName = (shopId: number) => {
    // Safety check: ensure shops is an array before calling find
    if (!Array.isArray(shops)) {
      return `Shop ${shopId}`;
    }
    const shop = shops.find(s => s.shop_id === shopId);
    return shop?.shop_name || `Shop ${shopId}`;
  };

  const getShopColor = (shopId: number) => {
    // Safety check: ensure shops is an array before calling find
    if (!Array.isArray(shops)) {
      return '#3B82F6';
    }
    const shop = shops.find(s => s.shop_id === shopId);
    return shop?.primary_color || '#3B82F6';
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update default shop selection when user changes
  useEffect(() => {
    if (user && shops.length > 0) {
      // Auto-select the current user's shop if available
      const userShop = shops.find(s => s.shop_id === user.shop_id);
      if (userShop && formData.shop_id === 6) {
        setFormData(prev => ({
          ...prev,
          shop_id: user.shop_id || 6 // Fallback to 6 if user.shop_id is null/undefined
        }));
      }
    }
  }, [user, shops, formData.shop_id]);

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Campaign Template Manager</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Template Form Modal */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Campaign Template Workflow</h4>
              <p className="text-xs text-blue-700">
                Templates are reusable components for campaigns. Choose <strong>Campaign ID</strong> based on:
              </p>
              <ul className="text-xs text-blue-600 mt-1 ml-3 list-disc">
                <li><strong>default:</strong> Generic fallback for any campaign</li>
                <li><strong>new_customer:</strong> First-time visitor onboarding</li>
                <li><strong>returning_visitor:</strong> Welcome back messages</li>
                <li><strong>promotional:</strong> Sales and discount campaigns</li>
                <li><strong>Custom:</strong> Create unique ID for specific campaigns</li>
              </ul>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Campaign ID
                    <span className="text-xs text-gray-500 ml-2">
                      (Choose existing or create new)
                    </span>
                  </label>
                  <div className="space-y-2">
                    <Input
                      value={formData.campaign_id}
                      onChange={(e) => setFormData({...formData, campaign_id: e.target.value})}
                      placeholder="e.g., new_customer, promotional, seasonal"
                      required
                    />
                    <div className="text-xs text-gray-600">
                      <div className="font-medium mb-1">Recommended Campaign Types:</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <strong>default:</strong> Generic fallback
                        </div>
                        <div>
                          <strong>new_customer:</strong> First-time visitors
                        </div>
                        <div>
                          <strong>returning_visitor:</strong> Existing customers
                        </div>
                        <div>
                          <strong>promotional:</strong> Sales & discounts
                        </div>
                        <div>
                          <strong>seasonal:</strong> Holiday campaigns
                        </div>
                        <div>
                          <strong>loyalty:</strong> VIP program
                        </div>
                      </div>
                    </div>
                    {templates.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <div className="font-medium mb-1">Existing Campaign IDs in your shop:</div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(templates
                            .filter(t => t.shop_id === user?.shop_id)
                            .map(t => t.campaign_id))).map(campaignId => (
                              <Badge 
                                key={campaignId} 
                                variant="outline" 
                                className="cursor-pointer text-xs"
                                onClick={() => setFormData({...formData, campaign_id: campaignId})}
                              >
                                {campaignId}
                              </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Click a badge to select an existing Campaign ID
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Shop</label>
                  <select
                    value={formData.shop_id}
                    onChange={(e) => setFormData({...formData, shop_id: Number(e.target.value)})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value={0}>Select a shop</option>
                    {shops.map(shop => (
                      <option key={shop.shop_id} value={shop.shop_id}>
                        {shop.shop_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Visitor Type</label>
                  <select
                    value={formData.visitor_type}
                    onChange={(e) => setFormData({...formData, visitor_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="first_visit">First Visit</option>
                    <option value="returning">Returning Visitor</option>
                    <option value="vip">VIP Customer</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Template Content (JSON)</label>
                <Textarea
                  value={formData.template_content}
                  onChange={(e) => setFormData({...formData, template_content: e.target.value})}
                  placeholder="Enter JSON template content"
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use the format: {"{ hero, offer, features }"} for optimal display
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  onClick={(e) => {
                    console.log('🖱️ Submit button clicked!', e);
                    console.log('🔄 Current form data:', formData);
                    console.log('📋 Form validation - shop_id:', formData.shop_id, 'campaign_id:', formData.campaign_id, 'visitor_type:', formData.visitor_type);
                  }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('🧪 Test button clicked - forcing form submission');
                    // Create a minimal test submission
                    const testData = {
                      campaign_id: 'test',
                      visitor_type: 'first_visit',
                      is_active: true,
                      template_content: { hero: { headline: 'Test' } }
                    };
                    console.log('📤 Test data:', testData);
                  }}
                >
                  Test
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No templates found. Create your first template to get started.</p>
            </CardContent>
          </Card>
        ) : (
          templates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getShopColor(template.shop_id) }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getShopName(template.shop_id)} - {template.visitor_type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">Campaign: {template.campaign_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Preview functionality - could open modal with rendered template
                        alert('Preview functionality can be implemented here');
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(template.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Template Preview:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Hero:</span>
                      <p>{template.template_content.hero?.headline || 'No headline'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Offer:</span>
                      <p>{template.template_content.offer?.title || 'No offer title'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button 
        onClick={fetchData} 
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Refresh Data
      </Button>
    </div>
  );
};

export default CampaignTemplateManager;
