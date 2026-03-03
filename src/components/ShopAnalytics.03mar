import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Share2, Loader2 } from 'lucide-react';

interface AnalyticsData {
  product_name: string;
  total_shares: number;
  shop_id: number;
}

const ShopAnalytics = ({ shopId }: { shopId: number }) => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Sending a POST request with the shop_id in the body
        const response = await fetch('https://n8n.tenear.com/webhook/shop-product-analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shop_id: shopId }),
        });
        
        if (!response.ok) throw new Error('Failed to fetch analytics');
        
        const result = await response.json();
        
        // n8n usually returns an array, but we ensure safety here
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching analytics from n8n:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchAnalytics();
    }
  }, [shopId]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-500 font-medium">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Summary Cards */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Share2 size={20} />
          <span className="font-bold">Total Engagement</span>
        </div>
        <div className="text-2xl font-black">
          {data.reduce((acc, curr) => acc + (Number(curr.total_shares) || 0), 0)}
        </div>
      </div>

      {/* Chart Section */}
      <div className="md:col-span-3 h-64 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold mb-4">Top Shared Products</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {/* Add horizontal grid lines for better readability */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="product_name" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#6b7280', fontWeight: 500 }} 
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              
              />
              {/* Gradient or specific color for the bar */}
              <Bar dataKey="total_shares" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalytics;
