-- Add welcome_message field to booking_settings table
ALTER TABLE booking_settings 
ADD COLUMN welcome_message text DEFAULT 'Schedule Your Appointment';