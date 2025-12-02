import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Bell,
  QrCode,
  Clock,
  Calendar,
  User
} from 'lucide-react';
import { WhatsAppTemplate } from '../services/WhatsAppTemplateService';

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onEdit: (template: WhatsAppTemplate) => void;
  onDelete: (templateId: number) => void;
  onDuplicate: (templateId: number) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');

  const getEngagementIcon = (method: string) => {
    switch (method) {
      case 'ws': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'sms': return <Smartphone className="h-4 w-4 text-blue-600" />;
      case 'email': return <Mail className="h-4 w-4 text-purple-600" />;
      case 'push': return <Bell className="h-4 w-4 text-orange-600" />;
      case 'qr_code': return <QrCode className="h-4 w-4 text-gray-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEngagementLabel = (method: string) => {
    switch (method) {
      case 'ws': return 'WhatsApp';
      case 'sms': return 'SMS';
      case 'email': return 'Email';
      case 'push': return 'Push';
      case 'qr_code': return 'QR Code';
      default: return method;
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

  const handlePreview = () => {
    // Generate preview message
    const preview = `📱 ${template.template_content.header}\n\n` +
      `${template.template_content.subheader}\n\n` +
      `${template.template_content.intro}\n\n` +
      `${template.template_content.cta}\n\n` +
      (template.template_content.urgency ? `⏰ ${template.template_content.urgency}\n\n` : '') +
      (template.template_content.hashtags || '');

    setPreviewMessage(preview);
    setShowPreview(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      const message = `📱 ${template.template_content.header}\n\n` +
        `${template.template_content.subheader}\n\n` +
        `${template.template_content.intro}\n\n` +
        `${template.template_content.cta}\n\n` +
        (template.template_content.urgency ? `⏰ ${template.template_content.urgency}\n\n` : '') +
        (template.template_content.hashtags || '');

      await navigator.clipboard.writeText(message);
      alert('Template message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  {getEngagementIcon(template.engagement_method)}
                  <Badge variant="outline" className="text-xs">
                    {getEngagementLabel(template.engagement_method)}
                  </Badge>
                </div>
                <Badge className={`text-xs ${getTypeColor(template.template_content.type)}`}>
                  {template.template_content.type}
                </Badge>
                <Badge variant={template.is_active ? 'default' : 'secondary'} className="text-xs">
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Content Preview */}
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {template.template_content.header}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.template_content.subheader}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Campaign: {template.campaign_id}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {template.visitor_type.replace('_', ' ')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(template.created_at)}
                  </div>
                </div>
              </div>

              {/* Template Content Preview */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">CTA:</span>{' '}
                    <span className="text-gray-600">{template.template_content.cta}</span>
                  </div>
                  {template.template_content.urgency && (
                    <div>
                      <span className="font-medium text-gray-700">Urgency:</span>{' '}
                      <span className="text-gray-600">{template.template_content.urgency}</span>
                    </div>
                  )}
                  {template.template_content.hashtags && (
                    <div>
                      <span className="font-medium text-gray-700">Hashtags:</span>{' '}
                      <span className="text-gray-600">{template.template_content.hashtags}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePreview}
                title="Preview Template"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDuplicate(template.id)}
                title="Duplicate Template"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(template)}
                title="Edit Template"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(template.id)}
                title="Delete Template"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <p className="text-sm text-gray-600 mt-1">
                {template.campaign_id} • {getEngagementLabel(template.engagement_method)}
              </p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="bg-green-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {previewMessage}
                </pre>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Variables:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><code>{'{SHOP_NAME}'}</code> - Your shop name</div>
                  <div><code>{'{MALL_NAME}'}</code> - Your mall name</div>
                  <div><code>{'{VISITOR_NAME}'}</code> - Visitor's name</div>
                  <div><code>{'{CAMPAIGN_NAME}'}</code> - Campaign name</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button onClick={handleCopyToClipboard}>
                Copy Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateCard;
