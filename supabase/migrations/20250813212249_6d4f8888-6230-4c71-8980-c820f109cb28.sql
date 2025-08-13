-- Add report metadata fields to report_details section guidance
UPDATE section_guidance 
SET "infoFields" = jsonb_build_array(
  jsonb_build_object(
    'name', 'title',
    'label', 'Report Title',
    'widget', 'text',
    'required', true
  ),
  jsonb_build_object(
    'name', 'client_name',
    'label', 'Client Name',
    'widget', 'text',
    'required', true
  ),
  jsonb_build_object(
    'name', 'address',
    'label', 'Property Address',
    'widget', 'textarea',
    'required', true
  ),
  jsonb_build_object(
    'name', 'inspection_date',
    'label', 'Inspection Date',
    'widget', 'date',
    'required', true
  ),
  jsonb_build_object(
    'name', 'in_attendance',
    'label', 'In Attendance',
    'widget', 'select',
    'required', false,
    'options', jsonb_build_array('Client', 'Home Owner', 'Listing Agent', 'Client''s Agent', 'Other')
  ),
  jsonb_build_object(
    'name', 'occupancy',
    'label', 'Occupancy',
    'widget', 'select', 
    'required', false,
    'options', jsonb_build_array('Furnished', 'Occupied', 'Vacant', 'Utilities Off', 'Other')
  ),
  jsonb_build_object(
    'name', 'style',
    'label', 'Style',
    'widget', 'select',
    'required', false,
    'options', jsonb_build_array('Manufactured', 'Ranch', 'Modular', 'Multi-level', 'Bungalow', 'Contemporary', 'Victorian', 'Modern', 'Rambler', 'Colonial', 'Other')
  ),
  jsonb_build_object(
    'name', 'temperature',
    'label', 'Temperature',
    'widget', 'text',
    'required', false
  ),
  jsonb_build_object(
    'name', 'type_of_building',
    'label', 'Type of Building',
    'widget', 'select',
    'required', false,
    'options', jsonb_build_array('Multi-Family', 'Detached', 'Single Family', 'Condominium / Townhouse', 'Attached', 'Other')
  ),
  jsonb_build_object(
    'name', 'weather_conditions',
    'label', 'Weather Conditions',
    'widget', 'select',
    'required', false,
    'options', jsonb_build_array('Snow', 'Cloudy', 'Recent Rain', 'Clear', 'Dry', 'Heavy Rain', 'Light Rain', 'Humid', 'Hot', 'Other')
  )
)
WHERE section_key = 'report_details';