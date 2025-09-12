import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { RoutesListView } from '@/components/routes/RoutesListView';
import { RoutesCardView } from '@/components/routes/RoutesCardView';
import { RoutesViewToggle } from '@/components/routes/RoutesViewToggle';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"list" | "card">("card");
  const effectiveView = isMobile ? "card" : view;
  const routesPerPage = 10;

  // Fetch routes based on date range
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['daily-routes', dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null, dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null],
    queryFn: () => {
      return routeOptimizationApi.getDailyRoutes(
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
      );
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  // Filter routes by selected date if one is selected
  const filteredRoutes = selectedDate 
    ? routes.filter(route => {
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        return route.route_date === selectedDateStr;
      })
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
    setSelectedDate(undefined); // Clear single date when range is selected
    setCurrentPage(1);
  };

  const handleSingleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // When a single date is selected, create a single-day date range for the query
      setDateRange({ from: date, to: date });
    } else {
      // If no date selected, reset to default week range
      setDateRange({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date())
      });
    }
    setCurrentPage(1);
  };

  const handleViewRoute = (routeId: string) => {
    navigate(`/route/${routeId}`);
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
                  onSelect={handleSingleDateSelect}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                {selectedDate && (
                  <div className="p-3 pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSingleDateSelect(undefined)}
                      className="w-full"
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          
          {!isMobile && <RoutesViewToggle view={view} onViewChange={setView} />}
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
        ) : effectiveView === "list" ? (
          <RoutesListView routes={currentRoutes} onViewRoute={handleViewRoute} />
        ) : (
          <RoutesCardView routes={currentRoutes} onViewRoute={handleViewRoute} />
        )}
        
        {/* Pagination */}
        {filteredRoutes.length > 0 && (
          <DataTablePagination
            currentPage={currentPage}
            totalItems={filteredRoutes.length}
            itemsPerPage={routesPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={() => {}} // Routes per page is fixed at 10
            showItemsPerPage={false}
          />
        )}
      </div>
    </div>
  );
}