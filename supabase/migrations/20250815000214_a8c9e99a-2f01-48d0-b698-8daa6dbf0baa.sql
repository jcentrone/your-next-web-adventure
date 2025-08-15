-- Update report_details section to include structured fields with contact lookup for client_name
UPDATE section_guidance 
SET "infoFields" = '[
  {
    "name": "title",
    "label": "Report Title",
    "widget": "text",
    "required": true
  },
  {
    "name": "client_name", 
    "label": "Client Name",
    "widget": "contact_lookup",
    "required": true
  },
  {
    "name": "address",
    "label": "Property Address", 
    "widget": "text",
    "required": true
  },
  {
    "name": "inspection_date",
    "label": "Inspection Date",
    "widget": "date", 
    "required": true
  }
]'::jsonb
WHERE section_key = 'report_details';

-- If report_details section doesn't exist, create it
INSERT INTO section_guidance (section_key, "infoFields", items)
SELECT 'report_details', '[
  {
    "name": "title",
    "label": "Report Title", 
    "widget": "text",
    "required": true
  },
  {
    "name": "client_name",
    "label": "Client Name",
    "widget": "contact_lookup", 
    "required": true
  },
  {
    "name": "address",
    "label": "Property Address",
    "widget": "text",
    "required": true
  },
  {
    "name": "inspection_date", 
    "label": "Inspection Date",
    "widget": "date",
    "required": true
  }
]'::jsonb, ARRAY[
  'Document inspection participants and attendees',
  'Record property occupancy status and conditions', 
  'Note architectural style and building type',
  'Record weather conditions and temperature during inspection'
]
WHERE NOT EXISTS (
  SELECT 1 FROM section_guidance WHERE section_key = 'report_details'
);