import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Circle, 
  ExternalLink,
  Flag,
  Home
} from 'lucide-react';
import { routeOptimizationApi } from '@/integrations/supabase/routeOptimizationApi';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  title: string;
  location?: string;
  appointment_date: string;
  completed: boolean;
}

export default function RouteView() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const { data: route, isLoading } = useQuery({
    queryKey: ['daily-route', routeId],
    queryFn: () => routeOptimizationApi.getDailyRouteById(routeId!),
    enabled: !!routeId,
  });

  useEffect(() => {
    if (route?.optimized_order) {
      // Mock appointment data based on route - in real app this would come from appointments API
      const mockAppointments: Appointment[] = route.optimized_order.map((id: string, index: number) => ({
        id,
        title: `Appointment ${index + 1}`,
        location: route.waypoints?.[index]?.address || 'Location not available',
        appointment_date: route.route_date,
        completed: false,
      }));
      setAppointments(mockAppointments);
    }
  }, [route]);

  const handleToggleComplete = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, completed: !apt.completed }
          : apt
      )
    );
    
    const newCompletedCount = appointments.filter(apt => 
      apt.id === appointmentId ? !apt.completed : apt.completed
    ).length;
    
    setCompletedCount(newCompletedCount);
    
    toast({
      title: "Appointment updated",
      description: "Route progress has been updated",
    });
  };

  const openInGoogleMaps = () => {
    if (route?.google_maps_url) {
      window.open(route.google_maps_url, '_blank');
    }
  };

  const openInWaze = () => {
    if (route?.waze_url) {
      window.open(route.waze_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Route not found</h1>
          <Button onClick={() => navigate('/calendar')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  const progress = appointments.length > 0 ? (completedCount / appointments.length) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/calendar')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Route Overview</h1>
            <p className="text-muted-foreground">
              {new Date(route.route_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={openInWaze}>
            Open in Waze
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <Button onClick={openInGoogleMaps}>
            <Navigation className="h-4 w-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </div>

      {/* Route Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Distance</p>
                <p className="text-lg font-bold">{route.total_distance_miles?.toFixed(1)} mi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Estimated Time</p>
                <p className="text-lg font-bold">{Math.round(route.total_duration_minutes || 0)} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-lg font-bold">${route.estimated_fuel_cost?.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-lg font-bold">{completedCount}/{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Route Progress
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {progress.toFixed(0)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
        </CardContent>
      </Card>

      {/* Route Stops */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route Stops
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Starting Point */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Starting Point</p>
              <p className="text-sm text-muted-foreground">{route.start_address}</p>
            </div>
            <Badge variant="outline">Home Base</Badge>
          </div>

          {/* Appointments */}
          {appointments.map((appointment, index) => (
            <div key={appointment.id}>
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => handleToggleComplete(appointment.id)}
                >
                  {appointment.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <p className={`font-medium ${appointment.completed ? 'line-through text-muted-foreground' : ''}`}>
                    Stop {index + 1}: {appointment.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{appointment.location}</p>
                </div>
                
                <Badge variant={appointment.completed ? "default" : "secondary"}>
                  {appointment.completed ? "Complete" : "Pending"}
                </Badge>
              </div>
              
              {index < appointments.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-px h-4 bg-border"></div>
                </div>
              )}
            </div>
          ))}

          {/* End Point */}
          {route.end_address !== route.start_address && (
            <>
              <div className="flex justify-center py-2">
                <div className="w-px h-4 bg-border"></div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  <Flag className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">End Point</p>
                  <p className="text-sm text-muted-foreground">{route.end_address}</p>
                </div>
                <Badge variant="outline">Destination</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}