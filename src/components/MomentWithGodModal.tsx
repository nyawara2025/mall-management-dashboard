import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Mic, Play, ChevronDown, Loader2 } from 'lucide-react';

interface MomentWithGodModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  shopId: number;
}

export const MomentWithGodModal = ({ isOpen, onClose, userData, shopId }: MomentWithGodModalProps) => {
  const [activeTab, setActiveTab] = useState<'spiritual' | 'sermons'>('spiritual');
  const [selectedCategory, setSelectedCategory] = useState('Personal Devotionals');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const SPIRITUAL_CATEGORIES = [
    'Personal Devotionals',
    'Guided Prayer & Reflection',
    'Scripture Engagement',
    'Personal Growth'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Horizontal Tab Header */}
        <div className="flex bg-gray-50 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('spiritual')}
            className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === 'spiritual' ? 'bg-white text-blue-600' : 'text-gray-400'
            }`}
          >
            <Sparkles size={16} /> Spiritual Moments
          </button>
          <button 
            onClick={() => setActiveTab('sermons')}
            className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === 'sermons' ? 'bg-white text-blue-600' : 'text-gray-400'
            }`}
          >
            <Mic size={16} /> Pastoral Sermons
          </button>
          <button onClick={onClose} className="px-6 text-gray-300 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 min-h-[400px]">
          {activeTab === 'spiritual' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Divine Connection</h3>
                <p className="text-xs text-gray-400 font-bold uppercase">Select a moment for reflection</p>
              </div>

              {/* Custom Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-5 bg-gray-50 rounded-2xl flex items-center justify-between font-black text-sm text-gray-700 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-500" size={18} />
                    {selectedCategory}
                  </div>
                  <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden">
                    {SPIRITUAL_CATEGORIES.map((cat) => (
                      <button 
                        key={cat}
                        className="w-full p-4 text-left text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors border-b last:border-none border-gray-50"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-center">
                <p className="text-center text-blue-600 font-bold text-sm italic">
                  "Draw near to God, and He will draw near to you."
                </p>
              </div>
              
              <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                BEGIN REFLECTION
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Pastoral Archive</h3>
                <p className="text-xs text-gray-400 font-bold uppercase">Listen to past Sunday messages</p>
              </div>

              {/* Placeholder for Sermon List */}
              <div className="space-y-3">
                {[
                  { title: "The Power of Faith", date: "April 20, 2026", speaker: "Canon Jane" },
                  { title: "Walking in Love", date: "April 13, 2026", speaker: "Rev. Philip" }
                ].map((sermon, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{sermon.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{sermon.speaker} • {sermon.date}</p>
                    </div>
                    <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Play size={16} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
