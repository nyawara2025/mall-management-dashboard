import React from 'react';
import { 
  Sprout, Droplets, Wheat, Truck, FileText, Tractor, 
  Share2, TrendingUp, Beef, ThermometerSun, Wallet, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AgriDashboard = () => {
  const { user } = useAuth();
  
  const marketPrices = [
    { crop: 'Maize (90kg)', price: 'KES 3,400', trend: 'down' },
    { crop: 'Tomatoes (Crate)', price: 'KES 5,500', trend: 'up' },
    { crop: 'Cabbages (Head)', price: 'KES 45', trend: 'stable' },
  ];

  const stats = [
  { label: 'Soil Health', value: '88%', change: '+2% health', icon: Sprout, color: 'bg-green-100 text-green-600', type: 'increase' },
  { label: 'Irrigation', value: 'Active', change: 'Optimal flow', icon: Droplets, color: 'bg-blue-100 text-blue-600', type: 'neutral' },
  { label: 'Crop Yield', value: '12.4t', change: '+1.2t vs last year', icon: Wheat, color: 'bg-yellow-100 text-yellow-600', type: 'increase' },
  { label: 'Livestock', value: '12 Beef', change: '85L Milk/Day', icon: Beef, color: 'bg-indigo-100 text-indigo-600', type: 'increase' },
  { label: 'M-Pesa Balance', value: 'KES 14.2k', change: 'Updated 2m ago', icon: Wallet, color: 'bg-emerald-100 text-emerald-600', type: 'neutral' }
];

  const sendWhatsAppAlert = (type: string) => {
    console.log(`Triggering Evolution API for: ${type}`);
    alert(`WhatsApp ${type} alert sent via Evolution API Gateway!`);
  };

  return (
    <div className="p-6 bg-[#FFF8F1] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Farm Administration</h1>
          <p className="text-blue-600 font-medium flex items-center gap-2">
            <CheckCircle2 size={16}/> Sustainable Growth & Precision Farming
          </p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Weather Forecast</p>
            <p className="text-sm font-bold text-gray-800">28°C • Sunny (Nairobi)</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
            <ThermometerSun size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`p-2 w-fit rounded-xl ${stat.color} mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-[10px] mt-1 font-medium ${stat.type === 'increase' ? 'text-green-500' : stat.type === 'decrease' ? 'text-red-500' : 'text-gray-400'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" /> Live Market Prices
            </h3>
            <div className="space-y-3">
              {marketPrices.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">{item.crop}</span>
                  <span className={`text-sm font-bold ${item.trend === 'up' ? 'text-red-500' : 'text-green-600'}`}>
                    {item.price} {item.trend === 'up' ? '↑' : '↓'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 text-indigo-600">
              <Beef size={18}/> Livestock Alerts
            </h3>
            <div className="p-3 border-l-4 border-orange-400 bg-orange-50 rounded-r-xl">
              <p className="text-xs font-bold text-orange-800">Vaccination Due</p>
              <p className="text-[10px] text-orange-700">FMD Booster (Beef #04, #09)</p>
              <button onClick={() => sendWhatsAppAlert('Vaccination Reminder')} className="mt-2 text-[10px] font-bold underline text-orange-900">Notify Vet</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">$ Operations Ledger</h2>
              <p className="text-xs text-gray-400">Automated tracking via M-Pesa</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[10px] bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-bold border border-blue-100 flex items-center gap-1">
                <FileText size={14}/> PDF
              </button>
              <button onClick={() => sendWhatsAppAlert('Daily Summary')} className="text-[10px] bg-green-50 text-green-700 px-3 py-2 rounded-lg font-bold border border-green-100 flex items-center gap-1">
                <Share2 size={14}/> Share
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['Harvesting', 'Inputs', 'Labor', 'Fuel'].map(cat => (
              <button key={cat} className="group flex flex-col items-center py-6 px-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-all border border-transparent hover:border-green-100">
                <span className="text-sm font-bold text-gray-600 group-hover:text-green-700">{cat}</span>
                <span className="text-[10px] text-gray-400 mt-1">Add Entry</span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-50 pt-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Recent M-Pesa Logs</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Truck size={16}/></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Diesel Purchase</p>
                  <p className="text-[10px] text-gray-400">Ref: RKX0921M</p>
                </div>
                <span className="text-sm font-bold text-red-600">- KES 4,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
