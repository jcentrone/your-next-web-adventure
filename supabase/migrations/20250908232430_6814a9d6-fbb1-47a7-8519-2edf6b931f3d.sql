-- Create table to store user-specific section ordering preferences
CREATE TABLE public.user_section_order (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  section_key TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  section_type TEXT NOT NULL CHECK (section_type IN ('standard', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_type, section_key)
);

-- Enable Row Level Security
ALTER TABLE public.user_section_order ENABLE ROW LEVEL SECURITY;

-- Create policies for user access only
CREATE POLICY "Users can view their own section order" 
ON public.user_section_order 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own section order" 
ON public.user_section_order 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own section order" 
ON public.user_section_order 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own section order" 
ON public.user_section_order 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_section_order_updated_at
BEFORE UPDATE ON public.user_section_order
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();