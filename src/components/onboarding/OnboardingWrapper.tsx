import React, { useRef } from 'react';
import { OnboardingProvider } from './OnboardingManager';
import { OnboardingInitializer, OnboardingInitializerRef } from './OnboardingInitializer';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const initializerRef = useRef<OnboardingInitializerRef>(null);

  const handleTourComplete = async () => {
    await initializerRef.current?.markOnboardingCompleted();
  };

  return (
    <OnboardingProvider onTourComplete={handleTourComplete}>
      <OnboardingInitializer ref={initializerRef} />
      {children}
    </OnboardingProvider>
  );
};