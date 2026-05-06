import React from 'react';

interface ConsentProps {
  hasConsented: boolean;
  setHasConsented: (val: boolean) => void;
}

export const ConsentSection = ({ hasConsented, setHasConsented }: ConsentProps) => {
  return (
    <div className="bg-blue-50/50 rounded-[2rem] p-5 border border-blue-100/50 space-y-4 my-4">
      <div className="space-y-2">
        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
          Data Privacy & Consent
        </h4>
        <p className="text-[9px] text-gray-600 leading-relaxed font-medium">
          Pursuant to the <strong>Kenya Data Protection Act 2019</strong>, ACK St. Barnabas needs your consent to collect your personal data, for official membership records and pastoral care. You have the right to access, correct, or withdraw this consent at any time.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center mt-0.5">
          <input 
            type="checkbox"
            className="w-5 h-5 rounded-md border-2 border-blue-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer appearance-none"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
          />
          {hasConsented && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <span className="text-[10px] font-bold text-gray-700 leading-tight select-none">
          I unequivocally consent to the collection and processing of my personal data for church administration.
        </span>
      </label>
    </div>
  );
};
