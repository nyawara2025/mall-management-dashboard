import React from 'react';
import { Globe, DollarSign, Calendar, Users } from 'lucide-react';

export function DiasporaManager({ shopId }: { shopId: string }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-primary-600" />
        <h2 className="text-2xl font-bold">Diaspora Engagement Hub</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fundraising Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <DollarSign className="w-6 h-6 text-green-600 mb-4" />
          <h3 className="font-semibold">US Dollar Contributions</h3>
          <p className="text-sm text-gray-500 mb-4">Generate Stripe or PayPal links for Diaspora donors.</p>
          <button className="w-full py-2 bg-green-600 text-white rounded-lg">Create Link</button>
        </div>

        {/* Town Hall Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <Calendar className="w-6 h-6 text-blue-600 mb-4" />
          <h3 className="font-semibold">Virtual Town Halls</h3>
          <p className="text-sm text-gray-500 mb-4">Schedule Zoom/Meet sessions (ET/PT Timezones).</p>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Schedule Session</button>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <Users className="w-6 h-6 text-purple-600 mb-4" />
          <h3 className="font-semibold">Diaspora Broadcast</h3>
          <p className="text-sm text-gray-500 mb-4">Send tailored WhatsApp updates via Evolution API.</p>
          <button className="w-full py-2 bg-purple-600 text-white rounded-lg">Send Update</button>
        </div>
      </div>
    </div>
  );
}
