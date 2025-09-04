import { supabase } from './client';

export interface BookingSettings {
  id?: string;
  user_id: string;
  slug: string;
  default_duration?: number | null;
  advance_notice?: number | null;
  template?: string;
  theme_color?: string | null;
  layout?: string;
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
        'id, user_id, slug, default_duration, advance_notice, template, theme_color, layout'
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as BookingSettings | null;
  },

  async getSettingsByUser(userId: string): Promise<BookingSettings | null> {
    const { data, error } = await supabase
      .from('booking_settings' as any)
      .select(
        'id, user_id, slug, default_duration, advance_notice, template, theme_color, layout'
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as BookingSettings | null;
  },

  async upsertSettings(
    userId: string,
    slug: string,
    template: string = 'templateA',
    themeColor: string | null = '#1e293b',
    advanceNotice?: number,
    defaultDuration?: number,
    layout: string = 'vertical'
  ): Promise<BookingSettings> {
    // First check if slug is already taken by another user
    const { data: existingSlug } = await supabase
      .from('booking_settings' as any)
      .select('user_id')
      .eq('slug', slug)
      .neq('user_id', userId)
      .maybeSingle();

    if (existingSlug) {
      throw new Error(`Slug "${slug}" is already taken. Please choose a different one.`);
    }

    const { data, error } = await supabase
      .from('booking_settings' as any)
      .upsert(
        {
          user_id: userId,
          slug,
          template,
          theme_color: themeColor,
          advance_notice: advanceNotice,
          default_duration: defaultDuration,
          layout,
        },
        { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data as unknown as BookingSettings;
  },

  async getTakenAppointments(
    userId: string
  ): Promise<{ appointment_date: string; duration_minutes: number | null }[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date, duration_minutes')
      .eq('user_id', userId)
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (error) throw error;
    return (
      (data as { appointment_date: string; duration_minutes: number | null }[]) || []
    );
  },

  async createAppointment(appointment: AppointmentPayload) {
    const { service_ids = [], ...appt } = appointment;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appt,
        status: 'scheduled' as const
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default bookingApi;
