import { supabase } from './client';

export interface AccountTag {
  id?: string;
  name: string;
}

async function list(): Promise<AccountTag[]> {
  const { data, error } = await supabase
    .from('account_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as AccountTag[]) || [];
}

async function create(name: string): Promise<AccountTag> {
  const { data, error } = await supabase
    .from('account_tags')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data as AccountTag;
}

export const accountsTagsApi = {
  list,
  create,
};

export default accountsTagsApi;
