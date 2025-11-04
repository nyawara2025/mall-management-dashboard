import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import CampaignManagement from './components/CampaignManagement';
import CampaignViewer from './components/CampaignViewer';
import Analytics from './components/Analytics';
import { useAuth } from './contexts/AuthContext';
import './index.css';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Handle campaign viewer (for QR code scanning)
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/campaign/')) {
      const id = path.split('/campaign/')[1];
      setCampaignId(id);
      setCurrentView('campaign-view');
    }
  }, []);

  // Show campaign viewer if we're on a campaign page
  if (currentView === 'campaign-view' && campaignId) {
    return (
      <div>
        <CampaignViewer campaignId={campaignId} />
      </div>
    );
  }

  // Main app for authenticated users
  return (
    <div className="App">
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          {currentView === 'dashboard' && (
            <Dashboard onViewChange={setCurrentView} />
          )}
          {currentView === 'campaigns' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Campaign Management" />
              <div className="pt-16">
                <CampaignManagement />
              </div>
            </div>
          )}
          {currentView === 'analytics' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Analytics & Insights" />
              <div className="pt-16">
                <Analytics />
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </div>
  );
}

// Header component for campaign management
function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <div></div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
