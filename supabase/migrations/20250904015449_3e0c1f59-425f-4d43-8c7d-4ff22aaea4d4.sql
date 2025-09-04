-- Add unique constraint on user_id in booking_settings table
ALTER TABLE booking_settings 
ADD CONSTRAINT unique_booking_settings_user_id UNIQUE (user_id);