import { supabase } from './client';

export interface InspectionAgreement {
  id?: string;
  appointment_id?: string | null;
  service_id?: string | null;
  client_name: string;
  signed_at?: string | null;
  signature_url?: string | null;
  agreement_html: string;
}

async function create(
  agreement: Omit<InspectionAgreement, 'id'>,
): Promise<InspectionAgreement> {
  const { data, error } = await supabase
    .from('inspection_agreements')
    .insert({
      ...agreement,
      appointment_id: agreement.appointment_id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as InspectionAgreement;
}

async function getByAppointment(
  appointmentId: string,
): Promise<InspectionAgreement | null> {
  const { data, error } = await supabase
    .from('inspection_agreements')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as InspectionAgreement) || null;
}

async function attachToReport(
  reportId: string,
  agreementId: string,
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ agreement_id: agreementId })
    .eq('report_id', reportId);
  if (error) throw error;
}

async function linkToAppointment(
  agreementId: string,
  appointmentId: string,
): Promise<void> {
  const { error } = await supabase
    .from('inspection_agreements')
    .update({ appointment_id: appointmentId })
    .eq('id', agreementId);
  if (error) throw error;
}

export const agreementsApi = {
  create,
  getByAppointment,
  attachToReport,
  linkToAppointment,
};

export default agreementsApi;
