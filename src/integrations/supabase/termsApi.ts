import { supabase } from './client';
import type { Report } from '@/lib/reportSchemas';
import DOMPurify from 'dompurify';

export interface Term {
  id?: string;
  organization_id: string;
  report_type: Report['reportType'] | null;
  content_html: string;
  file_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const TERMS_BUCKET = 'terms-conditions';

async function uploadDocx(
  organizationId: string,
  file: File,
): Promise<string> {
  const cleanName = file.name.replace(/\s+/g, '_');
  const path = `${organizationId}/${Date.now()}_${cleanName}`;
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

async function list(organizationId: string): Promise<Term[]> {
  const { data, error } = await supabase
    .from('terms_conditions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (
    ((data as unknown as Term[]) || []).map((t) => ({
      ...t,
      report_type: (t.report_type as unknown) === 'all' ? null : t.report_type,
    }))
  );
}

async function save(term: Term & { file?: File | null }): Promise<Term> {
  let file_url = term.file_url;
  if (term.file) {
    file_url = await uploadDocx(term.organization_id, term.file);
  }

  const payload = {
    organization_id: term.organization_id,
    report_type:
      (term.report_type as unknown) === 'all' ? null : term.report_type,
    content_html: DOMPurify.sanitize(term.content_html),
    file_url,
  };

  if (term.id) {
    const { data, error } = await supabase
      .from('terms_conditions')
      .update(payload)
      .eq('id', term.id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Term;
  } else {
    const { data, error } = await supabase
      .from('terms_conditions')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Term;
  }
}

async function remove(id: string): Promise<void> {
  const { error } = await supabase
    .from('terms_conditions')
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
