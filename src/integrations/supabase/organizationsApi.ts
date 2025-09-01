import { supabase } from "./client";

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  license_number: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'inspector' | 'viewer';
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

export type OrganizationInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: 'owner' | 'admin' | 'inspector' | 'viewer';
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  license_number: string | null;
  provider: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailTemplate = {
  organization_id: string;
  report_email_subject: string;
  report_email_body: string;
};

export async function createOrganization(data: {
  name: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  license_number?: string;
}) {
  const { data: org, error } = await supabase
    .from('organizations')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Add the current user as the owner
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: (await supabase.auth.getUser()).data.user!.id,
      role: 'owner'
    });

  if (memberError) throw memberError;

  return org;
}

export async function getMyOrganization(): Promise<Organization | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const { data, error } = await supabase
    .from('organization_members')
    .select('organizations(*)')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return (data as any)?.organizations || null;
}

export async function updateOrganization(id: string, data: Partial<Organization>) {
  const { data: updated, error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function getOrganizationMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as any[];
}

export async function inviteUserToOrganization(data: {
  organizationId: string;
  email: string;
  role: 'admin' | 'inspector' | 'viewer';
}) {
  const { data: invitation, error } = await supabase
    .from('organization_invitations')
    .insert({
      organization_id: data.organizationId,
      email: data.email,
      role: data.role,
      invited_by: (await supabase.auth.getUser()).data.user!.id
    })
    .select()
    .single();

  if (error) throw error;
  return invitation;
}

export async function getOrganizationInvitations(organizationId: string) {
  const { data, error } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OrganizationInvitation[];
}

export async function acceptInvitation(token: string) {
  const { data: invitation, error: inviteError } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (inviteError) throw inviteError;

  // Add user to organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: (await supabase.auth.getUser()).data.user!.id,
      role: invitation.role,
      invited_by: invitation.invited_by
    });

  if (memberError) throw memberError;

  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('organization_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateError) throw updateError;

  return invitation;
}

export async function getMyProfile() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Profile not found');
  return data as Profile;
}

export async function updateMyProfile(data: Partial<Profile>) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  
  const { data: updated, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', user.user.id)
    .select()
    .single();
    
  if (error) throw error;
  return updated;
}

export async function removeMemberFromOrganization(organizationId: string, userId: string) {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateMemberRole(organizationId: string, userId: string, role: 'admin' | 'inspector' | 'viewer') {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function getReportEmailTemplate(organizationId: string): Promise<EmailTemplate> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('organization_id, report_email_subject, report_email_body')
    .eq('organization_id', organizationId)
    .single();
  if (error) throw error;
  return data as EmailTemplate;
}

export async function saveReportEmailTemplate(organizationId: string, subject: string, body: string): Promise<EmailTemplate> {
  const { data, error } = await supabase
    .from('email_templates')
    .upsert({
      organization_id: organizationId,
      report_email_subject: subject,
      report_email_body: body,
    })
    .select('organization_id, report_email_subject, report_email_body')
    .single();
  if (error) throw error;
  return data as EmailTemplate;
}
