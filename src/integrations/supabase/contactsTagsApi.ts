import { supabase } from './client';

export interface ContactTag {
  id?: string;
  name: string;
}

async function list(): Promise<ContactTag[]> {
  const { data, error } = await supabase
    .from('contact_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as ContactTag[]) || [];
}

async function create(name: string): Promise<ContactTag> {
  const { data, error } = await supabase
    .from('contact_tags')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data as ContactTag;
}

export const contactsTagsApi = {
  list,
  create,
};

export default contactsTagsApi;
