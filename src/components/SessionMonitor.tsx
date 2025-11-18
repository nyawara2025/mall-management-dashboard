import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SessionMonitorProps {
  children: React.ReactNode;
}

/**
 * SessionMonitor Component
 * 
 * Monitors user activity and automatically extends session timeout
 * when users are actively using the application
 */
export function SessionMonitor({ children }: SessionMonitorProps) {
  const { isAuthenticated } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const resetTimerRef = useRef<NodeJS.Timeout>();

  // Reset session timeout when user is active
  const resetSessionTimeout = React.useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // Reset timeout for activity tracking
    lastActivityRef.current = Date.now();
  }, []);

  // Activity event handlers
  const handleActivity = React.useCallback(() => {
    resetSessionTimeout();
  }, [resetSessionTimeout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up periodic session check (every 30 seconds)
    const sessionCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // If no activity for more than 5 minutes, trigger session extension
      if (timeSinceLastActivity > 5 * 60 * 1000) {
        console.log('🔄 Extending session due to inactivity monitoring');
        resetSessionTimeout();
      }
    }, 30 * 1000); // Check every 30 seconds

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      // Clear interval
      clearInterval(sessionCheckInterval);
      
      // Clear any pending timers
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, [isAuthenticated, handleActivity]);

  return <>{children}</>;
}

/**
 * Session Warning Component
 * 
 * Displays a warning when session is about to expire
 */
export function SessionWarning() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(0);

  useEffect(() => {
    if (!user) return;

    // Simulate session timeout warning (2 minutes before expiration)
    const warningTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
    
    const warningInterval = setInterval(() => {
      const now = Date.now();
      const timeRemaining = Math.max(0, warningTime - now);
      
      setTimeLeft(Math.ceil(timeRemaining / 1000));
      
      if (timeRemaining <= 0 && !showWarning) {
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(warningInterval);
  }, [user, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-3 text-center">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-warning-foreground rounded-full animate-pulse"></div>
          <div className="text-left">
            <p className="font-medium">Session Expiring Soon</p>
            <p className="text-sm opacity-90">
              Your session expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-warning-foreground text-warning rounded text-sm font-medium"
          >
            Extend
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 border border-warning-foreground text-warning-foreground rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
