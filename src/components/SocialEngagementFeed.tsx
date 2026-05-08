import React, { useState } from 'react';
import { 
  MessageCircle, Share2, Heart, Loader2, 
  Send, ExternalLink, ShieldCheck 
} from 'lucide-react';

interface SocialMetric {
  platform: 'whatsapp' | 'social';
  user_name: string;
  comment: string;
  timestamp: string;
  remote_jid?: string; // Specific for WhatsApp/Evolution API
  post_url?: string;
}

interface SocialEngagementFeedProps {
  metrics: SocialMetric[];
  isLoading: boolean;
  shopId: number;
}

export const SocialEngagementFeed: React.FC<SocialEngagementFeedProps> = ({ 
  metrics, 
  isLoading, 
  shopId 
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleEvolutionReply = async (metric: SocialMetric) => {
    if (!replyText.trim()) return;
    setIsSending(true);

    try {
      // Direct call to your n8n webhook which acts as the Evolution API proxy
      const response = await fetch('https://n8n.tenear.com/webhook/EvoAPI-for-socialmedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          remote_jid: metric.remote_jid,
          message: replyText,
          context: metric.comment
        }),
      });

      if (response.ok) {
        alert("Reply sent via WhatsApp!");
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      console.error("Reply failed:", error);
      alert("Failed to send reply via Gateway.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Syncing Live Interactions...</p>
    </div>
  );

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {metrics.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-sm">No live mentions yet.<br/>Your campaign is ready for takeoff!</p>
        </div>
      ) : (
        metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${metric.platform === 'whatsapp' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {metric.platform === 'whatsapp' ? <MessageCircle size={18} /> : <Share2 size={18} />}
                </div>
                <div>
                  <span className="font-black text-gray-900 text-sm block">{metric.user_name || 'Supporter'}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {metric.platform === 'whatsapp' ? 'WhatsApp Mention' : 'Social Share'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold">
                {new Date(metric.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed italic mb-4 bg-gray-50 p-4 rounded-2xl border-l-4 border-blue-500">
              "{metric.comment}"
            </p>

            <div className="flex items-center gap-2">
              <button className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 transition">
                <Heart size={14} className="inline mr-2" /> Acknowledge
              </button>
              
              {metric.platform === 'whatsapp' && (
                <button 
                  onClick={() => setReplyingTo(replyingTo === metric.user_name ? null : metric.user_name)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200"
                >
                  Quick Reply
                </button>
              )}
            </div>

            {/* Quick Reply Textarea for Evolution API */}
            {replyingTo === metric.user_name && (
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl animate-in slide-in-from-top-2">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message to send via Evolution Gateway..."
                  className="w-full p-3 bg-white rounded-xl border-none text-sm font-medium focus:ring-2 focus:ring-blue-400 mb-3"
                  rows={2}
                />
                <button 
                  disabled={isSending}
                  onClick={() => handleEvolutionReply(metric)}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send via WhatsApp
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SocialEngagementFeed;
