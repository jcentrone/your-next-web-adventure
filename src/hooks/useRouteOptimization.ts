import { useState, useEffect } from 'react';
import { routeOptimizationApi, type RouteOptimizationSettings } from '@/integrations/supabase/routeOptimizationApi';
import { useAuth } from '@/contexts/AuthContext';

export function useRouteOptimization() {
  const [settings, setSettings] = useState<RouteOptimizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const routeSettings = await routeOptimizationApi.getSettings();
      setSettings(routeSettings);
    } catch (error) {
      console.error('Error loading route settings:', error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<RouteOptimizationSettings>) => {
    if (!user) return;

    try {
      const updatedSettings = await routeOptimizationApi.upsertSettings({
        user_id: user.id,
        ...settings,
        ...newSettings,
      } as RouteOptimizationSettings);
      
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating route settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: loadSettings,
    isEnabled: settings?.default_enabled ?? false,
  };
}