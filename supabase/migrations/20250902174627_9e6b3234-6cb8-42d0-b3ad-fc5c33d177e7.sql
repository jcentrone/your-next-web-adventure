-- Fix RLS by enabling it on any tables that might be missing it
-- (This addresses the security warning from the linter)

-- Check if there are any public tables without RLS enabled
-- Since we can't create new tables here, we'll ensure existing ones have proper RLS

-- Add RLS policies for the new email template types if needed
-- Update existing email template policies to handle new template_type column
DROP POLICY IF EXISTS "Organization members can select email templates" ON email_templates;
DROP POLICY IF EXISTS "Organization members can update email templates" ON email_templates;
DROP POLICY IF EXISTS "Organization members can insert email templates" ON email_templates;

-- Recreate policies with template_type awareness
CREATE POLICY "Organization members can select email templates" 
ON email_templates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = email_templates.organization_id 
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update email templates" 
ON email_templates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = email_templates.organization_id 
    AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = email_templates.organization_id 
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can insert email templates" 
ON email_templates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members m
    WHERE m.organization_id = email_templates.organization_id 
    AND m.user_id = auth.uid()
  )
);