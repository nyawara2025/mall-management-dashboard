import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Globe, MessageSquare, Facebook, Twitter, Loader2 } from 'lucide-react';

interface LinkGeneratorProps {
  shopId: string | number;
}

export function CampaignLinkGenerator({ shopId }: LinkGeneratorProps) {
  const [target, setTarget] = useState('manifesto');
  const [platform, setPlatform] = useState('whatsapp');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const WORKER_BASE_URL = "https://tenear.com"; 
  // Explicitly define your n8n or Worker trigger endpoint
  const WEBHOOK_URL = "https://n8n.tenear.com/webhook/political-campaign-interactions";

  const campaignId = `camp_${target}_${platform}_${Date.now().toString(36)}`;

  const generatedUrl = `${WORKER_BASE_URL}/?shop_id=${shopId}&business_category=political&target=${target}&platform=${platform}&campaign_id=${campaignId}`;

  const triggerWebhook = async () => {
    setIsSyncing(true);
    try {
      // This sends the interaction data to your n8n instance
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          category: 'political',
          target: target,
          platform: platform,
          timestamp: new Date().toISOString(),
          action: 'link_generated'
        }),
      });
      console.log('✅ Webhook triggered successfully');
    } catch (err) {
      console.error('❌ Webhook trigger failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleShareAction = async () => {
    await triggerWebhook();
    await copyToClipboard();
  };

  const copyToClipboard = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.error("Clipboard API failed", err);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = generatedUrl;
      textArea.style.position = "fixed"; 
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const platforms = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  { id: 'web', name: 'Website', icon: Globe, color: 'text-gray-500' }
  ];

  const targets = [
    { id: 'manifesto', label: 'My Manifesto' },
    { id: 'townhall', label: 'Town Hall Chat' },
    { id: 'rally', label: 'Rally Check-in' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Share2 className={`w-5 h-5 ${isSyncing ? 'animate-spin text-blue-500' : 'text-primary-600'}`} /> 
          Share Your Campaign
        </h3>
        <p className="text-sm text-gray-500">Generate tracking links to see which platform brings more votes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Destination</label>
          <select 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {targets.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Sharing Platform</label>
          <div className="flex gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`p-2 rounded-lg border transition-all ${platform === p.id ? 'border-primary-600 bg-primary-50' : 'border-gray-100'}`}
                title={p.name}
              >
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 relative group">
        <p className="text-xs text-gray-400 mb-1 font-mono uppercase">Tracking Link</p>
        <div className="flex items-center justify-between gap-4">
          <code className="text-blue-400 text-sm truncate font-mono">
            {generatedUrl}
          </code>
          <button 
            onClick={handleShareAction}
            className="text-white hover:text-primary-400 transition-colors"
          >
            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : (copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />)}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleShareAction}
          disabled={isSyncing}
          className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex justify-center items-center gap-2"
        >
          {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
          {copied ? 'Link Copied & Tracked!' : 'Copy Link to Share'}
        </button>
        <a 
          href={generatedUrl} 
          target="_blank" 
          rel="noreferrer"
          onClick={triggerWebhook}
          className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
