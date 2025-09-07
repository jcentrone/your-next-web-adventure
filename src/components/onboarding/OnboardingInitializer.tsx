import { useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/components/onboarding/OnboardingManager';
import { useToast } from '@/hooks/use-toast';

export interface OnboardingInitializerRef {
  markOnboardingCompleted: () => Promise<void>;
}

export const OnboardingInitializer = forwardRef<OnboardingInitializerRef>((_, ref) => {
  const { user } = useAuth();
  const { startTour } = useOnboarding();
  const { toast } = useToast();
  const [hasCompletedThisSession, setHasCompletedThisSession] = useState(false);

  const markOnboardingCompleted = useCallback(async () => {
    if (!user || hasCompletedThisSession) return;

    setHasCompletedThisSession(true);

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
  }, [user, toast, hasCompletedThisSession]);

  // Expose the markOnboardingCompleted function to parent
  useImperativeHandle(ref, () => ({
    markOnboardingCompleted
  }), [markOnboardingCompleted]);

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

  // This component doesn't render anything
  return null;
});