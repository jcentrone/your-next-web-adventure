-- Create route optimization settings table
CREATE TABLE public.route_optimization_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    organization_id uuid,
    home_base_address text NOT NULL,
    home_base_formatted_address text,
    home_base_place_id text,
    home_base_lat numeric,
    home_base_lng numeric,
    default_enabled boolean DEFAULT true,
    mileage_rate numeric DEFAULT 0.67, -- IRS standard rate
    always_return_home boolean DEFAULT true,
    preferred_nav_app text DEFAULT 'google_maps',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create daily routes table
CREATE TABLE public.daily_routes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    organization_id uuid,
    route_date date NOT NULL,
    optimized_order jsonb DEFAULT '[]'::jsonb, -- Array of appointment IDs in order
    total_distance_miles numeric DEFAULT 0,
    total_duration_minutes integer DEFAULT 0,
    estimated_fuel_cost numeric DEFAULT 0,
    start_address text NOT NULL,
    end_address text,
    waypoints jsonb DEFAULT '[]'::jsonb, -- Array of address objects
    google_maps_url text,
    waze_url text,
    is_optimized boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create route segments table  
CREATE TABLE public.route_segments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    daily_route_id uuid NOT NULL REFERENCES public.daily_routes(id) ON DELETE CASCADE,
    from_appointment_id uuid, -- NULL for start from home
    to_appointment_id uuid,   -- NULL for return to home
    from_address text NOT NULL,
    to_address text NOT NULL,
    distance_miles numeric DEFAULT 0,
    duration_minutes integer DEFAULT 0,
    segment_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.route_optimization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_segments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own route optimization settings"
ON public.route_optimization_settings
FOR ALL
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)))
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own daily routes"
ON public.daily_routes  
FOR ALL
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)))
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage route segments for their daily routes"
ON public.route_segments
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.daily_routes dr 
    WHERE dr.id = daily_route_id 
    AND (dr.user_id = auth.uid() OR (dr.organization_id IS NOT NULL AND is_organization_member(dr.organization_id)))
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.daily_routes dr 
    WHERE dr.id = daily_route_id 
    AND dr.user_id = auth.uid()
));

-- Add indexes for performance
CREATE INDEX idx_route_optimization_settings_user_id ON public.route_optimization_settings(user_id);
CREATE INDEX idx_daily_routes_user_id_date ON public.daily_routes(user_id, route_date);
CREATE INDEX idx_route_segments_daily_route_id ON public.route_segments(daily_route_id);

-- Add triggers for updated_at
CREATE TRIGGER update_route_optimization_settings_updated_at
    BEFORE UPDATE ON public.route_optimization_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_routes_updated_at
    BEFORE UPDATE ON public.daily_routes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();