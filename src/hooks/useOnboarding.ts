import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showTour, setShowTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setLoading(false);
          return;
        }

        if (profile && !profile.onboarding_completed) {
          // Small delay to ensure page is fully loaded
          const timer = setTimeout(() => {
            setShowTour(true);
            setLoading(false);
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in checkOnboardingStatus:', error);
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

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

  const startTour = () => {
    setShowTour(true);
  };

  const completeTour = async () => {
    setShowTour(false);
    await markOnboardingCompleted();
  };

  const resetOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting onboarding:', error);
        toast({
          title: "Error",
          description: "Failed to reset onboarding",
          variant: "destructive",
        });
        return;
      }

      setShowTour(true);
      toast({
        title: "Success",
        description: "Onboarding tour will restart",
      });
    } catch (error) {
      console.error('Error in resetOnboarding:', error);
    }
  };

  return {
    showTour,
    loading,
    startTour,
    completeTour,
    resetOnboarding,
  };
};