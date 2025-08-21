-- Create cover_pages and cover_page_assignments tables

-- Create cover_pages table
CREATE TABLE public.cover_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  template_slug text,
  color_palette_key text,
  text_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_cover_pages_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create cover_page_assignments table
CREATE TABLE public.cover_page_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  report_type text NOT NULL,
  cover_page_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_type),
  CONSTRAINT fk_cover_page_assignments_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cover_page_assignments_cover_page FOREIGN KEY (cover_page_id) REFERENCES public.cover_pages(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.cover_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_page_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cover_pages
CREATE POLICY "Users can view their own cover pages"
ON public.cover_pages FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own cover pages"
ON public.cover_pages FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cover pages"
ON public.cover_pages FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cover pages"
ON public.cover_pages FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for cover_page_assignments
CREATE POLICY "Users can view their own cover page assignments"
ON public.cover_page_assignments FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own cover page assignments"
ON public.cover_page_assignments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cover page assignments"
ON public.cover_page_assignments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cover page assignments"
ON public.cover_page_assignments FOR DELETE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_cover_pages_updated_at
BEFORE UPDATE ON public.cover_pages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_cover_page_assignments_updated_at
BEFORE UPDATE ON public.cover_page_assignments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_cover_pages_user_id ON public.cover_pages(user_id);
CREATE INDEX idx_cover_page_assignments_user_id ON public.cover_page_assignments(user_id);
CREATE INDEX idx_cover_page_assignments_cover_page_id ON public.cover_page_assignments(cover_page_id);
