-- Phase 1: Database Schema Updates for Universal Report Section Manager

-- Add report_types support to user_custom_sections table
ALTER TABLE user_custom_sections 
ADD COLUMN IF NOT EXISTS report_types TEXT[] DEFAULT ARRAY['home_inspection']::TEXT[],
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS template_name TEXT;

-- Add report_types support to user_custom_fields table  
ALTER TABLE user_custom_fields 
ADD COLUMN IF NOT EXISTS report_types TEXT[] DEFAULT ARRAY['home_inspection']::TEXT[];

-- Create user_report_templates table for custom report templates
CREATE TABLE IF NOT EXISTS user_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  sections_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  fields_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_report_templates
ALTER TABLE user_report_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_report_templates
CREATE POLICY "Users can view their own report templates" 
ON user_report_templates 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own report templates" 
ON user_report_templates 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own report templates" 
ON user_report_templates 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own report templates" 
ON user_report_templates 
FOR DELETE 
USING (user_id = auth.uid());

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_user_report_templates_updated_at
BEFORE UPDATE ON user_report_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Migrate existing custom sections to include home_inspection in report_types
UPDATE user_custom_sections 
SET report_types = ARRAY['home_inspection']::TEXT[]
WHERE report_types IS NULL OR array_length(report_types, 1) IS NULL;

-- Migrate existing custom fields to include home_inspection in report_types  
UPDATE user_custom_fields 
SET report_types = ARRAY['home_inspection']::TEXT[]
WHERE report_types IS NULL OR array_length(report_types, 1) IS NULL;