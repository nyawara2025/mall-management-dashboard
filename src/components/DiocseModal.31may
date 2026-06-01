import React, { useState } from 'react';
import { X, Award, Layers, HeartHandshake, ChevronDown, CheckCircle2, Star } from 'lucide-react';

interface DioceseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DioceseModal = ({ isOpen, onClose }: DioceseModalProps) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'programmes'>('pillars');
  
  // Tracks which list row item index is currently expanded/opened
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] max-h-[80vh] overflow-hidden">
        
        {/* Modal Branding Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 shadow-inner">
              <Award className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">ACK Diocese of Nairobi</h2>
              <p className="text-blue-200 text-[9px] font-black uppercase tracking-widest pt-1">Diocesan Central Knowledge Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex border-b px-6 bg-gray-50/50 gap-6 text-xs font-black uppercase tracking-wider overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveTab('pillars'); setExpandedIndex(null); }}
            className={`py-4 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'pillars' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Layers size={14} /> Strategic Pillars ({strategicPillars.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('programmes'); setExpandedIndex(null); }}
            className={`py-4 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'programmes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <HeartHandshake size={14} /> Community Based Programmes ({communityProgrammes.length})
          </button>
        </div>

        {/* Dynamic Accordion Canvas Scrolling Display Box */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-2.5 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="animate-in fade-in duration-150 space-y-2.5">
            {currentList.map((item, idx) => {
              const isOpen = expandedIndex === idx;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl shadow-2xs overflow-hidden transition-all duration-200">
                  
                  {/* Collapsible Click Header Row Trigger */}
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left gap-3 hover:bg-slate-50/40 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      {activeTab === 'pillars' ? (
                        <CheckCircle2 size={16} className={`shrink-0 ${isOpen ? 'text-blue-600' : 'text-gray-400'}`} />
                      ) : (
                        <Star size={14} className={`shrink-0 ${isOpen ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400'}`} />
                      )}
                      <span className="font-bold text-gray-800 text-xs tracking-tight leading-snug">{item.title}</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  
                  {/* Smooth Sliding Dropdown Description Block */}
                  {isOpen && (
                    <div className="px-11 pb-4 pt-0.5 animate-in slide-in-from-top-1 duration-150">
                      <p className="text-xs text-gray-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-gray-100/60 whitespace-pre-line">
                        {item.desc}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
