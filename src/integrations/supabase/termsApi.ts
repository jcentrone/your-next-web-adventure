import { supabase } from './client';
import type { Report } from '@/lib/reportSchemas';

export interface Term {
  id?: string;
  user_id: string;
  report_type: Report['reportType'] | 'all';
  text: string;
  file_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const TERMS_BUCKET = 'terms-and-conditions';

async function uploadDocx(userId: string, file: File): Promise<string> {
  const cleanName = file.name.replace(/\s+/g, '_');
  const path = `${userId}/${Date.now()}_${cleanName}`;
  const { error } = await supabase.storage
    .from(TERMS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType:
        file.type ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  if (error) throw error;
  return path;
}

async function list(userId: string): Promise<Term[]> {
  const { data, error } = await supabase
    .from('terms_and_conditions' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as unknown as Term[]) || [];
}

async function save(term: Term & { file?: File | null }): Promise<Term> {
  let file_url = term.file_url;
  if (term.file) {
    file_url = await uploadDocx(term.user_id, term.file);
  }

  const payload = {
    user_id: term.user_id,
    report_type: term.report_type,
    text: term.text,
    file_url,
  };

  if (term.id) {
    const { data, error } = await supabase
      .from('terms_and_conditions' as any)
      .update(payload)
      .eq('id', term.id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Term;
  } else {
    const { data, error } = await supabase
      .from('terms_and_conditions' as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Term;
  }
}

async function remove(id: string): Promise<void> {
  const { error } = await supabase
    .from('terms_and_conditions' as any)
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export const termsApi = {
  list,
  save,
  remove,
};

export default termsApi;
