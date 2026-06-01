import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Upload, Loader2, FileText, CheckCircle2, AlertCircle, Star, Award } from 'lucide-react';

const N8N_WEBHOOK_URL = 'https://n8n.tenear.com/webhook/church-nairobi-diocese';

interface DioceseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;     // Handled and passed down from parent PublicChurchHub.tsx
  dioceseId?: string;         // Handled and passed down from parent PublicChurchHub.tsx
}

// Custom data definitions matching indicator forms
interface IndicatorRow {
  label: string;
  value: string;
}

const InteractivePillarForm = ({ 
  title, 
  userId, 
  dioceseId 
}: { 
  title: string; 
  userId: string; 
  dioceseId: string; 
}) => {
  const [indicators, setIndicators] = useState<IndicatorRow[]>([]);
  const [impactEvidence, setImpactEvidence] = useState<string>('');
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Read multi-tenant context parameters straight from browser location variables
  const queryParams = new URLSearchParams(window.location.search);
  const shopId = queryParams.get('shop_id') || dioceseId || '68';

  // Initialize explicit structures depending on row name matching
  useEffect(() => {
    const initializeStructure = () => {
      let structure: string[] = [];
      
      if (title.includes("Mission")) {
        structure = [
          "Evangelism Activities Conducted",
          "New Members / Converts",
          "Discipleship Programs",
          "Home Cells Fellowships"
        ];
      } else if (title.includes("Welfare")) {
        structure = [
          "Welfare Support Cases Assisted",
          "Counseling Sessions",
          "Health Programs Conducted",
          "Clergy & Staff Welfare Initiatives"
        ];
      } else if (title.includes("Governance")) {
        structure = [
          "PCC/Finance Meetings Held",
          "Policy Compliance Level",
          "Leadership Trainings",
          "Accountability Structures Strengthened"
        ];
      } else {
        // Dynamic generic fallback pattern matching standard operational schemas
        structure = [
          "Activities Conducted",
          "Total Registered Attendants",
          "Operational Framework Milestones",
          "Resources Mobilized"
        ];
      }

      setIndicators(structure.map(label => ({ label, value: '' })));
    };

    // 1. Fetch live metrics from n8n backend endpoint matrix
    const fetchRowData = async () => {
      if (!userId) return;
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_pillar_data',
            userId,
            shop_id: shopId,
            pillarName: title
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.indicators) {
            setIndicators(data.indicators);
            setImpactEvidence(data.impact_evidence || '');
            setFileUrls(data.file_urls || []);
          } else {
            initializeStructure();
          }
        } else {
          initializeStructure();
        }
      } catch (err) {
        console.error('Failed fetching payload data context:', err);
        initializeStructure();
      }
    };

    fetchRowData();
  }, [title, userId, shopId]);

  const handleInputChange = (index: number, value: string) => {
    const updated = [...indicators];
    updated[index].value = value;
    setIndicators(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userId) return;
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('action', 'upload_pillar_files');
    formData.append('userId', userId);
    formData.append('shop_id', shopId);
    formData.append('pillarName', title);

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData 
      });

      if (!response.ok) throw new Error('Upload failed through intermediary hook.');
      
      const data = await response.json();
      if (data && data.urls) {
        setFileUrls((prev) => [...prev, ...data.urls]);
        setMessage({ type: 'success', text: 'Files staged successfully! Remember to save changes.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'File upload framework failure.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveData = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: 'Session context missing.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_pillar_data',
          userId: userId,
          shop_id: shopId,
          pillarName: title,
          indicators: indicators,
          impact_evidence: impactEvidence,
          file_urls: fileUrls
        })
      });

      if (!response.ok) throw new Error('Backend failed to commit save update.');

      setMessage({ type: 'success', text: 'Data saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed saving content via n8n.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200/60 space-y-5">
      
      {/* 1. Quantitative Metrics Layout - Transformed into spacious full-width textareas */}
      <div>
        <div className="border-b border-gray-200 pb-2 mb-3 bg-gray-100/60 p-3 rounded-lg">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Strategic Pillar Performance & Indicator Results
          </span>
        </div>

        <div className="space-y-4">
          {indicators.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {item.label}
              </label>
              <textarea
                rows={2}
                value={item.value}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                placeholder={`Document specific results or status logs for: ${item.label}...`}
                className="w-full p-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none resize-y min-h-[55px] text-gray-800 font-medium"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Qualitative Impact Block Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Impact (Spiritual & Well-being Growth Evidence Analysis)
        </label>
        <textarea
          rows={3}
          value={impactEvidence}
          onChange={(e) => setImpactEvidence(e.target.value)}
          placeholder="Provide evidence of real transformation, community impacts, or organizational achievements here..."
          className="w-full p-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* 3. Media Attachments Input Row */}
      <div className="pt-2 border-t border-gray-200/50">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Supporting Files & Reports Evidence
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-sm">
            {isUploading ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm text-gray-600 font-semibold">
              {isUploading ? 'Uploading records...' : 'Attach documents / images'}
            </span>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading || isSaving}
            />
          </label>

          <div className="flex flex-col justify-center space-y-1.5 bg-white p-2 rounded-lg border border-gray-100">
            {fileUrls.length === 0 ? (
              <p className="text-xs text-gray-400 italic px-1">No file attachments linked yet.</p>
            ) : (
              fileUrls.map((url, index) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold truncate max-w-[280px]"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> Attachment #{index + 1}
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Action Alerts and Buttons Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1.5">
          {message && (
            <>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-xs font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveData}
          disabled={isSaving || isUploading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all disabled:opacity-40"
        >
          {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
          Save Entry Data
        </button>
      </div>
    </div>
  );
};

// ==========================================
// Main Diocese Modal Presentation Export
// ==========================================
export const DioceseModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  dioceseId = "68" 
}: DioceseModalProps) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'programmes'>('pillars');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const strategicPillars = [
    { title: "Mission, Evangelism and Spiritual Growth", desc: "Driving spiritual transformation across parishes through targeted crusades, church planting, and family discipleship mentorship groups." },
    { title: "Welfare, Health and Wellbeing of the Clergy and Laity", desc: "Sustaining our spiritual shepherds and congregation through structured medical covers, pension alignment plans, and emergency support funds." },
    { title: "Governance, Leadership and Policy Development", desc: "Enforcing clear operational accountability, structural canonical training pipelines, and objective administrative policy audits." },
    { title: "Education, Research, Training and Advocacy", desc: "Empowering communities by managing diocesan learning schools, continuous theological training sponsorships, and civic justice advocacy." },
    { title: "Information, Technology and Communication", desc: "Modernizing church management processes via multi-tenant software deployments, database tracking synchronization, and digital broadcast channels." },
    { title: "Resource Mobilization and Development", desc: "Securing financial self-sustainability through strategic investment property developments, investment portfolios, and parish asset maximization projects." }
  ];

  const communityProgrammes = [
    { title: "Administrative and Organizational Development", desc: "Optimizing institutional framework efficiency, structural staff performance reviews, and capacity building for parish offices." },
    { title: "Environmental Stewardship", desc: "Leading climate change advocacy, localized tree-planting drives, and sustainable waste management awareness within communities." },
    { title: "Peace, Justice and Interfaith Engagement", desc: "Fostering communal cohesion, alternative dispute resolution platforms, and structured cross-religion peace dialogues." },
    { title: "Social Welfare and Vulnerable Groups", desc: "Extending structural aid provisions, care packages, and rehabilitation outreach to widows, orphans, and marginalized individuals." },
    { title: "Health, Addiction and Life Support", desc: "Managing community healthcare centers, localized addiction counseling programs, and mental health baseline support frameworks." },
    { title: "Family, Youth and Community Development", desc: "Empowering the next generation through value-based camps, micro-enterprise training, and family stability workshops." },
    { title: "Occupational and Transport Ministries", desc: "Reaching out directly to specific workforce sectors, including structured spiritual and safety training programs for the Boda Boda and Matatu sectors." },
    { title: "Education, Mentorship and Career Development", desc: "Bridging the professional gap through school bursaries, student mentorship matching, and career preparation workshops." },
    { title: "Economic Empowerment and Labour Relations", desc: "Facilitating parish table banking models, cooperative structures, and fair labor advocacy tracking networks." },
    { title: "Pre-Marital Counselling Programme", desc: "Building strong foundations for marriages via canonical 12-week counseling programs and marriage preparation cohorts." },
    { title: "Church and Community Mobilization Process (CCMP)", desc: "A holistic transformation framework empowering local churches to utilize God-given resources to alter their socio-economic realities." },
    { title: "Diocesan Institutions", desc: "Coordinating strategic oversight and asset maintenance parameters across diocesan-owned commercial hubs and retreat facilities." },
    { title: "ACK Marathon", desc: "An annual flagship sports evangelism and resource mobilization event championing physical fitness and raising funds for community development initiatives." }
  ];

  const currentList = activeTab === 'pillars' ? strategicPillars : communityProgrammes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner Header */}
        <div className="bg-[#1e3a8a] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">ACK Diocese of Nairobi</h2>
              <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Diocesan Central Knowledge Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 pt-2">
          <button 
            type="button"
            onClick={() => { setActiveTab('pillars'); setExpandedIndex(null); }}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'pillars' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Strategic Pillars ({strategicPillars.length})
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('programmes'); setExpandedIndex(null); }}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'programmes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Community Based Programmes ({communityProgrammes.length})
          </button>
        </div>

        {/* Accordion List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {currentList.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div key={index} className="border border-gray-100 rounded-xl overflow-hidden transition-all shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Star className={`w-4 h-4 ${isExpanded ? 'text-green-500 fill-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm font-bold text-gray-800">{item.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 bg-white text-sm text-gray-600 border-t border-gray-50 pt-3">
                    <p className="text-gray-500 italic mb-2">{item.desc}</p>
                    
                    {/* The Interactive Form instantly loads here since login checker fallback is removed */}
                    <InteractivePillarForm 
                      title={item.title} 
                      userId={userId || "authenticated_member"} 
                      dioceseId={dioceseId} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};




