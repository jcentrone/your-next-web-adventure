-- Add unique constraint on user_id for route_optimization_settings table
ALTER TABLE route_optimization_settings 
ADD CONSTRAINT route_optimization_settings_user_id_unique 
UNIQUE (user_id);