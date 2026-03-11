import React, { useState } from 'react';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import CampaignManagement from './components/CampaignManagement';
import { POS } from './components/POS';
import CampaignTemplateManager from './components/CampaignTemplateManager';
import CampaignViewer from './components/CampaignViewer';
import QRCheckInPage from './components/QRCheckInPage';
import QrCheckinPage from './pages/QrCheckinPage';
import QRSuccessPage from './pages/QRSuccessPage';
import MultiMallQrCheckinPage from './pages/MultiMallQrCheckinPage';
import ProductManager from './components/ProductManager';
// import SimpleQrTestPage from './pages/SimpleQrTestPage'; // Removed - file doesn't exist
import QRGeneration from './components/QRGeneration';
import Analytics from './components/Analytics';
import VisitorEngagementManager from './components/VisitorEngagementManager';
import PaymentManagement from './components/PaymentManagement';
import ReceivingPaymentModule from './components/ReceivingPaymentModule';
import PaymentReceiptMessaging from './components/PaymentReceiptMessaging';
import { useAuth } from './contexts/AuthContext';
import { CustomerInquiries } from './components/CustomerInquiries';
import SettingsPage from './pages/SettingsPage';
import './index.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Campaign Management"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <CampaignManagement />
              </div>
            </div>
          )}

          {currentView === 'pos' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Point of Sale (Cash Entry)"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                {/* We will create this file next */}
                <POS shopId={user?.shop_id || 0} /> 
              </div>
            </div>
          )}

          {currentView === 'templates' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Campaign Template Manager"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <CampaignTemplateManager />
              </div>
            </div>
          )}
          {currentView === 'qr-generation' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="QR Code Generation"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <QRGeneration />
              </div>
            </div>
          )}
          {currentView === 'analytics' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Analytics & Insights"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <Analytics />
              </div>
            </div>
          )}
          {currentView === 'visitor-engagement' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Visitor Engagement Manager"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <VisitorEngagementManager user={user!} />
              </div>
            </div>
          )}
          {currentView === 'products' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Product Management"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                {/* This renders your new component */}
                <ProductManager 
                  shopId={user?.shop_id || 0} 
                  onBack={() => setCurrentView('dashboard')}
                /> 
              </div>
            </div>
          )}
          {currentView === 'payments' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="MPESA Payment Management"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <PaymentManagement />
              </div>
            </div>
          )}
          {currentView === 'payment-reception' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Payment Reception"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <ReceivingPaymentModule />
              </div>
            </div>
          )}
          {currentView === 'receipt-messaging' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Receipt Messaging"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <PaymentReceiptMessaging />
              </div>
            </div>
          )}
          {currentView === 'transactions' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Transaction History"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <PaymentManagement />
              </div>
            </div>
          )}
          {currentView === 'customer-inquiries' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Customer Inquiries"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <CustomerInquiries />
              </div>
            </div>
          )}
          {currentView === 'settings' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Settings"
                user={user}
                onLogout={logout}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
              />
              <div className="pt-16">
                <SettingsPage />
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </div>
  );
}

// Header component for campaign management
function Header({ onBack, title, user, onLogout, showUserMenu, setShowUserMenu }: { 
  onBack: () => void; 
  title: string;
  user: any;
  onLogout: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
}) {
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
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{user?.full_name}</span>
                <span className="text-xs text-gray-500 uppercase">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.username}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
            
            {/* Click outside to close */}
            {showUserMenu && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
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
    path.startsWith('/q') ||
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
    
    // Handle QR test route (optimization testing) - DISABLED
    // if (path.startsWith('/qr/test')) {
    //   return <SimpleQrTestPage />;
    // }
    
    // Handle QR check-in routes (both old /qr/checkin and new /q)
    if (path.startsWith('/qr/checkin') || path.startsWith('/q')) {
      return <QrCheckinPage />;
    }
    
    // Handle QR success page
    if (path.startsWith('/qr/success')) {
      return <QRSuccessPage />;
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
