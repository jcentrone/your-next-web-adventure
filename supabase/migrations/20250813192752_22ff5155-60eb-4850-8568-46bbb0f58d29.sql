-- Update section_guidance.infoFields to support structured field definitions
ALTER TABLE section_guidance 
ALTER COLUMN "infoFields" TYPE jsonb USING "infoFields"::text::jsonb;

-- Add example structured data for roof section
INSERT INTO section_guidance (section_key, "infoFields", items) 
VALUES (
  'roof',
  jsonb_build_array(
    jsonb_build_object(
      'name', 'roof_covering_type',
      'label', 'Type of roof-covering materials',
      'sop_ref', '3.1.II.A',
      'widget', 'select',
      'required', true,
      'options', jsonb_build_array(
        'Asphalt shingles',
        'Architectural/laminate shingles', 
        'Metal (standing seam)',
        'Metal (corrugated)',
        'Clay tile',
        'Concrete tile',
        'Slate',
        'Wood shake/shingle',
        'Modified bitumen/rolled roofing',
        'Built-up roofing (BUR)',
        'Single-ply membrane (TPO)',
        'Single-ply membrane (EPDM)',
        'Single-ply membrane (PVC)',
        'Other'
      )
    ),
    jsonb_build_object(
      'name', 'inspection_method',
      'label', 'Method used to inspect the roof',
      'sop_ref', '3.1.I',
      'widget', 'select', 
      'required', true,
      'options', jsonb_build_array(
        'Walked on roof surface',
        'Observed from ground level',
        'Observed from ladder at eave',
        'Observed from adjacent structure',
        'Binoculars/telescope',
        'Drone inspection',
        'Other'
      )
    )
  ),
  ARRAY[
    'Inspect roof-covering materials',
    'Inspect gutters and downspouts', 
    'Inspect roof drainage systems',
    'Inspect flashings',
    'Inspect skylights, chimneys, and roof penetrations',
    'Inspect the general structure of the roof from the readily accessible panels, doors or stairs'
  ]
)
ON CONFLICT (section_key) 
DO UPDATE SET 
  "infoFields" = EXCLUDED."infoFields",
  items = EXCLUDED.items,
  updated_at = now();