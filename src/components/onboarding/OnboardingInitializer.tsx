import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/components/onboarding/OnboardingManager';
import { useToast } from '@/hooks/use-toast';

export const OnboardingInitializer = () => {
  const { user } = useAuth();
  const { startTour, isActive } = useOnboarding();
  const { toast } = useToast();

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

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || isActive) return;

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
  }, [user, isActive, startTour]);

  // Listen for tour ending and mark as completed
  useEffect(() => {
    let previouslyActive = false;
    
    const handleTourEnd = async () => {
      if (previouslyActive && !isActive) {
        // Tour just ended, mark as completed
        await markOnboardingCompleted();
      }
      previouslyActive = isActive;
    };

    handleTourEnd();
  }, [isActive, markOnboardingCompleted]);

  // This component doesn't render anything
  return null;
};