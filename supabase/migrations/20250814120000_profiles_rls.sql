ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are readable by owner"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Profiles are insertable by owner"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Profiles are updatable by owner"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
