import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Plus, Search, Filter, BarChart3, MessageSquare } from 'lucide-react';
import { whatsappTemplateService, WhatsAppTemplate } from '../services/WhatsAppTemplateService';
import TemplateEditor from './TemplateEditor';
import TemplateAnalytics from './TemplateAnalytics';
import TemplateCard from './TemplateCard';

const WhatsAppTemplateManager: React.FC = () => {
  const { user } = useAuth();
  
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  const ENGAGEMENT_METHODS = [
    { value: 'all', label: 'All Methods' },
    { value: 'ws', label: 'WhatsApp' },
    { value: 'qr_code', label: 'QR Code' },
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' },
    { value: 'push', label: 'Push Notification' }
  ];

  const fetchTemplates = async () => {
    if (!user?.shop_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const allTemplates = await whatsappTemplateService.getAllTemplates(user.shop_id);
      setTemplates(allTemplates);
      setFilteredTemplates(allTemplates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const success = await whatsappTemplateService.deleteTemplate(templateId);
      if (success) {
        await fetchTemplates(); // Refresh the list
      } else {
        setError('Failed to delete template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (templateId: number) => {
    try {
      const duplicate = await whatsappTemplateService.duplicateTemplate(templateId);
      if (duplicate) {
        await fetchTemplates(); // Refresh the list
      } else {
        setError('Failed to duplicate template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate template');
    }
  };

  const handleTemplateSaved = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    fetchTemplates(); // Refresh the list
  };

  // Filter templates based on search and filters
  useEffect(() => {
    let filtered = templates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.campaign_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.template_content.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.template_content.subheader.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Campaign filter
    if (filterCampaign) {
      filtered = filtered.filter(template => template.campaign_id === filterCampaign);
    }

    // Engagement method filter
    if (filterEngagement !== 'all') {
      filtered = filtered.filter(template => template.engagement_method === filterEngagement);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, filterCampaign, filterEngagement]);

  // Get unique campaign IDs for filter dropdown
  const uniqueCampaigns = Array.from(new Set(templates.map(t => t.campaign_id)));

  useEffect(() => {
    fetchTemplates();
  }, [user?.shop_id]);

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading WhatsApp templates...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-green-600" />
            WhatsApp Template Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage WhatsApp message templates for your campaigns
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="h-5 w-5 mr-2" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Templates</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search by campaign, header, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign</label>
                  <select
                    value={filterCampaign}
                    onChange={(e) => setFilterCampaign(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Campaigns</option>
                    {uniqueCampaigns.map(campaign => (
                      <option key={campaign} value={campaign}>{campaign}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Engagement Method</label>
                  <select
                    value={filterEngagement}
                    onChange={(e) => setFilterEngagement(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {ENGAGEMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template List */}
          <div className="grid gap-4">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {templates.length === 0 ? 'No templates found' : 'No templates match your filters'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {templates.length === 0 
                      ? 'Create your first WhatsApp template to get started with engaging your visitors.'
                      : 'Try adjusting your search criteria or filters to find templates.'
                    }
                  </p>
                  {templates.length === 0 && (
                    <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <TemplateAnalytics shopId={user?.shop_id || 0} />
        </TabsContent>
      </Tabs>

      {/* Template Editor Modal */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          shopId={user?.shop_id || 0}
          onSave={handleTemplateSaved}
          onCancel={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default WhatsAppTemplateManager;
