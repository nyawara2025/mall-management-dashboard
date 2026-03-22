import React, { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | number | undefined;
}

export default function ProjectModal({ isOpen, onClose, shopId }: ProjectModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    type: 'planned', // 'current' or 'planned'
    location: '',
  });
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('type', projectData.type);
    formData.append('location', projectData.location);
    formData.append('shop_id', shopId?.toString() || '');
    if (file) formData.append('file', file);

    try {
      const response = await fetch('https://n8n.tenear.com', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Project uploaded successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error uploading project.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Campaign Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
            {['current', 'planned'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setProjectData({ ...projectData, type: t })}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                  projectData.type === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)} Project
              </button>
            ))}
          </div>

          <input
            required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Project Title (e.g. Modern Market Upgrade)"
            onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
          />

          <textarea
            required
            className="w-full h-32 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe the impact and scope..."
            onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
          />

          <input
            className="w-full p-3 border rounded-xl outline-none"
            placeholder="Location (Constituency/Ward)"
            onChange={(e) => setProjectData({ ...projectData, location: e.target.value })}
          />

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
            <input
              type="file"
              id="proj-file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="proj-file" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="text-gray-400" />
              <span className="text-sm text-gray-500">{file ? file.name : "Upload Project Image/Blueprint"}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isUploading ? <><Loader2 className="animate-spin" /> Uploading...</> : 'Save Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
