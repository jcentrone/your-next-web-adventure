import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MapPin, Clock, DollarSign, Navigation } from "lucide-react";
import { DailyRoute } from "@/integrations/supabase/routeOptimizationApi";

interface RoutesCardViewProps {
  routes: DailyRoute[];
  onViewRoute: (routeId: string) => void;
}

export const RoutesCardView: React.FC<RoutesCardViewProps> = ({ routes, onViewRoute }) => {
  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Card key={route.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(route.route_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={route.is_optimized ? "default" : "secondary"}>
                  {route.is_optimized ? "Optimized" : "Manual"}
                </Badge>
                <Button 
                  size="sm" 
                  onClick={() => onViewRoute(route.id!)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Route
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{route.total_distance_miles?.toFixed(1)} mi</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{Math.round(route.total_duration_minutes || 0)} min</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Estimated Cost</p>
                  <p className="font-medium">${route.estimated_fuel_cost?.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Stops</p>
                  <p className="font-medium">
                    {Array.isArray(route.waypoints) ? route.waypoints.length : 0} stops
                  </p>
                </div>
              </div>
            </div>
            
            {route.start_address && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">Starting from:</p>
                <p className="text-sm font-medium truncate">{route.start_address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};