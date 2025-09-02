-- Create calendar_tokens table for storing external calendar authentication tokens
CREATE TABLE IF NOT EXISTS public.calendar_tokens (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, provider)
);

-- Enable RLS
ALTER TABLE public.calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own calendar tokens"
ON public.calendar_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE TRIGGER set_calendar_tokens_updated_at
  BEFORE UPDATE ON public.calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();