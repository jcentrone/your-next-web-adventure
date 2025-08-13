-- Add general notes field to all existing sections except finalize
UPDATE section_guidance 
SET "infoFields" = "infoFields" || jsonb_build_array(
  jsonb_build_object(
    'name', 'general_notes',
    'label', 'General Notes',
    'widget', 'textarea',
    'required', false
  )
)
WHERE section_key != 'finalize';