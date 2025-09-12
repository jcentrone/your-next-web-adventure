-- Add is_archived column to expense_categories table
ALTER TABLE public.expense_categories 
ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Create function to check if category has associated expenses
CREATE OR REPLACE FUNCTION public.check_category_usage(category_name text, user_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM public.expenses 
    WHERE category = category_name AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update RLS policies to handle archived categories
-- Allow users to view archived categories they own
DROP POLICY IF EXISTS "Users can view their own expense categories" ON public.expense_categories;
CREATE POLICY "Users can view their own expense categories" 
ON public.expense_categories FOR SELECT 
USING ((auth.uid() = user_id) OR (is_default = true));

-- Update delete policy to prevent deletion of categories with expenses
DROP POLICY IF EXISTS "Users can delete their own expense categories" ON public.expense_categories;
CREATE POLICY "Users can delete their own expense categories" 
ON public.expense_categories FOR DELETE 
USING (
  (auth.uid() = user_id) 
  AND (is_default = false) 
  AND (check_category_usage(name, auth.uid()) = 0)
);