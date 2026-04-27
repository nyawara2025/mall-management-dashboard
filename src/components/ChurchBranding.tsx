import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ChurchBrandingProps {
  departmentName: string;
}

export const ChurchBranding: React.FC<ChurchBrandingProps> = ({ departmentName }) => {
  const { user } = useAuth();

  // In a real multi-tenant app, these would come from user.churchName and user.logoUrl
  const churchName = "St. Barnabas Anglican Church, Otiende - The home of encouragement!";
  const logoUrl = "https://ufrrlfcxuovxgizxuowh.supabase.co/storage/v1/object/public/church-logos/StBarnanasGoldenFinal27apr.jpeg";

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl italic text-gray-700 tracking-tight font-['Century_Gothic']">
          {departmentName}
        </h1>
        <h2 className="text-lg font-semibold italic text-blue-600 mt-0 font-['Century_Gothic']">
          {churchName}
        </h2>
      </div>

      {user?.shop_id && (
        <div className="flex items-center">
          <img
            src={logoUrl}
            alt="Church Logo"
            className="h-30 w-40 object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-church.png";
            }}
          />
        </div>
      )}
    </div>
  );
};
