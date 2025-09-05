-- Add initials fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN initials_url TEXT,
ADD COLUMN initials_type TEXT;