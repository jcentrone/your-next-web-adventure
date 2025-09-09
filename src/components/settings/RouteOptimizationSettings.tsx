import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Save } from 'lucide-react';
import { GooglePlacesAutocomplete } from '@/components/maps/GooglePlacesAutocomplete';
import { routeOptimizationApi, type RouteOptimizationSettings } from '@/integrations/supabase/routeOptimizationApi';
import { toast } from '@/hooks/use-toast';

export function RouteOptimizationSettings() {
  const [settings, setSettings] = useState<Partial<RouteOptimizationSettings>>({
    home_base_address: '',
    default_enabled: true,
    mileage_rate: 0.67,
    always_return_home: true,
    preferred_nav_app: 'google_maps',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const existingSettings = await routeOptimizationApi.getSettings();
      if (existingSettings) {
        setSettings(existingSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings.home_base_address) {
      toast({
        title: 'Home base required',
        description: 'Please select your home base address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      await routeOptimizationApi.upsertSettings({
        user_id: '', // Will be set by RLS
        ...settings,
      } as RouteOptimizationSettings);

      toast({
        title: 'Settings saved',
        description: 'Route optimization settings have been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceChange = (place: any) => {
    console.log('🎯 handlePlaceChange called with place:', place);
    console.log('🎯 Place formatted_address:', place.formatted_address);
    console.log('🎯 Place structure:', JSON.stringify(place, null, 2));
    
    const newSettings = {
      ...settings,
      home_base_address: place.formatted_address,
      home_base_formatted_address: place.formatted_address,
      home_base_place_id: place.place_id,
      home_base_lat: place.latitude,
      home_base_lng: place.longitude,
    };
    
    console.log('🎯 New settings object:', newSettings);
    console.log('🎯 home_base_address will be set to:', newSettings.home_base_address);
    
    setSettings(newSettings);
    
    // Log after state update (will show in next render)
    setTimeout(() => {
      console.log('🎯 Settings state after update:', settings);
      console.log('🎯 Save button should be enabled:', !!settings.home_base_address);
    }, 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Route Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="home-base">Home Base Address *</Label>
          <GooglePlacesAutocomplete
            value={settings.home_base_address || ''}
            onPlaceChange={handlePlaceChange}
            placeholder="Enter your office or home address"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            This will be the starting and ending point for optimized routes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mileage-rate">Mileage Rate ($/mile)</Label>
            <Input
              id="mileage-rate"
              type="number"
              step="0.01"
              value={settings.mileage_rate || 0.67}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                mileage_rate: parseFloat(e.target.value) || 0.67 
              }))}
              placeholder="0.67"
            />
            <p className="text-sm text-muted-foreground">
              IRS standard rate: $0.67/mile (2024)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nav-app">Preferred Navigation App</Label>
            <Select
              value={settings.preferred_nav_app || 'google_maps'}
              onValueChange={(value) => setSettings(prev => ({ ...prev, preferred_nav_app: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_maps">Google Maps</SelectItem>
                <SelectItem value="waze">Waze</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="default-enabled">Enable by Default</Label>
              <p className="text-sm text-muted-foreground">
                Automatically optimize routes for new appointments
              </p>
            </div>
            <Switch
              id="default-enabled"
              checked={settings.default_enabled || false}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, default_enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="return-home">Always Return Home</Label>
              <p className="text-sm text-muted-foreground">
                Include home base as the final destination in routes
              </p>
            </div>
            <Switch
              id="return-home"
              checked={settings.always_return_home || false}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, always_return_home: checked }))}
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving || !settings.home_base_address}
          className="w-full"
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}