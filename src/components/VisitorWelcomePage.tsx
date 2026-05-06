import React, { useState } from 'react';
import { VisitorForm } from './VisitorForm'; // Ensure this matches your filename
import { CheckCircle2 } from 'lucide-react';

// Using a Named Export to match your App.tsx import
export const VisitorWelcomePage = ({ shopId }: { shopId: number }) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-8 space-y-8">
      {!hasCheckedIn ? (
        <>
          <div className="text-center">
             {/* St. Barnabas Logo */}
            <img 
              src="https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church-logos/StBarnanasGoldenFinal27apr.jpeg" 
              className="w-20 h-20 mx-auto mb-4 drop-shadow-sm" 
              alt="St. Barnabas Logo"
            />
            <h2 className="text-2xl font-black text-gray-800 leading-tight">Welcome Home!</h2>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-2">
              ACK St. Barnabas Otiende
            </p>
          </div>
          
          <VisitorForm onComplete={() => setHasCheckedIn(true)} />
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100 text-green-700">
            <CheckCircle2 size={24} className="flex-shrink-0" />
            <p className="font-bold text-sm text-left leading-tight">
              Praise God! You are checked in. Here is today's Order of Service.
            </p>
          </div>

          {/* Placeholder for your existing Service Activities logic */}
          <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <p className="text-center text-gray-400 font-bold italic">
               (Your English Service Schedule will render here)
             </p>
          </div>
        </div>
      )}
    </div>
  );
};
