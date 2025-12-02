import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Loader2, 
  Smartphone,
  MessageSquare,
  Mail,
  Bell,
  QrCode
} from 'lucide-react';
import { WhatsAppTemplate, WhatsAppTemplateCreate, whatsappTemplateService } from '../services/WhatsAppTemplateService';

interface TemplateEditorProps {
  template?: WhatsAppTemplate | null;
  shopId: number;
  onSave: () => void;
  onCancel: () => void;
}

interface TemplateFormData {
  campaign_id: string;
  visitor_type: string;
  engagement_method: WhatsAppTemplate['engagement_method'];
  template_content: {
    type: WhatsAppTemplate['template_content']['type'];
    header: string;
    subheader: string;
    intro: string;
    emoji: string;
    cta: string;
    urgency: string;
    hashtags: string;
    fallback_message: string;
  };
  is_active: boolean;
}

const ENGAGEMENT_METHODS = [
  { value: 'ws', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600' },
  { value: 'sms', label: 'SMS', icon: Smartphone, color: 'text-blue-600' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-purple-600' },
  { value: 'push', label: 'Push Notification', icon: Bell, color: 'text-orange-600' },
  { value: 'qr_code', label: 'QR Code', icon: QrCode, color: 'text-gray-600' }
];

const TEMPLATE_TYPES = [
  { value: 'promotional', label: 'Promotional', description: 'Sales, discounts, offers' },
  { value: 'informative', label: 'Informative', description: 'General information, updates' },
  { value: 'urgent', label: 'Urgent', description: 'Time-sensitive notifications' },
  { value: 'exclusive', label: 'Exclusive', description: 'VIP, member-only content' },
  { value: 'welcome', label: 'Welcome', description: 'First-time visitor greetings' }
];

const VISITOR_TYPES = [
  { value: 'general', label: 'General', description: 'All visitors' },
  { value: 'first_visit', label: 'First Visit', description: 'New customers' },
  { value: 'returning', label: 'Returning', description: 'Previous visitors' },
  { value: 'vip', label: 'VIP', description: 'Premium customers' },
  { value: 'loyalty', label: 'Loyalty', description: 'Loyalty program members' }
];

const EMOJI_OPTIONS = ['🎉', '🔥', '💫', '🌟', '⭐', '🎁', '🎯', '💝', '🚀', '🏆', '💪', '✨'];

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  shopId,
  onSave,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewMessage, setPreviewMessage] = useState('');

  const [formData, setFormData] = useState<TemplateFormData>({
    campaign_id: template?.campaign_id || '',
    visitor_type: template?.visitor_type || 'general',
    engagement_method: template?.engagement_method || 'ws',
    template_content: {
      type: template?.template_content.type || 'promotional',
      header: template?.template_content.header || '',
      subheader: template?.template_content.subheader || '',
      intro: template?.template_content.intro || '',
      emoji: template?.template_content.emoji || '🎉',
      cta: template?.template_content.cta || 'Visit us today!',
      urgency: template?.template_content.urgency || '',
      hashtags: template?.template_content.hashtags || '',
      fallback_message: template?.template_content.fallback_message || ''
    },
    is_active: template?.is_active ?? true
  });

  // Update preview when form data changes
  useEffect(() => {
    const generatePreview = () => {
      const content = formData.template_content;
      let message = `${content.emoji} ${content.header}\n\n`;
      message += `${content.subheader}\n\n`;
      message += `${content.intro}\n\n`;
      message += `${content.cta}\n\n`;
      
      if (content.urgency) {
        message += `⏰ ${content.urgency}\n\n`;
      }
      
      if (content.hashtags) {
        message += content.hashtags;
      }
      
      return message;
    };

    setPreviewMessage(generatePreview());
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('template_content.')) {
      const contentField = field.replace('template_content.', '');
      setFormData(prev => ({
        ...prev,
        template_content: {
          ...prev.template_content,
          [contentField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.campaign_id.trim()) {
        throw new Error('Campaign ID is required');
      }
      if (!formData.template_content.header.trim()) {
        throw new Error('Template header is required');
      }
      if (!formData.template_content.subheader.trim()) {
        throw new Error('Template subheader is required');
      }
      if (!formData.template_content.intro.trim()) {
        throw new Error('Template introduction is required');
      }
      if (!formData.template_content.cta.trim()) {
        throw new Error('Call-to-action is required');
      }

      const templateData: WhatsAppTemplateCreate = {
        campaign_id: formData.campaign_id,
        shop_id: shopId,
        visitor_type: formData.visitor_type,
        engagement_method: formData.engagement_method,
        template_content: formData.template_content,
        is_active: formData.is_active
      };

      let result;
      if (template) {
        // Update existing template
        result = await whatsappTemplateService.updateTemplate(template.id, templateData);
      } else {
        // Create new template
        result = await whatsappTemplateService.createTemplate(templateData);
      }

      if (result) {
        onSave();
      } else {
        throw new Error('Failed to save template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      campaign_id: '',
      visitor_type: 'general',
      engagement_method: 'ws',
      template_content: {
        type: 'promotional',
        header: '',
        subheader: '',
        intro: '',
        emoji: '🎉',
        cta: 'Visit us today!',
        urgency: '',
        hashtags: '',
        fallback_message: ''
      },
      is_active: true
    });
  };

  const selectedEngagementMethod = ENGAGEMENT_METHODS.find(m => m.value === formData.engagement_method);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex">
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {template ? 'Edit Template' : 'Create New Template'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {template ? 'Update your WhatsApp template' : 'Create a new WhatsApp message template'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Campaign ID *
                    </label>
                    <Input
                      value={formData.campaign_id}
                      onChange={(e) => handleInputChange('campaign_id', e.target.value)}
                      placeholder="e.g., welcome_new_customers"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for this template
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Visitor Type
                    </label>
                    <select
                      value={formData.visitor_type}
                      onChange={(e) => handleInputChange('visitor_type', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {VISITOR_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Engagement Method
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ENGAGEMENT_METHODS.map(method => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => handleInputChange('engagement_method', method.value)}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            formData.engagement_method === method.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${method.color}`} />
                            <span className="text-sm font-medium">{method.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Template is active
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Template Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {TEMPLATE_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('template_content.type', type.value)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          formData.template_content.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Emoji
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleInputChange('template_content.emoji', emoji)}
                        className={`p-2 border rounded-lg text-xl transition-colors ${
                          formData.template_content.emoji === emoji
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Header *
                  </label>
                  <Input
                    value={formData.template_content.header}
                    onChange={(e) => handleInputChange('template_content.header', e.target.value)}
                    placeholder="Main message header"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subheader *
                  </label>
                  <Input
                    value={formData.template_content.subheader}
                    onChange={(e) => handleInputChange('template_content.subheader', e.target.value)}
                    placeholder="Supporting message"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Introduction *
                  </label>
                  <Textarea
                    value={formData.template_content.intro}
                    onChange={(e) => handleInputChange('template_content.intro', e.target.value)}
                    placeholder="Main message content. Use {SHOP_NAME}, {MALL_NAME}, {VISITOR_NAME} for dynamic content."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available variables: {'{SHOP_NAME}'}, {'{MALL_NAME}'}, {'{VISITOR_NAME}'}, {'{CAMPAIGN_NAME}'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Call-to-Action *
                  </label>
                  <Input
                    value={formData.template_content.cta}
                    onChange={(e) => handleInputChange('template_content.cta', e.target.value)}
                    placeholder="What should the visitor do?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Urgency (Optional)
                  </label>
                  <Input
                    value={formData.template_content.urgency}
                    onChange={(e) => handleInputChange('template_content.urgency', e.target.value)}
                    placeholder="e.g., Limited time offer!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hashtags (Optional)
                  </label>
                  <Input
                    value={formData.template_content.hashtags}
                    onChange={(e) => handleInputChange('template_content.hashtags', e.target.value)}
                    placeholder="#YourBrand #Campaign"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {template ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-96 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Live Preview</h3>
                {selectedEngagementMethod && (
                  <Badge variant="outline" className="text-xs">
                    {selectedEngagementMethod.label}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Phone-like container for WhatsApp preview */}
                <div className="p-4">
                  <div className="bg-green-100 rounded-lg p-4 min-h-64">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                      {previewMessage}
                    </pre>
                  </div>
                  
                  {/* Template Info */}
                  <div className="mt-4 space-y-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Campaign:</span> {formData.campaign_id || 'Not set'}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {formData.template_content.type}
                    </div>
                    <div>
                      <span className="font-medium">Visitor Type:</span> {formData.visitor_type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Variables Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Template Variables</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><code>{'{SHOP_NAME}'}</code> - Your shop name</div>
                  <div><code>{'{MALL_NAME}'}</code> - Your mall name</div>
                  <div><code>{'{VISITOR_NAME}'}</code> - Visitor's name</div>
                  <div><code>{'{CAMPAIGN_NAME}'}</code> - Campaign name</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateEditor;
