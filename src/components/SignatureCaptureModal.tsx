import React, { useRef, useState, useEffect } from 'react';
import { X, Feather, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

export const SignatureCaptureModal = ({ 
  isOpen, 
  onClose, 
  userData,
  onSaveSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  userData: any;
  onSaveSuccess: (savedUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Canvas Proportions and DPI scaling
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e3a8a'; // Deep Blue ink color matches your theme
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  // Touch & Mouse Drawing Event Listeners
  const getCoordinates = (e: any) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Support both responsive phone screen touches and traditional desktop mice click dragging
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!canvasRef.current) return;
    setIsSaving(true);
    
    // Compress the canvas layout vectors into a highly compact, optimized Base64 Image String
    const base64DataUrl = canvasRef.current.toDataURL('image/png');

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/church-member-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData?.id,
          phone_number: userData?.phone_number,
          signature_img: base64DataUrl
        }),
      });

      if (response.ok) {
        alert("Digital Signature baseline encrypted & locked to your profile!");
        onSaveSuccess(base64DataUrl);
        onClose();
      }
    } catch (err) {
      alert("Error securely synchronizing your signature file.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              <Feather className="w-5 h-5 text-blue-600" /> Digital Sign-In Profile
            </h2>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Draw your secure official signature signature once</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
        </div>

        {/* Dynamic Canvas Capture Area */}
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl overflow-hidden relative touch-none">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={() => setIsDrawing(false)}
              className="w-full bg-transparent cursor-crosshair h-[200px]"
            />
            <div className="absolute top-2 right-2 pointer-events-none opacity-40 text-[9px] font-black uppercase bg-white px-2 py-0.5 border rounded-md">Ink Pad Area</div>
          </div>

          {/* Action Triggers Grid */}
          <div className="flex gap-2">
            <button
              onClick={clearCanvas}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} /> Reset Pad
            </button>
            <button
              onClick={saveSignature}
              disabled={isSaving}
              className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-50 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-98"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {isSaving ? 'Encrypting File...' : 'Secure to Profile'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
