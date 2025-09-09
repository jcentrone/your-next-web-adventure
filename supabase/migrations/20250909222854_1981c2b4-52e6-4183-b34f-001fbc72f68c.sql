-- Enable RLS on route_optimization_settings if not already enabled
ALTER TABLE route_optimization_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for route_optimization_settings
CREATE POLICY "Users can manage their own route optimization settings" 
ON route_optimization_settings 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);