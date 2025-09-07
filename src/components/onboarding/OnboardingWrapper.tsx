import React from 'react';
import { OnboardingProvider } from './OnboardingManager';
import { OnboardingInitializer } from './OnboardingInitializer';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const handleTourComplete = async () => {
    // This will be handled by OnboardingInitializer
  };

  return (
    <OnboardingProvider onTourComplete={handleTourComplete}>
      <OnboardingInitializer />
      {children}
    </OnboardingProvider>
  );
};