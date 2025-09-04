-- Add proper foreign key relationship between organization_members and profiles
ALTER TABLE organization_members 
ADD CONSTRAINT fk_organization_members_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint on booking_settings slug to prevent conflicts
ALTER TABLE booking_settings 
ADD CONSTRAINT unique_booking_settings_slug UNIQUE (slug);

-- Add index for better performance on organization_members queries
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);