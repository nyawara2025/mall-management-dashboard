import React from 'react';
import { 
  Users, 
  Megaphone, 
  TrendingUp, 
  MessageSquare, 
  MapPin, 
  Heart,
  BarChart3,
  Share2
} from 'lucide-react';

interface PoliticalDashboardProps {
  onViewChange: (view: string) => void;
}

export function PoliticalDashboard({ onViewChange }: PoliticalDashboardProps) {
  // Mock data - in production, fetch this from your Supabase 'campaign_stats' view
  const stats = [
    { label: 'Voter Reach', value: '45.2k', icon: Users, color: 'text-blue-600', trend: '+12%' },
    { label: 'Endorsements', value: '12,840', icon: Heart, color: 'text-red-600', trend: '+5.4%' },
    { label: 'Active Ads', value: '24', icon: Megaphone, color: 'text-purple-600', trend: 'Steady' },
    { label: 'Engagement', value: '18.5%', icon: MessageSquare, color: 'text-green-600', trend: '+2.1%' },
  ];

  const quickActions = [
    { id: 'manifestos', title: 'Manage Manifestos', icon: Megaphone, desc: 'Update policy points' },
    { id: 'analytics', title: 'Voter Insights', icon: BarChart3, desc: 'Demographic breakdown' },
    { id: 'visitor-engagement', title: 'Town Hall Chats', icon: MessageSquare, desc: 'Respond to voters' },
    { id: 'qr-generation', title: 'Rally QR Codes', icon: Share2, desc: 'Check-in at events' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Command Centre</h2>
          <p className="text-gray-500">Real-time mobilization and voter sentiment tracking.</p>
        </div>
        <button 
          onClick={() => onViewChange('campaigns')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Launch New Ad
        </button>
      </div>

      {/* 2. Key Metrics (Tracking Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Action Grid (Sub-view Navigation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onViewChange(action.id)}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-left group"
              >
                <action.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Geographical Reach / Constituency Map Widget */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" /> Constituency Hotspots
          </h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
            {/* Replace this div with a small SVG map or Chart.js component */}
            <p className="text-sm text-gray-400 text-center px-4">
              Interactive Map of Voter Engagement by Ward coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
