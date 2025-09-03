import { supabase } from './client';

export interface BookingSettings {
  id?: string;
  user_id: string;
  slug: string;
  default_duration?: number | null;
  advance_notice?: number | null;
  template?: string;
  theme_color?: string | null;
}

export interface AppointmentPayload {
  user_id: string;
  title: string;
  status: string;
  appointment_date: string;
  appointment_end?: string | null;
  contact_id?: string;
  service_ids?: string[];
}

export const bookingApi = {
  async getSettingsBySlug(slug: string): Promise<BookingSettings | null> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .select(
        'id, user_id, slug, default_duration, advance_notice, template, theme_color'
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data as BookingSettings | null;
  },

  async getSettingsByUser(userId: string): Promise<BookingSettings | null> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .select(
        'id, user_id, slug, default_duration, advance_notice, template, theme_color'
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as BookingSettings | null;
  },

  async upsertSettings(
    userId: string,
    slug: string,
    template: string = 'templateA',
    themeColor?: string | null
  ): Promise<BookingSettings> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .upsert({ user_id: userId, slug, template, theme_color: themeColor })
      .select()
      .single();

    if (error) throw error;
    return data as BookingSettings;
  },

  async getTakenAppointments(userId: string): Promise<{ start_date: string; end_date: string }[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date, duration_minutes')
      .eq('user_id', userId)
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (error) throw error;
    const rows = (data as { appointment_date: string; duration_minutes: number | null }[]) || [];
    return rows.map((a) => {
      const end = new Date(
        new Date(a.appointment_date).getTime() + (a.duration_minutes ?? 0) * 60000
      );
      return { start_date: a.appointment_date, end_date: end.toISOString() };
    });
  },

  async createAppointment(appointment: AppointmentPayload) {
    const { service_ids = [], ...appt } = appointment;

    const { data, error } = await supabase
      .from('appointments')
      .insert(appt)
      .select()
      .single();

    if (error) throw error;

    if (service_ids.length > 0) {
      const { error: svcError } = await supabase
        .from('appointment_services')
        .insert(
          service_ids.map((id) => ({
            user_id: appt.user_id,
            appointment_id: data.id,
            service_id: id,
          }))
        );
      if (svcError) throw svcError;
    }

    return data;
  }
};

export default bookingApi;
