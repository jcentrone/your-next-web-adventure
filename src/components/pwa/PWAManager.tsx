import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePWAPrompt } from '@/hooks/usePWAPrompt';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAOfflineIndicator } from './PWAOfflineIndicator';

export function PWAManager() {
  const { isNewUser, markUserAsReturning } = useAuth();
  const { showInstallPrompt, triggerInstallPrompt, hideInstallPrompt } = usePWAPrompt();

  useEffect(() => {
    // Show install prompt for new users after they sign up
    if (isNewUser) {
      triggerInstallPrompt();
      // Don't immediately mark as returning - let them interact with the prompt first
    }
  }, [isNewUser, triggerInstallPrompt]);

  const handleInstall = () => {
    // Mark user as returning after installing
    markUserAsReturning();
  };

  const handlePromptClose = () => {
    // Mark user as returning when they dismiss the prompt
    markUserAsReturning();
    hideInstallPrompt();
  };

  return (
    <>
      <PWAOfflineIndicator />
      <PWAInstallPrompt
        isOpen={showInstallPrompt}
        onOpenChange={handlePromptClose}
        onInstall={handleInstall}
      />
    </>
  );
}