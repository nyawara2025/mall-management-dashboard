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
  const [activeTab, setActiveTab] = useState<'hub' | 'events'>('hub');
  const [events, setEvents] = useState<YouthEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch events via your n8n POST endpoint when opening the events view
  useEffect(() => {
    if (activeTab === 'events') {
      fetchTenantEventsFromN8N();
    }
  }, [activeTab]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            {activeTab === 'events' && (
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

                <button className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 opacity-50 cursor-not-allowed text-left">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">Peer Mentorship Circles</h4>
                    <p className="text-xs text-gray-500">Get paired up with group leaders and spiritual mentors.</p>
                  </div>
                </button>

                <button className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 opacity-50 cursor-not-allowed text-left">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">Discussion Board</h4>
                    <p className="text-xs text-gray-500">Share insights, ask real life questions, and post anonymous suggestions.</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            /* Events Dashboard */
            <div className="space-y-3">
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
