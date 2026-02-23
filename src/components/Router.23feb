import React from 'react';

interface RouterProps {
  children: React.ReactNode;
}

export function Router({ children }: RouterProps) {
  const [route, setRoute] = React.useState(() => {
    // Get initial route from URL hash or default to '/'
    return window.location.hash.slice(1) || '/';
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

// Campaign Viewer Route Component
export function CampaignViewerRoute({ campaignId }: { campaignId: string }) {
  const { CampaignViewer } = require('./CampaignViewer');
  return <CampaignViewer campaignId={campaignId} />;
}

// Dashboard Route Component
export function DashboardRoute({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
