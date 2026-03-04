import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Share2, Loader2, Smartphone, Globe } from 'lucide-react';

const ShopAnalytics = ({ shopId }: { shopId: number }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://n8n.tenear.com/webhook/shop-product-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: shopId }),
        });
        const result = await response.json();
        
        // Ensure we store the actual object rather than the array wrapper
        if (Array.isArray(result) && result.length > 0) {
          setAnalytics(result[0]); 
        } else {
          setAnalytics(result);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) fetchAnalytics();
  }, [shopId]);

  if (loading || !analytics) return (
    <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Card 1: Total Engagement */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Share2 size={20} />
          <span className="font-bold">Total Engagement</span>
        </div>
        <div className="text-2xl font-black">
          {analytics?.chartData?.reduce((acc: number, curr: any) => acc + (curr.total_engagement || 0), 0) || 0}
        </div>
      </div>

      {/* Card 2: Top Platform */}
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 text-purple-600 mb-2">
          <Smartphone size={20} />
          <span className="font-bold">Top Platform</span>
        </div>
        <div className="text-2xl font-black capitalize">{analytics.mostPopular || 'N/A'}</div>
        <p className="text-[10px] text-purple-400 font-bold uppercase mt-1">Most views source</p>
      </div>

      {/* Card 3: WhatsApp vs Others */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <Globe size={20} />
          <span className="font-bold">Network Reach</span>
        </div>
        <div className="text-2xl font-black">
          {analytics?.platformStats ? Object.keys(analytics.platformStats).length : 0} Channels
        </div>
      </div>

      {/* Chart Section */}
      <div className="md:col-span-3 h-80 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold mb-4 text-gray-800">Product Performance</h3>
        {analytics?.chartData?.length > 0 ? (
          <div className="h-64 w-full"> 
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="product_name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          
                {analytics.availablePlatforms?.map((platform: string, index: number) => (
                  <Bar 
                    key={platform} 
                    dataKey={platform} 
                    stackId="a" 
                    fill={["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"][index % 5]} 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 italic">No data to display</div>
        )}
      </div>
    </div>
  );
};

export default ShopAnalytics;
