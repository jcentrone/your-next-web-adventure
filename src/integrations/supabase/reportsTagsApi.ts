import { supabase } from './client';

export interface ReportTag {
  id?: string;
  name: string;
}

async function list(): Promise<ReportTag[]> {
  const { data, error } = await supabase
    .from('report_tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as ReportTag[]) || [];
}

async function create(name: string): Promise<ReportTag> {
  const { data, error } = await supabase
    .from('report_tags')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data as ReportTag;
}

export const reportsTagsApi = {
  list,
  create,
};

export default reportsTagsApi;
