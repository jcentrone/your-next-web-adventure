-- Enable RLS on support_action_logs table
ALTER TABLE public.support_action_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own support action logs
CREATE POLICY "Users can view their own support action logs" 
ON public.support_action_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own support action logs  
CREATE POLICY "Users can insert their own support action logs" 
ON public.support_action_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own support action logs
CREATE POLICY "Users can update their own support action logs" 
ON public.support_action_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for users to delete their own support action logs
CREATE POLICY "Users can delete their own support action logs" 
ON public.support_action_logs 
FOR DELETE 
USING (auth.uid() = user_id);