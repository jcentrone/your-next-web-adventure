-- Add unique constraint to daily_routes table to support upsert operations
ALTER TABLE daily_routes ADD CONSTRAINT daily_routes_user_route_date_unique UNIQUE (user_id, route_date);