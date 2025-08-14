-- Create enum for contact types
CREATE TYPE public.contact_type AS ENUM ('client', 'realtor', 'vendor', 'contractor', 'other');

-- Create enum for appointment status  
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled');

-- Create enum for task priority
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create enum for activity type
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task_completed', 'appointment_created', 'report_delivered');

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  contact_type contact_type NOT NULL DEFAULT 'client',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  contact_id UUID,
  report_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  location TEXT,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_appointments_contact FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_report FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE SET NULL
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  assigned_to UUID,
  contact_id UUID,
  appointment_id UUID,
  report_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_tasks_contact FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_report FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE SET NULL
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  contact_id UUID,
  appointment_id UUID,
  report_id UUID,
  task_id UUID,
  activity_type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_activities_contact FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_report FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_task FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL
);

-- Enable RLS on all tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for contacts
CREATE POLICY "Users can view their own contacts or organization contacts"
ON public.contacts FOR SELECT
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can insert their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contacts or organization contacts"
ON public.contacts FOR UPDATE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can delete their own contacts or organization contacts with proper role"
ON public.contacts FOR DELETE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND (has_organization_role(organization_id, 'owner') OR has_organization_role(organization_id, 'admin'))));

-- RLS policies for appointments
CREATE POLICY "Users can view their own appointments or organization appointments"
ON public.appointments FOR SELECT
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can insert their own appointments"
ON public.appointments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments or organization appointments"
ON public.appointments FOR UPDATE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can delete their own appointments or organization appointments with proper role"
ON public.appointments FOR DELETE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND (has_organization_role(organization_id, 'owner') OR has_organization_role(organization_id, 'admin'))));

-- RLS policies for tasks
CREATE POLICY "Users can view their own tasks or organization tasks"
ON public.tasks FOR SELECT
USING (user_id = auth.uid() OR assigned_to = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tasks or assigned tasks or organization tasks"
ON public.tasks FOR UPDATE
USING (user_id = auth.uid() OR assigned_to = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can delete their own tasks or organization tasks with proper role"
ON public.tasks FOR DELETE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND (has_organization_role(organization_id, 'owner') OR has_organization_role(organization_id, 'admin'))));

-- RLS policies for activities
CREATE POLICY "Users can view their own activities or organization activities"
ON public.activities FOR SELECT
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can insert their own activities"
ON public.activities FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own activities or organization activities"
ON public.activities FOR UPDATE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND is_organization_member(organization_id)));

CREATE POLICY "Users can delete their own activities or organization activities with proper role"
ON public.activities FOR DELETE
USING (user_id = auth.uid() OR (organization_id IS NOT NULL AND (has_organization_role(organization_id, 'owner') OR has_organization_role(organization_id, 'admin'))));

-- Create indexes for better performance
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_organization_id ON public.contacts(organization_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_contact_type ON public.contacts(contact_type);

CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_organization_id ON public.appointments(organization_id);
CREATE INDEX idx_appointments_contact_id ON public.appointments(contact_id);
CREATE INDEX idx_appointments_appointment_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_organization_id ON public.activities(organization_id);
CREATE INDEX idx_activities_contact_id ON public.activities(contact_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();