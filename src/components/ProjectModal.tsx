import React, { useState } from 'react';
import { X, Loader2, Upload, DollarSign, Users, MapPin, Tag } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string | number | undefined;
}

export default function ProjectModal({ isOpen, onClose, shopId }: ProjectModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [projectData, setProjectData] = useState({
    project_name: '',
    project_details: '',
    type: 'planned',
    location: '',
    category: 'Sanctuary',
    estimated_cost: '',
    funds_available: '',
    donors: '',
    start_date: '',
    planned_enddate: ''
  });

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    Object.entries(projectData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('shop_id', String(shopId || ''));
    if (file) formData.append('file', file);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-project-create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("Project uploaded successfully!");
        onClose(); // Close the modal on success
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error uploading project.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-800">New Campaign Project</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Shop ID: {shopId}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition">
            <X className="text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          
          {/* Type Toggle */}
          <div className="flex gap-4 p-1.5 bg-gray-100 rounded-2xl">
            {['current', 'planned'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setProjectData({ ...projectData, type: t })}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                  projectData.type === t ? 'bg-white shadow-md text-blue-600' : 'text-gray-500'
                }`}
              >
                {t.toUpperCase()} PROJECT
              </button>
            ))}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              required
              placeholder="Project Name"
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none font-bold focus:border-blue-500 transition-colors"
              onChange={(e) => setProjectData({ ...projectData, project_name: e.target.value })}
            />
            <select 
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none font-bold bg-white"
              onChange={(e) => setProjectData({ ...projectData, category: e.target.value })}
            >
              <option value="Sanctuary">Sanctuary</option>
              <option value="Education">Education</option>
              <option value="Social">Social Outreach</option>
            </select>
          </div>

          <textarea
            required
            placeholder="Detailed description of the project impact..."
            className="w-full h-32 p-4 border-2 border-gray-100 rounded-2xl outline-none resize-none font-medium focus:border-blue-500 transition-colors"
            onChange={(e) => setProjectData({ ...projectData, project_details: e.target.value })}
          />

          {/* Costing */}
          <div className="grid grid-cols-2 gap-5">
            <div className="relative">
              <DollarSign className="absolute left-4 top-4.5 size-4 text-gray-400" />
              <input 
                type="number" 
                placeholder="Est. Cost" 
                className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl" 
                onChange={(e) => setProjectData({ ...projectData, estimated_cost: e.target.value })} 
              />
            </div>
            <div className="relative">
              <Users className="absolute left-4 top-4.5 size-4 text-gray-400" />
              <input 
                placeholder="Main Donors" 
                className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl"
                onChange={(e) => setProjectData({ ...projectData, donors: e.target.value })} 
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="border-4 border-dotted border-gray-100 rounded-3xl p-8 text-center hover:border-blue-200 transition-colors bg-gray-50/50">
            <input 
              type="file" 
              id="proj-file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            <label htmlFor="proj-file" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="p-4 bg-white shadow-sm rounded-2xl">
                <Upload className="text-blue-500" />
              </div>
              <span className="font-black text-gray-600">
                {file ? file.name : "Upload Project Image/Blueprint"}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isUploading ? <><Loader2 className="animate-spin" /> Publishing...</> : 'Save & Publish Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
