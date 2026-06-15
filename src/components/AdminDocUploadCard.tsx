import React, { useState, useRef } from 'react';
import { FileUp, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

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
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[1.5rem] p-4 border border-slate-800 shadow-xl min-h-[110px] flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-black tracking-wider flex items-center gap-1.5 uppercase text-left">
          <FileText className="w-3.5 h-3.5 text-blue-500" /> Knowledge RAG Core
        </h3>
        <p className="text-[11px] opacity-75 font-medium leading-tight text-left mt-0.5 line-clamp-2">
          Upload parish minutes, constitutions, or canon files to train your custom Church AI.
        </p>
      </div>

      <input 
        type="file" 
        ref={fileRef} 
        accept=".pdf,.docx,.txt" 
        className="hidden" 
        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
      />

      {/* Ultra-compact Upload Zone */}
      <div 
        onClick={() => fileRef.current?.click()} 
        className="mt-2 py-1.5 px-3 rounded-xl border border-dashed border-slate-800 hover:border-blue-500 bg-slate-950 text-center cursor-pointer transition-all flex items-center justify-center gap-2"
      >
        <FileUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span className="text-[11px] font-bold text-slate-300 truncate max-w-[150px]">
          {file ? file.name : "Select Document"}
        </span>
      </div>

      {status === 'success' && (
        <div className="mt-1 text-emerald-400 text-[10px] font-bold flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3" /> Vectorized!</div>
      )}
      {status === 'error' && (
        <div className="mt-1 text-rose-400 text-[10px] font-bold flex items-center gap-1 justify-center truncate"><AlertCircle className="w-3 h-3" /> {msg}</div>
      )}

      {/* Process Button adjusted to mirror operational cards layout safely */}
      <button 
        type="button" 
        disabled={!file || status === 'loading'} 
        onClick={handleUploadSubmit} 
        className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all"
      >
        {status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Process Document'}
      </button>
    </div>
  );
};
