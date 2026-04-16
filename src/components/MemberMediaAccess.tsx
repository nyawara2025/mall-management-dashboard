import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Image as ImageIcon, Video, Download, X, Bell } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  file_url: string;
  category: 'video' | 'document' | 'image' | 'sermon_media';
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shopId: number;
}

export const MemberMediaAccess = ({ isOpen, onClose, shopId }: Props) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchMedia();
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('church_media')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (!error) setMedia(data || []);
    setLoading(false);
  };

  if (!isOpen) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case 'video': return <Video className="text-red-500" />;
      case 'image': return <ImageIcon className="text-blue-500" />;
      default: return <FileText className="text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[85vh] sm:h-auto sm:max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" /> Newsletters
            </h2>
            <p className="text-xs text-gray-500 font-medium">Updates & Church Media</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">No updates found yet.</p>
            </div>
          ) : (
            media.map((item) => (
              <div key={item.id} className="group bg-gray-50 hover:bg-blue-50 p-4 rounded-2xl border border-gray-100 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    {getIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      {new Date(item.created_at).toLocaleDateString()} • {item.category}
                    </p>
                  </div>
                </div>
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-white text-blue-600 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all border border-blue-50"
                >
                  <Download size={18} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
