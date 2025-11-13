import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Campaign {
  id: number;
  name: string;
  description: string;
  benefits: string;
  shop_name: string;
  shop_id: string;
  mall_id: string;
  qr_code_url_entrance: string | null;
  qr_code_url_checkout: string | null;
  qr_code_url_display: string | null;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    shop_name: '',
    shop_id: '',
    mall_id: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('adcampaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodes = async (campaignId: number) => {
    try {
      // Generate QR codes for different locations
      const baseUrl = `${window.location.origin}`;
      const entranceUrl = `${baseUrl}/qr/checkin?campaign=${campaignId}&zone=entrance&location=Entrance`;
      const checkoutUrl = `${baseUrl}/qr/checkin?campaign=${campaignId}&zone=checkout&location=Checkout`;
      const displayUrl = `${baseUrl}/qr/checkin?campaign=${campaignId}&zone=display&location=Display`;

      // Update campaign with QR code URLs
      const { error: updateError } = await supabase
        .from('adcampaigns')
        .update({
          qr_code_url_entrance: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(entranceUrl)}`,
          qr_code_url_checkout: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkoutUrl)}`,
          qr_code_url_display: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(displayUrl)}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) {
        throw updateError;
      }

      // Refresh campaigns to show updated QR codes
      await fetchCampaigns();
      alert('QR codes generated successfully!');
    } catch (err) {
      console.error('Error generating QR codes:', err);
      alert('Failed to generate QR codes');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error: createError } = await supabase
        .from('adcampaigns')
        .insert([{
          name: formData.name,
          description: formData.description,
          benefits: formData.benefits,
          shop_name: formData.shop_name,
          shop_id: formData.shop_id,
          mall_id: formData.mall_id,
          scan_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (createError) {
        throw createError;
      }

      if (data && data.length > 0) {
        const newCampaign = data[0];
        // Generate QR codes for the new campaign
        await generateQRCodes(newCampaign.id);
      }

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        benefits: '',
        shop_name: '',
        shop_id: '',
        mall_id: ''
      });
      setShowCreateForm(false);
      
      // Refresh campaigns
      await fetchCampaigns();
      
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Failed to create campaign');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Campaign Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <span className="mr-2">+</span>
          Create Campaign
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3>
                <p className="text-sm text-gray-600">{campaign.shop_name}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {campaign.scan_count} scans
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {campaign.description}
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-800">Benefits:</p>
              <p className="text-sm text-gray-600">{campaign.benefits}</p>
            </div>

            {/* QR Codes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-800">QR Codes:</h4>
              {campaign.qr_code_url_entrance ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <img 
                      src={campaign.qr_code_url_entrance} 
                      alt="Entrance QR" 
                      className="w-16 h-16 mx-auto border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">Entrance</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src={campaign.qr_code_url_checkout} 
                      alt="Checkout QR" 
                      className="w-16 h-16 mx-auto border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">Checkout</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src={campaign.qr_code_url_display} 
                      alt="Display QR" 
                      className="w-16 h-16 mx-auto border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">Display</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => generateQRCodes(campaign.id)}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                >
                  Generate QR Codes
                </button>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Created: {new Date(campaign.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns yet</h3>
          <p className="text-gray-500">Create your first campaign to get started!</p>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create New Campaign</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., Black Friday Sale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Describe your campaign..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits/Offer *
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., 20% off all items, Free gift with purchase..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="e.g., Kika Wines & Spirits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop ID *
                  </label>
                  <input
                    type="text"
                    name="shop_id"
                    value={formData.shop_id}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="e.g., SH001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mall ID *
                </label>
                <input
                  type="text"
                  name="mall_id"
                  value={formData.mall_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., MAL001"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;
