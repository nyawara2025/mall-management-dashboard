import React, { useState, useRef } from 'react';
import { Save, Loader2, BookOpen, Upload, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ManifestoManager() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'uploading'>('idle');
  
  const [pillar, setPillar] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    // 1. Create FormData to bundle text and files
    const formData = new FormData();
    formData.append('shop_id', (user as any)?.shop_id || "");
    formData.append('category', 'political');
    formData.append('pillar_title', pillar);
    formData.append('policy_details', content);
    formData.append('timestamp', new Date().toISOString());
    
    if (selectedFile) {
      setStatus('uploading');
      // Append the actual PDF file
      formData.append('manifesto_pdf', selectedFile);
    }

    try {
      // 2. Submit to n8n (Production URL recommended)
      const response = await fetch('https://n8n.tenear.com/webhook/manage-manifesto', {
        method: 'POST',
        // IMPORTANT: Do NOT set 'Content-Type' header when sending FormData
        body: formData,
      });

      if (response.ok) {
        setStatus('success');
        setPillar('');
        setContent('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        console.error("Server responded with error status:", response.status);
        setStatus('error');
      }
    } catch (err) {
      console.error("Submission failed:", err);
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
            <h2 className="text-2xl font-bold text-gray-900">Manage Manifesto</h2>
            <p className="text-gray-500 text-sm">Update your policy pillars and upload your official PDF document.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pillar Title</label>
                <input 
                  type="text" 
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  placeholder="e.g. Sustainable Agriculture"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF Manifesto (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                  {selectedFile ? (
                    <>
                      <FileText className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-green-700 truncate max-w-full px-2">{selectedFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">Click to upload official PDF</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary Statement</label>
              <textarea 
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                placeholder="Briefly describe this policy pillar..."
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex flex-col">
              {status === 'success' && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Published to Hub!</span>}
              {status === 'uploading' && <span className="text-blue-600 text-sm font-medium animate-pulse">Uploading PDF...</span>}
              {status === 'error' && <span className="text-red-600 text-sm font-medium">Failed to update. Check connection.</span>}
            </div>
            
            <button 
              type="submit" 
              disabled={loading || status === 'uploading'}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save and Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
