import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  Loader2, 
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { loadGoogleMapsApi } from './loadGoogleMapsApi';
import { useToast } from '@/hooks/use-toast';

interface EmbeddedRouteMapProps {
  route: {
    start_address?: string;
    end_address?: string;
    waypoints?: { address: string }[];
    google_maps_url?: string;
  };
  appointments: Array<{
    id: string;
    title: string;
    location?: string;
    completed: boolean;
  }>;
  onToggleComplete: (appointmentId: string) => void;
}

export default function EmbeddedRouteMap({ 
  route, 
  appointments, 
  onToggleComplete 
}: EmbeddedRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRenderer = useRef<any>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeMap();
  }, [route]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      const google = await loadGoogleMapsApi();

      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
      });

      mapInstance.current = map;

      // Initialize directions renderer
      const renderer = new google.maps.DirectionsRenderer({
        draggable: false,
        panel: null, // We'll handle our own step-by-step UI
      });
      
      renderer.setMap(map);
      directionsRenderer.current = renderer;

      // Calculate and display route
      await displayRoute();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
      toast({
        title: "Map Error",
        description: "Failed to load the navigation map.",
        variant: "destructive",
      });
    }
  };

  const displayRoute = async () => {
    if (!directionsRenderer.current || !route.start_address) return;

    try {
      const google = await loadGoogleMapsApi();
      const directionsService = new google.maps.DirectionsService();

      // Ensure home base (start_address) is always waypoint A by making it the origin
      // and all other locations (including waypoints and end_address if different) are waypoints
      const allWaypoints = [];
      
      // Add route waypoints
      if (route.waypoints) {
        route.waypoints.forEach(wp => {
          allWaypoints.push({
            location: wp.address,
            stopover: true,
          });
        });
      }
      
      // Determine destination - if end_address is different from start, use it as final destination
      // Otherwise, return to start (round trip)
      const destination = route.end_address && route.end_address !== route.start_address 
        ? route.end_address 
        : route.start_address;

      const result = await directionsService.route({
        origin: route.start_address, // Home base is always origin (waypoint A)
        destination,
        waypoints: allWaypoints,
        optimizeWaypoints: false, // Don't optimize to preserve intended order
        travelMode: google.maps.TravelMode.DRIVING,
      });

      directionsRenderer.current.setDirections(result);
    } catch (error) {
      console.error('Error displaying route:', error);
      toast({
        title: "Route Error",
        description: "Failed to calculate the route.",
        variant: "destructive",
      });
    }
  };

  const recenterMap = () => {
    displayRoute();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const nextAppointment = appointments.find(apt => !apt.completed);
  const completedAppointments = appointments.filter(apt => apt.completed);

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            In-App Navigation
            {nextAppointment && (
              <Badge variant="secondary" className="ml-2">
                Next: {nextAppointment.title}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={recenterMap}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleExpanded}>
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div 
          className={`relative bg-muted rounded-lg overflow-hidden transition-all duration-300 ${
            isExpanded ? 'h-[600px]' : 'h-[400px]'
          }`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading navigation...</span>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {appointments.slice(0, 3).map((appointment, index) => (
            <Button
              key={appointment.id}
              variant={appointment.completed ? "secondary" : "outline"}
              size="sm"
              onClick={() => onToggleComplete(appointment.id)}
              className="flex items-center gap-2"
            >
              <MapPin className="h-3 w-3" />
              {appointment.completed ? "✓" : index + 1} {appointment.title}
            </Button>
          ))}
          {appointments.length > 3 && (
            <Badge variant="outline">
              +{appointments.length - 3} more
            </Badge>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{completedAppointments.length} of {appointments.length} completed</span>
          {nextAppointment && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Next: {nextAppointment.location}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}