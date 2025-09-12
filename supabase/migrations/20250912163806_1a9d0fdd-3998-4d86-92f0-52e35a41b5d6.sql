-- Update the roof section in section_guidance table to make roof_covering_type a multiselect
UPDATE section_guidance 
SET info_fields = jsonb_set(
  info_fields, 
  '{0,widget}', 
  '"multiselect"'
)
WHERE section_key = 'roof' 
AND info_fields->0->>'name' = 'roof_covering_type';