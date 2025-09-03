import { supabase } from './client';

export interface BookingSettings {
  id?: string;
  user_id: string;
  slug: string;
  default_duration?: number | null;
  advance_notice?: number | null;
}

export interface AppointmentPayload {
  user_id: string;
  title: string;
  status: string;
  appointment_date: string;
  appointment_end?: string | null;
  contact_name?: string;
  contact_email?: string;
}

export const bookingApi = {
  async getSettingsBySlug(slug: string): Promise<BookingSettings | null> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data as BookingSettings | null;
  },

  async getSettingsByUser(userId: string): Promise<BookingSettings | null> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as BookingSettings | null;
  },

  async upsertSettings(userId: string, slug: string): Promise<BookingSettings> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .upsert({ user_id: userId, slug })
      .select()
      .single();

    if (error) throw error;
    return data as BookingSettings;
  },

  async getTakenAppointments(userId: string): Promise<{ start_date: string; end_date: string | null }[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_end')
      .eq('user_id', userId)
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (error) throw error;
    const rows = (data as { appointment_date: string; appointment_end: string | null }[]) || [];
    return rows.map((a) => ({ start_date: a.appointment_date, end_date: a.appointment_end }));
  },

  async createAppointment(appointment: AppointmentPayload) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default bookingApi;
