import { useEffect, useCallback, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/components/onboarding/OnboardingManager';
import { useToast } from '@/hooks/use-toast';

export const OnboardingInitializer = () => {
  const { user } = useAuth();
  const { startTour, isActive } = useOnboarding();
  const { toast } = useToast();
  const [hasCompletedThisSession, setHasCompletedThisSession] = useState(false);
  const previouslyActiveRef = useRef(false);

  const markOnboardingCompleted = useCallback(async () => {
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
  }, [user, toast]);

  // Check onboarding status only on mount and user change
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || hasCompletedThisSession) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }

        if (profile && !profile.onboarding_completed) {
          // Small delay to ensure page is fully loaded
          setTimeout(() => {
            startTour();
          }, 1000);
        }
      } catch (error) {
        console.error('Error in checkOnboardingStatus:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, startTour, hasCompletedThisSession]);

  // Listen for tour ending and mark as completed
  useEffect(() => {
    const handleTourEnd = async () => {
      if (previouslyActiveRef.current && !isActive) {
        // Tour just ended, mark as completed
        setHasCompletedThisSession(true);
        await markOnboardingCompleted();
      }
      previouslyActiveRef.current = isActive;
    };

    handleTourEnd();
  }, [isActive, markOnboardingCompleted]);

  // This component doesn't render anything
  return null;
};