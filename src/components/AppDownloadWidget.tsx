import React, { useState } from 'react';
import { Smartphone, Download, QrCode, ShieldCheck } from 'lucide-react';

export const AppDownloadWidget: React.FC = () => {
  const [showQr, setShowQr] = useState(false);

  // Cache-busting parameter ensures clients always pull the freshest upload
  const apkDownloadUrl = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church_material/ChurchMate.apk";
  
  // Fixed template literal syntax and correct qrserver API path
  const qrImageUrl = `https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/product_images/1780024060.095_StBarnabaRegistrationQR_Code.jpg`;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl border border-slate-800 max-w-2xl mx-auto my-6 text-left animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Side: Context Details */}
        <div className="space-y-2 flex-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Smartphone className="w-3.5 h-3.5" /> Official Mobile Release
          </span>
          <h3 className="text-xl font-black tracking-tight md:text-2xl">Download ChurchMate App</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">
            Get instant, borderless access to parish directories, digital sacraments intake pipelines, sermon streaming, and automated M-Pesa offertory tracking.
          </p>
          
          {/* Security Assurance Badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold pt-1">
            <ShieldCheck className="w-4 h-4" /> Verified Aligned Build & Cryptographically Signed
          </div>
        </div>

        {/* Right Side: Interactive Call to Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 justify-center items-center">
          
          {/* Main Action Button for Android Devices */}
          <a
            href={apkDownloadUrl}
            className="w-full sm:w-auto md:w-48 flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-blue-900/30 text-center"
          >
            <Download className="w-4 h-4" /> Download APK
          </a>

          {/* Desktop Helper Toggle Button */}
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="w-full sm:w-auto md:w-48 flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black rounded-xl uppercase tracking-wider transition-all border border-slate-700"
          >
            <QrCode className="w-4 h-4" /> {showQr ? "Hide QR Code" : "Scan QR Code"}
          </button>
        </div>
      </div>

      {/* Conditionally Toggled Dynamic QR Panel Viewport */}
      {showQr && (
        <div className="mt-6 p-5 bg-white rounded-2xl border border-slate-800/40 flex flex-col sm:flex-row items-center gap-5 animate-in slide-in-from-top-3 duration-200">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 shrink-0">
            <img 
              src={qrImageUrl} 
              alt="Scan to download ChurchMate App" 
              className="w-32 h-32 select-none"
              loading="lazy"
            />
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="text-sm font-black text-slate-900">Browsing on a Laptop or Desktop?</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
              Point your Android device camera application directly at this matrix image pattern. It will instantly parse the package link path and begin your download stream.
            </p>
            <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl text-[10px] font-semibold flex items-start gap-1.5 border border-blue-100 mt-2">
              <img src="data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231e40af' stroke-width='2.5'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/></svg>" className="w-3.5 h-3.5 mt-0.5" alt="info"/>
              <span>If your device displays an "Unknown Sources" warning during installation, click *Settings &gt; Allow installation from this source* to authorize your parish package.</span>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
