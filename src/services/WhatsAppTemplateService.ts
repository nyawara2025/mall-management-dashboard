/**
 * WhatsApp Template Management Service
 * Author: MiniMax Agent
 * 
 * Extends existing campaign_visitor_templates table for WhatsApp integration
 */

import { supabase } from '../lib/supabase';

export interface WhatsAppTemplate {
  id: number;
  campaign_id: string;
  shop_id: number;
  visitor_type: string;
  engagement_method: 'qr_code' | 'ws' | 'sms' | 'email' | 'push';
  template_content: {
    type: 'promotional' | 'informative' | 'urgent' | 'exclusive' | 'welcome';
    header: string;
    subheader: string;
    intro: string;
    emoji: string;
    cta: string;
    urgency: string;
    hashtags: string;
    fallback_message: string;
    variables?: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplateCreate {
  campaign_id: string;
  shop_id: number;
  visitor_type?: string;
  engagement_method: 'qr_code' | 'ws' | 'sms' | 'email' | 'push';
  template_content: WhatsAppTemplate['template_content'];
  is_active?: boolean;
}

export interface TemplateStats {
  total_templates: number;
  active_templates: number;
  template_types: Record<string, number>;
  engagement_methods: Record<string, number>;
  last_created: number | null;
  shop_performance: Array<{
    shop_id: number;
    shop_name: string;
    template_count: number;
    active_count: number;
  }>;
}

class WhatsAppTemplateService {
  /**
   * Get all templates for a shop with optional campaign filtering
   */
  async getAllTemplates(shopId: number, campaignId?: string): Promise<WhatsAppTemplate[]> {
    try {
      let query = supabase
        .from('campaign_visitor_templates')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map((template: any) => ({
        ...template,
        // Ensure proper typing for engagement_method
        engagement_method: template.engagement_method as WhatsAppTemplate['engagement_method']
      })) || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  /**
   * Get templates for a specific engagement method
   */
  async getTemplatesByEngagementMethod(
    shopId: number, 
    engagementMethod: WhatsAppTemplate['engagement_method']
  ): Promise<WhatsAppTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('campaign_visitor_templates')
        .select('*')
        .eq('shop_id', shopId)
        .eq('engagement_method', engagementMethod)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map((template: any) => ({
        ...template,
        engagement_method: template.engagement_method as WhatsAppTemplate['engagement_method']
      })) || [];
    } catch (error) {
      console.error('Failed to fetch templates by engagement method:', error);
      return [];
    }
  }

  /**
   * Create a new template (stores reusable message templates)
   */
  async createTemplate(template: WhatsAppTemplateCreate): Promise<WhatsAppTemplate | null> {
    try {
      const templateData = {
        ...template,
        visitor_type: template.visitor_type || 'general',
        is_active: template.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to create via n8n webhook first (more reliable than Supabase RLS)
      const templatePayload = {
        action: 'create_template',
        table: 'adcampaigns',
        data: templateData
      };

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templatePayload)
      });

      if (response.ok) {
        // Return a mock template object since we can't get the ID from webhook
        return {
          id: Date.now(), // Temporary ID
          ...templateData
        } as WhatsAppTemplate;
      }

      // If webhook fails, try direct Supabase (may still fail due to RLS)
      const { data, error } = await supabase
        .from('campaign_visitor_templates')
        .insert([templateData])
        .select();

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Failed to create template:', error);
      return null;
    }
  }

  /**
   * Create a WhatsApp campaign from a template - Send directly to n8n webhook
   */
  async createCampaignFromTemplate(templateId: number, campaignData: {
    title: string;
    description: string;
    message?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
  }): Promise<{ template: WhatsAppTemplate; campaign_id: string } | null> {
    try {
      // GET template from campaign_visitor_templates
      const templateWithPreview = await this.getTemplateWithPreview(templateId);
      if (!templateWithPreview) {
        throw new Error('Template not found');
      }

      const template = templateWithPreview.template;
      
      // Generate WhatsApp message from template if not provided
      const whatsappMessage = campaignData.message || this.generateMessage(template);

      // Create campaign payload for adcampaigns table via n8n webhook
      const campaignPayload = {
        title: campaignData.title,
        description: campaignData.description,
        message: whatsappMessage,
        campaign_id: template.campaign_id,
        shop_id: template.shop_id,
        visitor_type: template.visitor_type,
        engagement_method: template.engagement_method,
        template_content: template.template_content,
        start_date: campaignData.start_date || new Date().toISOString(),
        end_date: campaignData.end_date,
        budget: campaignData.budget,
        active: true
      };

      // POST directly to n8n webhook for adcampaigns table
      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignPayload)
      });

      if (!response.ok) {
        throw new Error(`Campaign creation failed: ${response.status} ${response.statusText}`);
      }

      // Return success - webhook 200 OK means campaign was created
      return {
        template: template,
        campaign_id: template.campaign_id
      };
      
    } catch (error) {
      console.error('Failed to create WhatsApp campaign:', error);
      return null;
    }
  }

  /**
   * Update an existing template (reusable message templates)
   */
  async updateTemplate(
    id: number, 
    updates: Partial<WhatsAppTemplateCreate>
  ): Promise<WhatsAppTemplate | null> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try n8n webhook first for better reliability
      const templatePayload = {
        action: 'update_template',
        table: 'adcampaigns',
        id: id,
        data: updateData
      };

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templatePayload)
      });

      if (response.ok) {
        // Return updated template data
        return { id, ...updateData } as WhatsAppTemplate;
      }

      // Fallback to direct Supabase
      const { data, error } = await supabase
        .from('campaign_visitor_templates')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Failed to update template:', error);
      return null;
    }
  }

  /**
   * Update template via n8n webhook as fallback
   */


  /**
   * Delete a template (soft delete - reusable message templates)
   */
  async deleteTemplate(id: number): Promise<boolean> {
    try {
      const updateData = { 
        is_active: false,
        updated_at: new Date().toISOString()
      };

      // Try n8n webhook first
      const templatePayload = {
        action: 'delete_template',
        table: 'campaign_visitor_templates',
        id: id,
        data: updateData
      };

      const response = await fetch('https://n8n.tenear.com/webhook/manage-campaigns-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templatePayload)
      });

      if (response.ok) {
        return true;
      }

      // Fallback to direct Supabase
      const { error } = await supabase
        .from('campaign_visitor_templates')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  /**
   * Delete template via n8n webhook as fallback
   */


  /**
   * Generate WhatsApp message from template with variable replacement
   */
  generateMessage(
    template: WhatsAppTemplate, 
    variables: Record<string, string> = {}
  ): string {
    const content = template.template_content;
    const shopName = variables.shop_name || 'Our Store';
    const mallName = variables.mall_name || 'Our Mall';
    const visitorName = variables.visitor_name || 'Valued Customer';
    
    let message = `${content.emoji} ${content.header}\n\n`;
    message += `${content.subheader}\n\n`;
    message += `${content.intro}\n\n`;
    
    // Replace variables in intro if any
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key.toUpperCase()}}`, 'g');
      message = message.replace(regex, value);
    });
    
    message += `${content.cta}\n\n`;
    
    if (content.urgency) {
      message += `⏰ ${content.urgency}\n\n`;
    }
    
    if (content.hashtags) {
      message += content.hashtags;
    }
    
    return message;
  }

  /**
   * Get template with preview data
   */
  async getTemplateWithPreview(templateId: number): Promise<{
    template: WhatsAppTemplate;
    preview: string;
    variables: string[];
  } | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_visitor_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) return null;

      const dataItem = data[0];
      const template: WhatsAppTemplate = {
        ...dataItem,
        engagement_method: dataItem.engagement_method as WhatsAppTemplate['engagement_method']
      };

      // Extract variables from template content
      const variables = this.extractVariables(template.template_content);
      
      // Generate preview with default values
      const preview = this.generateMessage(template, {
        shop_name: 'Our Store',
        mall_name: 'Our Mall',
        visitor_name: 'Valued Customer'
      });

      return { template, preview, variables };
    } catch (error) {
      console.error('Failed to get template with preview:', error);
      return null;
    }
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: WhatsAppTemplate['template_content']): string[] {
    const variables = new Set<string>();
    const text = JSON.stringify(content);
    const regex = /{([A-Z_]+)}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Get template statistics for analytics
   */
  async getTemplateStats(shopId: number): Promise<TemplateStats | null> {
    try {
      const { data, error } = await supabase
        .from('campaign_visitor_templates')
        .select('*')
        .eq('shop_id', shopId);

      if (error) throw error;

      const templates = data || [];
      
      // Get shop names for performance data
      const { data: shopData } = await supabase
        .from('shop_configurations')
        .select('shop_id, shop_name')
        .eq('shop_id', shopId);

      const shopName = shopData?.[0]?.shop_name || `Shop ${shopId}`;

      const stats: TemplateStats = {
        total_templates: templates.length,
        active_templates: templates.filter((t: any) => t.is_active).length,
        template_types: templates.reduce((acc: Record<string, number>, template: any) => {
          const type = template.template_content?.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        engagement_methods: templates.reduce((acc: Record<string, number>, template: any) => {
          const method = template.engagement_method || 'unknown';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        last_created: templates.length > 0 ? 
          Math.max(...templates.map((t: any) => new Date(t.created_at).getTime())) : null,
        shop_performance: [{
          shop_id: shopId,
          shop_name: shopName,
          template_count: templates.length,
          active_count: templates.filter((t: any) => t.is_active).length
        }]
      };

      return stats;
    } catch (error) {
      console.error('Failed to fetch template stats:', error);
      return null;
    }
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(templateId: number): Promise<WhatsAppTemplate | null> {
    try {
      const template = await this.getTemplateWithPreview(templateId);
      if (!template) return null;

      const duplicateData: WhatsAppTemplateCreate = {
        campaign_id: `${template.template.campaign_id}_copy`,
        shop_id: template.template.shop_id,
        visitor_type: template.template.visitor_type,
        engagement_method: template.template.engagement_method,
        template_content: template.template.template_content,
        is_active: true
      };

      return await this.createTemplate(duplicateData);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      return null;
    }
  }
}

export const whatsappTemplateService = new WhatsAppTemplateService();
