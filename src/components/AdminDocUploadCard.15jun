import React, { useState, useRef } from 'react';
import { FileUp, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

// 1. Add userId to the component interface definitions
interface UploadCardProps {
  shopId: number;
  userId: string | number;
}

export const AdminDocUploadCard: React.FC<UploadCardProps> = ({ shopId, userId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUploadSubmit = async () => {
    if (!file) return;
    setStatus('loading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('shop_id', shopId.toString());

      // 2. Append the user_id text payload safely to the multiform boundary
      formData.append('user_id', userId.toString());

      const response = await fetch('https://n8n.tenear.com/webhook/upload-church-rag', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload rejected by pipeline');
      
      setStatus('success');
      setFile(null);
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || 'Transmission anomaly.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2rem] p-6 border border-slate-800 shadow-xl min-h-[295px] flex flex-col justify-between">
      <div>
        <h3 className="text-base font-black tracking-tight flex items-center gap-2 uppercase">
          <FileText className="w-5 h-5 text-blue-500" /> Knowledge RAG Core
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Upload parish minutes, constitutions, or canon files to train your custom Church AI.
        </p>
      </div>

      <input 
        type="file" ref={fileRef} accept=".pdf,.docx,.txt" className="hidden"
        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
      />

      <div 
        onClick={() => fileRef.current?.click()}
        className="mt-3 p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500 bg-slate-950 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
      >
        <FileUp className="w-6 h-6 text-slate-500" />
        <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
          {file ? file.name : "Select PDF, DOCX, or TXT"}
        </span>
      </div>

      {status === 'success' && (
        <div className="mt-2 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Vectorized!</div>
      )}
      {status === 'error' && (
        <div className="mt-2 text-rose-400 text-[10px] font-bold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {msg}</div>
      )}

      <button
        type="button" disabled={!file || status === 'loading'} onClick={handleUploadSubmit}
        className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-xs font-black rounded-xl uppercase tracking-wider transition-all"
      >
        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process Document'}
      </button>
    </div>
  );
};
