-- Fix the organization select policy
DROP POLICY IF EXISTS "Users can select their organizations" ON organizations;

CREATE POLICY "Users can select their organizations" 
ON organizations 
FOR SELECT 
USING (EXISTS (
  SELECT 1
  FROM organization_members m
  WHERE m.organization_id = organizations.id 
    AND m.user_id = auth.uid()
));

-- Fix the organization update policy  
DROP POLICY IF EXISTS "Users can update their organizations" ON organizations;

CREATE POLICY "Users can update their organizations" 
ON organizations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1
  FROM organization_members m
  WHERE m.organization_id = organizations.id 
    AND m.user_id = auth.uid() 
    AND m.role = ANY (ARRAY['owner'::organization_role, 'admin'::organization_role])
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM organization_members m
  WHERE m.organization_id = organizations.id 
    AND m.user_id = auth.uid() 
    AND m.role = ANY (ARRAY['owner'::organization_role, 'admin'::organization_role])
));