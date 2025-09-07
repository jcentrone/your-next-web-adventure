-- Insert universal terms and conditions for all organizations
-- This will apply to all report types when no specific terms exist

-- First, let's create a function to generate default terms and conditions HTML
CREATE OR REPLACE FUNCTION generate_default_terms_html()
RETURNS text
LANGUAGE sql
AS $$
SELECT '
<div class="space-y-6">
  <h2 class="text-2xl font-bold mb-4">Terms and Conditions</h2>
  
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Purpose and Scope</h3>
    <p>This inspection is performed in accordance with the Standards of Practice of the International Association of Certified Home Inspectors (InterNACHI). The inspection is visual and non-invasive, and is intended to identify material defects in the readily accessible components and systems of the property.</p>
  </div>
  
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Limitations</h3>
    <ul class="list-disc list-inside space-y-2">
      <li>This inspection is limited to readily accessible areas and components</li>
      <li>Not all defects will be identified during this inspection</li>
      <li>The inspection does not include destructive testing</li>
      <li>Systems and components may fail after the inspection</li>
      <li>The inspection is not a guarantee or warranty of any kind</li>
    </ul>
  </div>
  
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Recommendations</h3>
    <p>All deficiencies and safety issues identified in this report should be addressed by qualified professionals. We recommend obtaining detailed estimates for all repairs and improvements before making your final purchasing decision.</p>
  </div>
  
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Confidentiality</h3>
    <p>This report is confidential and prepared exclusively for the client named herein. Its use by any unauthorized persons is prohibited.</p>
  </div>
  
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Standards Compliance</h3>
    <p>This inspection was performed in accordance with InterNACHI Standards of Practice, which can be found at www.nachi.org.</p>
  </div>
</div>
'::text;
$$;

-- Insert default terms and conditions for existing organizations
-- report_type = null means it applies to all report types
INSERT INTO terms_conditions (organization_id, report_type, content_html)
SELECT 
  o.id as organization_id,
  null as report_type,
  generate_default_terms_html() as content_html
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM terms_conditions tc 
  WHERE tc.organization_id = o.id 
  AND tc.report_type IS NULL
);