import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { getOptimizedRoute } from './routeOptimizer';
import { RouteChoiceDialog } from './RouteChoiceDialog';
import { routeOptimizationApi } from '@/integrations/supabase/routeOptimizationApi';
import { toast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  location?: string;
  title: string;
  appointment_date: string;
}

interface EnhancedRouteOptimizerProps {
  appointments: Appointment[];
  selectedDate: string;
  onRouteOptimized?: (route: any) => void;
}

export function EnhancedRouteOptimizer({ 
  appointments, 
  selectedDate, 
  onRouteOptimized 
}: EnhancedRouteOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [existingRoute, setExistingRoute] = useState<any>(null);

  useEffect(() => {
    loadSettings();
    loadExistingRoute();
  }, [selectedDate]);

  const loadSettings = async () => {
    try {
      const routeSettings = await routeOptimizationApi.getSettings();
      setSettings(routeSettings);
    } catch (error) {
      console.error('Error loading route settings:', error);
    }
  };

  const loadExistingRoute = async () => {
    try {
      const route = await routeOptimizationApi.getDailyRoute(selectedDate);
      setExistingRoute(route ?? null);
    } catch (error) {
      console.error('Error loading existing route:', error);
    }
  };

  const handleOptimizeRoute = async () => {
    if (!settings?.home_base_formatted_address) {
      toast({
        title: 'Home base required',
        description: 'Please configure your home base address in Settings > Integrations first.',
        variant: 'destructive',
      });
      return;
    }

    if (appointments.length === 0) {
      toast({
        title: 'No appointments',
        description: 'No appointments found for the selected date.',
        variant: 'destructive',
      });
      return;
    }

    setIsOptimizing(true);

    try {
      // Build addresses array starting with home base
      const addresses = [settings.home_base_formatted_address];
      const appointmentsWithLocation: Appointment[] = [];

      // Add appointment locations
      appointments.forEach((apt) => {
        if (apt.location) {
          addresses.push(apt.location);
          appointmentsWithLocation.push(apt);
        }
      });

      // Add return to home if enabled
      if (settings.always_return_home && addresses.length > 1) {
        addresses.push(settings.home_base_formatted_address);
      }

      // Get optimized route from Google Maps
      const route = await getOptimizedRoute(addresses);
      const totalDistance = route.totalDistanceMiles;
      const totalDuration = route.totalDurationMinutes;
      const estimatedCost = totalDistance * (settings.mileage_rate || 0.67);
      const optimizedOrder = route.waypointOrder.map(
        (i) => appointmentsWithLocation[i].id
      );

      // Save route to database
      const dailyRoute = await routeOptimizationApi.createOrUpdateDailyRoute({
        user_id: '', // Will be set by RLS
        route_date: selectedDate,
        optimized_order: optimizedOrder,
        total_distance_miles: totalDistance,
        total_duration_minutes: totalDuration,
        estimated_fuel_cost: estimatedCost,
        start_address: settings.home_base_formatted_address,
        end_address: settings.always_return_home ? settings.home_base_formatted_address : addresses[addresses.length - 1],
        waypoints: addresses.slice(1, -1).map(addr => ({ address: addr })),
        google_maps_url: route.googleMapsUrl,
        waze_url: route.wazeUrl,
        is_optimized: true,
      });

      setOptimizedRoute({ ...route, ...dailyRoute });
      setExistingRoute(dailyRoute);
      setShowRouteDialog(true);
      
      onRouteOptimized?.(dailyRoute);

      toast({
        title: 'Route optimized',
        description: `Saved ${totalDistance.toFixed(1)} miles, estimated $${estimatedCost.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: 'Optimization failed',
        description: 'Could not optimize route. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const openExistingRoute = () => {
    if (existingRoute?.google_maps_url) {
      setOptimizedRoute(existingRoute);
      setShowRouteDialog(true);
    }
  };

  if (!settings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Configure route optimization in Settings &gt; Integrations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Home Base: {settings.home_base_address}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointments.length} appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${settings.mileage_rate}/mile</span>
            </div>
          </div>

          {existingRoute && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Route Created</p>
                  <p className="text-sm text-muted-foreground">
                    {existingRoute.total_distance_miles?.toFixed(1)} miles • ${existingRoute.estimated_fuel_cost?.toFixed(2)} estimated
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openExistingRoute}
                >
                  View Route
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={existingRoute ? openExistingRoute : handleOptimizeRoute}
              disabled={isOptimizing || appointments.length === 0}
              className="flex-1"
            >
              {isOptimizing ? 'Optimizing...' : 'View Route'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {optimizedRoute && (
        <RouteChoiceDialog
          open={showRouteDialog}
          onOpenChange={setShowRouteDialog}
          googleMapsUrl={optimizedRoute.google_maps_url || optimizedRoute.googleMapsUrl}
          wazeUrl={optimizedRoute.waze_url || optimizedRoute.wazeUrl}
          totalDistanceMiles={optimizedRoute.total_distance_miles || optimizedRoute.totalDistanceMiles}
          totalDurationMinutes={optimizedRoute.total_duration_minutes || optimizedRoute.totalDurationMinutes}
          estimatedFuelCost={optimizedRoute.estimated_fuel_cost}
          preferredNavApp={settings?.preferred_nav_app}
        />
      )}
    </>
  );
}