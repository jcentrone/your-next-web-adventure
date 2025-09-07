import React from 'react';
import { OnboardingProvider } from './OnboardingManager';
import { OnboardingInitializer } from './OnboardingInitializer';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  return (
    <OnboardingProvider>
      <OnboardingInitializer />
      {children}
    </OnboardingProvider>
  );
};