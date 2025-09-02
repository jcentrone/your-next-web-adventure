-- Add organization branding fields for email templates
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS email_from_name text,
ADD COLUMN IF NOT EXISTS email_from_address text,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#64748b';

-- Create enum for email template types first
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

-- Add new columns to email_templates table with proper types
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS template_type email_template_type DEFAULT 'report_share',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_org_type_active 
ON email_templates (organization_id, template_type, is_active);