import React, { useState } from 'react';
import { BookOpen, Send, Plus, Trash2, LayoutGrid, Type } from 'lucide-react';

interface Activity {
  activity_name: string;
  description: string;
}

interface SubjectEntry {
  subject: string;
  title: string;
  activities: Activity[];
}

export const EducationalDashboard = ({ shopId }: { shopId: number }) => {
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // High-level state: Array of Subjects
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { subject: '', title: '', activities: [{ activity_name: '', description: '' }] }
  ]);

  // --- Subject Management ---
  const addSubject = () => {
    setSubjects([...subjects, { subject: '', title: '', activities: [{ activity_name: '', description: '' }] }]);
  };

  const removeSubject = (sIdx: number) => {
    setSubjects(subjects.filter((_, i) => i !== sIdx));
  };

  const updateSubject = (sIdx: number, field: keyof Omit<SubjectEntry, 'activities'>, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx][field] = value;
    setSubjects(newSubjects);
  };

  // --- Activity Management (Nested) ---
  const addActivity = (sIdx: number) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx].activities.push({ activity_name: '', description: '' });
    setSubjects(newSubjects);
  };

  const updateActivity = (sIdx: number, aIdx: number, field: keyof Activity, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx].activities[aIdx][field] = value;
    setSubjects(newSubjects);
  };

  const removeActivity = (sIdx: number, aIdx: number) => {
    const newSubjects = [...subjects];
    newSubjects[sIdx].activities = newSubjects[sIdx].activities.filter((_, i) => i !== aIdx);
    setSubjects(newSubjects);
  };

  const handlePostHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/upload-school-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          due_date: dueDate,
          shop_id: shopId,
          payload: subjects // Sending the entire nested structure
        }),
      });

      if (response.ok) {
        alert("Daily Agenda posted & WhatsApp notifications triggered!");
        setSubjects([{ subject: '', title: '', activities: [{ activity_name: '', description: '' }] }]);
      }
    } catch (error) {
      console.error("Failed to post homework:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
              <BookOpen className="text-blue-600" size={28} /> Post Daily Agenda
            </h3>
            <p className="text-gray-500">Combine all subjects into one notification</p>
          </div>
          <input 
            type="date" 
            className="p-3 border-2 border-blue-50 rounded-2xl font-bold text-blue-600 focus:outline-none focus:border-blue-400" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />
        </div>

        <form onSubmit={handlePostHomework} className="space-y-10">
          {subjects.map((s, sIdx) => (
            <div key={sIdx} className="relative p-6 rounded-2xl border-2 border-gray-50 bg-white shadow-sm transition-all hover:border-blue-100">
              {/* Subject Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mr-4">
                  <div className="relative">
                    <LayoutGrid className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl font-bold" 
                      placeholder="Subject (e.g. Science)" 
                      value={s.subject} 
                      onChange={e => updateSubject(sIdx, 'subject', e.target.value)}
                      required 
                    />
                  </div>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl" 
                      placeholder="Topic (e.g. Photosynthesis)" 
                      value={s.title} 
                      onChange={e => updateSubject(sIdx, 'title', e.target.value)}
                      required 
                    />
                  </div>
                </div>
                {subjects.length > 1 && (
                  <button type="button" onClick={() => removeSubject(sIdx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Nested Activities */}
              <div className="ml-4 space-y-3 border-l-4 border-blue-50 pl-6 py-2">
                {s.activities.map((a, aIdx) => (
                  <div key={aIdx} className="group relative bg-blue-50/30 p-4 rounded-xl">
                    <div className="flex gap-3 mb-2">
                      <input 
                        className="flex-1 p-2 bg-white border rounded-lg text-sm font-bold" 
                        placeholder="Item (e.g. Lab Report)" 
                        value={a.activity_name} 
                        onChange={e => updateActivity(sIdx, aIdx, 'activity_name', e.target.value)}
                        required 
                      />
                      {s.activities.length > 1 && (
                        <button type="button" onClick={() => removeActivity(sIdx, aIdx)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <textarea 
                      className="w-full p-2 bg-white border rounded-lg text-sm text-gray-600" 
                      placeholder="Specific details..." 
                      rows={2}
                      value={a.description} 
                      onChange={e => updateActivity(sIdx, aIdx, 'description', e.target.value)}
                      required
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addActivity(sIdx)} className="mt-2 text-blue-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-800">
                  <Plus size={14} /> Add Task to {s.subject || 'Subject'}
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-4 pt-6 border-t-2 border-dashed border-gray-100">
            <button type="button" onClick={addSubject} className="w-full py-4 border-2 border-blue-600 border-dashed rounded-2xl text-blue-600 font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
              <Plus size={20} /> Add Another Subject
            </button>
            
            <button disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50">
              <Send size={24} /> {loading ? 'Publishing Everything...' : 'Post Daily Agenda & Notify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
