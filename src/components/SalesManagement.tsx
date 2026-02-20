import React, { useState } from 'react';
import { BarChart3, Printer, Database, Calendar, Filter, ChevronDown } from 'lucide-react';

interface SalesManagementProps {
  shopId: string;
  onBack: () => void;
}

const SalesManagement: React.FC<SalesManagementProps> = ({ shopId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'extract' | 'reports' | 'query'>('extract');

  // Helper to trigger n8n workflows
  const triggerN8n = async (action: string, data: any) => {
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/manage-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, shop_id: shopId, ...data })
      });
      // Handle response (e.g., download CSV, show toast)
    } catch (error) {
      console.error("Workflow failed:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
          <p className="text-gray-500">Manage data, reports, and database queries for Shop ID: {shopId}</p>
        </div>
        <button onClick={onBack} className="text-blue-600 hover:underline font-medium">
          ← Back to Dashboard
        </button>
      </div>

      {/* Sub-Navigation */}
      <div className="flex gap-4 border-b border-gray-200 mb-8">
        {(['extract', 'reports', 'query'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 capitalize font-medium transition-colors ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'extract' && (
          <>
            <ActionCard 
              title="Periodic Extraction" 
              desc="Download CSV for Daily, Weekly, or Monthly sales."
              icon={<Calendar className="w-5 h-5" />}
              onClick={() => triggerN8n('extract_periodic', { period: 'monthly' })}
              options={['Daily', 'Weekly', 'Monthly']}
            />
            <ActionCard 
              title="Location-Based" 
              desc="Filter by Online Store vs. Physical PoS."
              icon={<Filter className="w-5 h-5" />}
              onClick={() => triggerN8n('extract_location', { type: 'pos' })}
              options={['Online', 'PoS', 'All']}
            />
          </>
        )}

        {activeTab === 'reports' && (
          <ActionCard 
            title="Print Reports" 
            desc="Generate PDF receipts or summary reports."
            icon={<Printer className="w-5 h-5" />}
            onClick={() => window.print()}
          />
        )}

        {activeTab === 'query' && (
          <ActionCard 
            title="Database Query" 
            desc="Run advanced queries on sales & payments."
            icon={<Database className="w-5 h-5" />}
            onClick={() => triggerN8n('run_query', {})}
          />
        )}
      </div>
    </div>
  );
};

// Simple reusable card component
const ActionCard = ({ title, desc, icon, onClick, options }: any) => (
  <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      {options && (
        <select className="text-xs border rounded p-1 bg-gray-50 outline-none">
          {options.map((opt: string) => <option key={opt}>{opt}</option>)}
        </select>
      )}
    </div>
    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-sm text-gray-500 mb-4">{desc}</p>
    <button 
      onClick={onClick}
      className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 text-sm font-medium rounded-md transition-colors"
    >
      Run Action
    </button>
  </div>
);

export default SalesManagement;
