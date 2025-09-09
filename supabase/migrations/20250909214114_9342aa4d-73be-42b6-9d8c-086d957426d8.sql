-- Enable RLS on inspection_agreements table
ALTER TABLE public.inspection_agreements ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for inspection_agreements
CREATE POLICY "Users can view agreements for their appointments"
ON public.inspection_agreements
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.agreement_id = inspection_agreements.id
        AND a.user_id = auth.uid()
    )
);

CREATE POLICY "System can insert agreements"
ON public.inspection_agreements
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update agreements for their appointments"
ON public.inspection_agreements
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.agreement_id = inspection_agreements.id
        AND a.user_id = auth.uid()
    )
);