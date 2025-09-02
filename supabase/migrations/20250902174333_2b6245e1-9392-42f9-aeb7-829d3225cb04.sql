-- Add organization branding fields for email templates
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS email_from_name text,
ADD COLUMN IF NOT EXISTS email_from_address text,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#64748b';

-- Update email_templates table to support multiple template types
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS template_type text DEFAULT 'report_share',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Create enum for email template types
DO $$ BEGIN
    CREATE TYPE email_template_type AS ENUM (
        'report_share', 
        'signup_confirmation', 
        'password_recovery', 
        'magic_link', 
        'invite', 
        'email_change',
        'reauthentication'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the template_type column to use the enum
ALTER TABLE email_templates 
ALTER COLUMN template_type TYPE email_template_type USING template_type::email_template_type;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_org_type_active 
ON email_templates (organization_id, template_type, is_active);

-- Insert default platform email templates (these will be hardcoded in the edge function)
-- This is just for reference in the database
INSERT INTO email_templates (
    organization_id,
    template_type,
    report_email_subject,
    report_email_body,
    is_active
) 
SELECT 
    id as organization_id,
    'signup_confirmation'::email_template_type,
    'Welcome to {{organization.name}} - Verify your account',
    'Welcome! Please verify your account by clicking the confirmation link.',
    true
FROM organizations 
WHERE NOT EXISTS (
    SELECT 1 FROM email_templates 
    WHERE organization_id = organizations.id 
    AND template_type = 'signup_confirmation'
)
ON CONFLICT DO NOTHING;