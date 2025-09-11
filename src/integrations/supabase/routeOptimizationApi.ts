import { supabase } from './client';

export interface RouteOptimizationSettings {
  id?: string;
  user_id: string;
  organization_id?: string;
  home_base_address: string;
  home_base_formatted_address?: string;
  home_base_place_id?: string;
  home_base_lat?: number;
  home_base_lng?: number;
  default_enabled?: boolean;
  mileage_rate?: number;
  always_return_home?: boolean;
  preferred_nav_app?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyRoute {
  id?: string;
  user_id: string;
  organization_id?: string;
  route_date: string;
  optimized_order?: any;
  total_distance_miles?: number;
  total_duration_minutes?: number;
  estimated_fuel_cost?: number;
  start_address: string;
  end_address?: string;
  waypoints?: any;
  google_maps_url?: string;
  waze_url?: string;
  is_optimized?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RouteSegment {
  id?: string;
  daily_route_id: string;
  from_appointment_id?: string;
  to_appointment_id?: string;
  from_address: string;
  to_address: string;
  distance_miles?: number;
  duration_minutes?: number;
  segment_order: number;
  created_at?: string;
}

export const routeOptimizationApi = {
  // Settings CRUD
  async getSettings(): Promise<RouteOptimizationSettings | null> {
    const { data, error } = await supabase
      .from('route_optimization_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertSettings(settings: Omit<RouteOptimizationSettings, 'id' | 'created_at' | 'updated_at'>): Promise<RouteOptimizationSettings> {
    const { data, error } = await supabase
      .from('route_optimization_settings')
      .upsert(settings, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Daily Routes CRUD
  async getDailyRoute(date: string): Promise<DailyRoute | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user when fetching daily route');
      return null;
    }

    console.log('Fetching daily route for:', { user_id: user.id, date });

    const { data, error } = await supabase
      .from('daily_routes')
      .select('*')
      .eq('user_id', user.id)
      .eq('route_date', date)
      .maybeSingle();

    if (error) {
      console.error('Error fetching daily route:', error);
      throw new Error(`Failed to fetch route: ${error.message}`);
    }

    console.log('Daily route fetch result:', data ? `Found route ${data.id}` : 'No route found');
    return data;
  },

  async createOrUpdateDailyRoute(route: Omit<DailyRoute, 'id' | 'created_at' | 'updated_at'>): Promise<DailyRoute> {
    console.log('Creating/updating daily route:', { 
      user_id: route.user_id, 
      route_date: route.route_date,
      total_distance_miles: route.total_distance_miles,
      waypoints_count: Array.isArray(route.waypoints) ? route.waypoints.length : 0
    });

    const { data, error } = await supabase
      .from('daily_routes')
      .upsert(route, { 
        onConflict: 'user_id,route_date',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating daily route:', error);
      console.error('Route data being saved:', route);
      throw new Error(`Failed to save route: ${error.message}`);
    }

    console.log('Successfully saved daily route:', data.id);
    return data;
  },

  async getDailyRoutes(startDate?: string, endDate?: string): Promise<DailyRoute[]> {
    let query = supabase.from('daily_routes').select('*').order('route_date', { ascending: false });
    
    if (startDate) {
      query = query.gte('route_date', startDate);
    }
    if (endDate) {
      query = query.lte('route_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Route Segments
  async getRouteSegments(dailyRouteId: string): Promise<RouteSegment[]> {
    const { data, error } = await supabase
      .from('route_segments')
      .select('*')
      .eq('daily_route_id', dailyRouteId)
      .order('segment_order');

    if (error) throw error;
    return data || [];
  },

  async saveRouteSegments(segments: Omit<RouteSegment, 'id' | 'created_at'>[]): Promise<void> {
    const { error } = await supabase
      .from('route_segments')
      .insert(segments);

    if (error) throw error;
  },

  // Analytics helpers
  async getMileageAnalytics(startDate: string, endDate: string): Promise<{
    totalMiles: number;
    totalCost: number;
    totalTrips: number;
    avgMilesPerTrip: number;
    monthlyData: { month: string; miles: number; cost: number; trips: number }[];
  }> {
    const { data, error } = await supabase
      .from('daily_routes')
      .select('route_date, total_distance_miles, estimated_fuel_cost')
      .gte('route_date', startDate)
      .lte('route_date', endDate)
      .order('route_date');

    if (error) throw error;

    const routes = data || [];
    const totalMiles = routes.reduce((sum, route) => sum + (route.total_distance_miles || 0), 0);
    const totalCost = routes.reduce((sum, route) => sum + (route.estimated_fuel_cost || 0), 0);
    const totalTrips = routes.length;
    const avgMilesPerTrip = totalTrips > 0 ? totalMiles / totalTrips : 0;

    // Group by month
    const monthlyMap = new Map();
    routes.forEach(route => {
      const month = new Date(route.route_date).toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { miles: 0, cost: 0, trips: 0 });
      }
      const monthData = monthlyMap.get(month);
      monthData.miles += route.total_distance_miles || 0;
      monthData.cost += route.estimated_fuel_cost || 0;
      monthData.trips += 1;
    });

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      ...data,
    }));

    return { totalMiles, totalCost, totalTrips, avgMilesPerTrip, monthlyData };
  }
};