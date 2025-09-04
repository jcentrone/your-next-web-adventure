-- Add foreign key constraint linking organization_members.user_id to profiles.user_id
alter table organization_members
  add constraint organization_members_user_id_fkey
  foreign key (user_id) references profiles(user_id);

