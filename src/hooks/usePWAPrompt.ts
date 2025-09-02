import { useState, useEffect } from 'react';
import { usePWAInstall } from './usePWAInstall';

export function usePWAPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { isInstallable, isInstalled } = usePWAInstall();

  const shouldShowPrompt = () => {
    // Don't show if already installed
    if (isInstalled) return false;
    
    // Don't show if not installable
    if (!isInstallable) return false;
    
    // Check if user dismissed within last 7 days
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false;
    }
    
    return true;
  };

  const triggerInstallPrompt = () => {
    if (shouldShowPrompt()) {
      // Small delay to ensure UI is ready
      setTimeout(() => setShowInstallPrompt(true), 1000);
    }
  };

  const hideInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    showInstallPrompt,
    triggerInstallPrompt,
    hideInstallPrompt,
    shouldShowPrompt: shouldShowPrompt()
  };
}