-- Update the roof section in section_guidance table to make roof_covering_type a multiselect
UPDATE section_guidance 
SET "infoFields" = jsonb_set(
  "infoFields", 
  '{0,widget}', 
  '"multiselect"'
)
WHERE section_key = 'roof' 
AND "infoFields"->0->>'name' = 'roof_covering_type';