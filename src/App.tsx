import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import CampaignManagement from './components/CampaignManagement';
import CampaignViewer from './components/CampaignViewer';
import QRCheckInPage from './components/QRCheckInPage';
import MultiMallQrCheckinPage from './pages/MultiMallQrCheckinPage';
import QRGeneration from './components/QRGeneration';
import Analytics from './components/Analytics';
import VisitorEngagementManager from './components/VisitorEngagementManager';
import { useAuth } from './contexts/AuthContext';
import './index.css';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Handle admin routes (all visitor routes are now handled at App level)
  React.useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    console.log('🔍 Admin Route detection:', { path, hash });
    
    if (path.startsWith('/campaign/')) {
      const id = path.split('/campaign/')[1];
      setCampaignId(id);
      setCurrentView('campaign-view');
    } else if (hash === '#qr-generation') {
      // Handle direct navigation to QR generation from campaign management
      setCurrentView('qr-generation');
      // Clear the hash to prevent re-triggering
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      // Default to dashboard for authenticated users
      setCurrentView('dashboard');
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

  // Show QR check-in page for visitors
  if (currentView === 'qr-checkin' && campaignId) {
    return (
      <div>
        <QRCheckInPage 
          campaignId={campaignId}
          location={new URLSearchParams(window.location.search).get('location') || 'unknown'}
          shopId={new URLSearchParams(window.location.search).get('shop_id')}
        />
      </div>
    );
  }

  // Main app for authenticated users (ALL routes above handled PUBLIC routes)
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
          {currentView === 'qr-generation' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="QR Code Generation" />
              <div className="pt-16">
                <QRGeneration />
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
          {currentView === 'visitor-engagement' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Visitor Engagement Manager" />
              <div className="pt-16">
                <VisitorEngagementManager user={{
                  id: user?.id || 0,
                  username: user?.username || 'unknown',
                  mall_id: user?.mall_id || 0,
                  shop_id: user?.shop_id || 0,
                  shop_name: user?.shop_name || 'Unknown Shop'
                }} />
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
  const path = window.location.pathname;
  
  // Check if this is a public visitor route (bypass AuthProvider completely)
  const isPublicVisitorRoute = 
    path.startsWith('/qr/checkin') || 
    path.startsWith('/multi-mall-qr') || 
    path.includes('multi-mall-qr');

  console.log('🔓 App-level route check:', { path, isPublicVisitorRoute });

  // For public visitor routes, render without AuthProvider
  if (isPublicVisitorRoute) {
    console.log('🎯 Rendering PUBLIC visitor route outside AuthProvider');
    
    if (path.startsWith('/multi-mall-qr') || path.includes('multi-mall-qr')) {
      console.log('🎯 Rendering MultiMallQrCheckinPage (PUBLIC)');
      return <MultiMallQrCheckinPage />;
    }
    
    // Fallback for other visitor routes
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">QR Check-in</h2>
          <p className="text-gray-600">Processing your visit...</p>
        </div>
      </div>
    );
  }

  // For all other routes, use AuthProvider (admin routes)
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
