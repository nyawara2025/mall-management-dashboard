import React from 'react';
import { X, Sparkles, Calendar, Users, MessageSquare } from 'lucide-react';

// 1. Updated interface to match your exact parent component props
interface YouthAffairsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any; // Receives your MemberData object
  shopId: number; // Receives activeShopId for your n8n webhooks
}

export default function YouthAffairsModal({ isOpen, onClose, userData, shopId }: YouthAffairsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Youth Affairs Portal</h3>
              <p className="text-xs text-gray-500">Connect, Grow, and Serve</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Feature Hub */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            Welcome to the Youth Ministry hub. Explore upcoming youth events, join discussion circles, or request mentorship programs.
          </p>

          {/* Quick Option Cards */}
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-left group">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-800">Youth Events & Rallies</h4>
                <p className="text-xs text-gray-500">Register for camps, sports nights, and praise sessions.</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-purple-50/50 hover:border-purple-200 transition-all text-left group">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-800">Peer Mentorship Circles</h4>
                <p className="text-xs text-gray-500">Get paired up with group leaders and spiritual mentors.</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all text-left group">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-800">Discussion Board</h4>
                <p className="text-xs text-gray-500">Share insights, ask real life questions, and post anonymous suggestions.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
}
