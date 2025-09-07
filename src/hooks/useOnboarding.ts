import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboarding = () => {
  const { isNewUser, user } = useAuth();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Only show tour if user is new and hasn't completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed') === 'true';
    
    if (isNewUser && user && !hasCompletedOnboarding) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isNewUser, user]);

  const startTour = () => {
    setShowTour(true);
  };

  const completeTour = () => {
    setShowTour(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding-completed');
    setShowTour(true);
  };

  return {
    showTour,
    startTour,
    completeTour,
    resetOnboarding,
  };
};