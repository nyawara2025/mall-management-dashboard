import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Users, MessageSquare, Loader2, CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';

interface YouthAffairsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  shopId: number;
}

interface YouthEvent {
  id: string | number;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  is_registered?: boolean; // Managed downstream via n8n query returns
}

export default function YouthAffairsModal({ isOpen, onClose, userData, shopId }: YouthAffairsModalProps) {
  const [activeTab, setActiveTab] = useState<'hub' | 'events' | 'mentorship'>('hub');
  const [events, setEvents] = useState<YouthEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [requestingMentorId, setRequestingMentorId] = useState<string | number | null>(null);

  const [mentorshipTab, setMentorshipTab] = useState<'hub' | 'events' | 'mentorship'>('hub');
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingMentors, setLoadingMentors] = useState<boolean>(false);

  // --- INJECT CAREER TRACK & OPPORTUNITY STATES ---
  const [mentorshipSubTab, setMentorshipSubTab] = useState<'directory' | 'opportunities'>('directory');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loadingOpps, setLoadingOpps] = useState<boolean>(false);
  const [applyingOppId, setApplyingOppId] = useState<string | number | null>(null);

  // --- INJECT FORUM MODULE STATES WITHOUT EXTRA API FETCHES ---
  const [forumScope, setForumScope] = useState<'intra' | 'inter'>('intra');
  const [forumThreads, setForumThreads] = useState<any[]>([]);
  const [loadingForum, setLoadingForum] = useState<boolean>(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');

  // --- INJECT THREAD DETAIL & REPLY STATES ---
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [forumReplies, setForumReplies] = useState<any[]>([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);

  // Extract metadata directly from the inherited prop object values
  const dioceseName = userData?.church_metadata?.diocese_name || userData?.diocese_name || "Regional Network";
  const isFederated = userData?.church_metadata?.is_federated ?? userData?.is_federated ?? true;

  // Dynamically filter active card items by selection choice
  const filteredMentors = selectedProfession
    ? mentors.filter(m => m.profession === selectedProfession)
    : mentors;

  const [socialMetrics, setSocialMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);

  // Extract unique, non-empty professions, and sort them alphabetically
  const professionsList = Array.from(
    new Set(mentors.map(m => m.profession).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
  if (isOpen && shopId) {
    // Action A: Fire the existing n8n database pull for the event listings table
    fetchTenantEventsFromN8N();

    // Action B: Fire the Cloudflare Worker cache lookup for social interaction counts
    setLoadingMetrics(true);
    
    // Constructing your Worker target domain text structure safely:
    const workerDomain = "https://" + "churchyouthaffairsmetrics" + "." + "onudi2012" + "." + "workers" + "." + "dev";
    const workerEndpoint = workerDomain + "/webhook/fetch-youth-events";

    fetch(workerEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shopId })
    })
    .then(res => {
      if (!res.ok) throw new Error('Metrics endpoint responded with an error status');
      return res.json();
    })
    .then(data => {
      if (data.success) {
        setSocialMetrics(data.metrics);
      }
    })
    .catch(err => {
      console.error("Social metrics edge lookup bypassed:", err);
    })
    .finally(() => {
      setLoadingMetrics(false);
    });
  }
}, [isOpen, shopId]);

  const fetchTenantEventsFromN8N = async () => {
    setLoadingEvents(true);
    setErrorMessage(null);
    try {
      // Direct POST payload matching your strict workflow criteria
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-youth-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_events',
          shop_id: shopId,
          user_id: userData?.id || null
        })
      });

      if (!response.ok) throw new Error('Failed to retrieve schedules');
      
      const data = await response.json();
      // Expecting n8n to return an array of events: [ { id, title, description, event_date, venue, is_registered } ]
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('n8n event lookup failed:', err);
      setErrorMessage('Could not load youth schedules. Please try again.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleRegisterViaN8N = async (event: YouthEvent) => {
    setSubmittingId(event.id);
    setErrorMessage(null);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/register-for-youth-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_event',
          shop_id: shopId,
          event_id: event.id,
          user_id: userData?.id,
          member_details: {
            name: userData?.full_name || userData?.name,
            phone: userData?.phone,
            email: userData?.email
          }
        })
      });

      if (!response.ok) throw new Error('Registration failed');

      // Optimistically update registration state in UI layout
      setEvents(prevEvents => 
        prevEvents.map(ev => 
          ev.id === event.id ? { ...ev, is_registered: true } : ev
        )
      );
    } catch (err) {
      console.error('n8n registration pipeline error:', err);
      setErrorMessage('Could not process registration at this time.');
    } finally {
      setSubmittingId(null);
    }
  };

  // --- INJECT CAREER MARKETPLACE PIPELINES ---
  const fetchCareerOpportunitiesFromN8N = async () => {
    setLoadingOpps(true);
    setErrorMessage(null);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/youth-internship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_opportunities',
          shop_id: shopId,
          user_id: userData?.id || null
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      // Expects an array: [ { id, title, company, type, description, provider_name, is_applied } ]
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('n8n opportunities fetch failed:', err);
      setErrorMessage('Could not load dynamic career postings.');
    } finally {
      setLoadingOpps(false);
    }
  };

  const handleApplyForOpportunity = async (oppId: string | number) => {
    setApplyingOppId(oppId);
    setErrorMessage(null);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/youth-internship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_opportunity',
          shop_id: shopId,
          opportunity_id: oppId,
          user_id: userData?.id,
          applicant_details: {
            name: userData?.full_name || userData?.name,
            email: userData?.email
          }
        })
      });

      if (!response.ok) throw new Error();

      // Optimistically update the matching layout card row to registered/applied state
      setOpportunities(prev => prev.map(opp => opp.id === oppId ? { ...opp, is_applied: true } : opp));
    } catch (err) {
      console.error('Opportunity pairing error:', err);
      setErrorMessage('Could not process track request at this time.');
    } finally {
      setApplyingOppId(null);
    }
  };

  // --- INJECT FORUM DATA-STREAM PIPELINES ---
  const fetchForumThreadsFromN8N = async (scopeSelection: 'intra' | 'inter') => {
    setLoadingForum(true);
    setErrorMessage(null);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-youth-forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_threads',
          shop_id: shopId,
          scope: scopeSelection === 'intra' ? 'intra_parish' : 'inter_diocese'
        })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setForumThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Discussion board pull failed:', err);
      setErrorMessage('Could not load community discussions at this time.');
    } finally {
      setLoadingForum(false);
    }
  };

  const handleCreateForumThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    setLoadingForum(true);
    setErrorMessage(null);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/create-youth-forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_thread',
          shop_id: shopId,
          title: newTopicTitle,
          content: newTopicContent,
          scope: forumScope === 'intra' ? 'intra_parish' : 'inter_diocese',
          author_id: userData?.id,
          author_name: userData?.full_name || userData?.name || 'Community Member'
        })
      });
      if (!response.ok) throw new Error();
      setNewTopicTitle('');
      setNewTopicContent('');
      fetchForumThreadsFromN8N(forumScope);
    } catch (err) {
      setErrorMessage('Could not submit your discussion topic.');
      setLoadingForum(false);
    }
  };

  // --- INJECT FORUM COMMENT SECTION PIPELINES ---
  const fetchThreadRepliesFromN8N = async (threadId: string | number) => {
    setLoadingReplies(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-youth-forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_replies',
          shop_id: shopId,
          thread_id: threadId
        })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setForumReplies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to pull discussion replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !selectedThread) return;
    setLoadingReplies(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-youth-forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_reply',
          shop_id: shopId,
          thread_id: selectedThread.id,
          content: newReplyContent,
          author_id: userData?.id,
          author_name: userData?.full_name || userData?.name || 'Parish Youth'
        })
      });
      if (!response.ok) throw new Error();
      setNewReplyContent('');
      fetchThreadRepliesFromN8N(selectedThread.id);
    } catch (err) {
      console.error('Could not post comment response:', err);
      setLoadingReplies(false);
    }
  };

  const fetchMentorsFromN8N = async () => {
    setLoadingMentors(true);
    setErrorMessage(null);
    try {
      // Direct POST payload matching your strict workflow action criteria
      const response = await fetch('https://n8n.tenear.com/webhook/youth-mentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_mentors',
          shop_id: shopId,
          user_id: userData?.id || null
        })
      });

      if (!response.ok) throw new Error('Failed to retrieve mentorship listings');
      
      const data = await response.json();
      // Expecting n8n to return an array of available mentors from your youth_mentors table
      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('n8n mentor lookup failed:', err);
      setErrorMessage('Could not load mentor profiles. Please try again.');
    } finally {
      setLoadingMentors(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            {(activeTab === 'events' || activeTab === 'mentorship' || activeTab === 'forum' as any) && (
              <button 
                onClick={() => setActiveTab('hub')}
                className="p-1 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {activeTab === 'hub' ? 'Youth Affairs Portal' : 'Youth Events & Rallies'}
              </h3>
              <p className="text-xs text-gray-500">
                {activeTab === 'hub' ? 'Connect, Grow, and Serve' : 'View and register for events'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Navigation Panels */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'hub' ? (
            <>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                Welcome to the Youth Ministry hub. Explore upcoming youth events, join discussion circles, or request mentorship programs.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setActiveTab('events')}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-left group"
                >
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800">Youth Events & Rallies</h4>
                    <p className="text-xs text-gray-500">Register for camps, sports nights, and praise sessions.</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setActiveTab('mentorship');
                    setMentorshipSubTab('directory'); 
                    fetchMentorsFromN8N();
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-purple-50/50 hover:border-purple-200 transition-all text-left group"
                >
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800">Peer Mentorship Circles</h4>
                    <p className="text-xs text-gray-500">Get paired up with group leaders and spiritual mentors.</p>
                  </div>
                </button>

                {/* ACTIVATED DATA-DRIVEN DISCUSSION FORUM TRIGGER CARD */}
                <button 
                  onClick={() => {
                    setActiveTab('forum' as any);
                    fetchForumThreadsFromN8N(forumScope);
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all text-left group"
                >
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800">Discussion Board</h4>
                    <p className="text-xs text-gray-500">Share insights, ask real-life questions, and connect inter-diocese.</p>
                  </div>
                </button>

              </div>

              {/* PASTE THE SOCIAL PERFORMANCE METRICS METRICS CODE BLOCK HERE */}
              {socialMetrics && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Social Engagement Pulse
                    </h4>
                    {socialMetrics.last_updated && (
                      <span className="text-[10px] text-gray-400">
                        Updated: {new Date(socialMetrics.last_updated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} EAT
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Instagram Analytics Card */}
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-pink-50/30 to-rose-50/30 flex flex-col">
                      <span className="text-xs font-medium text-gray-500">Instagram Followers</span>
                      <span className="text-xl font-black text-gray-900 mt-1">
                        {socialMetrics.instagram?.followers?.toLocaleString() || 0}
                      </span>
                    </div>

                    {/* TikTok Analytics Card */}
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-cyan-50/30 to-slate-50/30 flex flex-col">
                      <span className="text-xs font-medium text-gray-500">TikTok Likes</span>
                      <span className="text-xl font-black text-gray-900 mt-1">
                        {socialMetrics.tiktok?.likes?.toLocaleString() || 0}
                      </span>
                    </div>

                    {/* Facebook Analytics Card */}
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 flex flex-col">
                      <span className="text-xs font-medium text-gray-500">Facebook Impressions</span>
                      <span className="text-xl font-black text-gray-900 mt-1">
                        {socialMetrics.facebook_impressions?.toLocaleString() || 0}
                      </span>
                    </div>

                    {/* Twitter / X Analytics Card */}
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-neutral-50 to-neutral-100/50 flex flex-col">
                      <span className="text-xs font-medium text-gray-500">Twitter Impressions</span>
                      <span className="text-xl font-black text-gray-900 mt-1">
                        {socialMetrics.twitter?.impressions_30d?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>


          ) : activeTab === 'mentorship' ? (
            /* Mentorship & Career Development Module View */
            <div className="space-y-4">
              
              {/* SUB-TAB TOGGLES FOR PROFESSIONAL TRACKS */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => { setMentorshipSubTab('directory'); fetchMentorsFromN8N(); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                    mentorshipSubTab === 'directory' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  👥 Spiritual Mentors
                </button>
                <button
                  type="button"
                  onClick={() => { setMentorshipSubTab('opportunities'); fetchCareerOpportunitiesFromN8N(); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                    mentorshipSubTab === 'opportunities' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  💼 Micro-Opportunities
                </button>
              </div>

              {mentorshipSubTab === 'directory' ? (
                /* --- TRACK A: STANDARD SPIRITUAL PROFILE DIRECTORY (YOUR ORIGINAL CODE) --- */
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Available Spiritual & Career Mentors
                    </span>
          
                    {!loadingMentors && mentors.length > 0 && (
                      <div className="mt-1">
                        <select
                          value={selectedProfession}
                          onChange={(e) => setSelectedProfession(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-xs transition-all shadow-sm font-medium"
                        >
                          <option value="">✨ All Professions / Ministries (Show All)</option>
                          {professionsList.map((profession) => (
                            <option key={profession} value={profession}>
                              💼 {profession}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {loadingMentors ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      <p className="text-xs">Loading mentor directory...</p>
                    </div>
                  ) : mentors.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No active mentors found</p>
                    </div>
                  ) : filteredMentors.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Nobody is listed under "{selectedProfession}" yet.</p>
                      <button onClick={() => setSelectedProfession('')} className="text-xs font-bold text-purple-600 underline mt-1 block mx-auto hover:text-purple-700">Clear filters</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1">
                      {filteredMentors.map((mentor) => {
                        return (
                          <div key={mentor.id} className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 shadow-sm transition-all flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center border border-purple-100/50 shrink-0 uppercase">
                              {mentor.first_name?.substring(0, 1)}{mentor.last_name?.substring(0, 1) || "M"}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-gray-900">{mentor.first_name} {mentor.last_name}</h4>
                                <span className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-semibold rounded-md uppercase tracking-wider">
                                  {mentor.profession || "Ministry Partner"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">{mentor.bio || `Available to mentor youth in the field of ${mentor.profession || 'Spiritual Growth'}.`}</p>
                              <button
                                disabled={requestingMentorId !== null || mentor.is_requested}
                                onClick={async () => {
                                  setRequestingMentorId(mentor.id);
                                  try {
                                    const res = await fetch('https://tenear.com', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        action: 'request_mentor',
                                        shop_id: shopId,
                                        mentor_id: mentor.id,
                                        student_id: userData?.id,
                                        student_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
                                        profession: mentor.profession
                                      })
                                    });
                                    if (!res.ok) throw new Error();
                                    setMentors(prev => prev.map(m => m.id === mentor.id ? { ...m, is_requested: true } : m));
                                  } catch (err) {
                                    setErrorMessage('Could not relay connection request.');
                                  } finally {
                                    setRequestingMentorId(null);
                                  }
                                }}
                                className={`w-full mt-2 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                                  mentor.is_requested ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default' : 'bg-purple-600 border-purple-600 hover:bg-purple-700 text-white shadow-sm'
                                }`}
                              >
                                {requestingMentorId === mentor.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : mentor.is_requested ? <>✔ Connection Active</> : 'Request Connection via Chat'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

   


              ) : (
                /* --- TRACK B: NEW PROFESSIONAL MICRO-OPPORTUNITIES MARKETPLACE --- */
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Job Shadowing, Resumes & Placement Blocks
                  </span>

                  {loadingOpps ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      <p className="text-xs">Loading career board...</p>
                    </div>
                  ) : opportunities.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No career micro-openings currently posted</p>
                      <p className="text-xs text-gray-400 mt-0.5">Check back later or post your interest in the feed.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1">
                      {opportunities.map((opp) => (
                        <div key={opp.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm text-gray-900">{opp.title}</h4>
                              <p className="text-xs text-purple-700 font-medium">{opp.company || "Parish Professional Network"}</p>
                            </div>
                            <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-bold rounded-md uppercase">
                              {opp.type || "Shadow Day"}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 leading-normal">{opp.description}</p>
                          
                          <div className="flex items-center justify-between pt-2 border-t text-[11px] text-gray-400">
                            <span>Posted by: <strong className="text-gray-600">{opp.provider_name}</strong></span>
                            <button
                              disabled={opp.is_applied || applyingOppId === opp.id}
                              onClick={() => handleApplyForOpportunity(opp.id)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                                opp.is_applied
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default shadow-none'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {applyingOppId === opp.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : opp.is_applied ? (
                                'Slot Reserved'
                              ) : (
                                'Apply for Slot'
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : activeTab === ('forum' as any) ? (
            /* --- INJECTED GENERIC DATA-DRIVEN DISCUSSION FORUM VIEW --- */
            <div className="space-y-4">
              {selectedThread ? (
                /* --- A: INDIVIDUAL TOPIC THREAD VIEW LAYOUT LOOP --- */
                <div className="space-y-4 animate-fade-in">
                  <button 
                    type="button" 
                    onClick={() => { setSelectedThread(null); setForumReplies([]); }} 
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    ← Back to Board Feed
                  </button>

                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-900">{selectedThread.title}</h3>
                      <span className="bg-white px-2 py-0.5 rounded-md text-[9px] text-slate-500 font-semibold border border-indigo-100 uppercase">
                        {selectedThread.scope === 'intra_parish' ? 'Local' : 'Network'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{selectedThread.content}</p>
                    <div className="text-[10px] text-gray-400 flex justify-between pt-1 border-t border-indigo-100/40">
                      <span>Posted by: <strong>{selectedThread.author_name}</strong></span>
                      <span>{new Date(selectedThread.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Responses</span>
                    {loadingReplies ? (
                      <div className="text-center py-4 text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Pulling responses...
                      </div>
                    ) : forumReplies.length === 0 ? (
                      <p className="text-xs text-gray-400 italic pl-1">No responses yet. Share your thoughts below!</p>
                    ) : (
                      forumReplies.map((reply: any) => (
                        <div key={reply.id} className="p-3 bg-white border border-gray-100 rounded-xl space-y-1 shadow-sm">
                          <p className="text-xs text-gray-600 leading-normal">{reply.content}</p>
                          <div className="text-[9px] text-gray-400 flex justify-between items-center border-t pt-1">
                            <span>🙌 {reply.author_name}</span>
                            <span>{new Date(reply.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleCreateReply} className="flex gap-2">
                    <input
                      required
                      value={newReplyContent}
                      onChange={(e) => setNewReplyContent(e.target.value)}
                      placeholder="Type your encouraging thought or answer..."
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button type="submit" disabled={loadingReplies} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0">
                      Reply
                    </button>
                  </form>
                </div>
              ) : (
                /* --- B: CENTRAL BULK FORUM SELECTION INTERFACE DISPLAY --- */
                <>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => { setForumScope('intra'); fetchForumThreadsFromN8N('intra'); }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          forumScope === 'intra' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        🔒 Local Parish Board
                      </button>
                      
                      {isFederated && (
                        <button
                          type="button"
                          onClick={() => { setForumScope('inter'); fetchForumThreadsFromN8N('inter'); }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center truncate ${
                            forumScope === 'inter' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        >
                          🌐 {dioceseName} Connect
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleCreateForumThread} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <input
                      required
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Discussion Subject (e.g., Youth Outreach Ideas...)"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <textarea
                      required
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Share details, modern Christian youth ideas, career insights, or prayer items..."
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                    />
                    <button type="submit" disabled={loadingForum} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1">
                      Post to {forumScope === 'intra' ? 'Local Board' : dioceseName}
                    </button>
                  </form>

                  {loadingForum ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      <p className="text-xs">Loading community exchange...</p>
                    </div>
                  ) : forumThreads.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <p className="text-sm font-medium text-gray-500">No discussions ongoing here yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Be the first to share an encouraging word or suggestion!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[220px] overflow-y-auto pr-1">
                      {forumThreads.map((thread: any) => (
                        <button
                          key={thread.id} 
                          type="button"
                          onClick={() => {
                            setSelectedThread(thread);
                            fetchThreadRepliesFromN8N(thread.id);
                          }}   
                          className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-1.5 text-left w-full hover:border-indigo-300 hover:shadow-md transition-all block"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-gray-800">{thread.title}</h4>
                            <span className="text-[10px] text-gray-400">{new Date(thread.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-normal">{thread.content}</p>
                          <div className="text-[11px] font-medium text-gray-400 border-t pt-1.5 flex justify-between items-center w-full">
                            <span>✍️ {thread.author_name}</span>
                            <span className="text-indigo-600 font-semibold text-[10px]">💬 View & Reply</span>
                          </div>
                        </button>
                      ))}
                    </div>  
                  )}
                </>
              )}
            </div>
          ) : (          
            /* --- C: RESTORED ORIGINAL STABLE EVENTS MATRIX BLOCK --- */
            <div className="space-y-4">
              
              {/* Leader/Admin Event Creation Form Option */}
              {(userData?.is_admin || userData?.role === 'leader' || userData?.is_leader) && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/80 space-y-3"> 
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Create New Youth Event
                  </h4>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    
                    setLoadingEvents(true);
                    try {
                      const res = await fetch('https://tenear.com', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'create_event',
                          shop_id: shopId,
                          title: formData.get('title'),
                          description: formData.get('description'),
                          event_date: formData.get('event_date'),
                          venue: formData.get('venue'),
                          created_by: userData?.id
                        })
                      });
                      
                      if (!res.ok) throw new Error();
                      form.reset();
                      fetchTenantEventsFromN8N(); // Auto-refresh the event deck instantly
                    } catch (err) {
                      setErrorMessage('Could not publish event.');
                    } finally {
                      setLoadingEvents(false);
                    }
                  }} className="space-y-2">
                    <input required name="title" placeholder="Event Title (e.g., Youth Camp 2026)" className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                    <input required name="description" placeholder="Brief details..." className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <input required name="event_date" placeholder="Date/Time (e.g., Fri, Aug 14 • 6PM)" className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <input required name="venue" placeholder="Venue Location" className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
                      Publish Event Live
                    </button>
                  </form>
                </div>
              )}

              {/* Event Feed Output Deck */}
              {loadingEvents ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs">Connecting to engine payload...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <p className="text-sm font-medium text-gray-500">No upcoming youth events scheduled.</p>
                  <p className="text-xs text-gray-400 mt-1">Check back later or contact your platform coordinator.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div 
                    key={event.id}
                    className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-gray-800">{event.title}</h4>
                      <p className="text-xs text-gray-600 leading-snug">{event.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5 text-[11px] font-medium text-gray-500">
                        <span>📅 {event.event_date}</span>
                        <span>📍 {event.venue}</span>
                      </div>
                    </div>

                    <button
                      disabled={event.is_registered || submittingId === event.id}
                      onClick={() => handleRegisterViaN8N(event)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                        event.is_registered 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                      }`}
                    >
                      {submittingId === event.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : event.is_registered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Saved
                        </>
                      ) : (
                        'Join Event'
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            Multi-Tenant Lock ID: {shopId}
          </span>
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
