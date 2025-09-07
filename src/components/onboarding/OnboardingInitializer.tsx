import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/components/onboarding/OnboardingManager';

export const OnboardingInitializer = () => {
  const { user } = useAuth();
  const { startTour } = useOnboarding();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

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
  }, [user, startTour]);

  // This component doesn't render anything
  return null;
};