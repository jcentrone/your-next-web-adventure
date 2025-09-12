import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MapPin, Clock, DollarSign, Navigation } from "lucide-react";
import { DailyRoute } from "@/integrations/supabase/routeOptimizationApi";

interface RoutesListViewProps {
  routes: DailyRoute[];
  onViewRoute: (routeId: string) => void;
}

export const RoutesListView: React.FC<RoutesListViewProps> = ({ routes, onViewRoute }) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Stops</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="font-medium">
                  {new Date(route.route_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                {route.start_address && (
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                    From: {route.start_address}
                  </div>
                )}
              </TableCell>
              <TableCell>
              <Badge variant={route.is_optimized ? "default" : "secondary"}>
                {route.is_optimized ? "Optimized" : "Manual"}
              </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{route.total_distance_miles?.toFixed(1)} mi</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{Math.round(route.total_duration_minutes || 0)} min</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${route.estimated_fuel_cost?.toFixed(2)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span>{Array.isArray(route.waypoints) ? route.waypoints.length : 0} stops</span>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  onClick={() => onViewRoute(route.id!)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};