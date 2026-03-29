import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { CampaignHub } from './pages/CampaignHub'; // Your existing page
import VoterHub from './pages/VoterHub';      // The component we built
import { VoterDiscoveryModal } from './components/VoterDiscoveryModal';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { MedicalDashboard } from './components/MedicalDashboard';
import { PoliticalDashboard } from './components/PoliticalDashboard';
import { EducationalDashboard } from './components/EducationalDashboard';
import { ChurchDashboard } from './components/ChurchDashboard';
import CampaignManagement from './components/CampaignManagement';
import { POS } from './components/POS';
import CampaignTemplateManager from './components/CampaignTemplateManager';
import CampaignViewer from './components/CampaignViewer';
import ManifestoManager from './components/ManifestoManager';
import QRCheckInPage from './components/QRCheckInPage';
import QrCheckinPage from './pages/QrCheckinPage';
import QRSuccessPage from './pages/QRSuccessPage';
import MultiMallQrCheckinPage from './pages/MultiMallQrCheckinPage';
import ProductManager from './components/ProductManager';
import { DiasporaManager } from './components/DiasporaManager';
import QRGeneration from './components/QRGeneration';
import Analytics from './components/Analytics';
import VisitorEngagementManager from './components/VisitorEngagementManager';
import PaymentManagement from './components/PaymentManagement';
import ReceivingPaymentModule from './components/ReceivingPaymentModule';
import PaymentReceiptMessaging from './components/PaymentReceiptMessaging';
import { useAuth } from './contexts/AuthContext';
import { CustomerInquiries } from './components/CustomerInquiries';
import { PublicChurchHub } from './components/PublicChurchHub';
import { PublicSchoolHub } from './components/PublicSchoolHub';
import { MemberLogin } from './components/MemberLogin';
import SettingsPage from './pages/SettingsPage';
import './index.css';

// Reusable Header Component
const Header = ({ onBack, title, user, onLogout, showUserMenu, setShowUserMenu }: any) => (
  <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-6 z-50">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
    <div className="relative">
      <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
      </button>
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1">
          <button onClick={onLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  </header>
);

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams(); // Add this hook

  const bizCategory = searchParams.get('business_category');
  const shopId = searchParams.get('shop_id');
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const isChurchPath = window.location.pathname.includes('/church');
  const isSchoolPath = window.location.pathname.includes('/school');
  const handleSelectCandidate = (shopId: string) => {
    // Update the URL parameters without a page reload
    // We keep 'business_category=political' to ensure the Hub stays active
    setSearchParams({
      business_category: 'political',
      shop_id: shopId
    });

    setIsDiscoveryModalOpen(false);
  };

  // 2. VISITOR REDIRECT LOGIC (Before Auth/Protected Routes)
  // If a voter arrives with the political category, show them the campaign hub
  if (bizCategory?.startsWith('politic')) {
    return (
      <>
        <CampaignHub /> 
        <VoterDiscoveryModal 
          isOpen={!shopId || isDiscoveryModalOpen} // Open if no candidate selected
          onClose={() => setIsDiscoveryModalOpen(false)}
          onSelectCandidate={(id) => setSearchParams({ business_category: 'political', shop_id: id })}
        />
      </>
    );
  }

  // 2b. CHURCH VISITOR REDIRECT LOGIC (Public Access)
  // If a user arrives with the church category, show them the public hub
  if (bizCategory === 'church' || isChurchPath) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Import and use your new PublicChurchHub component here */}
        <PublicChurchHub shopId={Number(shopId) || 68} />
      </div>
    );
  }

  if (bizCategory === 'educational' || isSchoolPath) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicSchoolHub shopId={Number(shopId) || 1} /> 
      </div>
    );
  }

  useEffect(() => {
    // If no candidate is selected, open the discovery modal immediately
    if (!shopId) {
      setIsDiscoveryModalOpen(true);
    }
    }, [shopId]);


  // Monitor routing and login status
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // DEBUG: Check exactly what the category is in the console
    if (user) {
      console.log('🩺 TeNEAR Medical Debug:', {
        username: user.username,
        category: (user as any)?.category
      });
    }
    
    if (path.startsWith('/campaign/')) {
      const id = path.split('/campaign/')[1];
      setCampaignId(id);
      setCurrentView('campaign-view');
    } else if (hash === '#qr-generation') {
      setCurrentView('qr-generation');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [user]);

  // 1. Visitor/Public Routes
  if (currentView === 'campaign-view' && campaignId) {
    return <CampaignViewer campaignId={campaignId} />;
  }

  if (currentView === 'qr-checkin' && campaignId) {
    return (
      <QRCheckInPage 
        campaignId={campaignId}
        location={new URLSearchParams(window.location.search).get('location') || 'unknown'}
        shopId={new URLSearchParams(window.location.search).get('shop_id') || ''}
      />
    );
  }

  // 2. Main Admin Application (Protected)
  return (
    <div className="App">
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          
          {/* Main Dashboard Logic: Single block to handle all 3 categories */}
          {currentView === 'dashboard' && (() => {
            const category = (user as any)?.category;

            if (category === 'medical') {
              return (
                <div className="min-h-screen">
                  <Header 
                    onBack={() => setCurrentView('dashboard')} 
                    title="TeNEAR Medical Portal" 
                    user={user} 
                    onLogout={logout} 
                    showUserMenu={showUserMenu} 
                    setShowUserMenu={setShowUserMenu} 
                  />
                  <div className="pt-16">
                    <MedicalDashboard />
                  </div>
                </div>
              );
            } 
  
            if (category === 'political') {
              return (
                <div className="min-h-screen">
                  <Header 
                    onBack={() => setCurrentView('dashboard')} 
                    title="WAJIBIKA!" 
                    user={user} 
                    onLogout={logout} 
                    showUserMenu={showUserMenu} 
                    setShowUserMenu={setShowUserMenu} 
                  />
                  <div className="pt-16">
                    {/* Added the missing prop here to fix the build error */}
                    <PoliticalDashboard onViewChange={setCurrentView} />
                  </div>
                </div>
              );
            }

            if (category === 'educational') {
              return (
                <div className="min-h-screen">
                  <Header 
                    onBack={() => setCurrentView('dashboard')} 
                    title="TeNEAR Education" 
                    user={user} 
                    onLogout={logout} 
                    showUserMenu={showUserMenu} 
                    setShowUserMenu={setShowUserMenu} 
                  />
                  <div className="pt-16">
                    {/* Create this component next */}
                    <EducationalDashboard shopId={69} /> 
                  </div>
                </div>
              );
            }

            if (category === 'church') {
              return (
                <div className="min-h-screen">
                  <Header 
                    onBack={() => setCurrentView('dashboard')} 
                    title="TeNEAR Church Connect" 
                    user={user} 
                    onLogout={logout} 
                    showUserMenu={showUserMenu} 
                    setShowUserMenu={setShowUserMenu} 
                  />
                  <div className="pt-16">
                    {/* Create this component next */}
                    <ChurchDashboard onViewChange={setCurrentView} />
                  </div>
                </div>
              );
            }

            // Default Retail Dashboard
            return <Dashboard onViewChange={setCurrentView} />;
          })()} {/* <--- Ensure these closing symbols match exactly */}

          {currentView === 'campaigns' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Campaign Management" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><CampaignManagement /></div>
            </div>
          )}


          {currentView === 'pos' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Point of Sale (Cash Entry)" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><POS shopId={(user as any)?.shop_id || 0} /></div>
            </div>
          )}

          {currentView === 'templates' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Campaign Template Manager" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><CampaignTemplateManager /></div>
            </div>
          )}

          {currentView === 'qr-generation' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="QR Code Generation" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><QRGeneration /></div>
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Analytics & Insights" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><Analytics /></div>
            </div>
          )}

          {currentView === 'visitor-engagement' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Visitor Engagement Manager" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><VisitorEngagementManager user={user!} /></div>
            </div>
          )}

          {currentView === 'products' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Product Management" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16">
                <ProductManager shopId={(user as any)?.shop_id || 0} onBack={() => setCurrentView('dashboard')} /> 
              </div>
            </div>
          )}

          {currentView === 'payments' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="MPESA Payment Management" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><PaymentManagement /></div>
            </div>
          )}

          {currentView === 'payment-reception' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Payment Reception" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><ReceivingPaymentModule /></div>
            </div>
          )}

          {currentView === 'messaging' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Payment Receipt Messaging" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><PaymentReceiptMessaging /></div>
            </div>
          )}

          {currentView === 'inquiries' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Customer Inquiries" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><CustomerInquiries /></div>
            </div>
          )}

          {currentView === 'manifestos' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Manifesto Builder" 
                user={user} 
                onLogout={logout} 
                showUserMenu={showUserMenu} 
                setShowUserMenu={setShowUserMenu} 
              />
              <div className="pt-16">
                <ManifestoManager />
              </div>
            </div>
          )}

          {currentView === 'diaspora-hub' && (
            <div className="min-h-screen">
              <Header 
                onBack={() => setCurrentView('dashboard')} 
                title="Diaspora Engagement Hub" 
                user={user} 
                onLogout={logout} 
                showUserMenu={showUserMenu} 
                setShowUserMenu={setShowUserMenu} 
              />
              <div className="pt-16">
                <DiasporaManager shopId={(user as any)?.shop_id?.toString() || ""} />
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="min-h-screen">
              <Header onBack={() => setCurrentView('dashboard')} title="Settings" user={user} onLogout={logout} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} />
              <div className="pt-16"><SettingsPage /></div>
            </div>
          )}

          {/* ADD THIS AT THE END */}
          {!['campaigns', 'pos', 'templates', 'qr-generation', 'analytics', 'visitor-engagement', 'products', 'payments', 'payment-reception', 'messaging', 'inquiries', 'manifestos', 'diaspora-hub', 'settings', 'dashboard'].includes(currentView) && (
            <div className="pt-20 text-center">
              <p>View "{currentView}" not found. Returning to dashboard...</p>
              <button onClick={() => setCurrentView('dashboard')} className="text-blue-600 underline">
                Go Back
              </button>
            </div>
          )}

        </div>
      </ProtectedRoute>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
