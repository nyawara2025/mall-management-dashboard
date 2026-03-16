import React, { useState } from 'react';
import { Save, Plus, Trash2, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ManifestoManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [pillar, setPillar] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    const payload = {
      shop_id: (user as any)?.shop_id,
      category: 'political',
      pillar_title: pillar,
      policy_details: content,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/manage-manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus('success');
        setPillar('');
        setContent('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Manifesto Pillars</h2>
            <p className="text-gray-500 text-sm">Define your key campaign promises and policy positions.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pillar Title (e.g., Agricultural Reform)</label>
            <input 
              type="text" 
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter the main theme of this policy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Policy Statement</label>
            <textarea 
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe your plan for this pillar in detail..."
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            {status === 'success' && <span className="text-green-600 text-sm font-medium">✓ Pillar updated successfully!</span>}
            {status === 'error' && <span className="text-red-600 text-sm font-medium">Failed to update. Try again.</span>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish to Manifesto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
