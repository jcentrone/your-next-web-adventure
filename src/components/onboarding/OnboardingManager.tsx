import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OnboardingTooltip } from './OnboardingTooltip';

interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    target: '[data-onboarding="logo"]',
    title: 'Welcome to HomeReportPro!',
    content: 'Let\'s take a quick tour to get you started with your home inspection reporting platform.',
    position: 'bottom'
  },
  {
    id: 'dashboard',
    target: '[data-onboarding="dashboard"]',
    title: 'Dashboard',
    content: 'View your recent reports, upcoming inspections, and key metrics from your main dashboard.',
    position: 'bottom'
  },
  {
    id: 'reports',
    target: '[data-onboarding="reports"]',
    title: 'Reports',
    content: 'Create, edit, and manage all your inspection reports. Access templates and generate professional PDFs.',
    position: 'bottom'
  },
  {
    id: 'calendar',
    target: '[data-onboarding="calendar"]',
    title: 'Calendar',
    content: 'Schedule inspections, manage appointments, and view your upcoming work calendar.',
    position: 'bottom'
  },
  {
    id: 'contacts',
    target: '[data-onboarding="contacts"]',
    title: 'Contacts',
    content: 'Manage your clients, real estate agents, and other professional contacts.',
    position: 'bottom'
  },
  {
    id: 'settings',
    target: '[data-onboarding="user-menu"]',
    title: 'Settings & Profile',
    content: 'Access your account settings, customize report templates, and manage your organization preferences.',
    position: 'left'
  }
];

interface OnboardingProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ 
  children, 
  onComplete 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipArrow, setTooltipArrow] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');

  const calculateTooltipPosition = useCallback((targetSelector: string, preferredPosition: string = 'bottom') => {
    const element = document.querySelector(targetSelector) as HTMLElement;
    if (!element) return { position: { x: 0, y: 0 }, arrow: 'bottom' as const };

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let position = { x: 0, y: 0 };
    let arrow: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    
    // Determine best position based on available space
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;
    
    // Try preferred position first, fallback to best available space
    if (preferredPosition === 'top' && spaceAbove > 150) {
      position = { x: rect.left + rect.width / 2, y: rect.top };
      arrow = 'top';
    } else if (preferredPosition === 'bottom' && spaceBelow > 150) {
      position = { x: rect.left + rect.width / 2, y: rect.bottom };
      arrow = 'bottom';
    } else if (preferredPosition === 'left' && spaceLeft > 300) {
      position = { x: rect.left, y: rect.top + rect.height / 2 };
      arrow = 'left';
    } else if (preferredPosition === 'right' && spaceRight > 300) {
      position = { x: rect.right, y: rect.top + rect.height / 2 };
      arrow = 'right';
    } else {
      // Fallback to position with most space
      if (spaceBelow > spaceAbove && spaceBelow > 150) {
        position = { x: rect.left + rect.width / 2, y: rect.bottom };
        arrow = 'bottom';
      } else if (spaceAbove > 150) {
        position = { x: rect.left + rect.width / 2, y: rect.top };
        arrow = 'top';
      } else if (spaceRight > spaceLeft && spaceRight > 300) {
        position = { x: rect.right, y: rect.top + rect.height / 2 };
        arrow = 'right';
      } else if (spaceLeft > 300) {
        position = { x: rect.left, y: rect.top + rect.height / 2 };
        arrow = 'left';
      } else {
        // Default fallback
        position = { x: rect.left + rect.width / 2, y: rect.bottom };
        arrow = 'bottom';
      }
    }
    
    return { position, arrow };
  }, []);

  const updateTooltipPosition = useCallback(() => {
    if (!isActive || currentStep >= ONBOARDING_STEPS.length) return;
    
    const step = ONBOARDING_STEPS[currentStep];
    const { position, arrow } = calculateTooltipPosition(step.target, step.position);
    setTooltipPosition(position);
    setTooltipArrow(arrow);
  }, [isActive, currentStep, calculateTooltipPosition]);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    onComplete?.();
  }, [onComplete]);

  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < ONBOARDING_STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  // Update tooltip position when step changes or window resizes
  useEffect(() => {
    updateTooltipPosition();
  }, [updateTooltipPosition]);

  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => updateTooltipPosition();
    const handleScroll = () => updateTooltipPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isActive, updateTooltipPosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, endTour]);

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
      
      {isActive && currentStepData && createPortal(
        <OnboardingTooltip
          title={currentStepData.title}
          content={currentStepData.content}
          position={tooltipPosition}
          arrow={tooltipArrow}
          currentStep={currentStep}
          totalSteps={ONBOARDING_STEPS.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={endTour}
          isFirst={currentStep === 0}
          isLast={currentStep === ONBOARDING_STEPS.length - 1}
        />,
        document.body
      )}
    </OnboardingContext.Provider>
  );
};