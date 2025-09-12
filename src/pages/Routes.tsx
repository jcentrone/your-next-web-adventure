import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { 
  CalendarIcon, 
  MapPin, 
  Clock, 
  DollarSign, 
  Navigation,
  Route as RouteIcon,
  Eye
} from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { routeOptimizationApi } from '@/integrations/supabase/routeOptimizationApi';
import { useQuery } from '@tanstack/react-query';

export default function Routes() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [currentPage, setCurrentPage] = useState(1);
  const routesPerPage = 10;

  // Fetch routes based on date range
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['daily-routes', dateRange?.from?.toISOString().split('T')[0], dateRange?.to?.toISOString().split('T')[0]],
    queryFn: () => routeOptimizationApi.getDailyRoutes(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  // Filter routes by selected date if one is selected
  const filteredRoutes = selectedDate 
    ? routes.filter(route => route.route_date === format(selectedDate, 'yyyy-MM-dd'))
    : routes;

  // Pagination calculations
  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
  const startIndex = (currentPage - 1) * routesPerPage;
  const endIndex = startIndex + routesPerPage;
  const currentRoutes = filteredRoutes.slice(startIndex, endIndex);

  // Reset pagination when routes change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredRoutes.length]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleViewRoute = (routeId: string) => {
    navigate(`/route/${routeId}`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages = [];
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {currentPage > 3 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                  1
                </PaginationLink>
              </PaginationItem>
              {currentPage > 4 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}
          
          {getVisiblePages().map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RouteIcon className="h-6 w-6" />
            Routes
          </h1>
          <p className="text-muted-foreground">
            View and manage your optimized daily routes
          </p>
        </div>
        
        {/* Date Range and Single Date Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">or</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Single date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                {selectedDate && (
                  <div className="p-3 pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedDate(undefined)}
                      className="w-full"
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Routes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Routes</p>
                <p className="text-lg font-bold">{filteredRoutes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Miles</p>
                <p className="text-lg font-bold">
                  {filteredRoutes.reduce((sum, route) => sum + (route.total_distance_miles || 0), 0).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Time</p>
                <p className="text-lg font-bold">
                  {Math.round(filteredRoutes.reduce((sum, route) => sum + (route.total_duration_minutes || 0), 0))} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Cost</p>
                <p className="text-lg font-bold">
                  ${filteredRoutes.reduce((sum, route) => sum + (route.estimated_fuel_cost || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {/* Pagination Info */}
        {filteredRoutes.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredRoutes.length)} of {filteredRoutes.length} routes
            </span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        )}

        {currentRoutes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No routes found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedDate 
                  ? `No routes found for ${format(selectedDate, "PPP")}` 
                  : "No routes found in the selected date range"
                }
              </p>
              <Button onClick={() => navigate('/calendar')}>
                Go to Calendar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentRoutes.map((route) => (
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
                        onClick={() => handleViewRoute(route.id!)}
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
          </>
        )}
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}