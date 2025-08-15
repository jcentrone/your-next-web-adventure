-- Update report_details section to include all the missing fields
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
  },
  {
    "name": "in_attendance",
    "label": "In Attendance",
    "widget": "select",
    "required": false,
    "options": ["Client", "Home Owner", "Listing Agent", "Client''s Agent", "Other"]
  },
  {
    "name": "occupancy",
    "label": "Occupancy",
    "widget": "select",
    "required": false,
    "options": ["Furnished", "Occupied", "Vacant", "Utilities Off", "Other"]
  },
  {
    "name": "style",
    "label": "Style",
    "widget": "select",
    "required": false,
    "options": ["Manufactured", "Ranch", "Modular", "Multi-level", "Bungalow", "Contemporary", "Victorian", "Modern", "Rambler", "Colonial", "Other"]
  },
  {
    "name": "temperature",
    "label": "Temperature",
    "widget": "text",
    "required": false
  },
  {
    "name": "type_of_building",
    "label": "Type of Building",
    "widget": "select",
    "required": false,
    "options": ["Multi-Family", "Detached", "Single Family", "Condominium / Townhouse", "Attached", "Other"]
  },
  {
    "name": "weather_conditions",
    "label": "Weather Conditions",
    "widget": "select",
    "required": false,
    "options": ["Snow", "Cloudy", "Recent Rain", "Clear", "Dry", "Heavy Rain", "Light Rain", "Humid", "Hot", "Other"]
  }
]'::jsonb
WHERE section_key = 'report_details';