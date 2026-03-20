import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, phone: string) => Promise<void>;
  candidateName: string;
  mode: 'ai' | 'critique';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  candidateName, 
  mode 
}) => {
  const [text, setText] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAI = mode === 'ai';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(text, phone);
    setIsSubmitting(false);
    setText('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900">
              {isAI ? '🤖 Ask Manifesto AI' : '📝 Share Feedback'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            {isAI 
              ? `Ask anything about ${candidateName}'s manifesto.` 
              : `Your critique will be sent directly to ${candidateName}'s team.`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Your Question/Thoughts</label>
              <textarea
                required
                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700"
                placeholder={isAI ? "e.g. How will you improve irrigation?" : "e.g. I suggest more focus on youth..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">WhatsApp Number (Optional)</label>
              <input
                type="tel"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                placeholder="e.g. 254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition ${isAI ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isSubmitting ? 'Sending...' : isAI ? 'Ask AI' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
