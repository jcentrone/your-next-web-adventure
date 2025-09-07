import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OnboardingTooltip } from './OnboardingTooltip';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    position: 'right'
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
    id: 'accounts',
    target: '[data-onboarding="accounts"]',
    title: 'Accounts',
    content: 'Manage client accounts, property information, and business relationships for organized reporting.',
    position: 'bottom'
  },
  {
    id: 'contacts',
    target: '[data-onboarding="contacts"]',
    title: 'Contacts',
    content: 'Store and organize your clients, real estate agents, and other professional contacts.',
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
    id: 'tasks',
    target: '[data-onboarding="tasks"]',
    title: 'Tasks',
    content: 'Track your to-do items, follow-ups, and inspection-related tasks to stay organized.',
    position: 'bottom'
  },
  {
    id: 'analytics',
    target: '[data-onboarding="analytics"]',
    title: 'Analytics',
    content: 'View business insights, report statistics, and performance metrics to grow your inspection business.',
    position: 'bottom'
  },
  {
    id: 'settings',
    target: '[data-onboarding="settings-menu"]',
    title: 'Settings & Profile',
    content: 'Access your account settings, customize report templates, and manage your organization preferences.',
    position: 'left'
  }
];

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ 
  children
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipArrow, setTooltipArrow] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [tooltipTransform, setTooltipTransform] = useState('translateX(-50%)');

  const markOnboardingCompleted = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking onboarding as completed:', error);
        toast({
          title: "Error",
          description: "Failed to save onboarding progress",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in markOnboardingCompleted:', error);
    }
  };

  const calculateTooltipPosition = useCallback((targetSelector: string, preferredPosition: string = 'bottom') => {
    const element = document.querySelector(targetSelector) as HTMLElement;
    if (!element) return { position: { x: 0, y: 0 }, arrow: 'bottom' as const, transform: 'translateX(-50%)' };

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320; // max-w-[320px]
    const tooltipHeight = 200; // estimated height
    const margin = 16; // minimum margin from viewport edge
    
    let position = { x: 0, y: 0 };
    let arrow: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    let transform = 'translateX(-50%)';
    
    // Special handling for settings menu item
    if (targetSelector === '[data-onboarding="settings-menu"]') {
      // Position to the left of the settings menu item
      position = { 
        x: Math.max(margin + tooltipWidth / 2, rect.left - margin), 
        y: rect.top + rect.height / 2 
      };
      arrow = 'right';
      transform = 'translate(-100%, -50%)';
      return { position, arrow, transform };
    }
    
    // Determine best position based on available space
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;
    
    // Calculate initial position based on preferred direction
    let initialX = rect.left + rect.width / 2;
    let initialY = rect.bottom + margin; // Add offset for bottom position
    
    if (preferredPosition === 'top' && spaceAbove > tooltipHeight + margin) {
      initialY = rect.top - margin; // Add offset for top position
      arrow = 'top';
    } else if (preferredPosition === 'bottom' && spaceBelow > tooltipHeight + margin) {
      initialY = rect.bottom + margin; // Add offset for bottom position
      arrow = 'bottom';
    } else if (preferredPosition === 'left' && spaceLeft > tooltipWidth + margin) {
      initialX = rect.left - margin; // Add offset for left position
      initialY = rect.top + rect.height / 2;
      arrow = 'left';
      transform = 'translateY(-50%)';
    } else if (preferredPosition === 'right' && spaceRight > tooltipWidth + margin) {
      initialX = rect.right + margin; // Add offset for right position
      initialY = rect.top + rect.height / 2;
      arrow = 'right';
      transform = 'translateY(-50%)';
    } else {
      // Fallback logic - choose best available space
      if (spaceBelow > tooltipHeight + margin) {
        initialY = rect.bottom + margin;
        arrow = 'bottom';
      } else if (spaceAbove > tooltipHeight + margin) {
        initialY = rect.top - margin;
        arrow = 'top';
      } else if (spaceRight > tooltipWidth + margin) {
        initialX = rect.right + margin;
        initialY = rect.top + rect.height / 2;
        arrow = 'right';
        transform = 'translateY(-50%)';
      } else if (spaceLeft > tooltipWidth + margin) {
        initialX = rect.left - margin;
        initialY = rect.top + rect.height / 2;
        arrow = 'left';
        transform = 'translateY(-50%)';
      }
    }
    
    // Adjust horizontal position for top/bottom arrows to prevent overflow
    if (arrow === 'top' || arrow === 'bottom') {
      const halfTooltipWidth = tooltipWidth / 2;
      
      // Check if centered position would overflow
      if (initialX - halfTooltipWidth < margin) {
        // Too far left - align to left edge with margin
        initialX = margin + halfTooltipWidth;
      } else if (initialX + halfTooltipWidth > viewportWidth - margin) {
        // Too far right - align to right edge with margin
        initialX = viewportWidth - margin - halfTooltipWidth;
      }
      
      transform = 'translateX(-50%)';
    }
    
    // Adjust vertical position for left/right arrows to prevent overflow
    if (arrow === 'left' || arrow === 'right') {
      const halfTooltipHeight = tooltipHeight / 2;
      
      if (initialY - halfTooltipHeight < margin) {
        initialY = margin + halfTooltipHeight;
      } else if (initialY + halfTooltipHeight > viewportHeight - margin) {
        initialY = viewportHeight - margin - halfTooltipHeight;
      }
      
      transform = 'translateY(-50%)';
    }
    
    position = { x: initialX, y: initialY };
    
    return { position, arrow, transform };
  }, []);

  const updateTooltipPosition = useCallback(() => {
    if (!isActive || currentStep >= ONBOARDING_STEPS.length) return;
    
    const step = ONBOARDING_STEPS[currentStep];
    
    // Add small delay for settings step to ensure dropdown is rendered
    if (step.id === 'settings') {
      setTimeout(() => {
        const { position, arrow, transform } = calculateTooltipPosition(step.target, step.position);
        setTooltipPosition(position);
        setTooltipArrow(arrow);
        setTooltipTransform(transform);
      }, 100);
    } else {
      const { position, arrow, transform } = calculateTooltipPosition(step.target, step.position);
      setTooltipPosition(position);
      setTooltipArrow(arrow);
      setTooltipTransform(transform);
    }
  }, [isActive, currentStep, calculateTooltipPosition]);

  const startTour = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      setCurrentStep(0);
    }
  }, [isActive]);

  const endTour = useCallback(async () => {
    setIsActive(false);
    setCurrentStep(0);
    await markOnboardingCompleted();
  }, [markOnboardingCompleted]);

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
          transform={tooltipTransform}
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