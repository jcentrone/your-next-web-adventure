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
  Minimize2,
  LocateIcon,
  Home,
  Flag,
  ChevronRight
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
  const userLocationMarker = useRef<any>(null);
  const customMarkers = useRef<any[]>([]); // Store custom markers for cleanup
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    getUserLocation();
    initializeMap();
  }, [route]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          // Continue without user location
        }
      );
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      const google = await loadGoogleMapsApi();

      // Determine initial center - use user location or route center
      let initialCenter = { lat: 39.8283, lng: -98.5795 }; // Default to center of US
      
      if (userLocation) {
        initialCenter = userLocation;
      } else if (route.start_address) {
        // Try to geocode the home base address for initial centering
        const geocoder = new google.maps.Geocoder();
        try {
          const result = await geocoder.geocode({ address: route.start_address });
          if (result.results[0]) {
            initialCenter = {
              lat: result.results[0].geometry.location.lat(),
              lng: result.results[0].geometry.location.lng(),
            };
          }
        } catch (e) {
          console.log('Could not geocode start address for centering');
        }
      }

      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: initialCenter,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
      });

      mapInstance.current = map;

      // Add user location marker if available
      if (userLocation) {
        const google = window.google;
        userLocationMarker.current = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
      }

      // Initialize directions renderer with custom markers
      const renderer = new google.maps.DirectionsRenderer({
        draggable: false,
        panel: null,
        suppressMarkers: true, // We'll add custom markers
      });
      
      renderer.setMap(map);
      directionsRenderer.current = renderer;

      // Calculate and display route
      await displayRoute();
      
      // Add custom markers after a small delay to ensure route is rendered
      setTimeout(() => {
        if (directions) {
          addCustomMarkers(directions);
        }
      }, 100);
      
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

      // Clear any existing markers first
      if (customMarkers.current.length > 0) {
        customMarkers.current.forEach(marker => marker.setMap(null));
        customMarkers.current = [];
      }

      // Build route structure: NEVER add home base as waypoint
      const waypoints = [];
      
      // Add ONLY appointment locations as waypoints
      if (route.waypoints && route.waypoints.length > 0) {
        route.waypoints.forEach(wp => {
          waypoints.push({
            location: wp.address,
            stopover: true,
          });
        });
      }

      // Set destination - for round trips, use start address as destination
      const destination = (route.end_address && route.end_address !== route.start_address) 
        ? route.end_address 
        : route.start_address;

      const result = await directionsService.route({
        origin: route.start_address, // Start from home base
        destination: destination, // End at home base (for round trips) or different location
        waypoints: waypoints, // Only appointments, NO home base
        optimizeWaypoints: false, // Maintain intended order
        travelMode: google.maps.TravelMode.DRIVING,
      });

      // Ensure suppressMarkers is set to true
      directionsRenderer.current.setOptions({
        suppressMarkers: true,
        suppressInfoWindows: false
      });
      
      directionsRenderer.current.setDirections(result);
      setDirections(result);
      
      // Add custom markers after route is set
      setTimeout(() => {
        addCustomMarkers(result);
      }, 100);

      // Add custom markers for better visualization
      addCustomMarkers(result);
      
    } catch (error) {
      console.error('Error displaying route:', error);
      toast({
        title: "Route Error",
        description: "Failed to calculate the route.",
        variant: "destructive",
      });
    }
  };

  const addCustomMarkers = (directionsResult: any) => {
    if (!mapInstance.current) return;

    const google = window.google;
    const route = directionsResult.routes[0];
    const leg = route.legs[0];
    const finalLeg = route.legs[route.legs.length - 1];
    
    // Check if this is a round trip (same start and end)
    const isRoundTrip = route.start_address === route.end_address;

    if (isRoundTrip) {
      // Create a home base marker with tooltip-style appearance
      const homeMarker = new google.maps.Marker({
        position: leg.start_location,
        map: mapInstance.current,
        title: `Home Base - Start & End Point\n${route.start_address || ''}`,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 20,
          fillColor: '#8B5CF6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 0,
        },
        label: {
          text: '🏠',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '16px'
        },
        zIndex: 1000,
      });
      
      customMarkers.current.push(homeMarker);
    } else {
      // Separate start and end markers for non-round trips
      const startMarker = new google.maps.Marker({
        position: leg.start_location,
        map: mapInstance.current,
        title: 'Start Location',
        label: { text: 'START', color: 'white', fontWeight: 'bold', fontSize: '8px' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });
      customMarkers.current.push(startMarker);

      // Add end marker
      const endMarker = new google.maps.Marker({
        position: finalLeg.end_location,
        map: mapInstance.current,
        title: 'Final Destination',
        label: { text: 'END', color: 'white', fontWeight: 'bold', fontSize: '8px' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });
      customMarkers.current.push(endMarker);
    }

    // Add appointment markers with numbers
    route.legs.forEach((leg: any, index: number) => {
      if (index < route.legs.length - 1) { // Don't mark the final destination here
        const appointmentNumber = index + 1; // Start numbering from 1
        const appointmentMarker = new google.maps.Marker({
          position: leg.end_location,
          map: mapInstance.current,
          title: `Appointment ${appointmentNumber}\n${leg.end_address || ''}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: '#22C55E',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          label: {
            text: appointmentNumber.toString(),
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          zIndex: 500,
        });
        customMarkers.current.push(appointmentMarker);
      }
    });
  };

  const recenterMap = () => {
    displayRoute();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapInstance.current) {
      mapInstance.current.setCenter(userLocation);
      mapInstance.current.setZoom(15);
    } else {
      getUserLocation();
    }
  };

  const getNextStep = () => {
    if (!directions) return null;
    
    const route = directions.routes[0];
    let stepCount = 0;
    
    for (let legIndex = 0; legIndex < route.legs.length; legIndex++) {
      for (let stepIndex = 0; stepIndex < route.legs[legIndex].steps.length; stepIndex++) {
        if (stepCount === currentStep) {
          return route.legs[legIndex].steps[stepIndex];
        }
        stepCount++;
      }
    }
    return null;
  };

  const nextStep = () => {
    if (!directions) return;
    
    const totalSteps = directions.routes[0].legs.reduce(
      (total: number, leg: any) => total + leg.steps.length, 
      0
    );
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nextAppointment = appointments.find(apt => !apt.completed);
  const completedAppointments = appointments.filter(apt => apt.completed);
  const nextStepData = getNextStep();

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
            <Button variant="outline" size="sm" onClick={centerOnUserLocation}>
              <LocateIcon className="h-4 w-4" />
            </Button>
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

        {/* Navigation Controls */}
        {directions && (
          <div className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Turn-by-Turn Navigation
              </h4>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
                  ←
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={nextStep} 
                  disabled={!directions || currentStep >= directions.routes[0].legs.reduce(
                    (total: number, leg: any) => total + leg.steps.length, 0
                  ) - 1}
                >
                  →
                </Button>
              </div>
            </div>
            
            {nextStepData && (
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                  <div>
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: nextStepData.instructions }}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {nextStepData.distance.text} • {nextStepData.duration.text}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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