import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, Globe, MessageSquare, Loader2 } from 'lucide-react';

interface LinkGeneratorProps {
  shopId: string | number
}

export function CampaignLinkGenerator({ shopId }: LinkGeneratorProps) {
  const [target, setTarget] = useState('manifesto');
  const [platform, setPlatform] = useState('whatsapp');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const WORKER_BASE_URL = "https://tenearpolitical.pages.dev"; 
  const WEBHOOK_URL = "https://n8n.tenear.com/webhook/political-campaign-interactions";

  const targets = [
    { id: 'manifesto', label: 'My Manifesto' },
    { id: 'townhall', label: 'Town Hall Chat' },
    { id: 'rally', label: 'Rally Check-in' },
  ];

  const platforms = [
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { id: 'facebook', name: 'Facebook', icon: Globe, color: 'text-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Share2, color: 'text-sky-500' },
  { id: 'web', name: 'Website', icon: Globe, color: 'text-gray-500' }
  ];


  const campaignId = `camp_${target}_${platform}_${Date.now().toString(36)}`;
  const generatedUrl = `${WORKER_BASE_URL}/?shop_id=${shopId}&business_category=political&target=${target}&platform=${platform}&campaign_id=${campaignId}`;

  // 1. Log analytics to n8n
  const trackShare = async (selectedPlatform: string) => {
    try {
      await fetch('https://n8n.tenear.com/webhook/get-political-campaign-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'share_campaign_material', 
          shop_id: shopId, 
          material_id: target,
          business_category: "political",
          utm_source: selectedPlatform,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Failed to log share to n8n:", error);
    }
  };

  // 2. Main Share Logic
  const handleCampaignShare = async (platformId: string) => {
    setPlatform(platformId);
    const selectedTarget = targets.find(t => t.id === target);
    const title = selectedTarget?.label || "Campaign Update";
    const description = `Access my official ${target} and campaign projects for the 2027 General Election.`;
    
    const finalUrl = `${WORKER_BASE_URL}/?shop_id=${shopId}&business_category=political&target=${target}&utm_source=${platformId}`;
    const shareText = `🗳️ 2027 CAMPAIGN UPDATE\n\n📜 ${title}\n📢 ${description}\n\n🔗 View Official Hub:\n${finalUrl}`;

    // Mobile Native Share (iOS/Android Chrome/Safari)
    if (platformId === 'web' && typeof navigator.share !== 'undefined') {
      try {
        await navigator.share({ title, text: shareText, url: finalUrl });
        trackShare("mobile_native");
        return;
      } catch (err) { /* fallback if user cancels */ }
    }

    // Specific Platform Logic
    if (platformId === 'whatsapp') {
      // NOTE: We open the window BEFORE the await to prevent pop-up blockers
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      trackShare("whatsapp_direct");
    } else if (platformId === 'facebook') {
      window.open(`https://www.facebook.com{encodeURIComponent(finalUrl)}`, '_blank');
      trackShare("facebook_direct");
    } else if (platformId === 'twitter') {
      window.open(`https://twitter.com{encodeURIComponent(shareText)}`, '_blank');
      trackShare("twitter_direct");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare("manual_copy");
    } catch (err) {
      console.error("Clipboard failed", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary-600" /> 
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
          <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Sharing Platform (Click to Share)</label>
          <div className="flex gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => handleCampaignShare(p.id)}
                className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 ${platform === p.id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-white'}`}
                title={`Share on ${p.name}`}
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
            onClick={copyToClipboard}
            className="text-white hover:text-primary-400 transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={copyToClipboard}
          className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex justify-center items-center gap-2"
        >
          {copied ? 'Link Copied!' : 'Copy Link to Share'}
        </button>
        <a 
          href={generatedUrl} 
          target="_blank" 
          rel="noreferrer"
          className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
