-- Create expense_categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  organization_id UUID,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own expense categories" 
ON public.expense_categories 
FOR SELECT 
USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can create their own expense categories" 
ON public.expense_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense categories" 
ON public.expense_categories 
FOR UPDATE 
USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete their own expense categories" 
ON public.expense_categories 
FOR DELETE 
USING (auth.uid() = user_id AND is_default = false);

-- Create update trigger
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories (using a dummy user_id that will be ignored due to is_default = true)
INSERT INTO public.expense_categories (name, user_id, is_default) VALUES
('Travel', gen_random_uuid(), true),
('Supplies', gen_random_uuid(), true),
('Meals', gen_random_uuid(), true),
('Equipment', gen_random_uuid(), true),
('Vehicle', gen_random_uuid(), true),
('Other', gen_random_uuid(), true);